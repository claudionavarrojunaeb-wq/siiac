import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import logo from "../inicio/assets/logo.jpg";

interface TokenState {
  __tokenParams?: Record<string, string>;
}

export default function EstudianteForm() {
  const location = useLocation();

  const solicitudId = useMemo<string | null>(() => {
    const state = location.state as TokenState | null;
    const fromState = state?.__tokenParams?.solicitudid;
    if (fromState) return fromState;

    const params = new URLSearchParams(window.location.search);
    let id = params.get("solicitudid");
    if (!id) {
      try {
        const last = sessionStorage.getItem("last_params");
        if (last) {
          const obj = JSON.parse(last);
          id = obj?.solicitudid ?? id;
        }
      } catch (err) {
        void err;
      }
    }
    return id ?? null;
  }, [location]);

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

  type Option = { id: string; nombre: string };
  const [sexoOpts, setSexoOpts] = useState<Option[]>([]);
  const [generoOpts, setGeneroOpts] = useState<Option[]>([]);
  const [edadOpts, setEdadOpts] = useState<Option[]>([]);
  const [pueblosOpts, setPueblosOpts] = useState<Option[]>([]);
  const [paisOpts, setPaisOpts] = useState<Option[]>([]);
  const [regionOpts, setRegionOpts] = useState<Option[]>([]);
  const [comunaOpts, setComunaOpts] = useState<Option[]>([]);

  const [invalid, setInvalid] = useState<Record<string, boolean>>({});

  const celularRegex = useMemo(() => /^(\+56)?\s?9\d{8}$/, []);
  const telefonoRegex = useMemo(() => /^(\+56)?\s?\d{9}$/, []);

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
    return formattedBody + "-" + dv;
  }

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
    return expected === dv;
  }

  useEffect(() => {
    fetch("/api/sexo").then((r) => r.json()).then(setSexoOpts).catch(() => setSexoOpts([]));
    fetch("/api/genero").then((r) => r.json()).then(setGeneroOpts).catch(() => setGeneroOpts([]));
    fetch("/api/edad").then((r) => r.json()).then(setEdadOpts).catch(() => setEdadOpts([]));
    fetch("/api/pueblos").then((r) => r.json()).then(setPueblosOpts).catch(() => setPueblosOpts([]));
    fetch("/api/pais").then((r) => r.json()).then(setPaisOpts).catch(() => setPaisOpts([]));
    fetch("/api/region").then((r) => r.json()).then(setRegionOpts).catch(() => setRegionOpts([]));
  }, []);

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

  function handleRutBlur() {
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
      if (pais && pais.toString().toLowerCase().trim() === "otro" && !paisOtro) inv.paisOtro = true;
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
      pueblo: nacionalidad === "Chilena" ? pueblo : undefined,
      pais: nacionalidad === "Extranjero" ? (pais && pais.toString().toLowerCase().trim() === "otro" ? paisOtro : pais) : undefined,
      region,
      comuna,
      institucion,
    };
    console.log("Formulario válido, payload:", payload);
  }

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
              <div>
                <label className="block text-sm font-medium text-gray-700">Rut estudiante</label>
                <input
                  className={`mt-1 block w-full rounded-md shadow-sm p-2 border ${invalid.rut ? "bg-[rgb(255,192,192)] border-red-500" : "border-gray-300"}`}
                  value={rut}
                  onChange={(e) => setRut(e.target.value)}
                  onBlur={handleRutBlur}
                  placeholder="Ingrese el R.U.T. del estudiante"
                  title="Ingrese el R.U.T. del estudiante"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Nombres</label>
                <input
                  maxLength={100}
                  className={`mt-1 block w-full rounded-md shadow-sm p-2 border ${invalid.nombres ? "bg-[rgb(255,192,192)] border-red-500" : "border-gray-300"}`}
                  value={nombres}
                  onChange={(e) => setNombres(e.target.value)}
                  placeholder="Ingrese sus nombres"
                  title="Ingrese sus nombres"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Primer Apellido</label>
                <input
                  maxLength={50}
                  className={`mt-1 block w-full rounded-md shadow-sm p-2 border ${invalid.apellido1 ? "bg-[rgb(255,192,192)] border-red-500" : "border-gray-300"}`}
                  value={apellido1}
                  onChange={(e) => setApellido1(e.target.value)}
                  placeholder="Ingrese su primer apellido"
                  title="Ingrese su primer apellido"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Segundo Apellido</label>
                <input
                  maxLength={50}
                  className={`mt-1 block w-full rounded-md shadow-sm p-2 border ${invalid.apellido2 ? "bg-[rgb(255,192,192)] border-red-500" : "border-gray-300"}`}
                  value={apellido2}
                  onChange={(e) => setApellido2(e.target.value)}
                  placeholder="Ingrese su segundo apellido"
                  title="Ingrese su segundo apellido"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Sexo</label>
                <select
                  className={`mt-1 block w-full rounded-md shadow-sm p-2 border ${invalid.sexo ? "bg-[rgb(255,192,192)] border-red-500" : "border-gray-300"}`}
                  value={sexo}
                  onChange={(e) => setSexo(e.target.value)}
                  title="Seleccione su sexo"
                >
                  <option value="">- Seleccione su sexo -</option>
                  {sexoOpts.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Género</label>
                <select
                  className={`mt-1 block w-full rounded-md shadow-sm p-2 border ${invalid.genero ? "bg-[rgb(255,192,192)] border-red-500" : "border-gray-300"}`}
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

              <div>
                <label className="block text-sm font-medium text-gray-700">Edad</label>
                <select
                  className={`mt-1 block w-full rounded-md shadow-sm p-2 border ${invalid.edad ? "bg-[rgb(255,192,192)] border-red-500" : "border-gray-300"}`}
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

              <div>
                <label className="block text-sm font-medium text-gray-700">Teléfono / Celular</label>
                <input
                  className={`mt-1 block w-full rounded-md shadow-sm p-2 border ${invalid.telefono ? "bg-[rgb(255,192,192)] border-red-500" : "border-gray-300"}`}
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="Si es celular utilizar formato +569 y si es fijo indicar el código de la región"
                  title="Si es celular utilizar formato +569 y si es fijo indicar el código de la región"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Correo Electrónico</label>
                <input
                  className={`mt-1 block w-full rounded-md shadow-sm p-2 border ${invalid.email ? "bg-[rgb(255,192,192)] border-red-500" : "border-gray-300"}`}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Ingrese su correo electrónico"
                  title="Ingrese su correo electrónico"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Repita Correo Electrónico</label>
                <input
                  className={`mt-1 block w-full rounded-md shadow-sm p-2 border ${invalid.email2 ? "bg-[rgb(255,192,192)] border-red-500" : "border-gray-300"}`}
                  value={email2}
                  onChange={(e) => setEmail2(e.target.value)}
                  placeholder="Repita su correo electrónico"
                  title="Repita su correo electrónico"
                />
              </div>

              <div className="md:col-span-2">
                <div className="block text-sm font-medium text-gray-700 mb-2">Nacionalidad</div>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="nacionalidad"
                      value="Chilena"
                      checked={nacionalidad === "Chilena"}
                      onChange={() => setNacionalidad("Chilena")}
                    />
                    <span className="text-sm">Chilena</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="nacionalidad"
                      value="Extranjero"
                      checked={nacionalidad === "Extranjero"}
                      onChange={() => setNacionalidad("Extranjero")}
                    />
                    <span className="text-sm">Extranjero</span>
                  </label>
                </div>
              </div>

              {nacionalidad === "Chilena" ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Perteneciente a Pueblos Originarios</label>
                  <select
                    className={`mt-1 block w-full rounded-md shadow-sm p-2 border ${invalid.pueblo ? "bg-[rgb(255,192,192)] border-red-500" : "border-gray-300"}`}
                    value={pueblo}
                    onChange={(e) => setPueblo(e.target.value)}
                    title="-- seleccione --"
                  > 
                    {/* <option value="">--Seleccione su pueblo originario--</option> */}
                    {pueblosOpts.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">País</label>
                    <select
                      className={`mt-1 block w-full rounded-md shadow-sm p-2 border ${invalid.pais ? "bg-[rgb(255,192,192)] border-red-500" : "border-gray-300"}`}
                      value={pais}
                        onChange={(e) => setPais(e.target.value)}
                        title="Seleccione su país de origen"
                    >
                      <option value="">- Seleccione su país de origen -</option>
                      {paisOpts.map((o) => (
                        <option key={o.id} value={o.nombre}>
                          {o.nombre}
                        </option>
                      ))}
                      <option value="Otro">Otro</option>
                    </select>
                  </div>

                  <div>
                    {pais && pais.toString().toLowerCase().trim() === "otro" ? (
                      <>
                        <label className="block text-sm font-medium text-gray-700">Ingrese su país</label>
                        <input
                          className={`mt-1 block w-full rounded-md shadow-sm p-2 border ${invalid.paisOtro ? "bg-[rgb(255,192,192)] border-red-500" : "border-gray-300"}`}
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

              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Región de Residencia</label>
                  <select
                    className={`mt-1 block w-full rounded-md shadow-sm p-2 border ${invalid.region ? "bg-[rgb(255,192,192)] border-red-500" : "border-gray-300"}`}
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
                    className={`mt-1 block w-full rounded-md shadow-sm p-2 border ${invalid.comuna ? "bg-[rgb(255,192,192)] border-red-500" : "border-gray-300"}`}
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

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Institución de Educación</label>
                <input
                  maxLength={100}
                  className={`mt-1 block w-full rounded-md shadow-sm p-2 border ${invalid.institucion ? "bg-[rgb(255,192,192)] border-red-500" : "border-gray-300"}`}
                  value={institucion}
                  onChange={(e) => setInstitucion(e.target.value)}
                  placeholder="Ingrese el nombre de la institución donde estudia. Si no es beneficiario, indique “No aplica”"
                  title="Ingrese el nombre de la institución donde estudia. Si no es beneficiario, indique “No aplica”"
                />
              </div>
            </div>

            <div className="flex justify-center mt-6">
              <div className="flex items-center gap-6">
                <button
                  type="button"
                  onClick={() => { window.location.href = 'http://localhost:5173/'; }}
                  className="inline-flex justify-center items-center w-40 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm font-medium text-sm"
                >
                  Volver
                </button>

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
