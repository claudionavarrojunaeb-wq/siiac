import express from 'express';
import cors from 'cors';
import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3001);
const ALLOWED_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:5173";

const dbConfig = {
  host: process.env.PGHOST || "localhost",
  port: Number(process.env.PGPORT || 5432),
  database: process.env.PGDATABASE || "siiac",
  user: process.env.PGUSER || "siiac2026",
  password: process.env.PGPASSWORD || "siiac2026",
};

const pool = new Pool(dbConfig);
const app = express();

app.use(
  cors({
    origin: ALLOWED_ORIGIN,
  }),
);

app.use((req, _res, next) => {
  console.log(new Date().toISOString(), req.method, req.path);
  next();
});

app.use(express.json());

// Registrar proxy de cuidador
  try {
    const mod = await import('./routes/cuidador.js');
    app.use('/api/cuidador', mod.default);
  } catch (e) {
    console.error('No se pudo registrar /api/cuidador:', e);
  }

  try {
    const logsMod = await import('./routes/logsViewer.js');
    app.use('/api/logsViewer', logsMod.default);
  } catch (e) {
    console.error('No se pudo registrar /api/logsViewer:', e);
  }

app.get("/api/health", (_request, response) => {
  response.json({ ok: true });
});

app.get("/api/campana-activa", async (_request, response) => {
  try {
    const queryResult = await pool.query(
      `
        select campanadescripcion
        from public.campana
        where campanahabilitado = 1
          and campanasistema = 1
        order by campanaid asc
        limit 1;
      `,
    );

    const campaignHtml = queryResult.rows[0]?.campanadescripcion ?? "";

    response.json({ campaignHtml });
  } catch (error) {
    console.error("Error al obtener la campaña activa", error);

    response.status(500).json({
      message: "No fue posible obtener la campaña activa.",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Backend escuchando en http://localhost:${PORT}`);
});

app.post("/api/solicitud", async (request, response) => {
  try {
    const { tipoFormulario } = request.body;

    const estadoId = 8;
    const tipoSolicitudId = 0;
    const solicitudConsultaEstudiante = 1;
    const solicitudFechaMarca = 1;
    const solicitudUsuariosId = request.body.solicitudUsuariosId || "admin";

    const insertQuery = `
      insert into public.solicitud (
        estadoid,
        tiposolicitudid,
        solicitudconsultaestudiante,
        solicitudfecha,
        solicitudfechaingreso,
        solicitudhoraingreso,
        solicitudfechamarca,
        solicitudusuariosid,
        solicitudtipoformulario
      ) values (
        $1, $2, $3, now(), current_date, to_char(now()::time, 'HH24:MI:SS'), $4, $5, $6
      ) returning solicitudid;
    `;

    const params = [
      estadoId,
      tipoSolicitudId,
      solicitudConsultaEstudiante,
      solicitudFechaMarca,
      solicitudUsuariosId,
      tipoFormulario,
    ];

    console.log("Executing insert with params:", params.map((p) => (typeof p === "string" ? `${p.length} chars` : p)));

    const result = await pool.query(insertQuery, params);

    const solicitudId = result.rows[0]?.solicitudid;

    if (!solicitudId) {
      return response.status(500).json({ message: "No se pudo crear la solicitud." });
    }

    // Si el payload trae un RUT, normalizarlo (sin puntos, sin guion, sin DV)
    try {
      const s = (v) => (v === null || v === undefined ? null : String(v).trim());
      const rutCandidate = s(request.body.payload?.rut || request.body.rut || null);
      if (rutCandidate) {
        const cleaned = rutCandidate.replace(/[^0-9kK]/g, '').toUpperCase();
        const rutSinDv = cleaned.length > 1 ? cleaned.slice(0, -1) : null;
        if (rutSinDv) {
            const uq = `update solicitud set ciudadanorut = $1 where solicitudid = $2`;
            await pool.query(uq, [rutSinDv, solicitudId]);
            try {
              const now = new Date();
              const pad = (n) => String(n).padStart(2, "0");
              const YYYY = now.getFullYear();
              const MM = pad(now.getMonth() + 1);
              const DD = pad(now.getDate());
              const HH = pad(now.getHours());
              const mm = pad(now.getMinutes());
              const ss = pad(now.getSeconds());
              const ms = String(now.getMilliseconds()).padStart(3, "0");
              const localTimestamp = `${YYYY}-${MM}-${DD}T${HH}:${mm}:${ss}.${ms}`;
              const dateKey = `${YYYY}${MM}${DD}`;
              const logDir = path.join(__dirname, "log");
              if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
              const jsonlPath = path.join(logDir, `${dateKey}.jsonl`);
              const mdPath = path.join(logDir, `${dateKey}.md`);
              const entry = { timestamp: localTimestamp, action: 'solicitud_update_ciudadanorut', source: 'api/solicitud', solicitudId: solicitudId, ciudadanorut: rutSinDv };
              fs.appendFile(jsonlPath, JSON.stringify(entry) + "\n", (e) => { if (e) console.error('Error escribiendo JSONL solicitud_update (solicitud endpoint):', e); });
              fs.appendFile(mdPath, `${localTimestamp} : solicitud_update_ciudadanorut (solicitud endpoint) - solicitudId: ${solicitudId} ciudadanorut: ${rutSinDv}\n`, (e) => { if (e) console.error('Error escribiendo MD solicitud_update (solicitud endpoint):', e); });
            } catch (e) {
              console.error('Error registrando log solicitud_update en /api/solicitud:', e);
            }
        }
      }
    } catch (e) {
      console.error('Error actualizando solicitud.ciudadanorut:', e);
    }

    response.json({ solicitudId });
  } catch (error) {
    console.error("Error al crear solicitud", error);
    response.status(500).json({ message: "Error al crear la solicitud." });
  }
});

// Upsert ciudadano desde formulario
app.post('/api/ciudadano', async (req, res) => {
  try {
    const body = req.body || {};
    // The frontend sends { objeto, action, solicitudId, payload, ... } or directly payload
    const payload = body.payload || body;

    // Normalizar: crear una copia del payload donde todas las propiedades
    // que son strings hayan sido aplicadas `trim()` para evitar espacios
    // en blanco delante/detrás en la base de datos.
    const cleanedPayload = {};
    Object.keys(payload || {}).forEach((k) => {
      const v = payload[k];
      cleanedPayload[k] = typeof v === 'string' ? v.trim() : v;
    });

    // Helper to clean strings
    const s = (v) => (v === null || v === undefined ? null : String(v).trim());

    const rutRaw = s(cleanedPayload.rut) || '';
    // clean run digits and dv (sin puntos ni guiones)
    const clean = rutRaw.replace(/[^0-9kK]/g, '').toUpperCase();
    const dv = clean.length ? clean.slice(-1) : null;
    const rutSinDv = clean.length > 1 ? clean.slice(0, -1) : null; // llave
    // Formato sin puntos para almacenar; con guión entre rut y dv: 12883038-3
    const rutConGuion = rutSinDv ? `${rutSinDv}${dv ? '-' + dv : ''}` : null;

    const nombres = s(payload.nombres) || null;
    const paterno = s(payload.apellido1) || null;
    const materno = s(payload.apellido2) || null;
    const telefono = s(payload.telefono) || null;
    const email = s(payload.email) || null;
    const comuna = s(payload.comuna) || null;
    const institucion = s(payload.institucion) || null;
    const generoId = cleanedPayload.genero ? Number(cleanedPayload.genero) : null;
    const sexoId = cleanedPayload.sexo ? Number(cleanedPayload.sexo) : null;
    const edadId = cleanedPayload.edad ? Number(cleanedPayload.edad) : null;
    const paisId = cleanedPayload.Pais || cleanedPayload.pais || cleanedPayload.paisId || 1;
    const paisIdNum = paisId ? Number(paisId) : 1;
    const cuidadorVal = cleanedPayload.cuidador === null || cleanedPayload.cuidador === undefined ? null : String(cleanedPayload.cuidador).trim();
    const otroPais = s(cleanedPayload.OtroPais) || null;
    const nacionalidad = cleanedPayload.nacionalidad ? s(cleanedPayload.nacionalidad) : null;

    const nombreSinEsp = nombres ? nombres.replace(/\s+/g, '') : null;
    const paternoSinEsp = paterno ? paterno.replace(/\s+/g, '') : null;
    const maternoSinEsp = materno ? materno.replace(/\s+/g, '') : null;

    const nombreCompleto = [nombres, paterno, materno].filter(Boolean).map((x) => x.replace(/\s+/g, ' ')).join(' ').trim();

    if (!rutSinDv) return res.status(400).json({ ok: false, message: 'rut inválido' });

    // Check existence by ciudadano_rut
    const existing = await pool.query('select ciudadanorut from ciudadano where ciudadanorut = $1', [rutSinDv]);

    if (existing.rowCount > 0) {
      // Update
      const q = `
        update ciudadano set
          ciudadanodv = $1,
          ciudadanonombres = $2,
          ciudadanopaterno = $3,
          ciudadanomaterno = $4,
          ciudadanotelefono1 = $5,
          ciudadanoemail = $6,
          ciudadanocorepa = $7,
          ciudadanoinstitucion = $8,
          ocupacionid = $9,
          generoid = $10,
          sexoid = $11,
          edadid = $12,
          paisid = $13,
          nombrecompleto = $14,
          ciudadanorutguion = $15,
          ciudadanoregion = $16,
          pueblosid = $17,
          ciudadanootrotipo = $18,
          ciudadanocargoid = NULL,
          ciudadanoinstitucionid = NULL,
          ciudadanonombreotrainstitucion = NULL,
          ciudadanocomunainstitucion = NULL,
          ciudadanoregioninstitucion = NULL,
          ciudadanotipoinstitucion = NULL,
          ciudadanoorigen = NULL,
          ciudadanooficinafap = NULL,
          ciudadanopreferenteid = NULL,
          ciudadanoconsultanteid = NULL,
          ciudadanocuidador = $19,
          ciudadanootropais = $20,
          ciudadanotipoid = $21,
          ciudadanonacionalidad = $22
        where ciudadanorut = $23
      `;

      const params = [
        dv,
        nombreSinEsp,
        paternoSinEsp,
        maternoSinEsp,
        telefono,
        email,
        comuna,
        institucion,
        15,
        generoId,
        sexoId,
        edadId,
        paisIdNum,
        nombreCompleto,
        rutConGuion,
        s(cleanedPayload.region),
        s(cleanedPayload.pueblo),
        '',
        cuidadorVal,
        otroPais,
        1,
        nacionalidad,
        rutSinDv,
      ];

      // Sanitizar y truncar parámetros según límites razonables y ejecutar update
      const maxLens = [
        2,   // ciudadanodv
        200, // ciudadanonombres
        100, // ciudadanopaterno
        100, // ciudadanomaterno
        30,  // ciudadanotelefono1
        200, // ciudadanoemail
        50,  // ciudadanocorepa
        200, // ciudadanoinstitucion
        null, // ocupacionid (num)
        null, // generoid
        null, // sexoid
        null, // edadid
        null, // paisid
        300, // nombrecompleto
        20,  // ciudadanorutguion
        50,  // ciudadanoregion
        50,  // pueblosid
        50,  // ciudadanootrotipo
        null, // placeholder
        null, // ciudadanocuidador
        200, // ciudadanootro_pais
        null, // ciudadanotipoid
        50,  // ciudadanonacionalidad
      ];

      const sanitize = (val, max) => {
        if (val === null || val === undefined) return null;
        if (typeof val === 'string') {
          const t = val.trim();
          if (max && t.length > max) {
            console.warn(`Truncando parámetro por superar ${max} chars: muestra='${t.slice(0,80)}...'`);
            return t.slice(0, max);
          }
          return t;
        }
        return val;
      };

      const sanitizedParams = params.map((p, i) => sanitize(p, maxLens[i]));
      try {
        await pool.query(q, sanitizedParams);

        // Si se proporcionó solicitudId en el payload, actualizar solicitud.ciudadanorut
        try {
          const sId = cleanedPayload.solicitudId || cleanedPayload.solicitudid || null;
          if (sId) {
            const parsedRut = Number(rutSinDv);
            if (!Number.isNaN(parsedRut)) {
              await pool.query('update solicitud set ciudadanorut = $1 where solicitudid = $2', [parsedRut, sId]);
              // log breve en jsonl
              try {
                const now = new Date();
                const pad = (n) => String(n).padStart(2, "0");
                const YYYY = now.getFullYear();
                const MM = pad(now.getMonth() + 1);
                const DD = pad(now.getDate());
                const ms = String(now.getMilliseconds()).padStart(3, "0");
                const localTimestamp = `${YYYY}-${MM}-${DD}T${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}.${ms}`;
                const dateKey = `${YYYY}${MM}${DD}`;
                const logDir = path.join(__dirname, "log");
                const jsonlPath = path.join(logDir, `${dateKey}.jsonl`);
                const mdPath = path.join(logDir, `${dateKey}.md`);
                const entry = { timestamp: localTimestamp, action: 'solicitud_update_ciudadanorut', solicitudId: sId, ciudadanorut: parsedRut };
                fs.appendFile(jsonlPath, JSON.stringify(entry) + "\n", (e) => { if (e) console.error('Error escribiendo JSONL solicitud_update:', e); });
                fs.appendFile(mdPath, `${localTimestamp} : solicitud_update_ciudadanorut - solicitudId: ${sId} ciudadanorut: ${parsedRut}\n`, (e) => { if (e) console.error('Error escribiendo MD solicitud_update:', e); });
              } catch (e) { console.error('Error registrando log de solicitud_update_ciudadanorut', e); }
            }
          }
        } catch (e) {
          console.error('Error actualizando solicitud.ciudadanorut después de UPDATE ciudadano:', e);
        }
      } catch (dbErr) {
        console.error('Error ejecutando UPDATE ciudadano:', dbErr);
        try {
          console.error('sanitizedParams debug:', sanitizedParams.map((v, i) => ({ index: i + 1, type: typeof v, len: typeof v === 'string' ? v.length : null, sample: typeof v === 'string' ? v.slice(0, 120) : v })));
        } catch (e) {
          console.error('Error al serializar sanitizedParams:', e);
        }
        throw dbErr;
      }

      // Registrar upsert en backend/log/YYYYMMDD.jsonl y .md (payload limpio)
      try {
        const now = new Date();
        const pad = (n) => String(n).padStart(2, "0");
        const YYYY = now.getFullYear();
        const MM = pad(now.getMonth() + 1);
        const DD = pad(now.getDate());
        const HH = pad(now.getHours());
        const mm = pad(now.getMinutes());
        const ss = pad(now.getSeconds());
        const ms = String(now.getMilliseconds()).padStart(3, "0");
        const localTimestamp = `${YYYY}-${MM}-${DD}T${HH}:${mm}:${ss}.${ms}`;
        const dateKey = `${YYYY}${MM}${DD}`;
        const logDir = path.join(__dirname, "log");
        if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
        const jsonlPath = path.join(logDir, `${dateKey}.jsonl`);
        const mdPath = path.join(logDir, `${dateKey}.md`);

        const entry = {
          timestamp: localTimestamp,
          action: 'ciudadano_upsert',
          type: 'update',
          solicitudId: cleanedPayload.solicitudId || null,
          payload: cleanedPayload,
          sanitizedParams: sanitizedParams,
        };
        fs.appendFile(jsonlPath, JSON.stringify(entry) + "\n", (e) => { if (e) console.error('Error escribiendo JSONL upsert:', e); });
        const mdLine = `${localTimestamp} : ciudadano_upsert (update) - solicitudId: ${cleanedPayload.solicitudId || ''}\n`;
        fs.appendFile(mdPath, mdLine, (e) => { if (e) console.error('Error escribiendo MD upsert:', e); });
      } catch (e) {
        console.error('Error registrando upsert en log:', e);
      }

      return res.json({ ok: true, updated: true });
    }

    // Insert
    const iq = `
      insert into ciudadano (
        ciudadanorut,
        ciudadanodv,
        ciudadanonombres,
        ciudadanopaterno,
        ciudadanomaterno,
        ciudadanotelefono1,
        ciudadanoemail,
        ciudadanocorepa,
        ciudadanoinstitucion,
        ocupacionid,
        generoid,
        sexoid,
        edadid,
        paisid,
        nombrecompleto,
        ciudadanorutguion,
        ciudadanoregion,
        pueblosid,
        ciudadanootrotipo,
        ciudadanocuidador,
        ciudadanootro_pais,
        ciudadanotipoid,
        ciudadanonacionalidad
      ) values (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23
      ) returning ciudadanorut;
    `;

    const iparams = [
      rutSinDv,
      dv,
      nombreSinEsp,
      paternoSinEsp,
      maternoSinEsp,
      telefono,
      email,
      comuna,
      institucion,
      15,
      generoId,
      sexoId,
      edadId,
      paisIdNum,
      nombreCompleto,
      rutConGuion,
      s(cleanedPayload.region),
      s(cleanedPayload.pueblo),
      '',
      cuidadorVal,
      otroPais,
      1,
      nacionalidad,
    ];

    // Sanitizar y truncar parámetros antes del insert
    const maxLensIns = [
      50, // ciudadanorut
      2,  // ciudadanodv
      200, // ciudadanonombres
      100, // ciudadanopaterno
      100, // ciudadanomaterno
      30,  // ciudadanotelefono1
      200, // ciudadanoemail
      50,  // ciudadanocorepa
      200, // ciudadanoinstitucion
      null, // ocupacionid
      null, // generoid
      null, // sexoid
      null, // edadid
      null, // paisid
      300, // nombrecompleto
      20,  // ciudadanorutguion
      50,  // ciudadanoregion
      50,  // pueblosid
      50,  // ciudadanootrotipo
      null, // ciudadanocuidador
      200, // ciudadanootro_pais
      null, // ciudadanotipoid
      50,  // ciudadanonacionalidad
    ];
    const sanitize = (val, max) => {
      if (val === null || val === undefined) return null;
      if (typeof val === 'string') {
        const t = val.trim();
        if (max && t.length > max) {
          console.warn(`Truncando parámetro por superar ${max} chars: muestra='${t.slice(0,80)}...'`);
          return t.slice(0, max);
        }
        return t;
      }
      return val;
    };
    const sanitizedIParams = iparams.map((p, i) => sanitize(p, maxLensIns[i]));
    let result;
    try {
      result = await pool.query(iq, sanitizedIParams);

      // Si se proporcionó solicitudId en el payload, actualizar solicitud.ciudadanorut
      try {
        const sId = cleanedPayload.solicitudId || cleanedPayload.solicitudid || null;
        if (sId) {
          const parsedRut = Number(rutSinDv);
          if (!Number.isNaN(parsedRut)) {
            await pool.query('update solicitud set ciudadanorut = $1 where solicitudid = $2', [parsedRut, sId]);
            try {
              const now = new Date();
              const pad = (n) => String(n).padStart(2, "0");
              const YYYY = now.getFullYear();
              const MM = pad(now.getMonth() + 1);
              const DD = pad(now.getDate());
              const ms = String(now.getMilliseconds()).padStart(3, "0");
              const localTimestamp = `${YYYY}-${MM}-${DD}T${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}.${ms}`;
              const dateKey = `${YYYY}${MM}${DD}`;
              const logDir = path.join(__dirname, "log");
              const jsonlPath = path.join(logDir, `${dateKey}.jsonl`);
              const mdPath = path.join(logDir, `${dateKey}.md`);
              const entry = { timestamp: localTimestamp, action: 'solicitud_update_ciudadanorut', solicitudId: sId, ciudadanorut: parsedRut };
              fs.appendFile(jsonlPath, JSON.stringify(entry) + "\n", (e) => { if (e) console.error('Error escribiendo JSONL solicitud_update:', e); });
              fs.appendFile(mdPath, `${localTimestamp} : solicitud_update_ciudadanorut - solicitudId: ${sId} ciudadanorut: ${parsedRut}\n`, (e) => { if (e) console.error('Error escribiendo MD solicitud_update:', e); });
            } catch (e) { console.error('Error registrando log de solicitud_update_ciudadanorut', e); }
          }
        }
      } catch (e) {
        console.error('Error actualizando solicitud.ciudadanorut después de INSERT ciudadano:', e);
      }
    } catch (dbErr) {
      console.error('Error ejecutando INSERT ciudadano:', dbErr);
      try {
        console.error('sanitizedIParams debug:', sanitizedIParams.map((v, i) => ({ index: i + 1, type: typeof v, len: typeof v === 'string' ? v.length : null, sample: typeof v === 'string' ? v.slice(0, 120) : v })));
      } catch (e) {
        console.error('Error al serializar sanitizedIParams:', e);
      }
      throw dbErr;
    }

    // Registrar upsert (insert) en backend/log
    try {
      const now = new Date();
      const pad = (n) => String(n).padStart(2, "0");
      const YYYY = now.getFullYear();
      const MM = pad(now.getMonth() + 1);
      const DD = pad(now.getDate());
      const HH = pad(now.getHours());
      const mm = pad(now.getMinutes());
      const ss = pad(now.getSeconds());
      const ms = String(now.getMilliseconds()).padStart(3, "0");
      const localTimestamp = `${YYYY}-${MM}-${DD}T${HH}:${mm}:${ss}.${ms}`;
      const dateKey = `${YYYY}${MM}${DD}`;
      const logDir = path.join(__dirname, "log");
      if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
      const jsonlPath = path.join(logDir, `${dateKey}.jsonl`);
      const mdPath = path.join(logDir, `${dateKey}.md`);

      const entry = {
        timestamp: localTimestamp,
        action: 'ciudadano_upsert',
        type: 'insert',
        solicitudId: cleanedPayload.solicitudId || null,
        payload: cleanedPayload,
        sanitizedParams: sanitizedIParams,
        insertedId: result.rows[0]?.ciudadanorut || null,
      };
      fs.appendFile(jsonlPath, JSON.stringify(entry) + "\n", (e) => { if (e) console.error('Error escribiendo JSONL upsert insert:', e); });
      const mdLine = `${localTimestamp} : ciudadano_upsert (insert) - solicitudId: ${cleanedPayload.solicitudId || ''}\n`;
      fs.appendFile(mdPath, mdLine, (e) => { if (e) console.error('Error escribiendo MD upsert insert:', e); });
    } catch (e) {
      console.error('Error registrando insert upsert en log:', e);
    }

    return res.json({ ok: true, inserted: true, id: result.rows[0]?.ciudadanorut || null });
  } catch (err) {
    console.error('Error /api/ciudadano', err);
    res.status(500).json({ ok: false, error: String(err) });
  }
});

// Catálogos usados por el formulario de estudiante
app.get("/api/sexo", async (_req, res) => {
  try {
    const q = `select sexoid as id, sexodescripcion as nombre from public.sexo order by sexoid`; 
    const r = await pool.query(q);
    res.json(r.rows);
  } catch (err) {
    console.error("Error /api/sexo", err);
    res.status(500).json([]);
  }
});

app.get("/api/genero", async (_req, res) => {
  try {
    const q = `select generoid as id, generodescripcion as nombre from public.genero order by generoid`;
    const r = await pool.query(q);
    res.json(r.rows);
  } catch (err) {
    console.error("Error /api/genero", err);
    res.status(500).json([]);
  }
});

app.get("/api/edad", async (_req, res) => {
  try {
    const q = `select edadid as id, edaddescripcion as nombre from public.edad order by edadid`;
    const r = await pool.query(q);
    res.json(r.rows);
  } catch (err) {
    console.error("Error /api/edad", err);
    res.status(500).json([]);
  }
});

app.get("/api/pueblos", async (_req, res) => {
  try {
    const q = `select pueblosid as id, pueblosdescripcion as nombre from public.pueblos order by pueblosid`;
    const r = await pool.query(q);
    res.json(r.rows);
  } catch (err) {
    console.error("Error /api/pueblos", err);
    res.status(500).json([]);
  }
});

app.get("/api/pais", async (_req, res) => {
  try {
    const q = `select paisid as id, paisdescripcion as nombre from public.pais order by paisdescripcion`;
    const r = await pool.query(q);
    res.json(r.rows.map(rw => ({ id: String(rw.id), nombre: rw.nombre })));
  } catch (err) {
    console.error("Error /api/pais", err);
    res.status(500).json([]);
  }
});

app.get("/api/region", async (_req, res) => {
  try {
    const q = `select regionid as id, regiondescripcion as nombre from public.region order by regionid`;
    const r = await pool.query(q);
    res.json(r.rows);
  } catch (err) {
    console.error("Error /api/region", err);
    res.status(500).json([]);
  }
});

app.get("/api/comunas", async (req, res) => {
  try {
    const regionId = req.query.regionId;
    if (!regionId) return res.status(400).json({ message: "regionId required" });

    const q = `
      select c.comunaid as id, c.comunadescripcion as nombre
      from public.corepa c
      join public.provincia p on c.provinciaid = p.provinciaid
      where p.regionid = $1
      order by c.comunadescripcion
    `;
    const r = await pool.query(q, [regionId]);
    res.json(r.rows);
  } catch (err) {
    console.error("Error /api/comunas", err);
    res.status(500).json([]);
  }
});

// Endpoint para recibir logs desde el frontend y persistirlos en backend/log
app.post("/api/logs", (req, res) => {
  try {
    const payload = req.body || {};
    const now = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    const YYYY = now.getFullYear();
    const MM = pad(now.getMonth() + 1);
    const DD = pad(now.getDate());
    const HH = pad(now.getHours());
    const mm = pad(now.getMinutes());
    const ss = pad(now.getSeconds());
    const ms = String(now.getMilliseconds()).padStart(3, "0");
    const localTimestamp = `${YYYY}-${MM}-${DD}T${HH}:${mm}:${ss}.${ms}`;

    const clientInfoFromPayload = payload.clientInfo || null;
    // Sanitizar/truncar clientInfo para evitar entradas excesivamente largas
    const sanitize = (v, max) => {
      if (v === null || v === undefined) return null;
      const s = String(v);
      if (!max) return s;
      return s.length > max ? s.slice(0, max) : s;
    };
    const sanitizedClientInfo = clientInfoFromPayload
      ? {
          userAgent: sanitize(clientInfoFromPayload.userAgent || req.headers["user-agent"] || "", 1000),
          platform: sanitize(clientInfoFromPayload.platform || "", 100),
          browser: sanitize(clientInfoFromPayload.browser || "", 100),
          browserVersion: sanitize(clientInfoFromPayload.browserVersion || "", 50),
          deviceType: sanitize(clientInfoFromPayload.deviceType || "", 20),
          ip: sanitize(clientInfoFromPayload.ip || req.ip || req.connection?.remoteAddress || "", 50),
        }
      : {
          userAgent: sanitize(req.headers["user-agent"] || "", 1000),
          platform: null,
          browser: null,
          browserVersion: null,
          deviceType: null,
          ip: sanitize(req.ip || req.connection?.remoteAddress || "", 50),
        };

    const entry = {
      timestamp: localTimestamp,
      objeto: payload.objeto || null,
      action: payload.action || "siguiente_formulario",
      solicitudId: payload.solicitudId || null,
      payload: payload.payload || payload,
      userAgent: sanitize(req.headers["user-agent"] || "", 1000),
      ip: sanitize(req.ip || req.connection?.remoteAddress || "", 50),
      clientInfo: sanitizedClientInfo,
    };

    // Escribir en archivo diario JSONL y en archivo MD resumen (ruta: backend/log/)
    const dateKey = `${YYYY}${MM}${DD}`; // YYYYMMDD
    const logDir = path.join(__dirname, "log");
    if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

    const jsonlPath = path.join(logDir, `${dateKey}.jsonl`);
    const mdPath = path.join(logDir, `${dateKey}.md`);

    // Línea JSONL por entrada
    const jsonlLine = JSON.stringify(entry) + "\n";
    fs.appendFile(jsonlPath, jsonlLine, (err) => {
      if (err) console.error("Error escribiendo JSONL de log:", err);
    });

    // Línea en MD para trazabilidad humana
    // Añadir resumen corto de clientInfo en la línea MD sin perder solicitudId
    const clientSummary = sanitizedClientInfo
      ? `${sanitizedClientInfo.browser || ''}/${sanitizedClientInfo.browserVersion || ''} ${sanitizedClientInfo.deviceType || ''} ip:${sanitizedClientInfo.ip || entry.ip}`
      : `ip:${entry.ip}`;
    const mdLine = `${entry.timestamp} : ${entry.action} - solicitudId: ${entry.solicitudId || ""} - ${clientSummary}\n`;
    fs.appendFile(mdPath, mdLine, (err) => {
      if (err) console.error("Error escribiendo MD de log:", err);
    });

    return res.status(201).json({ ok: true });
  } catch (err) {
    console.error("Error en /api/logs", err);
    res.status(500).json({ ok: false });
  }
});

// Rotación y compresión de logs antiguos
function rotateAndCompressLogs() {
  try {
    const logDir = path.join(__dirname, "log");
    if (!fs.existsSync(logDir)) return;
    const files = fs.readdirSync(logDir);
    const now = Date.now();
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 días
    files.forEach((f) => {
      const m = f.match(/^(\d{8})\.(jsonl|md)$/);
      if (!m) return;
      const filePath = path.join(logDir, f);
      const stats = fs.statSync(filePath);
      if (now - stats.mtimeMs > maxAge) {
        const gzPath = filePath + ".gz";
        if (fs.existsSync(gzPath)) {
          // ya comprimido: borrar original
          try { fs.unlinkSync(filePath); } catch (e) { /* ignore */ }
          return;
        }
        const gzip = zlib.createGzip();
        const inp = fs.createReadStream(filePath);
        const out = fs.createWriteStream(gzPath);
        inp.pipe(gzip).pipe(out);
        out.on("finish", () => {
          try { fs.unlinkSync(filePath); } catch (e) { console.error("Error borrando original tras comprimir:", e); }
        });
      }
    });
  } catch (err) {
    console.error("Error en rotateAndCompressLogs:", err);
  }
}

// Ejecutar rotación al iniciar y luego cada 24 horas
try {
  rotateAndCompressLogs();
  setInterval(rotateAndCompressLogs, 24 * 60 * 60 * 1000);
} catch (err) {
  console.error("No se pudo programar rotación de logs:", err);
}