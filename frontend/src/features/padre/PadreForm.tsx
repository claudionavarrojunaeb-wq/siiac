import { useMemo } from "react";
import { useLocation } from "react-router-dom";

interface TokenState {
  __tokenParams?: Record<string, string>;
}

export default function PadreForm() {
  const location = useLocation();
  const solicitudId = useMemo(() => {
    const state = location.state as TokenState | null;
    const fromState = state?.__tokenParams?.solicitudid;
    if (fromState) return fromState;
    const fromQuery = new URLSearchParams(window.location.search).get("solicitudid");
    if (fromQuery) return fromQuery;
    try {
      const last = sessionStorage.getItem('last_params');
      if (last) {
        const obj = JSON.parse(last);
        return obj?.solicitudid ?? null;
      }
    } catch {}
    return null;
  }, [location]);

  return (
    <main className="p-6">
      <h1 className="mb-4 text-xl font-bold">Formulario - Padre / Madre / Apoderado</h1>
      <p className="mb-2">Identificador de solicitud recibido:</p>
      <pre className="rounded border bg-gray-50 p-3">{solicitudId ?? "(no provisto)"}</pre>
    </main>
  );
}
