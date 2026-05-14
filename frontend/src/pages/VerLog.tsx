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
  placeholder,
  ariaLabel,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  ariaLabel?: string;
  className?: string;
}) {
  const [focused, setFocused] = useState(false);
  const inputType = focused || value ? 'date' : 'text';
  return (
    <input
      type={inputType}
      className={className}
      placeholder={placeholder}
      aria-label={ariaLabel}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onFocus={() => setFocused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.value) setFocused(false);
      }}
    />
  );
}

export default function VerLog() {
  const [dates, setDates] = useState<string[]>([]);
  const [term, setTerm] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [results, setResults] = useState<LogMatch[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/logsViewer/list')
      .then((r) => r.json())
      .then((j) => setDates(j.dates || []))
      .catch(() => setDates([]));
  }, []);

  async function doSearch() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (term) params.set('term', term);
      if (from) params.set('from', from);
      if (to) params.set('to', to);
      const r = await fetch('/api/logsViewer/search?' + params.toString());
      const j = await r.json();
      setResults(j.matches || []);
    } catch (e) {
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
            <DateInput
              value={from}
              onChange={setFrom}
              placeholder="Desde"
              ariaLabel="Fecha desde"
              className="border p-2 rounded w-full sm:w-auto"
            />
            <DateInput
              value={to}
              onChange={setTo}
              placeholder="Hasta"
              ariaLabel="Fecha hasta"
              className="border p-2 rounded w-full sm:w-auto"
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
