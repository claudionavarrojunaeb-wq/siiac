import React, { useEffect, useMemo, useState } from "react";

/*
  EstudianteSolicitudForm.tsx

  Formulario de registro (parte 1) para datos del estudiante.

  Comentarios y propósito didáctico:
  - Este archivo implementa un formulario controlado en React que replica
    los campos mostrados en `assets/FormularioEstudiante.jpg`.
  - Todas las entradas son obligatorias; al presionar "Siguiente" se validan
    todos los campos y se marcan los inválidos con fondo `rgb(255,192,192)`.
  - Las listas de opciones (sexo, género, edad, pueblos, país, regiones, comunas)
    se cargan desde supuestos endpoints REST (`/api/...`). Si el backend no
    está disponible, las listas quedan vacías y el campo se marca como inválido.
  - El RUT se autocompleta y valida usando funciones `formatRut` y `validateRut`.
  - La visibilidad de campos es condicional:
    * Si `Nacionalidad` es `Chilena` aparece `Perteneciente a Pueblos Originarios`.
    * Si `Nacionalidad` es `Extranjero` aparece `Pais`; si `Pais` es `Otro` aparece
      el input `Ingrese su país`.

  Notas de integración:
  - Reemplace las llamadas a `fetch('/api/...')` por las rutas reales del backend.
  - El componente no incluye estilos CSS externos; use clases o estilos del
    proyecto para adaptar la apariencia a la imagen proporcionada.
*/

type Option = { id: string; nombre: string };

const ERROR_BG = "rgb(255,192,192)";

function formatRut(value: string) {
  // Formatea el RUT a la máscara 12.345.678-5 conservando el DV.
  const clean = value.replace(/[^0-9kK]/g, "").toUpperCase();
  if (!clean) return "";
  const body = clean.slice(0, -1);
  const dv = clean.slice(-1);
  let reversed = body.split("").reverse();
  let res: string[] = [];
  for (let i = 0; i < reversed.length; i++) {
    if (i % 3 === 0 && i !== 0) res.push(".");
    res.push(reversed[i]);
  }
  const formattedBody = res.reverse().join("");
  return formattedBody + "-" + dv;
}

function validateRut(rut: string) {
  // Valida el dígito verificador del RUT chileno.
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
  return expected === dv;
}

export default function EstudianteSolicitudForm() {
  // Campos controlados del formulario
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
  const [nacionalidad, setNacionalidad] = useState("Chilena");
  const [pueblo, setPueblo] = useState("");
  const [pais, setPais] = useState("");
  const [paisOtro, setPaisOtro] = useState("");
  const [region, setRegion] = useState("");
  const [comuna, setComuna] = useState("");
  const [institucion, setInstitucion] = useState("");

  // Opciones para select; se cargan desde supuestos endpoints
  const [sexoOpts, setSexoOpts] = useState<Option[]>([]);
  const [generoOpts, setGeneroOpts] = useState<Option[]>([]);
  const [edadOpts, setEdadOpts] = useState<Option[]>([]);
  const [pueblosOpts, setPueblosOpts] = useState<Option[]>([]);
  const [paisOpts, setPaisOpts] = useState<Option[]>([]);
  const [regionOpts, setRegionOpts] = useState<Option[]>([]);
  const [comunaOpts, setComunaOpts] = useState<Option[]>([]);

  // Mapa de campos inválidos para aplicar estilo
  const [invalid, setInvalid] = useState<Record<string, boolean>>({});

  const celularRegex = useMemo(() => /^(\+56)?\s?9\d{8}$/, []);
  const telefonoRegex = useMemo(() => /^(\+56)?\s?\d{9}$/, []);

  useEffect(() => {
    // Cargar catálogos desde la API (rutas de ejemplo)
    fetch("/api/sexo")
      .then((r) => r.json())
      .then(setSexoOpts)
      .catch(() => setSexoOpts([]));
    fetch("/api/genero")
      .then((r) => r.json())
      .then(setGeneroOpts)
      .catch(() => setGeneroOpts([]));
    fetch("/api/edad")
      .then((r) => r.json())
      .then(setEdadOpts)
      .catch(() => setEdadOpts([]));
    fetch("/api/pueblos")
      .then((r) => r.json())
      .then(setPueblosOpts)
      .catch(() => setPueblosOpts([]));
    fetch("/api/pais")
      .then((r) => r.json())
      .then(setPaisOpts)
      .catch(() => setPaisOpts([]));
    fetch("/api/region")
      .then((r) => r.json())
      .then(setRegionOpts)
      .catch(() => setRegionOpts([]));
  }, []);

  useEffect(() => {
    // Al cambiar la región, cargar comunas filtradas por región
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

  function getFieldStyle(name: string) {
    return invalid[name] ? { backgroundColor: ERROR_BG } : {};
  }

  function handleRutBlur() {
    // Formatear RUT al perder foco
    const formatted = formatRut(rut);
    setRut(formatted);
  }

  function validateAll() {
    const inv: Record<string, boolean> = {};
    if (!rut || !validateRut(rut)) inv.rut = true;
    if (!nombres || nombres.trim().length === 0 || nombres.length > 100) inv.nombres = true;
    if (!apellido1 || apellido1.trim().length === 0 || apellido1.length > 50) inv.apellido1 = true;
    if (!apellido2 || apellido2.trim().length === 0 || apellido2.length > 50) inv.apellido2 = true;
    if (!sexo) inv.sexo = true;
    if (!genero) inv.genero = true;
    if (!edad) inv.edad = true;
    if (!telefono || !(celularRegex.test(telefono) || telefonoRegex.test(telefono))) inv.telefono = true;
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) inv.email = true;
    if (!email2 || email2 !== email) inv.email2 = true;
    if (!nacionalidad) inv.nacionalidad = true;
    if (nacionalidad === "Chilena") {
      if (!pueblo) inv.pueblo = true;
    } else {
      if (!pais) inv.pais = true;
      if (pais === "Otro" && !paisOtro) inv.paisOtro = true;
    }
    if (!region) inv.region = true;
    if (!comuna) inv.comuna = true;
    if (!institucion || institucion.trim().length === 0 || institucion.length > 100) inv.institucion = true;

    setInvalid(inv);
    return Object.keys(inv).length === 0;
  }

  function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    const ok = validateAll();
    if (!ok) return;
    const payload = {
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
      pueblo: nacionalidad === "Chilena" ? pueblo : undefined,
      pais: nacionalidad === "Extranjero" ? (pais === "Otro" ? paisOtro : pais) : undefined,
      region,
      comuna,
      institucion,
    } as any;
    console.log("Formulario válido, payload:", payload);
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 900 }}>
      <div style={{ display: "grid", gap: 8 }}>
        <label>
          Rut estudiante
          <input
            style={getFieldStyle("rut")}
            value={rut}
            onChange={(e) => setRut(e.target.value)}
            onBlur={handleRutBlur}
            placeholder="12.345.678-5"
          />
        </label>

        <label>
          Nombres
          <input
            maxLength={100}
            style={getFieldStyle("nombres")}
            value={nombres}
            onChange={(e) => setNombres(e.target.value)}
          />
        </label>

        <label>
          Primer Apellido
          <input
            maxLength={50}
            style={getFieldStyle("apellido1")}
            value={apellido1}
            onChange={(e) => setApellido1(e.target.value)}
          />
        </label>

        <label>
          Segundo Apellido
          <input
            maxLength={50}
            style={getFieldStyle("apellido2")}
            value={apellido2}
            onChange={(e) => setApellido2(e.target.value)}
          />
        </label>

        <label>
          Sexo
          <select style={getFieldStyle("sexo")} value={sexo} onChange={(e) => setSexo(e.target.value)}>
            <option value="">-- seleccione --</option>
            {sexoOpts.map((o) => (
              <option key={o.id} value={o.id}>
                {o.nombre}
              </option>
            ))}
          </select>
        </label>

        <label>
          Género
          <select style={getFieldStyle("genero")} value={genero} onChange={(e) => setGenero(e.target.value)}>
            <option value="">-- seleccione --</option>
            {generoOpts.map((o) => (
              <option key={o.id} value={o.id}>
                {o.nombre}
              </option>
            ))}
          </select>
        </label>

        <label>
          Edad
          <select style={getFieldStyle("edad")} value={edad} onChange={(e) => setEdad(e.target.value)}>
            <option value="">-- seleccione --</option>
            {edadOpts.map((o) => (
              <option key={o.id} value={o.id}>
                {o.nombre}
              </option>
            ))}
          </select>
        </label>

        <label>
          Teléfono / Celular
          <input
            style={getFieldStyle("telefono")}
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            placeholder="+569XXXXXXXX"
          />
        </label>

        <label>
          Correo Electrónico
          <input style={getFieldStyle("email")} value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>

        <label>
          Repita Correo Electrónico
          <input style={getFieldStyle("email2")} value={email2} onChange={(e) => setEmail2(e.target.value)} />
        </label>

        <div>
          <div> Nacionalidad </div>
          <label>
            <input
              type="radio"
              name="nacionalidad"
              value="Chilena"
              checked={nacionalidad === "Chilena"}
              onChange={() => setNacionalidad("Chilena")}
            />
            Chilena
          </label>
          <label>
            <input
              type="radio"
              name="nacionalidad"
              value="Extranjero"
              checked={nacionalidad === "Extranjero"}
              onChange={() => setNacionalidad("Extranjero")}
            />
            Extranjero
          </label>
        </div>

        {nacionalidad === "Chilena" ? (
          <label>
            Perteneciente a Pueblos Originarios
            <select style={getFieldStyle("pueblo")} value={pueblo} onChange={(e) => setPueblo(e.target.value)}>
              <option value="">-- seleccione --</option>
              {pueblosOpts.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.nombre}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <>
            <label>
              País
              <select style={getFieldStyle("pais")} value={pais} onChange={(e) => setPais(e.target.value)}>
                <option value="">-- seleccione --</option>
                {paisOpts.map((o) => (
                  <option key={o.id} value={o.nombre}>
                    {o.nombre}
                  </option>
                ))}
              </select>
            </label>
            {pais === "Otro" && (
              <label>
                Ingrese su país
                <input style={getFieldStyle("paisOtro")} value={paisOtro} onChange={(e) => setPaisOtro(e.target.value)} />
              </label>
            )}
          </>
        )}

        <label>
          Región de Residencia
          <select style={getFieldStyle("region")} value={region} onChange={(e) => setRegion(e.target.value)}>
            <option value="">-- seleccione --</option>
            {regionOpts.map((o) => (
              <option key={o.id} value={o.id}>
                {o.nombre}
              </option>
            ))}
          </select>
        </label>

        <label>
          Comuna de Residencia
          <select style={getFieldStyle("comuna")} value={comuna} onChange={(e) => setComuna(e.target.value)}>
            <option value="">-- seleccione --</option>
            {comunaOpts.map((o) => (
              <option key={o.id} value={o.id}>
                {o.nombre}
              </option>
            ))}
          </select>
        </label>

        <label>
          Institución de Educación
          <input
            maxLength={100}
            style={getFieldStyle("institucion")}
            value={institucion}
            onChange={(e) => setInstitucion(e.target.value)}
          />
        </label>

        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" onClick={handleSubmit}>
            Siguiente
          </button>
        </div>
      </div>
    </form>
  );
}
