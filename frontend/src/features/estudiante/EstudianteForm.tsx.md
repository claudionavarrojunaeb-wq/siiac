# Documentación detallada de frontend/src/features/estudiante/EstudianteForm.tsx

Este documento describe la implementación actual del componente `EstudianteForm.tsx`,
sus validaciones y los endpoints del backend que consume.

## Resumen

- `EstudianteForm.tsx` muestra el identificador de la solicitud (`solicitudId`) y
  contiene el formulario de datos del estudiante (Parte 1). El formulario usa
  campos controlados con `useState`, carga catálogos desde el backend y valida
  todos los campos al presionar `Siguiente`. Los campos inválidos reciben el
  fondo `rgb(255,192,192)` según el requerimiento.

## Endpoints usados (backend)

- `GET /api/sexo` → devuelve lista de objetos `{ id, nombre }` desde tabla `sexo`.
- `GET /api/genero` → devuelve `{ id, nombre }` desde tabla `genero`.
- `GET /api/edad` → devuelve `{ id, nombre }` desde tabla `edad`.
- `GET /api/pueblos` → devuelve `{ id, nombre }` desde tabla `pueblos`.
- `GET /api/pais` → devuelve `{ id, nombre }` desde tabla `pais`.
- `GET /api/region` → devuelve `{ id, nombre }` desde tabla `region`.
- `GET /api/comunas?regionId=<regionId>` → devuelve comunas (`corepa`) filtradas
  por `regionId` (se hace `JOIN` con `provincia` para aplicar el filtro).

Estas rutas fueron añadidas en `backend/index.js` y devuelven JSON arrays con los
campos `id` y `nombre` (tal como los consume el formulario en el frontend).

## Comportamiento del formulario

- Campos incluidos (todos obligatorios):
  - `Rut estudiante`: se formatea al perder foco y se valida con algoritmo DV.
  - `Nombres` (máx. 100)
  - `Primer Apellido` (máx. 50)
  - `Segundo Apellido` (máx. 50)
  - `Sexo` (select desde `/api/sexo`)
  - `Género` (select desde `/api/genero`)
  - `Edad` (select desde `/api/edad`)
  - `Teléfono / Celular` (valida con `^(\\+56)?\\s?9\\d{8}$` o `^(\\+56)?\\s?\\d{9}$`)
  - `Correo Electrónico` (valida formato básico `^\\S+@\\S+\\.\\S+$`)
  - `Repita Correo Electrónico` (debe coincidir con el anterior)
  - `Nacionalidad` (radio: `Chilena` / `Extranjero`)
    - Si `Chilena`: aparece `Perteneciente a Pueblos Originarios` (select `/api/pueblos`).
    - Si `Extranjero`: aparece `País` (select `/api/pais`). Si se elige `Otro`, aparece
      el input `Ingrese su país`.
  - `Región de Residencia` (select `/api/region`)
  - `Comuna de Residencia` (select `/api/comunas?regionId=...`) — se recarga al cambiar región.
  - `Institución de Educación` (máx. 100)

- Validación: al presionar `Siguiente` se ejecuta `validateAll()` que marca los
  campos inválidos en el objeto `invalid`. La interfaz aplica `bg-[rgb(255,192,192)]`
  y `border-red-500` a los campos listados en `invalid`.

## Puntos técnicos y decisiones

- Formato y validación de RUT:
  - `formatRut(value)` limpia caracteres no válidos, inserta puntos y guion, y
    conserva la K si corresponde.
  - `validateRut(rut)` implementa el algoritmo módulo 11 para comprobar el DV.

- Carga de catálogos:
  - El componente realiza `fetch` a los endpoints señalados arriba en `useEffect`.
  - Si la llamada falla, el select queda vacío y la validación marcará el campo
    como inválido hasta que se seleccione un valor.

- Filtrado de comunas por región:
  - Cuando cambia `region` se solicita `/api/comunas?regionId=...` que internamente
    hace `JOIN` entre `corepa` y `provincia` para filtrar por `regionid`.

## Integración y pasos siguientes recomendados

- Estilado: el componente usa clases Tailwind; adapte utilidades o tema si su
  proyecto usa una configuración Tailwind diferente.
- Localización/labels: si requiere textos en otro idioma o ajustes en accesibilidad,
  actualice los `label` y atributos `aria-` según necesidad.
- Persistencia: en `handleSubmit` actualmente se construye `payload` y se hace
  `console.log`. Puede enviar `payload` a la ruta `/api/solicitud` (ya existente)
  o a otra ruta de su preferencia para persistir los datos.

## Registro de cambios

- 2026-04-29: Actualizada documentación para reflejar implementación del formulario y los endpoints añadidos en `backend/index.js`.


## Código de EstudianteForm.tsx

A continuación se incluye el código completo de `EstudianteForm.tsx` con comentarios
línea a línea en español explicando la intención y el comportamiento de cada parte.

```typescript
import React, { useEffect, useMemo, useState } from "react"; // Importa React y hooks necesarios
import { useLocation } from "react-router-dom"; // Hook para leer el estado/URL de la ruta
import logo from "../inicio/assets/logo.jpg"; // Importa el logo usado en el header

// Tipo auxiliar para leer parámetros opcionales desde location.state
interface TokenState {
  __tokenParams?: Record<string, string>;
}

// Exporta el componente principal del formulario
export default function EstudianteForm() {
  const location = useLocation(); // Obtiene la ubicación actual (URL y state)

  const FORM_NAME = "EstudianteForm.tsx"; // Nombre del formulario usado para logs

  // Obtiene el `solicitudId` desde state, querystring o sessionStorage
  const solicitudId = useMemo<string | null>(() => {
    const state = location.state as TokenState | null; // intenta leer del state
    const fromState = state?.__tokenParams?.solicitudid; // posible origen en token
    if (fromState) return fromState; // si existe, usarlo

    const params = new URLSearchParams(window.location.search); // lee querystring
    let id = params.get("solicitudid");
    if (!id) {
      try {
        const last = sessionStorage.getItem("last_params"); // fallback en sessionStorage
        if (last) {
          const obj = JSON.parse(last);
          id = obj?.solicitudid ?? id; // intenta extraer solicitudid
        }
      } catch (err) {
        void err; // ignorar errores de parseo
      }
    }
    return id ?? null; // devolver id o null
  }, [location]);

  // Estados controlados para cada campo del formulario
  const [rut, setRut] = useState("");
  const [nombres, setNombres] = useState("");
  const [apellido1, setApellido1] = useState("");
  const [apellido2, setApellido2] = useState("");
  const [sexo, setSexo] = useState("");
  const [genero, setGenero] = useState("");
  const [edad, setEdad] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [email2, setEmail2] = useState("");
  // Usar códigos para nacionalidad: "1" = Chilena, "2" = Extranjero
  const [nacionalidad, setNacionalidad] = useState("1");
  const [pueblo, setPueblo] = useState("");
  const [pais, setPais] = useState("");
  const [paisOtro, setPaisOtro] = useState("");
  const [region, setRegion] = useState("");
  const [comuna, setComuna] = useState("");
  const [institucion, setInstitucion] = useState("");
  const [cuidador, setCuidador] = useState<string | undefined>(undefined); // '0'|'1'|'error' u otros valores

  // Tipos y opciones para selects (cargadas desde backend)
  type Option = { id: string; nombre: string };
  const [sexoOpts, setSexoOpts] = useState<Option[]>([]);
  const [generoOpts, setGeneroOpts] = useState<Option[]>([]);
  const [edadOpts, setEdadOpts] = useState<Option[]>([]);
  const [pueblosOpts, setPueblosOpts] = useState<Option[]>([]);
  const [paisOpts, setPaisOpts] = useState<Option[]>([]);
  const [regionOpts, setRegionOpts] = useState<Option[]>([]);
  const [comunaOpts, setComunaOpts] = useState<Option[]>([]);

  // Objeto que marca qué campos están inválidos para mostrar estilos
  const [invalid, setInvalid] = useState<Record<string, boolean>>({});

  // Regex reutilizables para validar teléfono/celular
  const celularRegex = useMemo(() => /^([+]56)?\\s?9\\d{8}$/, []);
  const telefonoRegex = useMemo(() => /^([+]56)?\\s?\\d{9}$/, []);

  // Determina si el campo 'País' está en modo 'Otro' (acepta tanto '10' como nombre 'otro')
  const isPaisOtro = useMemo(() => {
    const p = String(pais ?? "").toLowerCase().trim();
    if (p === "otro" || p === "10") return true; // aceptar código 10 como 'Otro'
    const found = paisOpts.find((o) => String(o.id) === String(pais));
    if (found && String(found.nombre).toLowerCase().trim() === "otro") return true;
    return false;
  }, [pais, paisOpts]);

  // formatea un RUT: limpia, añade puntos y guion, mantiene K si existe
  function formatRut(value: string) {
    const clean = value.replace(/[^0-9kK]/g, "").toUpperCase();
    if (!clean) return "";
    const body = clean.slice(0, -1);
    const dv = clean.slice(-1);
    const reversed = body.split("").reverse();
    const res: string[] = [];
    for (let i = 0; i < reversed.length; i++) {
      if (i % 3 === 0 && i !== 0) res.push(".");
      res.push(reversed[i]);
    }
    const formattedBody = res.reverse().join("");
    return formattedBody + "-" + dv; // retorna formato: 12.345.678-5
  }

  // Valida RUT con algoritmo módulo 11 (DV)
  function validateRut(rut: string) {
    const clean = rut.replace(/[^0-9kK]/g, "").toUpperCase();
    if (!/^[0-9]+[0-9kK]$/.test(clean)) return false;
    const body = clean.slice(0, -1);
    const dv = clean.slice(-1);
    let sum = 0;
    let mul = 2;
    for (let i = body.length - 1; i >= 0; i--) {
      sum += parseInt(body[i], 10) * mul;
      mul = mul === 7 ? 2 : mul + 1;
    }
    const res = 11 - (sum % 11);
    const expected = res === 11 ? "0" : res === 10 ? "K" : String(res);
    return expected === dv; // true si DV coincide
  }

  // Carga catálogos necesarios desde el backend al montar el componente
  useEffect(() => {
    fetch("/api/sexo").then((r) => r.json()).then(setSexoOpts).catch(() => setSexoOpts([]));
    fetch("/api/genero").then((r) => r.json()).then(setGeneroOpts).catch(() => setGeneroOpts([]));
    fetch("/api/edad").then((r) => r.json()).then(setEdadOpts).catch(() => setEdadOpts([]));
    fetch("/api/pueblos").then((r) => r.json()).then(setPueblosOpts).catch(() => setPueblosOpts([]));
    fetch("/api/pais").then((r) => r.json()).then(setPaisOpts).catch(() => setPaisOpts([]));
    fetch("/api/region").then((r) => r.json()).then(setRegionOpts).catch(() => setRegionOpts([]));
  }, []);

  // Cuando cambia región se recargan las comunas asociadas
  useEffect(() => {
    if (!region) {
      setComunaOpts([]);
      setComuna("");
      return;
    }
    fetch(`/api/comunas?regionId=${encodeURIComponent(region)}`)
      .then((r) => r.json())
      .then(setComunaOpts)
      .catch(() => setComunaOpts([]));
  }, [region]);

  // Al perder foco en el RUT se formatea y, si es válido, se consulta si es cuidador
  function handleRutBlur() {
    const formatted = formatRut(rut);
    setRut(formatted);
    if (validateRut(formatted)) {
      void fetchCuidador(formatted); // consulta asíncrona a proxy
    }
  }

  // Consulta el proxy /api/cuidador/:rut que a su vez consulta el servicio externo
  async function fetchCuidador(rutFormatted: string) {
    try {
      // Preparar RUT para la API: sin puntos y con guion
      let apiRut = String(rutFormatted || "").replace(/\\./g, "").trim();
      // Asegurar que tenga guion entre cuerpo y dígito verificador
      if (!apiRut.includes("-")) {
        const clean = apiRut.replace(/[^0-9kK]/g, "");
        if (clean.length > 1) apiRut = clean.slice(0, -1) + "-" + clean.slice(-1);
      }
      const url = `/api/cuidador/${encodeURIComponent(apiRut)}`;
      console.log("fetchCuidador URL (proxy):", url, "apiRut:", apiRut);
      const res = await fetch(url);
      console.log("fetchCuidador status:", res.status);
      let json: Record<string, unknown> | null = null;
      try {
        json = (await res.json()) as Record<string, unknown> | null;
      } catch (e) {
        console.error("fetchCuidador parse error (proxy):", e);
        setCuidador("error");
        return;
      }
      console.log("fetchCuidador proxy response:", json);

      if (!res.ok) {
        setCuidador(String(res.status));
        return;
      }

      // Extraer solo el indicador numérico de cuidador si está disponible
      // Estructura esperada (proxy): { ok, status, data: { code, message, time, data: [ { cuidador: 0|1, ... } ] } }
      if (json && Object.prototype.hasOwnProperty.call(json, "data")) {
        const d = (json as Record<string, unknown])["data"] as unknown;
        if (d && typeof d === "object") {
          const dobj = d as Record<string, unknown>;
          // Caso: dobj.data es array con primer elemento que contiene 'cuidador'
          const inner = dobj["data"];
          if (Array.isArray(inner) && inner.length > 0 && inner[0] && typeof inner[0] === "object") {
            const first = inner[0] as Record<string, unknown>;
            if (Object.prototype.hasOwnProperty.call(first, "cuidador")) {
              const c = first["cuidador"];
              const cval = c === null || c === undefined ? "" : String(c);
              console.log("fetchCuidador extracted cuidador:", cval);
              setCuidador(cval); // guarda '0' o '1'
              return;
            }
          }
          // Caso alternativo: dobj.cuidador directo
          if (Object.prototype.hasOwnProperty.call(dobj, "cuidador")) {
            const c = dobj["cuidador"];
            const cval = c === null || c === undefined ? "" : String(c);
            console.log("fetchCuidador extracted cuidador (direct):", cval);
            setCuidador(cval);
            return;
          }
        }
      }

      // Fallback: guardar representación reducida para trazabilidad
      try {
        setCuidador(JSON.stringify(json));
      } catch {
        setCuidador("error");
      }
    } catch (err) {
      console.error("Error consultando API cuidador:", err);
      setCuidador("error");
    }
  }

  // Valida todos los campos visibles y devuelve { ok, inv }
  function validateAll() {
    const inv: Record<string, boolean> = {};
    if (!rut || !validateRut(rut)) inv.rut = true; // RUT obligatorio y válido
    if (!nombres || nombres.trim().length === 0 || nombres.length > 100) inv.nombres = true;
    if (!apellido1 || apellido1.trim().length === 0 || apellido1.length > 50) inv.apellido1 = true;
    if (!apellido2 || apellido2.trim().length === 0 || apellido2.length > 50) inv.apellido2 = true;
    if (!sexo) inv.sexo = true;
    if (!genero) inv.genero = true;
    if (!edad) inv.edad = true;
    if (!telefono || !(celularRegex.test(telefono) || telefonoRegex.test(telefono))) inv.telefono = true;
    if (!email || !/^\\S+@\\S+\\.\\S+$/.test(email)) inv.email = true;
    if (!email2 || email2 !== email) inv.email2 = true;
    if (!nacionalidad) inv.nacionalidad = true;
    if (nacionalidad === "1") {
      if (!pueblo) inv.pueblo = true; // si es chileno, pueblo es obligatorio
    } else {
      if (!pais) inv.pais = true; // si es extranjero, país es obligatorio
      if (isPaisOtro && !paisOtro) inv.paisOtro = true; // si País=Otro, pedir texto
    }
    if (!region) inv.region = true;
    if (!comuna) inv.comuna = true;
    if (!institucion || institucion.trim().length === 0 || institucion.length > 100) inv.institucion = true;

    setInvalid(inv); // actualiza UI
    const ok = Object.keys(inv).length === 0; // ok si no hay inválidos
    return { ok, inv };
  }

  // Maneja el envío: valida, manda log y si todo OK hace upsert de ciudadano
  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    const { ok, inv } = validateAll();
    const payload = {
      solicitudId,
      rut,
      nombres,
      apellido1,
      apellido2,
      sexo,
      genero,
      edad,
      telefono,
      email,
      nacionalidad,
      pueblo: nacionalidad === "1" ? pueblo : undefined,
      Pais: nacionalidad === "2" ? (isPaisOtro ? "10" : pais) : undefined, // si 'Otro' siempre enviar código "10"
      OtroPais: nacionalidad === "2" ? (isPaisOtro ? paisOtro : undefined) : undefined,
      cuidador: cuidador ?? undefined, // puede ser '0' o '1'
      region,
      comuna,
      institucion,
    };

    console.log("Estado validación:", ok, "invalidFields:", Object.keys(inv));

    // Enviar log al backend siempre, aunque falten campos
    try {
      await fetch("/api/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ objeto: FORM_NAME, action: "siguiente_formulario_attempt", solicitudId, payload, valid: ok, invalidFields: Object.keys(inv) }),
      });
    } catch (err) {
      console.error("No se pudo enviar el log al backend:", err);
    }

    if (!ok) {
      // No continuar con envío real si hay errores, pero el intento ya quedó registrado.
      return;
    }

    // Requerir que se haya consultado/obtenido `cuidador` antes de guardar ciudadano
    if (!cuidador) {
      setInvalid({ ...inv, cuidador: true });
      console.warn('No se guardará ciudadano: falta campo cuidador');
      return;
    }

    // Enviar/guardar ciudadano en el backend
    try {
      const r = await fetch('/api/ciudadano', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payload }),
      });
      const jr = await r.json().catch(() => ({}));
      console.log('ciudadano upsert result:', jr);
    } catch (e) {
      console.error('Error guardando ciudadano:', e);
    }

    // Aquí podrías proceder con el flujo normal si todo es válido.
  }

  

  // Render del formulario (tailwind para estilos)
  return (
    <main className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-4">
          <img src={logo} alt="logo" className="mx-auto h-20 object-contain" />
          <h1 className="text-2xl font-semibold text-gray-800 mt-2">
            Formulario de Contacto - OIRS Virtual
          </h1>
          {solicitudId ? (
            <div className="text-sm text-gray-600">N° {solicitudId}</div>
          ) : null}
        </header>

        <div className="mb-4">
          <div className="w-full bg-blue-600 text-white py-3 rounded shadow-inner flex flex-col items-center justify-center">
            <h2 className="text-white font-semibold text-center text-sm md:text-base">Consulta, reclamo, sugerencia, felicitación o solicitud</h2>
            <p className="text-white text-xs md:text-sm mt-1 text-center">Realice diferentes solicitudes completando el siguiente formulario</p>
          </div>
        </div>

        <div className="mb-4">
          <div className="w-full bg-yellow-50 border border-yellow-200 p-3 text-sm text-gray-700 rounded flex items-start gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-600 mt-0.5 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M18 10A8 8 0 11 2 10a8 8 0 0116 0zm-8-4a1 1 0 100 2 1 1 0 000-2zm1 7a1 1 0 10-2 0v1a1 1 0 102 0v-1z" clipRule="evenodd" />
            </svg>
            <div>La respuesta será emitida al correo electrónico informado por usted. Revise que sus datos se encuentren correctamente ingresados.</div>
          </div>
        </div>

        <div className="bg-white rounded shadow mt-6 p-6">
          <form onSubmit={handleSubmit}>
            {/* Indicador de pasos (multi-step) */}
            <div className="mb-4">
              <div className="flex justify-center">
                <div className="w-full max-w-2xl">
                  <div className="flex items-center justify-center space-x-6 md:space-x-12">
                    <div className="flex flex-col items-center md:items-center">
                      <div className="w-8 h-8 rounded-full bg-blue-100 border-2 border-blue-500 text-blue-600 flex items-center justify-center text-xs font-semibold">1</div>
                      <div className="text-xs mt-1 text-center text-blue-600 font-semibold">Datos solicitante</div>
                    </div>

                    <div className="flex-1 h-0.5 bg-gray-200 mx-4 hidden md:block" />

                    <div className="flex flex-col items-center md:items-center">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-semibold">2</div>
                      <div className="text-xs mt-1 text-center text-blue-400 font-semibold">Tipo Solicitud</div>
                    </div>

                    <div className="flex-1 h-0.5 bg-gray-200 mx-4 hidden md:block" />

                    <div className="flex flex-col items-center md:items-center">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-semibold">3</div>
                      <div className="text-xs mt-1 text-center text-blue-400 font-semibold">Comprobante de envío</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <h2 className="text-lg font-semibold text-center mb-4">Información relacionada al estudiante</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
              // Contenedor: fila para RUT (label + input)
              <div>
                // Label del campo RUT
                <label className="block text-sm font-medium text-gray-700">Rut estudiante</label>
                // Input controlado para `rut`. Aplica estilos condicionales si `invalid.rut`.
                <input
                  className={`mt-1 block w-full rounded-md shadow-sm p-2 text-gray-800 placeholder-gray-400 border ${invalid.rut ? "bg-[rgb(255,192,192)] border-red-500" : "border-gray-300"}`}
                  value={rut}
                  onChange={(e) => setRut(e.target.value)} // actualiza estado al escribir
                  onBlur={handleRutBlur} // al perder foco formatea y consulta cuidador si es válido
                  placeholder="Ingrese el R.U.T. del estudiante"
                  title="Ingrese el R.U.T. del estudiante"
                />
              </div>

              // Contenedor: Nombres
              <div>
                // Label del campo Nombres
                <label className="block text-sm font-medium text-gray-700">Nombres</label>
                // Input controlado para `nombres`, con maxlength y validación visual
                <input
                  maxLength={100}
                  className={`mt-1 block w-full rounded-md shadow-sm p-2 text-gray-800 placeholder-gray-400 border ${invalid.nombres ? "bg-[rgb(255,192,192)] border-red-500" : "border-gray-300"}`}
                  value={nombres}
                  onChange={(e) => setNombres(e.target.value)}
                  placeholder="Ingrese sus nombres"
                  title="Ingrese sus nombres"
                />
              </div>

              // Contenedor: Primer Apellido
              <div>
                // Label del campo Primer Apellido
                <label className="block text-sm font-medium text-gray-700">Primer Apellido</label>
                // Input controlado para `apellido1` con maxlength y validación visual
                <input
                  maxLength={50}
                  className={`mt-1 block w-full rounded-md shadow-sm p-2 text-gray-800 placeholder-gray-400 border ${invalid.apellido1 ? "bg-[rgb(255,192,192)] border-red-500" : "border-gray-300"}`}
                  value={apellido1}
                  onChange={(e) => setApellido1(e.target.value)}
                  placeholder="Ingrese su primer apellido"
                  title="Ingrese su primer apellido"
                />
              </div>

              // Contenedor: Segundo Apellido
              <div>
                // Input controlado para `apellido2` con maxlength y validación visual
                <input
                  maxLength={50}
                  className={`mt-1 block w-full rounded-md shadow-sm p-2 text-gray-800 placeholder-gray-400 border ${invalid.apellido2 ? "bg-[rgb(255,192,192)] border-red-500" : "border-gray-300"}`}
                  value={apellido2}
                  onChange={(e) => setApellido2(e.target.value)}
                  placeholder="Ingrese su segundo apellido"
                  title="Ingrese su segundo apellido"
                />
              </div>

              // Contenedor: Sexo (select cargado desde `sexoOpts`)
              <div>
                // Label del select Sexo
                <label className="block text-sm font-medium text-gray-700">Sexo</label>
                // Select controlado que muestra opciones desde `sexoOpts`
                <select
                  className={`mt-1 block w-full rounded-md shadow-sm p-2 text-gray-800 placeholder-gray-400 border ${invalid.sexo ? "bg-[rgb(255,192,192)] border-red-500" : "border-gray-300"}`}
                  value={sexo}
                  onChange={(e) => setSexo(e.target.value)}
                  title="Seleccione su sexo"
                >
                  // Opción por defecto vacía
                  <option value="">- Seleccione su sexo -</option>
                  // Mapea las opciones traídas del backend
                  {sexoOpts.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.nombre}
                    </option>
                  ))}
                </select>
              </div>

              // Contenedor: Género (select cargado desde `generoOpts`)
              <div>
                <label className="block text-sm font-medium text-gray-700">Género</label>
                <select
                  className={`mt-1 block w-full rounded-md shadow-sm p-2 text-gray-800 placeholder-gray-400 border ${invalid.genero ? "bg-[rgb(255,192,192)] border-red-500" : "border-gray-300"}`}
                  value={genero}
                  onChange={(e) => setGenero(e.target.value)}
                  title="Seleccione su género"
                >
                  <option value="">- Seleccione su género -</option>
                  {generoOpts.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.nombre}
                    </option>
                  ))}
                </select>
              </div>

              // Contenedor: Edad (select cargado desde `edadOpts`)
              <div>
                <label className="block text-sm font-medium text-gray-700">Edad</label>
                <select
                  className={`mt-1 block w-full rounded-md shadow-sm p-2 text-gray-800 placeholder-gray-400 border ${invalid.edad ? "bg-[rgb(255,192,192)] border-red-500" : "border-gray-300"}`}
                  value={edad}
                  onChange={(e) => setEdad(e.target.value)}
                  title="Seleccione su edad"
                >
                  <option value="">- Seleccione su edad -</option>
                  {edadOpts.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.nombre}
                    </option>
                  ))}
                </select>
              </div>

              // Contenedor: Teléfono / Celular
              <div>
                <label className="block text-sm font-medium text-gray-700">Teléfono / Celular</label>
                <input
                  className={`mt-1 block w-full rounded-md shadow-sm p-2 text-gray-800 placeholder-gray-400 border ${invalid.telefono ? "bg-[rgb(255,192,192)] border-red-500" : "border-gray-300"}`}
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="Si es celular utilizar formato +569 y si es fijo indicar el código de la región"
                  title="Si es celular utilizar formato +569 y si es fijo indicar el código de la región"
                />
              </div>

              // Contenedor: Correo Electrónico
              <div>
                <label className="block text-sm font-medium text-gray-700">Correo Electrónico</label>
                <input
                  className={`mt-1 block w-full rounded-md shadow-sm p-2 text-gray-800 placeholder-gray-400 border ${invalid.email ? "bg-[rgb(255,192,192)] border-red-500" : "border-gray-300"}`}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Ingrese su correo electrónico"
                  title="Ingrese su correo electrónico"
                />
              </div>

              // Contenedor: Repita Correo Electrónico
              <div>
                <label className="block text-sm font-medium text-gray-700">Repita Correo Electrónico</label>
                <input
                  className={`mt-1 block w-full rounded-md shadow-sm p-2 text-gray-800 placeholder-gray-400 border ${invalid.email2 ? "bg-[rgb(255,192,192)] border-red-500" : "border-gray-300"}`}
                  value={email2}
                  onChange={(e) => setEmail2(e.target.value)}
                  placeholder="Repita su correo electrónico"
                  title="Repita su correo electrónico"
                />
              </div>

              // Contenedor: Nacionalidad (radio buttons)
              <div className="md:col-span-2">
                <div className="block text-sm font-medium text-gray-700 mb-2">Nacionalidad</div>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="nacionalidad"
                        value="1"
                        checked={nacionalidad === "1"}
                        onChange={() => setNacionalidad("1")}
                      />
                    <span className="text-sm">Chilena</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="nacionalidad"
                      value="2"
                      checked={nacionalidad === "2"}
                      onChange={() => setNacionalidad("2")}
                    />
                    <span className="text-sm">Extranjero</span>
                  </label>
                </div>
              </div>

              // Si es Chileno mostrar Pueblos Originarios
              {nacionalidad === "1" ? (
                <div>
                <label className="block text-sm font-medium text-gray-700">Perteneciente a Pueblos Originarios</label>
                <select
                  className={`mt-1 block w-full rounded-md shadow-sm p-2 text-gray-800 placeholder-gray-400 border ${invalid.pueblo ? "bg-[rgb(255,192,192)] border-red-500" : "border-gray-300"}`}
                  value={pueblo}
                  onChange={(e) => setPueblo(e.target.value)}
                  title="-- seleccione --"
                > 
                  {pueblosOpts.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.nombre}
                    </option>
                  ))}
                </select>
              </div>
              ) : (
                // Si es Extranjero mostrar País (y campo 'Otro' si aplica)
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">País</label>
                    <select
                      className={`mt-1 block w-full rounded-md shadow-sm p-2 text-gray-800 placeholder-gray-400 border ${invalid.pais ? "bg-[rgb(255,192,192)] border-red-500" : "border-gray-300"}`}
                      value={pais}
                        onChange={(e) => setPais(e.target.value)}
                        title="Seleccione su país de origen"
                    >
                      <option value="">- Seleccione su país de origen -</option>
                      {paisOpts.map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.nombre}
                        </option>
                      ))}
                      // Opción fija para 'Otro' que debe enviar código "10"
                      <option value="10">Otro</option>
                    </select>
                  </div>

                  <div>
                    {isPaisOtro ? (
                      <>
                        <label className="block text-sm font-medium text-gray-700">Ingrese su país</label>
                        <input
                          className={`mt-1 block w-full rounded-md shadow-sm p-2 text-gray-800 placeholder-gray-400 border ${invalid.paisOtro ? "bg-[rgb(255,192,192)] border-red-500" : "border-gray-300"}`}
                          value={paisOtro}
                          onChange={(e) => setPaisOtro(e.target.value)}
                          placeholder="Ingrese su país"
                          title="Ingrese su país"

                        />
                      </>
                    ) : (
                      <div />
                    )}
                  </div>
                </div>
              )}

              // Contenedor: Región y Comuna
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Región de Residencia</label>
                  <select
                    className={`mt-1 block w-full rounded-md shadow-sm p-2 text-gray-800 placeholder-gray-400 border ${invalid.region ? "bg-[rgb(255,192,192)] border-red-500" : "border-gray-300"}`}
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    title="- Seleccione su región de residencia -"
                  >
                    <option value="">- Seleccione su región de residencia -</option>
                    {regionOpts.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Comuna de Residencia</label>
                  <select
                    className={`mt-1 block w-full rounded-md shadow-sm p-2 text-gray-800 placeholder-gray-400 border ${invalid.comuna ? "bg-[rgb(255,192,192)] border-red-500" : "border-gray-300"}`}
                    value={comuna}
                    onChange={(e) => setComuna(e.target.value)}
                    title="- Seleccione su comuna de residencia -"
                  >
                    <option value="">- Seleccione su comuna de residencia -</option>
                    {comunaOpts.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              // Contenedor: Institución de Educación
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Institución de Educación</label>
                <input
                  maxLength={100}
                  className={`mt-1 block w-full rounded-md shadow-sm p-2 text-gray-800 placeholder-gray-400 border ${invalid.institucion ? "bg-[rgb(255,192,192)] border-red-500" : "border-gray-300"}`}
                  value={institucion}
                  onChange={(e) => setInstitucion(e.target.value)}
                  placeholder="Ingrese el nombre de la institución donde estudia. Si no es beneficiario, indique “No aplica”"
                  title="Ingrese el nombre de la institución donde estudia. Si no es beneficiario, indique “No aplica”"
                />
              </div>
            </div>

            <div className="flex justify-center mt-6">
              <div className="flex items-center gap-6">
                // Botón 'Volver': redirige a la página principal (localhost:5173).
                // Tipo: button (no envía el formulario), onClick hace window.location.href.
                <button
                  type="button"
                  onClick={() => { window.location.href = 'http://localhost:5173/'; }}
                  className="inline-flex justify-center items-center w-40 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm font-medium text-sm"
                >
                  Volver
                </button>

                // Botón 'Siguiente': ejecuta `handleSubmit` que realiza:
                // 1) validateAll() -> marca campos inválidos y devuelve {ok,inv}
                // 2) envía un log a `/api/logs` con el intento (siempre)
                // 3) si ok === true y `cuidador` está presente, hace POST a `/api/ciudadano` para upsert
                // 4) si `cuidador` falta, marca el campo como inválido y aborta el upsert
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="inline-flex justify-center items-center w-40 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm font-medium text-sm"
                >
                  Siguiente
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
```


