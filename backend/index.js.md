# Documentación detallada de backend/index.js

## Código fuente

```js
// express se usa como base liviana para publicar una API HTTP consumible desde el frontend React.
const express = require("express");

// cors permite abrir el backend al servidor de desarrollo del frontend cuando el proxy de Vite no interviene,
// por ejemplo durante pruebas locales directas o verificaciones manuales desde otro origen controlado.
const cors = require("cors");

// Pool de pg administra conexiones reutilizables a PostgreSQL y evita abrir una conexion nueva en cada request.
const { Pool } = require("pg");

// El puerto se deja configurable para no acoplar el backend a un unico entorno de ejecucion.
const PORT = Number(process.env.PORT || 3001);

// allowedOrigin define el origen del frontend en desarrollo. Se mantiene configurable para poder ajustarlo
// sin tocar codigo si el servidor de Vite cambia de host o puerto en otra maquina.
const ALLOWED_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:5173";

// dbConfig centraliza las credenciales del motor PostgreSQL. Se usan variables de entorno con valores por
// defecto alineados a la documentacion operativa actual del proyecto para facilitar la primera puesta en marcha.
const dbConfig = {
  host: process.env.PGHOST || "localhost",
  port: Number(process.env.PGPORT || 5432),
  database: process.env.PGDATABASE || "siiac",
  user: process.env.PGUSER || "siiac2026",
  password: process.env.PGPASSWORD || "siiac2026",
};

// pool conserva las conexiones abiertas hacia la base para que la API pueda responder multiples peticiones
// sin el costo de reconectar en cada consulta individual.
const pool = new Pool(dbConfig);

// app es la instancia principal del servidor HTTP que publicara los endpoints consumidos por el formulario.
const app = express();

// Se habilita CORS de forma acotada al origen del frontend para reducir ruido entre capas durante desarrollo.
app.use(
  cors({
    origin: ALLOWED_ORIGIN,
  }),
);

// Log de peticiones básicas para depuración en dev.
app.use((req, _res, next) => {
  console.log(new Date().toISOString(), req.method, req.path);
  next();
});

// express.json prepara el backend para aceptar payloads JSON en futuros endpoints sin requerir cambios extra.
app.use(express.json());

// health expone un chequeo simple para confirmar que el proceso HTTP esta vivo aun cuando la base no haya sido usada.
app.get("/api/health", (_request, response) => {
  response.json({ ok: true });
});

// Este endpoint obtiene la descripcion HTML de la campaña activa del sistema. La consulta replica exactamente
// el criterio funcional documentado en BBDD.md: campaña habilitada y marcada para el sistema.
app.get("/api/campana-activa", async (_request, response) => {
  try {
    // Se selecciona solo la columna requerida por el frontend para no transferir datos innecesarios.
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

    // Si no existe una campaña que cumpla las condiciones, se devuelve una cadena vacia para que el frontend
    // pueda renderizar un estado controlado sin romper el layout del formulario.
    const campaignHtml = queryResult.rows[0]?.campanadescripcion ?? "";

    response.json({ campaignHtml });
  } catch (error) {
    // Se registra el error en consola para depuracion local sin exponer detalles sensibles al navegador.
    console.error("Error al obtener la campaña activa", error);

    response.status(500).json({
      message: "No fue posible obtener la campaña activa.",
    });
  }
});

// El servidor queda escuchando de forma explicita para aceptar peticiones del frontend durante desarrollo.
app.listen(PORT, () => {
  console.log(`Backend escuchando en http://localhost:${PORT}`);
});

// Crear una nueva solicitud en la tabla public.solicitud y devolver el id generado.
app.post("/api/solicitud", async (request, response) => {
  try {
    const { tipoFormulario } = request.body;

    // Valores por defecto según especificación funcional.
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
```

## Explicación detallada

- Resumen: Backend HTTP (Express) con acceso a DB y endpoints para la app.

**Declaraciones top-level (const/let/var):**
- const express
- const cors
- const { Pool }
- const PORT
- const ALLOWED_ORIGIN
- const dbConfig
- const pool
- const app
- const queryResult
- const campaignHtml
- const { tipoFormulario }
- const estadoId
- const tipoSolicitudId
- const solicitudConsultaEstudiante
- const solicitudFechaMarca
- const solicitudUsuariosId
- const insertQuery
- const params
- const result
- const solicitudId

**Estructuras de control detectadas:**
- `await` usos: 2
- `fetch(...)` usos: 0
- bucles `for`: 0
- condicionales `if`: 1
- bloques `try/catch`: 2

**Notas sobre asincronía y peticiones:**
- Este archivo usa `await` para esperar operaciones asíncronas. Revisa las llamadas que retornan Promises (p. ej. `fetch`, `pool.query`, `crearSolicitud`).

**Consultas SQL / Acceso a BD:**
- Este archivo ejecuta consultas SQL (p. ej. `pool.query`) y debe validar parámetros y manejar errores para no exponer información.

---
Nota: Esta explicación fue generada automáticamente. Puede editarse para añadir más contexto específico o ejemplos.