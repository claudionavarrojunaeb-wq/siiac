import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

interface TokenState {
  __tokenParams?: Record<string, string>;
}

// Este componente representa el formulario específico para `Estudiante`.
// Objetivo: leer `solicitudid` desde la query string y mostrarlo en la vista.
export default function EstudianteForm() {
  // `solicitudId` mantiene el valor obtenido de la URL. Se muestra en pantalla
  // para confirmar que el flujo desde `InicioForm.tsx` pasó correctamente el id.
  const [solicitudId, setSolicitudId] = useState<string | null>(null);

  const location = useLocation();

  useEffect(() => {
    // Primero intentar leer desde location.state (oculto por token)
    const state = location.state as TokenState | null;
    const fromState = state?.__tokenParams?.solicitudid;
    if (fromState) {
      setSolicitudId(fromState);
      return;
    }

    // Fallback: leer la query string si existe
    const params = new URLSearchParams(window.location.search);
    let id = params.get("solicitudid");
    // Último recurso: leer desde sessionStorage si existe (back/forward cases)
    if (!id) {
      try {
        const last = sessionStorage.getItem('last_params');
        if (last) {
          const obj = JSON.parse(last);
          id = obj?.solicitudid ?? id;
        }
      } catch {}
    }
    setSolicitudId(id);
  }, [location]);

  return (
    <main className="p-6">
      <h1 className="mb-4 text-xl font-bold">Formulario - Estudiante</h1>
      <p className="mb-2">Identificador de solicitud recibido:</p>
      <pre className="rounded border bg-gray-50 p-3">{solicitudId ?? "(no provisto)"}</pre>
    </main>
  );
}
