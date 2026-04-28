import { useMemo } from "react";
import { useLocation } from "react-router-dom";

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

  return (
    <main className="p-6">
      <h1 className="mb-4 text-xl font-bold">Formulario - Estudiante</h1>
      <p className="mb-2">Identificador de solicitud recibido:</p>
      <pre className="rounded border bg-gray-50 p-3">{solicitudId ?? "(no provisto)"}</pre>
    </main>
  );
}
