import { useEffect, useState } from 'react';

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

  return (
    <main className="p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-semibold mb-4">Visor de logs</h1>

        <div className="mb-4 p-4 bg-white rounded shadow">
          <div className="flex gap-2 items-center">
            <input className="border p-2 rounded flex-1" placeholder="Buscar término (ej: 12.883.038-3)" value={term} onChange={(e) => setTerm(e.target.value)} />
            <input type="date" className="border p-2 rounded" value={from} onChange={(e) => setFrom(e.target.value)} />
            <input type="date" className="border p-2 rounded" value={to} onChange={(e) => setTo(e.target.value)} />
            <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={doSearch} disabled={loading}>Buscar</button>
          </div>
          <div className="text-sm text-gray-500 mt-2">Fechas disponibles: {dates.join(', ')}</div>
        </div>

        <div className="bg-white rounded shadow p-4">
          <div className="text-sm text-gray-700 mb-2">Resultados: {results.length}</div>
          <div className="space-y-2 max-h-[60vh] overflow-y-auto font-mono text-xs">
            {results.map((r, idx) => (
              <div key={idx} className="p-2 border rounded">
                <div className="text-xs text-gray-500">{r.date} — {r.file} — line {r.index}</div>
                <div className="whitespace-pre-wrap wrap-break-word">{r.line}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
