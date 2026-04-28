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