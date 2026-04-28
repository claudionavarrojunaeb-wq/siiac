// StrictMode ayuda a detectar practicas inseguras o efectos secundarios no deseados durante desarrollo.
// Aunque no cambia el resultado visual final en produccion, sirve como red de seguridad durante el trabajo.
import { StrictMode } from 'react'

// createRoot es la API moderna de React para inicializar el arbol de componentes sobre un nodo real del DOM.
import { createRoot } from 'react-dom/client'

// Este import incorpora los estilos globales que establecen la base visual comun de toda la aplicacion.
import './index.css'

// App concentra la pantalla principal que se renderiza dentro del contenedor raiz del HTML servido por Vite.
import App from './App.tsx'

// Se busca el nodo con id root definido en index.html. La asercion ! indica que el proyecto asume que ese
// nodo existe siempre; si faltara, el arranque fallaria de inmediato y eso revelaria un problema estructural.
createRoot(document.getElementById('root')!).render(
  // StrictMode envuelve toda la aplicacion para activar comprobaciones extra de React en desarrollo.
  <StrictMode>
    {/* Este comentario queda dentro del arbol JSX con la sintaxis propia de React para que documente el montaje sin renderizar texto visible en pantalla. */}
    <App />
  </StrictMode>,
)
