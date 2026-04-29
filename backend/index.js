const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

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