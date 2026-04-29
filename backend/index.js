const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

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

    response.json({ solicitudId });
  } catch (error) {
    console.error("Error al crear solicitud", error);
    response.status(500).json({ message: "Error al crear la solicitud." });
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

    const entry = {
      timestamp: localTimestamp,
      objeto: payload.objeto || null,
      action: payload.action || "siguiente_formulario",
      solicitudId: payload.solicitudId || null,
      payload: payload.payload || payload,
      userAgent: req.headers["user-agent"] || "",
      ip: req.ip || req.connection?.remoteAddress || "",
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
    const mdLine = `${entry.timestamp} : ${entry.action} - solicitudId: ${entry.solicitudId || ""} \n`;
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
        const gzip = require("zlib").createGzip();
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