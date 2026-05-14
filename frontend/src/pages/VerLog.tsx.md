# Documentación detallada de frontend/src/pages/VerLog.tsx

## Código fuente

```tsx
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';

/**
 * Tipo que representa una coincidencia retornada por el endpoint
 * `GET /api/logsViewer/search`.
 *
 * - `date`: fecha extraída del nombre del fichero (YYYYMMDD).
 * - `file`: nombre del fichero donde se encontró la línea (ej. 20260501.jsonl).
 * - `line`: contenido completo de la línea coincidente.
 * - `index`: índice de línea (0-based) dentro del fichero.
 *
 * Este tipo reemplaza el uso de `any` para cumplir con la regla
 * `@typescript-eslint/no-explicit-any` y proporcionar seguridad
 * de tipos en el componente.
 */
type LogMatch = {
  date: string;
  file: string;
  line: string;
  index: number;
};

// DateInput: muestra `placeholder` cuando está vacío (tipo text),
// al hacer focus cambia a `date` para mostrar el selector nativo.
function DateInput({
  value,
  onChange,
  ## Explicación línea a línea

  A continuación se describe cada línea del archivo `frontend/src/pages/VerLog.tsx` con detalle técnico y propósito.

  - L1: `import { useEffect, useState } from 'react';` — importa los hooks `useEffect` y `useState` desde React para efectos y estado local.
  - L2: `import type { ReactNode } from 'react'` — importa únicamente el tipo `ReactNode` para anotaciones TypeScript.
  - L3: (línea en blanco) — separador lógico entre importaciones y documentación del tipo.
  - L4: `/**` — inicio de bloque de comentario JSDoc que documenta el tipo `LogMatch`.
  - L5: ` * Tipo que representa una coincidencia retornada por el endpoint` — descripción del propósito del bloque.
  - L6: ` * `GET /api/logsViewer/search`.` — referencia al endpoint backend que produce estos datos.
  - L7: ` *` — línea en blanco dentro del JSDoc para separar secciones.
  - L8: ` * - `date`: fecha extraída del nombre del fichero (YYYYMMDD).` — explica la propiedad `date` del tipo.
  - L9: ` * - `file`: nombre del fichero donde se encontró la línea (ej. 20260501.jsonl).` — explica la propiedad `file`.
  - L10: ` * - `line`: contenido completo de la línea coincidente.` — explica la propiedad `line`.
  - L11: ` * - `index`: índice de línea (0-based) dentro del fichero.` — explica la propiedad `index`.
  - L12: ` *` — separador en el JSDoc.
  - L13: ` * Este tipo reemplaza el uso de `any` para cumplir con la regla` — nota sobre motivo de tipado estricto.
  - L14: ` * `@typescript-eslint/no-explicit-any` y proporcionar seguridad` — continuación de la nota de tipado.
  - L15: ` * de tipos en el componente.` — cierre de la razón para usar tipos explícitos.
  - L16: ` */` — fin del bloque JSDoc.
  - L17: `type LogMatch = {` — inicio de la definición del tipo TypeScript `LogMatch`.
  - L18: `  date: string;` — declaración de la propiedad `date` como `string`.
  - L19: `  file: string;` — declaración de la propiedad `file`.
  - L20: `  line: string;` — declaración de la propiedad `line`.
  - L21: `  index: number;` — declaración de la propiedad `index` como `number`.
  - L22: `};` — cierre de la definición del tipo `LogMatch`.
  - L23: (línea en blanco) — separador entre tipos y definición de componente auxiliar.
  - L24: `// DateInput: muestra `placeholder` cuando está vacío (tipo text),` — comentario corto que explica la intención del componente auxiliar `DateInput`.
  - L25: `// al hacer focus cambia a `date` para mostrar el selector nativo.` — detalle del comportamiento dinámico del input.
  - L26: `function DateInput({` — inicio de la declaración del componente `DateInput` (función, no exportado).
  - L27: `  value,` — parámetro `value` pasado al componente (valor del input).
  - L28: `  onChange,` — parámetro `onChange`, callback para actualizar el valor en el padre.
  - L29: `  placeholder,` — parámetro `placeholder` para texto guía cuando el campo está vacío.
  - L30: `  ariaLabel,` — parámetro `ariaLabel` para accesibilidad (atributo `aria-label`).
  - L31: `  className,` — parámetro `className` para estilos CSS/Tailwind.
  - L32: `}: {` — inicio de la anotación del tipo del objeto de props en TypeScript.
  - L33: `  value: string;` — tipo de `value` declarado como `string`.
  - L34: `  onChange: (v: string) => void;` — tipo del callback `onChange` que recibe un `string`.
  - L35: `  placeholder?: string;` — `placeholder` es opcional y de tipo `string`.
  - L36: `  ariaLabel?: string;` — `ariaLabel` es opcional.
  - L37: `  className?: string;` — `className` es opcional.
  - L38: `}) {` — cierre de la firma de la función y comienzo del cuerpo.
  - L39: `  const [focused, setFocused] = useState(false);` — hook de estado local que indica si el input está enfocado.
  - L40: `  const inputType = focused || value ? 'date' : 'text';` — lógica para elegir `type='date'` cuando hay foco o valor; muestra `placeholder` si `text`.
  - L41: `  return (` — inicio del retorno JSX del componente `DateInput`.
  - L42: `    <input` — entrada JSX `<input`.
  - L43: `      type={inputType}` — asigna dinámicamente el `type` (`text` o `date`).
  - L44: `      className={className}` — aplica las clases recibidas (Tailwind/CSS).
  - L45: `      placeholder={placeholder}` — pasa el `placeholder` al input (visible cuando `type='text'`).
  - L46: `      aria-label={ariaLabel}` — añade atributo `aria-label` para accesibilidad.
  - L47: `      value={value}` — enlaza el valor controlado del input.
  - L48: `      onChange={(e) => onChange(e.target.value)}` — llama a `onChange` con el nuevo valor cuando cambia el input.
  - L49: `      onFocus={() => setFocused(true)}` — al enfocar, marca el estado `focused` como `true`.
  - L50: `      onBlur={(e) => {` — manejador `onBlur` (cuando el input pierde foco).
  - L51: `        if (!e.currentTarget.value) setFocused(false);` — cuando el campo queda vacío al perder foco, resetea `focused` a `false` para volver a mostrar placeholder.
  - L52: `      }}` — cierre del bloque `onBlur`.
  - L53: `    />` — cierre del elemento `<input />`.
  - L54: `  );` — cierre del retorno JSX del componente `DateInput`.
  - L55: `}` — fin del componente `DateInput`.
  - L56: (línea en blanco) — separador antes del componente principal.
  - L57: `export default function VerLog() {` — declaración y exportación por defecto del componente principal `VerLog`.
  - L58: `  const [dates, setDates] = useState<string[]>([]);` — estado `dates` (array de strings) con setter `setDates`.
  - L59: `  const [term, setTerm] = useState('');` — estado `term` para el texto de búsqueda.
  - L60: `  const [from, setFrom] = useState('');` — estado `from` para la fecha inicial seleccionada.
  - L61: `  const [to, setTo] = useState('');` — estado `to` para la fecha final seleccionada.
  - L62: `  const [results, setResults] = useState<LogMatch[]>([]);` — estado `results` que almacena coincidencias tipadas `LogMatch[]`.
  - L63: `  const [loading, setLoading] = useState(false);` — estado booleano `loading` para indicar búsqueda en curso.
  - L64: (línea en blanco) — separador antes del efecto.
  - L65: `  useEffect(() => {` — hook `useEffect` que se ejecuta al montar el componente para cargar fechas disponibles.
  - L66: `    fetch('/api/logsViewer/list')` — realiza petición al endpoint `/api/logsViewer/list`.
  - L67: `      .then((r) => r.json())` — parsea la respuesta JSON.
  - L68: `      .then((j) => setDates(j.dates || []))` — actualiza `dates` con `j.dates` o array vacío si no viene.
  - L69: `      .catch(() => setDates([]));` — en caso de error, asegura que `dates` quede como array vacío.
  - L70: `  }, []);` — array de deps vacío: se ejecuta solo al montar.
  - L71: (línea en blanco) — separador antes de `doSearch`.
  - L72: `  async function doSearch() {` — función asíncrona que ejecuta la búsqueda en backend.
  - L73: `    setLoading(true);` — marca `loading` en true al iniciar la búsqueda.
  - L74: `    try {` — inicio de bloque try para manejo de errores.
  - L75: `      const params = new URLSearchParams();` — crea instancia para construir query string.
  - L76: `      if (term) params.set('term', term);` — añade `term` si existe.
  - L77: `      if (from) params.set('from', from);` — añade `from` si existe.
  - L78: `      if (to) params.set('to', to);` — añade `to` si existe.
  - L79: `      const r = await fetch('/api/logsViewer/search?' + params.toString());` — hace la petición `search` con los parámetros.
  - L80: `      const j = await r.json();` — parsea la respuesta JSON.
  - L81: `      setResults(j.matches || []);` — almacena las coincidencias en `results` (o array vacío si no vienen).
  - L82: `    } catch (e) {` — captura errores de la petición/parsing.
  - L83: `      console.error(e);` — loguea el error en consola para diagnóstico.
  - L84: `      setResults([]);` — en error, limpia los resultados.
  - L85: `    } finally {` — bloque `finally` que siempre se ejecuta.
  - L86: `      setLoading(false);` — marca `loading` en false al terminar (éxito o fallo).
  - L87: `    }` — cierre del try/catch/finally.
  - L88: `  }` — fin de la función `doSearch`.
  - L89: (línea en blanco) — separador antes de la función de resaltado.
  - L90: `  function renderHighlighted(line: string, term: string) {` — función que devuelve JSX con coincidencias resaltadas.
  - L91: `    if (!term) return line;` — si no hay término de búsqueda, devuelve la línea sin cambios.
  - L92: `    const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");` — helper para escapar caracteres especiales de regex.
  - L93: `    const esc = escapeRegExp(term);` — aplica escape al `term`.
  - L94: `    const re = new RegExp(esc, 'gi');` — crea expresión regular global y case-insensitive.
  - L95: `    const elements: Array<ReactNode> = [];` — array que acumulará fragmentos de texto y elementos JSX.
  - L96: `    let lastIndex = 0;` — posición del último corte en la línea.
  - L97: `    let match: RegExpExecArray | null;` — variable para iterar coincidencias del regex.
  - L98: `    let i = 0;` — contador para keys de elementos resaltados.
  - L99: `    while ((match = re.exec(line)) !== null) {` — bucle que itera todas las coincidencias en la línea.
  - L100: `      const start = match.index;` — índice de inicio de la coincidencia actual.
  - L101: `      if (start > lastIndex) {` — si existe texto entre `lastIndex` y `start`, lo añade.
  - L102: `        elements.push(line.slice(lastIndex, start));` — añade texto no coincidiente al array de elementos.
  - L103: `      }` — cierre del condicional.
  - L104: `      elements.push(` — añade un span con la coincidencia resaltada.
  - L105: `        <span key={`m-${i}-${start}`} className="bg-yellow-200 text-black px-1 rounded">` — span con clases visuales y key única.
  - L106: `          {match[0]}` — contenido de la coincidencia original.
  - L107: `        </span>,` — cierre del span añadido.
  - L108: `      );` — cierre del `elements.push`.
  - L109: `      lastIndex = re.lastIndex;` — actualiza `lastIndex` al final de la coincidencia.
  - L110: `      i += 1;` — incrementa contador de keys.
  - L111: `    }` — fin del bucle `while`.
  - L112: `    if (lastIndex < line.length) elements.push(line.slice(lastIndex));` — añade el resto de la línea después de la última coincidencia.
  - L113: `    return elements.length ? elements : line;` — si hay elementos, devuelve el array (JSX), si no devuelve la línea original.
  - L114: `  }` — fin de `renderHighlighted`.
  - L115: (línea en blanco) — separador antes del JSX de retorno.
  - L116: `  return (` — inicio del retorno JSX del componente `VerLog`.
  - L117: `    <main className="p-6">` — contenedor principal con padding aplicado por Tailwind.
  - L118: `      <div className="max-w-4xl mx-auto">` — contenedor centrado con ancho máximo.
  - L119: `        <h1 className="text-2xl font-semibold mb-4">Visor de logs</h1>` — título de la página.
  - L120: (línea en blanco) — separador visual en el JSX.
  - L121: `        <div className="mb-4 p-4 bg-white rounded shadow">` — tarjeta que contiene los controles de búsqueda.
  - L122: `          {/* Controles de búsqueda: en pantallas pequeñas se apilan, en pantallas >= sm van en fila */}` — comentario JSX explicativo del layout responsive.
  - L123: `          <div className="flex flex-col sm:flex-row gap-2 items-stretch">` — contenedor flexible que cambia de columna a fila según el breakpoint `sm`.
  - L124: `            <input` — input de texto para término de búsqueda.
  - L125: `              className="border p-2 rounded flex-1 min-w-0"` — clases que permiten que el campo crezca y no rompa el layout.
  - L126: `              placeholder="Buscar término (ej: 12.883.038-3)"` — placeholder visible para guiar al usuario.
  - L127: `              value={term}` — input controlado ligado al estado `term`.
  - L128: `              onChange={(e) => setTerm(e.target.value)}` — actualiza `term` cuando cambia el valor.
  - L129: `            />` — cierre del input del término.
  - L130: `            <DateInput` — uso del componente `DateInput` para la fecha `from`.
  - L131: `              value={from}` — pasa `from` como `value`.
  - L132: `              onChange={setFrom}` — pasa `setFrom` como `onChange` para actualizar el estado.
  - L133: `              placeholder="Desde"` — placeholder visible cuando no hay valor.
  - L134: `              ariaLabel="Fecha desde"` — etiqueta accesible para lectores de pantalla.
  - L135: `              className="border p-2 rounded w-full sm:w-auto"` — clases estilos y comportamiento responsive.
  - L136: `            />` — cierre del primer `DateInput`.
  - L137: `            <DateInput` — uso del componente `DateInput` para la fecha `to`.
  - L138: `              value={to}` — pasa `to` como `value`.
  - L139: `              onChange={setTo}` — enlace al setter `setTo`.
  - L140: `              placeholder="Hasta"` — placeholder visible cuando no hay valor.
  - L141: `              ariaLabel="Fecha hasta"` — etiqueta accesible.
  - L142: `              className="border p-2 rounded w-full sm:w-auto"` — clases para estilo y responsive.
  - L143: `            />` — cierre del segundo `DateInput`.
  - L144: `            <button` — botón de búsqueda.
  - L145: `              className="bg-blue-600 text-white px-4 py-2 rounded w-full sm:w-auto"` — estilos y ancho responsive (llena en mobile).
  - L146: `              onClick={doSearch}` — al hacer click ejecuta `doSearch`.
  - L147: `              disabled={loading}` — deshabilita el botón mientras `loading` es true.
  - L148: `            >` — apertura del contenido del botón.
  - L149: `              {loading ? 'Buscando...' : 'Buscar'}` — muestra texto condicional según estado de carga.
  - L150: `            </button>` — cierre del botón.
  - L151: `          </div>` — cierre del contenedor flexible de controles.
  - L152: `          <div className="text-sm text-gray-500 mt-2">Fechas disponibles: {dates.join(', ')}</div>` — muestra las fechas disponibles concatenadas.
  - L153: `        </div>` — cierre de la tarjeta de controles.
  - L154: (línea en blanco) — separador en el JSX.
  - L155: `        <div className="bg-white rounded shadow p-4">` — tarjeta que contiene los resultados.
  - L156: `          <div className="text-sm text-gray-700 mb-2">Resultados: {results.length}</div>` — contador de resultados mostrados.
  - L157: `          <div className="space-y-2 max-h-[60vh] overflow-y-auto font-mono text-xs">` — contenedor con scroll y tipografía monoespaciada para las líneas.
  - L158: `            {results.map((r, idx) => {` — mapeo sobre `results` para renderizar cada coincidencia.
  - L159: `              const base = r.file.replace(/\.(jsonl|md)$/, '');` — extrae la base del nombre de fichero sin extensión.
  - L160: `              const jsonlName = `${base}.jsonl`;` — construye nombre `.jsonl` asociado.
  - L161: `              const mdName = `${base}.md`;` — construye nombre `.md` asociado.
  - L162: `              return (` — inicio del JSX por elemento.
  - L163: `                <div key={idx} className="p-2 border rounded overflow-x-auto">` — contenedor por resultado con scroll horizontal si es necesario.
  - L164: `                  <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mb-1">` — fila con metadatos (fecha, archivos, línea).
  - L165: `                    <span className="font-medium">{r.date}</span>` — muestra la fecha del resultado.
  - L166: `                    <a className="text-blue-600 underline" href={`/api/logsViewer/file?name=${encodeURIComponent(jsonlName)}`}>{jsonlName}</a>` — enlace para descargar el `.jsonl`.
  - L167: `                    <a className="text-blue-600 underline" href={`/api/logsViewer/file?name=${encodeURIComponent(mdName)}`}>({mdName})</a>` — enlace para descargar el `.md` asociado.
  - L168: `                    <span className="ml-auto">line {r.index}</span>` — indica el índice de la línea encontrada, alineado a la derecha.
  - L169: `                  </div>` — cierre de la fila de metadatos.
  - L170: `                  <div className="whitespace-pre-wrap wrap-break-word overflow-x-auto">{renderHighlighted(r.line, term)}</div>` — muestra la línea con formato pre y saltos, usando `renderHighlighted` para resaltar el término y permitiendo scroll horizontal.
  - L171: `                </div>` — cierre del contenedor por resultado.
  - L172: `              );` — fin del `return` del mapeo.
  - L173: `            })}` — cierre del `map`.
  - L174: `          </div>` — cierre del contenedor de resultados.
  - L175: `        </div>` — cierre de la tarjeta de resultados.
  - L176: `      </div>` — cierre del contenedor centrado.
  - L177: `    </main>` — cierre del `main`.
  - L178: `  );` — cierre del retorno JSX del componente `VerLog`.
  - L179: `}` — fin del componente `VerLog` y del archivo.

  ---

  Si deseas, puedo:

  - Añadir anotaciones en línea directamente en el archivo `.tsx` como comentarios explicativos.
  - Generar un resumen más corto por secciones (imports, helpers, estado, UI) si prefieres lectura rápida.

  Fin de la explicación línea a línea.
      console.error(e);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  function renderHighlighted(line: string, term: string) {
    if (!term) return line;
    const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const esc = escapeRegExp(term);
    const re = new RegExp(esc, 'gi');
    const elements: Array<ReactNode> = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    let i = 0;
    while ((match = re.exec(line)) !== null) {
      const start = match.index;
      if (start > lastIndex) {
        elements.push(line.slice(lastIndex, start));
      }
      elements.push(
        <span key={`m-${i}-${start}`} className="bg-yellow-200 text-black px-1 rounded">
          {match[0]}
        </span>,
      );
      lastIndex = re.lastIndex;
      i += 1;
    }
    if (lastIndex < line.length) elements.push(line.slice(lastIndex));
    return elements.length ? elements : line;
  }

  return (
    <main className="p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-semibold mb-4">Visor de logs</h1>

        <div className="mb-4 p-4 bg-white rounded shadow">
          {/* Controles de búsqueda: en pantallas pequeñas se apilan, en pantallas >= sm van en fila */}
          <div className="flex flex-col sm:flex-row gap-2 items-stretch">
            <input
              className="border p-2 rounded flex-1 min-w-0"
              placeholder="Buscar término (ej: 12.883.038-3)"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
            />
            <input
              type="date"
              className="border p-2 rounded w-full sm:w-auto"
              placeholder="Desde"
              aria-label="Fecha desde"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
            <input
              type="date"
              className="border p-2 rounded w-full sm:w-auto"
              placeholder="Hasta"
              aria-label="Fecha hasta"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded w-full sm:w-auto"
              onClick={doSearch}
              disabled={loading}
            >
              {loading ? 'Buscando...' : 'Buscar'}
            </button>
          </div>
          <div className="text-sm text-gray-500 mt-2">Fechas disponibles: {dates.join(', ')}</div>
        </div>

        <div className="bg-white rounded shadow p-4">
          <div className="text-sm text-gray-700 mb-2">Resultados: {results.length}</div>
          <div className="space-y-2 max-h-[60vh] overflow-y-auto font-mono text-xs">
            {results.map((r, idx) => {
              const base = r.file.replace(/\.(jsonl|md)$/, '');
              const jsonlName = `${base}.jsonl`;
              const mdName = `${base}.md`;
              return (
                <div key={idx} className="p-2 border rounded overflow-x-auto">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mb-1">
                    <span className="font-medium">{r.date}</span>
                    <a className="text-blue-600 underline" href={`/api/logsViewer/file?name=${encodeURIComponent(jsonlName)}`}>{jsonlName}</a>
                    <a className="text-blue-600 underline" href={`/api/logsViewer/file?name=${encodeURIComponent(mdName)}`}>({mdName})</a>
                    <span className="ml-auto">line {r.index}</span>
                  </div>
                  <div className="whitespace-pre-wrap wrap-break-word overflow-x-auto">{renderHighlighted(r.line, term)}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}

```

## Explicación detallada

- Resumen: Este archivo forma parte del proyecto.

**Importaciones:**
- import { useEffect, useState } from 'react';

**Declaraciones top-level (const/let/var):**
- const [dates, setDates]
- const [term, setTerm]
- const [from, setFrom]
- const [to, setTo]
- const [results, setResults]
- const [loading, setLoading]
- const params
- const r
- const j

**Funciones / Componentes exportados:**
- `VerLog`: componente o función exportada.
- `doSearch`: componente o función exportada.

**Estructuras de control detectadas:**
- `await` usos: 2
- `fetch(...)` usos: 2
- bucles `for`: 0
- condicionales `if`: 3
- bloques `try/catch`: 1

**Notas sobre asincronía y peticiones:**
- Este archivo usa `await` para esperar operaciones asíncronas. Revisa las llamadas que retornan Promises (p. ej. `fetch`, `pool.query`, `crearSolicitud`).
- Contiene llamadas a `fetch(...)` que realizan peticiones HTTP desde el cliente hacia el backend. Asegúrate de manejar errores y timeouts.

**Hooks y APIs de React detectadas:**
- useEffect
- useState
- useState
- useState
- useState
- useState
- useState
- useState
- useEffect

## Desglose por componente/función

### `VerLog`
- Tipo: Componente React funcional.
- Puntos clave encontrados en el cuerpo:
  - Usa `useState` para manejar estado local.
  - Usa `useEffect` para efectos secundarios (cargas iniciales, suscripciones).

---
Nota: Esta explicación fue generada automáticamente. Puede editarse para añadir más contexto específico o ejemplos.