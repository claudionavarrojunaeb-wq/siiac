import express from 'express';
const router = express.Router();
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// Proxy sencillo para la API de persona-cuidadora de servicios.junaeb.cl
// Ruta: GET /api/cuidador/:rut

let httpClient;
try {
  const mod = await import('../lib/httpClient.js');
  httpClient = mod.default;
} catch (e) {
  console.warn('[proxy-cuidador] lib/httpClient no disponible, usando fallback fetch', e?.message);
  let fetchImpl = globalThis.fetch;
  try {
    if (!fetchImpl) {
      const nf = await import('node-fetch');
      fetchImpl = nf.default;
    }
  } catch (ee) {
    console.warn('[proxy-cuidador] node-fetch no disponible, fetch fallback puede fallar', ee?.message);
  }
  httpClient = {
    get: async (url, opts) => {
      if (!fetchImpl) throw new Error('No fetch available');
      const headers = (opts && opts.headers) || {};
      const r = await fetchImpl(url, { method: 'GET', headers });
      const text = await r.text();
      return { status: r.status || r.statusCode, data: text };
    },
  };
}

router.get('/:rut', async (req, res) => {
  const rut = req.params.rut;
  const requestId = (crypto.randomUUID && typeof crypto.randomUUID === 'function') ? crypto.randomUUID() : `${Date.now().toString(36)}-${Math.floor(Math.random() * 0xffff).toString(36)}`;
  res.setHeader('X-Request-ID', requestId);

  const startHr = process.hrtime.bigint();
  if (!rut) return res.status(400).json({ ok: false, message: 'rut requerido' });

  const url = `http://servicios.junaeb.cl/apiv1/servicios/canales-atencion/persona-cuidadora/${encodeURIComponent(
    rut
  )}`;

  console.log('[proxy-cuidador] solicitando URL:', url);

  try {
    const resp = await httpClient.get(url, { responseType: 'text', headers: { 'X-Request-ID': requestId } });
    const status = resp.status;
    const text = resp.data;
    const endHr = process.hrtime.bigint();
    const latencyMs = Number(endHr - startHr) / 1e6;
    console.log('[proxy-cuidador] status:', status, 'latencyMs:', latencyMs.toFixed(2), 'body_preview:', (text || '').slice(0, 200));

    try {
      const now = new Date();
      const pad = (n) => String(n).padStart(2, '0');
      const YYYY = now.getFullYear();
      const MM = pad(now.getMonth() + 1);
      const DD = pad(now.getDate());
      const HH = pad(now.getHours());
      const mm = pad(now.getMinutes());
      const ss = pad(now.getSeconds());
      const ms = String(now.getMilliseconds()).padStart(3, '0');
      const localTimestamp = `${YYYY}-${MM}-${DD}T${HH}:${mm}:${ss}.${ms}`;
      const dateKey = `${YYYY}${MM}${DD}`;
      const logDir = path.join(new URL('..', import.meta.url).pathname, 'log');
      if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
      const jsonlPath = path.join(logDir, `${dateKey}.jsonl`);
      const mdPath = path.join(logDir, `${dateKey}.md`);
      const entry = { timestamp: localTimestamp, action: 'proxy_cuidador_call', source: 'api/cuidador', rut: rut, status: status, requestId, latencyMs };
      fs.appendFile(jsonlPath, JSON.stringify(entry) + '\n', (e) => { if (e) console.error('Error escribiendo JSONL proxy_cuidador_call:', e); });
      fs.appendFile(mdPath, `${localTimestamp} : proxy_cuidador_call - rut: ${rut} status: ${status} requestId: ${requestId} latencyMs: ${latencyMs.toFixed(2)}\n`, (e) => { if (e) console.error('Error escribiendo MD proxy_cuidador_call:', e); });
    } catch (e) { console.error('Error registrando log de proxy_cuidador_call', e); }

    if (!(status >= 200 && status < 300)) {
      console.warn('[proxy-cuidador] respuesta no-2xx, devolviendo cuidador fallback "0"');
      try {
        const now = new Date();
        const pad = (n) => String(n).padStart(2, '0');
        const YYYY = now.getFullYear();
        const MM = pad(now.getMonth() + 1);
        const DD = pad(now.getDate());
        const HH = pad(now.getHours());
        const mm = pad(now.getMinutes());
        const ss = pad(now.getSeconds());
        const ms = String(now.getMilliseconds()).padStart(3, '0');
        const localTimestamp = `${YYYY}-${MM}-${DD}T${HH}:${mm}:${ss}.${ms}`;
        const dateKey = `${YYYY}${MM}${DD}`;
        const logDir = path.join(new URL('..', import.meta.url).pathname, 'log');
        if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
        const jsonlPath = path.join(logDir, `${dateKey}.jsonl`);
        const mdPath = path.join(logDir, `${dateKey}.md`);
        const entry = { timestamp: localTimestamp, action: 'proxy_cuidador_fallback', source: 'api/cuidador', rut: rut, reason: `status_${status}` };
        fs.appendFile(jsonlPath, JSON.stringify(entry) + '\n', (e) => { if (e) console.error('Error escribiendo JSONL fallback cuidador:', e); });
        fs.appendFile(mdPath, `${localTimestamp} : proxy_cuidador_fallback - rut: ${rut} reason: status_${status}\n`, (e) => { if (e) console.error('Error escribiendo MD fallback cuidador:', e); });
      } catch (e) { console.error('Error registrando fallback proxy-cuidador:', e); }
      return res.status(200).json({ ok: true, status: 200, data: { cuidador: '0' }, note: 'fallback' });
    }

    try {
      const json = JSON.parse(text);
      if (json && (json.cuidador !== undefined || json.data?.cuidador !== undefined)) {
        return res.status(200).json({ ok: true, status: 200, data: json });
      }
      return res.status(200).json({ ok: true, status: 200, data: json });
    } catch (parseErr) {
      console.warn('[proxy-cuidador] respuesta no JSON, devolviendo texto y fallback cuidador');
      try {
        const now = new Date();
        const pad = (n) => String(n).padStart(2, '0');
        const YYYY = now.getFullYear();
        const MM = pad(now.getMonth() + 1);
        const DD = pad(now.getDate());
        const HH = pad(now.getHours());
        const mm = pad(now.getMinutes());
        const ss = pad(now.getSeconds());
        const ms = String(now.getMilliseconds()).padStart(3, '0');
        const localTimestamp = `${YYYY}-${MM}-${DD}T${HH}:${mm}:${ss}.${ms}`;
        const dateKey = `${YYYY}${MM}${DD}`;
        const logDir = path.join(new URL('..', import.meta.url).pathname, 'log');
        if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
        const jsonlPath = path.join(logDir, `${dateKey}.jsonl`);
        const mdPath = path.join(logDir, `${dateKey}.md`);
        const entry = { timestamp: localTimestamp, action: 'proxy_cuidador_fallback', source: 'api/cuidador', rut: rut, reason: 'non_json_response', sample: (text || '').slice(0, 1000) };
        fs.appendFile(jsonlPath, JSON.stringify(entry) + '\n', (e) => { if (e) console.error('Error escribiendo JSONL fallback cuidador (non-json):', e); });
        fs.appendFile(mdPath, `${localTimestamp} : proxy_cuidador_fallback - rut: ${rut} reason: non_json_response\n`, (e) => { if (e) console.error('Error escribiendo MD fallback cuidador (non-json):', e); });
      } catch (e) { console.error('Error registrando fallback proxy-cuidador (non-json):', e); }
      return res.status(200).json({ ok: true, status: 200, data: { cuidador: '0', raw: text.slice(0, 1000) }, note: 'fallback' });
    }
  } catch (err) {
    console.error('[proxy-cuidador] error al solicitar servicio externo:', err);
    try {
      const now = new Date();
      const pad = (n) => String(n).padStart(2, '0');
      const YYYY = now.getFullYear();
      const MM = pad(now.getMonth() + 1);
      const DD = pad(now.getDate());
      const HH = pad(now.getHours());
      const mm = pad(now.getMinutes());
      const ss = pad(now.getSeconds());
      const ms = String(now.getMilliseconds()).padStart(3, '0');
      const localTimestamp = `${YYYY}-${MM}-${DD}T${HH}:${mm}:${ss}.${ms}`;
      const dateKey = `${YYYY}${MM}${DD}`;
      const logDir = path.join(new URL('..', import.meta.url).pathname, 'log');
      if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
      const jsonlPath = path.join(logDir, `${dateKey}.jsonl`);
      const mdPath = path.join(logDir, `${dateKey}.md`);
      const entry = { timestamp: localTimestamp, action: 'proxy_cuidador_fallback', source: 'api/cuidador', rut: rut, reason: 'network_error', error: String(err) };
      fs.appendFile(jsonlPath, JSON.stringify(entry) + '\n', (e) => { if (e) console.error('Error escribiendo JSONL fallback cuidador (error):', e); });
      fs.appendFile(mdPath, `${localTimestamp} : proxy_cuidador_fallback - rut: ${rut} reason: network_error error: ${String(err)}\n`, (e) => { if (e) console.error('Error escribiendo MD fallback cuidador (error):', e); });
    } catch (e) { console.error('Error registrando fallback proxy-cuidador (error):', e); }
    return res.status(200).json({ ok: true, status: 200, data: { cuidador: '0' }, note: 'error_fallback', error: String(err) });
  }
});

export default router;
