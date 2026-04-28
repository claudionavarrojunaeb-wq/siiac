# Documentación detallada de frontend/src/features/inicio/InicioForm.tsx

## Código fuente

```tsx
import { type SyntheticEvent, useEffect, useId, useState } from "react";
import { useNavigate } from "react-router-dom";
import { crearSolicitud } from "../solicitud/solicitudService";
import logoSrc from "./assets/logo.jpg";
import infoIcon from "./assets/notice-info.png";

/* Colores solicitados (hex). Equivalentes RGB:
  - COLOR_BANNER: #0078E8 (rgb(0,120,232))
  - COLOR_CAMPAIGN: #4911EC (rgb(73,17,236))
  - COLOR_INFO_BG: #FFF1D4 (rgb(255,241,212))
  - COLOR_INFO_BORDER: #FFD24D (rgb(255,210,77))
  - COLOR_INFO_TEXT: #4B2E00 (rgb(75,46,0))
*/
const COLOR_BANNER = "#0078E8"; // banda informativa (rgb(0,120,232))
const COLOR_CAMPAIGN = "#4911EC"; // contenedor de campaña (rgb(73,17,236))
const COLOR_INFO_BG = "#FFF1D4"; // fondo aviso informativo (rgb(255,241,212))
const COLOR_INFO_BORDER = "#FFD24D"; // borde lateral del aviso (rgb(255,210,77))
const COLOR_INFO_TEXT = "#4B2E00"; // texto del aviso (rgb(75,46,0))

type CitizenTypeOption = {
  id: number;
  label: string;
};

const citizenTypeOptions: CitizenTypeOption[] = [
  { id: 1, label: "Estudiante (beneficiario o no beneficiario)" },
  { id: 2, label: "Padre, Madre, Tutor(a) o apoderado(a)" },
  { id: 3, label: "Red Colaboradora" },
  { id: 4, label: "Otro" },
];

const routeMap: Record<number, string> = {
  1: "/EstudianteForm",
  2: "/PadreForm",
  3: "/RedForm",
  4: "/OtroForm",
};

export default function InicioForm() {
  const selectId = useId();
  const navigate = useNavigate();

  const [selectedUserType, setSelectedUserType] = useState("");
  const [campaignHtml, setCampaignHtml] = useState("");
  const [isCampaignLoading, setIsCampaignLoading] = useState(true);
  const [campaignError, setCampaignError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  // campo de texto adicional cuando el usuario selecciona "Otro"
  const [otherDetail, setOtherDetail] = useState("");

  useEffect(() => {
    let ignore = false;

    const loadCampaign = async () => {
      try {
        setIsCampaignLoading(true);
        setCampaignError("");

        const response = await fetch("/api/campana-activa");
        if (!response.ok) throw new Error();

        const data = await response.json();

        if (!ignore) {
          // Sanitizar HTML recibido para eliminar estilos de fondo y atributos `bgcolor`
          const sanitizeCampaignHtml = (html: string) => {
            try {
              const parser = new DOMParser();
              const doc = parser.parseFromString(html, "text/html");

              const elements = doc.querySelectorAll("*");
              elements.forEach((el) => {
                // eliminar atributos bgcolor
                if (el.hasAttribute("bgcolor")) el.removeAttribute("bgcolor");

                // eliminar background en style
                const style = (el as HTMLElement).style;
                if (style) {
                  if (style.background) style.background = "transparent";
                  if (style.backgroundColor) style.backgroundColor = "transparent";
                }
                // también limpiar style inline que contenga background-*
                if (el.hasAttribute("style")) {
                  const newStyle = el
                    .getAttribute("style")
                    ?.replace(/background(-color)?\s*:\s*[^;]+;?/gi, "")
                    .replace(/background\s*:[^;]+;?/gi, "");
                  if (newStyle !== undefined) {
                    if (newStyle.trim() === "") el.removeAttribute("style");
                    else el.setAttribute("style", newStyle);
                  }
                }
              });

              // Forzar color de texto consistente (sin fondos) y serializar
              return doc.body.innerHTML;
            } catch {
              return html;
            }
          };

          setCampaignHtml(sanitizeCampaignHtml(data.campaignHtml ?? ""));
        }
      } catch {
        if (!ignore) {
          setCampaignError("No fue posible cargar la campaña vigente.");
        }
      } finally {
        if (!ignore) setIsCampaignLoading(false);
      }
    };

    loadCampaign();
    return () => {
      ignore = true;
    };
  }, []);

  // Desactivar siguiente si no se selecciona tipo, o si seleccionó "Otro" sin detallar
  const isNextDisabled =
    selectedUserType === "" ||
    (Number(selectedUserType) === 4 && otherDetail.trim() === "");

  const handleSubmit = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isNextDisabled) return;

    try {
      setIsSubmitting(true);

      const solicitudId = await crearSolicitud(Number(selectedUserType));

      const target = routeMap[Number(selectedUserType)] ?? "/";
      navigate(`${target}?solicitudid=${solicitudId}`);
    } catch (error) {
      console.error(error);
      alert("No fue posible continuar");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Encabezado con logo y título centrados */}
      <header className="text-center">
        <img src={logoSrc} alt="logo" className="mx-auto h-20 object-contain" />
        <h1 className="text-2xl font-semibold text-gray-800 mt-2">
          Formulario de contacto – OIRS Virtual
        </h1>
      </header>

      {/* Banda informativa (morado) bajo el título */}
      <div style={{ backgroundColor: COLOR_BANNER }} className="text-white text-center py-3 rounded mt-4">
        <p className="text-sm">Consulta, reclamo, sugerencia, felicitación o solicitud</p>
        <p className="text-sm">Realice diferentes solicitudes completando el siguiente formulario</p>
      </div>

      {/* Contenedor de campaña (HTML provisto por backend) */}
      <section className="mt-6">
        {isCampaignLoading && <p>Cargando campaña...</p>}
        {campaignError && <p className="text-red-600">{campaignError}</p>}
        {campaignHtml && (
            <div
              className="rounded-2xl p-6"
              style={{ backgroundColor: COLOR_CAMPAIGN, color: "white" }}
              dangerouslySetInnerHTML={{ __html: campaignHtml }}
            />
          )}
      </section>

      {/* Aviso informativo sin fondo de texto, con borde amarillo como la imagen */}
      <div className="mt-4 border-l-4 rounded p-3 flex items-center gap-3"
        style={{ borderColor: COLOR_INFO_BORDER, backgroundColor: COLOR_INFO_BG, color: COLOR_INFO_TEXT }}>
        <img src={infoIcon} alt="info" className="h-5 w-5" />
        <div className="text-sm">La respuesta será emitida al correo electrónico informado por usted. Revise que sus datos se encuentren correctamente ingresados.</div>
      </div>

      {/* Caja blanca con selección y botón */}
      <div className="mt-6 bg-white rounded-2xl p-6 shadow">
        <p className="text-gray-700 mb-4">
          Para orientarte de mejor manera, necesitamos que selecciones si eres estudiante (beneficiario o no beneficiario), padre, madre, tutor(a), apoderado(a), Red Colaboradora u otro tipo de usuario.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="max-w-xl mx-auto text-center">
            <label className="block text-black mb-2">Seleccione el tipo de usuario/a:</label>

            <select
              id={selectId}
              value={selectedUserType}
              onChange={(e) => setSelectedUserType(e.target.value)}
              className="mx-auto block w-80 border border-gray-300 rounded px-3 py-2 focus:outline-none"
              style={{ outlineColor: COLOR_CAMPAIGN, color: 'rgb(85,85,85)' }}
            >
              <option value="">- Seleccione el tipo de usuario/a -</option>
              {citizenTypeOptions.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>

            {/* Si selecciona "Otro", mostrar campo de detalle y requerirlo */}
            {Number(selectedUserType) === 4 && (
              <div className="mt-4 max-w-xl mx-auto text-left">
                <label className="block text-gray-700 mb-2">Detalle tipo de usuario/a:</label>
                <input
                  aria-label="Detalle otro"
                  placeholder="Ingrese tipo de usuario/a"
                  value={otherDetail}
                  onChange={(e) => setOtherDetail(e.target.value)}
                  className="block w-80 mx-auto border border-gray-300 rounded px-3 py-2 bg-white text-black"
                />
                <div className="mt-4">
                  <p className="text-sm text-gray-600 bg-gray-100 p-3 rounded">(Otros usuarios como: empresa, familiar, otra institución, fundación, etc.)</p>
                </div>
              </div>
            )}

            <div className="mt-6">
              <button
                type="submit"
                disabled={isNextDisabled || isSubmitting}
                className={`px-6 py-2 rounded text-white ${isNextDisabled || isSubmitting ? 'bg-purple-300' : ''}`}
                style={!isNextDisabled && !isSubmitting ? { backgroundColor: COLOR_CAMPAIGN } : undefined}
              >
                {isSubmitting ? "Enviando..." : "Siguiente"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
```

## Explicación detallada

- Resumen: Componente React que forma parte del flujo de formularios del frontend.

**Importaciones:**
- import { type SyntheticEvent, useEffect, useId, useState } from "react";
- import { useNavigate } from "react-router-dom";
- import { crearSolicitud } from "../solicitud/solicitudService";
- import logoSrc from "./assets/logo.jpg";
- import infoIcon from "./assets/notice-info.png";

**Declaraciones top-level (const/let/var):**
- const COLOR_BANNER
- const COLOR_CAMPAIGN
- const COLOR_INFO_BG
- const COLOR_INFO_BORDER
- const COLOR_INFO_TEXT
- const citizenTypeOptions: CitizenTypeOption[]
- const routeMap: Record<number, string>
- const selectId
- const navigate
- const [selectedUserType, setSelectedUserType]
- const [campaignHtml, setCampaignHtml]
- const [isCampaignLoading, setIsCampaignLoading]
- const [campaignError, setCampaignError]
- const [isSubmitting, setIsSubmitting]
- const [otherDetail, setOtherDetail]
- let ignore
- const loadCampaign
- const response
- const data
- const sanitizeCampaignHtml
- const parser
- const doc
- const elements
- const style
- const newStyle
- const isNextDisabled
- const handleSubmit
- const solicitudId
- const target

**Funciones / Componentes exportados:**
- `InicioForm`: componente o función exportada.

**Estructuras de control detectadas:**
- `await` usos: 3
- `fetch(...)` usos: 1
- bucles `for`: 0
- condicionales `if`: 12
- bloques `try/catch`: 3

**Notas sobre asincronía y peticiones:**
- Este archivo usa `await` para esperar operaciones asíncronas. Revisa las llamadas que retornan Promises (p. ej. `fetch`, `pool.query`, `crearSolicitud`).
- Contiene llamadas a `fetch(...)` que realizan peticiones HTTP desde el cliente hacia el backend. Asegúrate de manejar errores y timeouts.

**Hooks y APIs de React detectadas:**
- useEffect
- useId
- useState
- useNavigate
- useId
- useNavigate
- useState
- setCampaignHtml
- useState
- useState
- useState
- useState
- useState
- useEffect
- setCampaignHtml
- dangerouslySetInnerHTML

## Desglose por componente/función

### `InicioForm`
- Tipo: Componente React funcional.
- Puntos clave encontrados en el cuerpo:
  - Usa `useState` para manejar estado local.
  - Usa `useEffect` para efectos secundarios (cargas iniciales, suscripciones).

---
Nota: Esta explicación fue generada automáticamente. Puede editarse para añadir más contexto específico o ejemplos.