# Documentación detallada de frontend/src/features/estudiante/EstudianteForm.tsx

## Código fuente

```tsx
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

```

## Explicación detallada

- Resumen: Componente React que forma parte del flujo de formularios del frontend.

**Importaciones:**
- import { useEffect, useState } from "react";
- import { useLocation } from "react-router-dom";

**Declaraciones top-level (const/let/var):**
- const [solicitudId, setSolicitudId]
- const location
- const state
- const fromState
- const params
- let id
- const last
- const obj

**Funciones / Componentes exportados:**
- `EstudianteForm`: componente o función exportada.

**Estructuras de control detectadas:**
- `await` usos: 0
- `fetch(...)` usos: 0
- bucles `for`: 0
- condicionales `if`: 3
- bloques `try/catch`: 1

**Hooks y APIs de React detectadas:**
- useEffect
- useState
- useLocation
- useState
- useLocation
- useEffect

## Desglose por componente/función

### `EstudianteForm`
- Tipo: Componente React funcional.
- Puntos clave encontrados en el cuerpo:
  - Usa `useEffect` para efectos secundarios (cargas iniciales, suscripciones).

---
Nota: Esta explicación fue generada automáticamente. Puede editarse para añadir más contexto específico o ejemplos.