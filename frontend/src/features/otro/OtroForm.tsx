import { useMemo } from "react";
import { useLocation } from "react-router-dom";

interface TokenState {
  __tokenParams?: Record<string, string>;
}

// Formulario para el tipo `Otro`.
// Lee `solicitudid` desde la query string y lo presenta en pantalla.
export default function OtroForm() {
  const location = useLocation();
  const solicitudId = useMemo(() => {
    const state = location.state as TokenState | null;
    const fromState = state?.__tokenParams?.solicitudid;
    if (fromState) return fromState;
    const params = new URLSearchParams(window.location.search);
    let id = params.get("solicitudid");
    if (!id) {
      try {
        const last = sessionStorage.getItem('last_params');
        if (last) {
          const obj = JSON.parse(last);
          id = obj?.solicitudid ?? id;
        }
      } catch {}
    }
    return id;
  }, [location]);

  return (
    <main className="p-6">
      <h1 className="mb-4 text-xl font-bold">Formulario - Otro</h1>
      <p className="mb-2">Identificador de solicitud recibido:</p>
      <pre className="rounded border bg-gray-50 p-3">{solicitudId ?? "(no provisto)"}</pre>
    </main>
  );
}
