import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

// Crear una política global de Trusted Types para evitar bloqueos cuando
// el entorno exige TrustedHTML/TrustedScript. Esto permite crear TrustedHTML
// a partir de cadenas sanitizadas en componentes que lo requieran.
try {
  const win = window as any;
  const tt = win.trustedTypes;
  if (tt && typeof tt.createPolicy === 'function') {
    try {
      tt.createPolicy('siiac-policy', {
        createHTML: (s: string) => s,
        createScript: (s: string) => s,
        createScriptURL: (s: string) => s,
      });
    } catch (e) {
      // Si la policy ya existe o la creación falla, no bloquear la app
      console.warn('TrustedTypes policy creation skipped or failed:', e);
    }
  }
} catch (e) {
  console.warn('TrustedTypes setup error:', e);
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
