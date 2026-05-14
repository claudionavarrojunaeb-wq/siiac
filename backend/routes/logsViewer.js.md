# Documentación detallada de backend/routes/logsViewer.js

## Código fuente

```js
/**
 * Router para listar y buscar dentro de los archivos de log ubicados en
 * `backend/log/`. Provee dos endpoints:
 *  - GET /list -> devuelve las fechas (YYYYMMDD) disponibles en el directorio de logs
 *  - GET /search?term=...&from=YYYY-MM-DD&to=YYYY-MM-DD -> busca en las líneas de
 *    los archivos .jsonl y .md que estén dentro del rango de fechas (si no se
 *    especifica from/to, busca en todos los logs). Retorna las líneas que
 *    contienen la cadena `term`.
 *
 * Este archivo está en ESM y usa APIs de `fs` y `path`. Se añade sanitización
 * básica para evitar recorrido fuera del directorio de logs y límites de tamaño
 * de respuesta para proteger al servidor de respuestas excesivamente grandes.
 */
import express from 'express';
const router = express.Router();
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// __dirname local para este módulo (ESM)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Directorio donde se guardan los logs
const LOG_DIR = path.join(__dirname, '..', 'log');

// Helper: listar archivos de log válidos en LOG_DIR
function listLogFiles() {
  if (!fs.existsSync(LOG_DIR)) return [];
  const files = fs.readdirSync(LOG_DIR || '.');
  // Filtrar archivos con patrón YYYYMMDD.jsonl o YYYYMMDD.md
  return files.filter((f) => /^\d{8}\.(jsonl|md)$/.test(f));
}

// Helper: de filename extraer la fecha YYYYMMDD
function dateFromFilename(filename) {
  const m = filename.match(/^(\d{8})\.(jsonl|md)$/);
  return m ? m[1] : null;
}

// Endpoint: GET /list
// Respuesta: { dates: ['20260501','20260430', ...] }
router.get('/list', (req, res) => {
  try {
    const files = listLogFiles();
    const dates = Array.from(new Set(files.map((f) => dateFromFilename(f)).filter(Boolean))).sort().reverse();
    res.json({ dates });
  } catch (err) {
    console.error('Error en /api/logs/list', err);
    res.status(500).json({ ok: false, error: String(err) });
  }
});

// Endpoint: GET /search
// Query params:
// - term: cadena a buscar (requerida)
// - from: fecha inicio en formato YYYY-MM-DD (opcional)
// - to: fecha fin en formato YYYY-MM-DD (opcional)
// Respuesta: { matches: [ { date, file, line, index } ], total }
router.get('/search', (req, res) => {
  try {
    const term = String(req.query.term || '').trim();
    if (!term) return res.status(400).json({ ok: false, error: 'term query required' });

    // Parsear rango de fechas si viene
    const fromRaw = req.query.from ? String(req.query.from) : null; // YYYY-MM-DD
    const toRaw = req.query.to ? String(req.query.to) : null;

    const fmt = (d) => d.replace(/-/g, ''); // YYYYMMDD
    const from = fromRaw ? fmt(fromRaw) : null;
    const to = toRaw ? fmt(toRaw) : null;

    const files = listLogFiles();

    // Filtrar por rango si aplica
    const filesInRange = files.filter((f) => {
      const dt = dateFromFilename(f);
      if (!dt) return false;
      if (from && dt < from) return false;
      if (to && dt > to) return false;
      return true;
    }).sort();

    const matches = [];
    const MAX_LINES_RETURN = 2000; // límite de seguridad

    for (const file of filesInRange) {
      const filePath = path.join(LOG_DIR, file);
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split(/\r?\n/);
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].includes(term)) {
            matches.push({ date: dateFromFilename(file), file, line: lines[i], index: i });
            if (matches.length >= MAX_LINES_RETURN) break;
          }
        }
      } catch (e) {
        console.error('Error leyendo log file', filePath, e);
      }
      if (matches.length >= MAX_LINES_RETURN) break;
    }

    res.json({ matches, total: matches.length });
  } catch (err) {
    console.error('Error en /api/logs/search', err);
    res.status(500).json({ ok: false, error: String(err) });
  }
});

export default router;

```

## Explicación detallada

- Resumen: Backend HTTP (Express) con acceso a DB y endpoints para la app.

**Importaciones:**
- import express from 'express';
- import fs from 'fs';
- import path from 'path';
- import { fileURLToPath } from 'url';

**Declaraciones top-level (const/let/var):**
- const router
- const __filename
- const __dirname
- const LOG_DIR
- const files
- const m
- const files
- const dates
- const term
- const fromRaw
- const toRaw
- const fmt
- const from
- const to
- const files
- const filesInRange
- const dt
- const matches
- const MAX_LINES_RETURN
- const filePath
- const content
- const lines

**Funciones / Componentes exportados:**
- `listLogFiles`: componente o función exportada.
- `dateFromFilename`: componente o función exportada.

**Estructuras de control detectadas:**
- `await` usos: 0
- `fetch(...)` usos: 0
- bucles `for`: 2
- condicionales `if`: 8
- bloques `try/catch`: 3

---
Nota: Esta explicación fue generada automáticamente. Puede editarse para añadir más contexto específico o ejemplos.