import { type SyntheticEvent, useEffect, useId, useState } from "react";
import { useNavigate } from "react-router-dom";
import { crearSolicitud } from "../solicitud/solicitudService";
import logoSrc from "./assets/logo.jpg";
import infoIcon from "./assets/notice-info.png";

const COLOR_BANNER = "#0078E8";
const COLOR_CAMPAIGN = "#4911EC";
const COLOR_INFO_BG = "#FFF1D4";
const COLOR_INFO_BORDER = "#FFD24D";
const COLOR_INFO_TEXT = "#4B2E00";

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
  const otherDetailId = useId();

  const [selectedUserType, setSelectedUserType] = useState("");
  const [campaignHtml, setCampaignHtml] = useState("");
  const [isCampaignLoading, setIsCampaignLoading] = useState(true);
  const [campaignError, setCampaignError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
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
          const sanitizeCampaignHtml = (html: string) => {
            try {
              const parser = new DOMParser();
              const doc = parser.parseFromString(html, "text/html");

              const elements = doc.querySelectorAll("*");
              elements.forEach((el) => {
                if (el.hasAttribute("bgcolor")) el.removeAttribute("bgcolor");

                const style = (el as HTMLElement).style;
                if (style) {
                  if (style.background) style.background = "transparent";
                  if (style.backgroundColor) style.backgroundColor = "transparent";
                }
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
      <header className="text-center">
        <img src={logoSrc} alt="logo" className="mx-auto h-20 object-contain" />
        <h1 className="text-2xl font-semibold text-gray-800 mt-2">
          Formulario de contacto – OIRS Virtual
        </h1>
      </header>

      <div style={{ backgroundColor: COLOR_BANNER }} className="text-white text-center py-3 rounded mt-4">
        <p className="text-sm">Consulta, reclamo, sugerencia, felicitación o solicitud</p>
        <p className="text-sm">Realice diferentes solicitudes completando el siguiente formulario</p>
      </div>

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

      <div className="mt-4 border-l-4 rounded p-3 flex items-center gap-3"
        style={{ borderColor: COLOR_INFO_BORDER, backgroundColor: COLOR_INFO_BG, color: COLOR_INFO_TEXT }}>
        <img src={infoIcon} alt="info" className="h-5 w-5" />
        <div className="text-sm">La respuesta será emitida al correo electrónico informado por usted. Revise que sus datos se encuentren correctamente ingresados.</div>
      </div>

      <div className="mt-6 bg-white rounded-2xl p-6 shadow">
        <p className="text-gray-700 mb-4">
          Para orientarte de mejor manera, necesitamos que selecciones si eres estudiante (beneficiario o no beneficiario), padre, madre, tutor(a), apoderado(a), Red Colaboradora u otro tipo de usuario.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="max-w-xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-2 md:gap-4">
              <label htmlFor={selectId} className="text-black md:text-right md:pr-2">Seleccione el tipo de usuario/a:</label>

              <div className="flex justify-center md:justify-start">
                <select
                  id={selectId}
                  value={selectedUserType}
                  onChange={(e) => setSelectedUserType(e.target.value)}
                  className="w-full md:w-80 border border-gray-300 rounded px-3 py-2 focus:outline-none"
                  style={{ outlineColor: COLOR_CAMPAIGN, color: 'rgb(85,85,85)' }}
                >
                  <option value="">- Seleccione el tipo de usuario/a -</option>
                  {citizenTypeOptions.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {Number(selectedUserType) === 4 && (
              <div className="mt-4 max-w-xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-2 md:gap-4">
                  <label htmlFor={otherDetailId} className="text-black md:text-right md:pr-2">Detalle tipo de usuario/a:</label>

                  <div className="flex justify-center md:justify-start">
                    <input
                      id={otherDetailId}
                      aria-label="Detalle otro"
                      placeholder="Ingrese tipo de usuario/a"
                      value={otherDetail}
                      onChange={(e) => setOtherDetail(e.target.value)}
                      className="w-full md:w-80 border border-gray-300 rounded px-3 py-2 bg-white text-black"
                    />
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-600 bg-gray-100 p-3 rounded">(Otros usuarios como: empresa, familiar, otra institución, fundación, etc.)</p>
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-center">
              <button
                type="submit"
                disabled={isNextDisabled || isSubmitting}
                className={`w-40 px-6 py-2 rounded-lg shadow-sm font-medium text-sm text-white ${isNextDisabled || isSubmitting ? 'bg-purple-300' : ''}`}
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