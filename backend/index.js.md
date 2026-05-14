# Documentación detallada de backend/index.js

## Código fuente

```js
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

## Explicación por línea (resumen por bloque)

A continuación se presenta una explicación detallada, por secciones y por líneas relevantes, del contenido de `backend/index.js`. Cada entrada indica la intención y el efecto del código en el servidor.

Nota: para mantener el documento legible se agrupan líneas estrechamente relacionadas (imports, configuración, endpoints y helpers). Si quieres una anotación literal línea por línea (cada número de línea), dímelo y la generaré explícitamente.

### Imports y utilidades (líneas iniciales)
- `import express from 'express';` — importa el framework HTTP Express para crear rutas y middleware.
- `import cors from 'cors';` — middleware para habilitar CORS en las respuestas HTTP.
- `import { Pool } from 'pg';` — cliente de PostgreSQL para conexiones y consultas.
- `import fs from 'fs';` — módulo de sistema de ficheros para leer/escribir logs.
- `import path from 'path';` — utilidades para rutas de archivos multiplataforma.
- `import zlib from 'zlib';` — compresión Gzip para rotación de logs.
- `import { fileURLToPath } from 'url';` — ayuda a obtener __filename cuando se usa ESM.

### Determinación de __dirname y configuración básica
- `const __filename = fileURLToPath(import.meta.url);` — obtiene la ruta del archivo actual en ESM.
- `const __dirname = path.dirname(__filename);` — obtiene el directorio del archivo actual.
- `const PORT = Number(process.env.PORT || 3001);` — puerto donde escucha el backend (configurable por env).
- `const ALLOWED_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:5173";` — origen permitido por CORS.

### Configuración de la conexión a la base de datos
- `const dbConfig = { host, port, database, user, password };` — objeto que recoge variables de entorno con valores por defecto para la conexión a PostgreSQL.
- `const pool = new Pool(dbConfig);` — crea un pool de conexiones reusables para ejecutar queries.
- `const app = express();` — instancia la aplicación Express.

### Middlewares globales
- `app.use(cors({ origin: ALLOWED_ORIGIN }));` — configura CORS con el origen permitido.
- `app.use((req, _res, next) => { console.log(...); next(); });` — middleware de logging que imprime método y path por cada petición.
- `app.use(express.json());` — parsea JSON en el body de las peticiones.

### Registro dinámico de rutas (plugins)
- Bloque `try { const mod = await import('./routes/cuidador.js'); app.use('/api/cuidador', mod.default); } catch (e) { ... }` — intenta cargar dinámicamente un módulo de rutas `cuidador.js` y lo monta en `/api/cuidador`; captura errores para que la app siga arrancando si el módulo falta o falla.
- Bloque análogo para `./routes/logsViewer.js` montado en `/api/logsViewer`.

### Endpoints simples
- `app.get("/api/health", ...)` — endpoint de salud que responde `{ ok: true }`.

### Endpoint `/api/campana-activa`
- Ejecuta una consulta SQL que selecciona `campanadescripcion` de la tabla `public.campana` con filtros de habilitado y sistema, ordena por `campanaid` y toma el primer resultado.
- Si hay resultado, responde `{ campaignHtml }`, si ocurre un error responde 500 con mensaje genérico y lo registra en consola.

### Inicio del servidor
- `app.listen(PORT, () => { console.log(...) });` — inicia el servidor y loguea la URL local.

### Endpoint `/api/solicitud` (creación de solicitud)
- Recibe `request.body`, construye parámetros predefinidos (`estadoId`, `tipoSolicitudId`, etc.) y ejecuta un INSERT en `public.solicitud` devolviendo `solicitudid`.
- Valida que `solicitudId` fue retornado; si no, responde 500.
- Si en el payload aparece un `rut`, normaliza el RUT (elimina puntos/guion, mayúsculas), extrae la parte numérica sin DV y actualiza `solicitud.ciudadanorut` en la base de datos.
- Registra operaciones en archivos `backend/log/YYYYMMDD.jsonl` y `.md` para trazabilidad (JSONL para máquina, MD para lectura humana); maneja errores de I/O.

### Endpoint `/api/ciudadano` (upsert)
- Normaliza el `payload` recibiendo `body.payload` o `body` directamente.
- Limpia cadenas con `trim()` y construye variables derivadas (RUT limpio, DV, nombres, teléfono, email, etc.).
- Si el RUT ya existe en la tabla `ciudadano` realiza un `UPDATE` con una lista extensa de columnas; los parámetros se sanitizan y se truncán según límites (`maxLens`) antes de ejecutar la query.
- Si se provee `solicitudId`, actualiza `solicitud.ciudadanorut` y registra la acción en los logs diarios.
- Si no existe, hace `INSERT` en `ciudadano` con campos ordenados y también registra el upsert en logs.
- En caso de error de BD, captura, imprime depuración de parámetros y relanza o responde con error 500.

### Endpoints de catálogos (sexo, genero, edad, pueblos, pais, region, comunas)
- Cada endpoint ejecuta una consulta `SELECT ... FROM public.<tabla>` y devuelve filas como JSON. Manejador de errores responde 500 y devuelve array vacío para compatibilidad con el cliente.
- `/api/comunas` valida que `regionId` venga en query params y devuelve las comunas asociadas a la región.

### Endpoint `/api/logs` (persistencia de logs desde frontend)
- Recibe un `payload`, construye un `entry` con timestamp y metadatos de cliente (userAgent, ip, device), sanitiza valores para no escribir entradas gigantes.
- Escribe una línea JSONL y una línea MD en `backend/log/YYYYMMDD.jsonl` y `.md` respectivamente; responde 201 si todo OK.

### Rotación y compresión de logs (`rotateAndCompressLogs`)
- Escanea `backend/log`, detecta archivos `.jsonl` y `.md` con más de 7 días, los comprime a `.gz` y borra los originales. Maneja errores y evita volver a comprimir si ya existe `.gz`.
- Al arrancar el servidor llama a `rotateAndCompressLogs()` y programa `setInterval(..., 24h)` para ejecutar rotación diaria.

### Observaciones de seguridad y mantenimiento
- El código contiene consultas SQL con parámetros parametrizados (uso de `$1..$N`) para evitar inyección SQL; no obstante, se recomienda revisar y limitar longitudes y tipos antes de insertar en DB (ya hay sanitización y truncado en el código).
- Se registran logs en disco; en entornos de producción es recomendable rotar y/o enviar logs a un sistema centralizado y proteger los ficheros con permisos adecuados.

---
Si quieres, puedo generar una versión que anote literal cada línea del archivo con su descripción (por ejemplo: `L1: import express from 'express' — importa Express`). Dime si la prefieres numerada o en formato de comentarios inline dentro del propio bloque de código.
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

## Anotación literal por línea: `backend/index.js`

A continuación se lista cada línea del archivo `backend/index.js` con una breve explicación de su propósito. Las explicaciones son concisas para facilitar la lectura rápida.

L1: import express from 'express'; — importa el framework HTTP Express.
L2: import cors from 'cors'; — importa middleware CORS para controlar orígenes.
L3: import { Pool } from 'pg'; — importa el pool de PostgreSQL para conexiones.
L4: import fs from 'fs'; — módulo de sistema de ficheros para leer/escribir logs.
L5: import path from 'path'; — utilidades para manejo de rutas de archivos.
L6: import zlib from 'zlib'; — utilidad para compresión (gzip).
L7: import { fileURLToPath } from 'url'; — ayuda a obtener __filename en ESM.

L9: const __filename = fileURLToPath(import.meta.url); — calcula la ruta del archivo actual.
L10: const __dirname = path.dirname(__filename); — obtiene el directorio del archivo actual.

L12: const PORT = Number(process.env.PORT || 3001); — puerto donde escucha el servidor.
L13: const ALLOWED_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:5173"; — origen permitido para CORS.

L15-L22: const dbConfig = { ... }; — objeto con configuración de conexión a Postgres (host, port, database, user, password) tomando valores de env con fallback.

L24: const pool = new Pool(dbConfig); — crea el pool de conexiones a la BD.
L25: const app = express(); — instancia la aplicación Express.

L27-L33: app.use(cors({ origin: ALLOWED_ORIGIN, })); — aplica middleware CORS con el origen configurado.

L35-L39: app.use((req, _res, next) => { console.log(...); next(); }); — middleware de logging simple que imprime la hora, método y ruta.

L41: app.use(express.json()); — middleware para parsear cuerpos JSON en peticiones.

L43-L50: try { const mod = await import('./routes/cuidador.js'); app.use('/api/cuidador', mod.default); } catch (e) { ... } — intenta montar dinámicamente el router `cuidador`, ignora si falta.

L52-L57: try { const logsMod = await import('./routes/logsViewer.js'); app.use('/api/logsViewer', logsMod.default); } catch (e) { ... } — intenta montar el router `logsViewer` de forma dinámica.

L59-L61: app.get("/api/health", (_request, response) => { response.json({ ok: true }); }); — endpoint de salud mínimo.

L63-L95: app.get("/api/campana-activa", async (...) => { ... }); — endpoint que consulta la campaña activa en BD y devuelve `campaignHtml`.

L97-L99: app.listen(PORT, () => { console.log(`Backend escuchando en http://localhost:${PORT}`); }); — inicia el servidor y muestra mensaje en consola.

L101-L170: app.post("/api/solicitud", async (request, response) => { ... }); — endpoint para crear una solicitud en `public.solicitud` y devolver su `solicitudId`.
  - Dentro se definen parámetros por defecto (estadoId, tipoSolicitudId, etc.), se ejecuta un `INSERT ... returning solicitudid` y se valida el resultado.
  - Tras crear la solicitud, si llega un `rut` en el payload, se normaliza y actualiza `solicitud.ciudadanorut`.
  - También registra un log diario en `backend/log/YYYYMMDD.jsonl` y `.md` con la acción `solicitud_update_ciudadanorut`.

L172-L179: helpers para normalizar RUT y construir timestamps locales usados en los logs (pad, YYYY, MM, DD, HH, mm, ss, ms, localTimestamp, dateKey).

L181-L210: código que crea `logDir` si no existe y escribe entradas en JSONL y MD usando `fs.appendFile` (asíncrono, con callbacks de error simples).

L212-L215: manejo de errores dentro del bloque de actualización de `solicitud.ciudadanorut` (try/catch secundario).

L217-L290: app.post('/api/ciudadano', async (req, res) => { ... }); — endpoint para upsert (update o insert) de `ciudadano` desde un formulario.
  - L220-L226: obtiene `body` y `payload` (soporta dos formatos: { payload } o body directo).
  - L228-L236: crea `cleanedPayload` aplicando `trim()` a strings para evitar espacios indeseados.
  - L238-L246: helper `s` para normalizar valores nulos y strings; proceso de extracción y limpieza del RUT (`rutRaw`, `clean`, `dv`, `rutSinDv`, `rutConGuion`).
  - L248-L268: extracción de campos relevantes (nombres, apellidos, telefono, email, comuna, institucion, ids de genero/sexo/edad, pais, cuidador, nacionalidad) y derivación de nombres sin espacios y `nombreCompleto`.
  - L270: validación temprana: si no hay `rutSinDv` retorna 400 con 'rut inválido'.

L272-L275: consulta `existing` para comprobar si ya existe un `ciudadano` con `ciudadanorut = rutSinDv`.

L277-L369: rama `if (existing.rowCount > 0)` — secuencia para `UPDATE ciudadano` con query parametrizada `q` y `params`.
  - Define `maxLens` y `sanitize()` para truncar strings largos y evitar errores por tamaños excesivos.
  - Mapea `sanitizedParams` y ejecuta `await pool.query(q, sanitizedParams)`.
  - Si se incluye `solicitudId` en payload, intenta actualizar `solicitud.ciudadanorut` y registrar log JSONL/MD.
  - Manejo de errores de BD imprime `sanitizedParams` para depuración antes de relanzar.
  - Registra un `ciudadano_upsert` (tipo 'update') en los logs diarios.

L371-L453: rama `else` (Insert): prepara `iq` (INSERT into ciudadano ... returning ciudadanorut), `iparams` con valores, `maxLensIns` y sanitización similar a la rama UPDATE.
  - Ejecuta `result = await pool.query(iq, sanitizedIParams)`.
  - Si se proporcionó `solicitudId`, actualiza `solicitud.ciudadanorut` y registra log.
  - En caso de error en INSERT, imprime `sanitizedIParams` para depuración y relanza.
  - Registra un `ciudadano_upsert` (tipo 'insert') en los logs diarios y responde con `{ ok: true, inserted: true, id: ... }`.

L455-L464: manejador catch final del endpoint `/api/ciudadano` que loguea el error y responde 500.

L466-L481: app.get("/api/sexo", async (_req, res) => { ... }); — devuelve lista de sexo desde `public.sexo`.

L483-L489: app.get("/api/genero", ...) — devuelve lista de genero.

L491-L497: app.get("/api/edad", ...) — devuelve lista de edad.

L499-L505: app.get("/api/pueblos", ...) — devuelve lista de pueblos.

L507-L514: app.get("/api/pais", ...) — devuelve lista de paises y transforma `id` a string en la respuesta.

L516-L522: app.get("/api/region", ...) — devuelve lista de regiones.

L524-L537: app.get("/api/comunas", async (req, res) => { ... }); — requiere `regionId` en query y devuelve comunas asociadas a la región.

L539-L629: app.post("/api/logs", (req, res) => { ... }); — endpoint para recibir logs desde frontend y persistirlos en `backend/log`.
  - Extrae `payload`, construye timestamps y sanitiza `clientInfo` (userAgent, platform, browser, ip).
  - Construye `entry` con `timestamp`, `action`, `solicitudId`, `payload`, `userAgent`, `ip` y `clientInfo`.
  - Escribe una línea JSONL y una línea MD resumen en archivos diarios; responde 201 si OK.

L631-L677: function rotateAndCompressLogs() { ... } — función que recorre `backend/log`, encuentra archivos `.jsonl` y `.md` de más de 7 días, los comprime a `.gz` y borra los originales.
  - Evita recomprimir si ya existe `.gz`.
  - Usa streams (`createReadStream`, `createWriteStream`) y `zlib.createGzip()`.

L679-L686: bloque que ejecuta `rotateAndCompressLogs()` al iniciar y programa `setInterval` para ejecutarla cada 24h; captura errores si falla la programación.

Si quieres que convierta esta anotación en comentarios inline dentro del propio `backend/index.js` (por ejemplo como /* LNN: explicación */ encima de cada línea), o que genere un archivo separado enumerando exactamente `L<number>: <código>` seguido de la explicación, dime cuál formato prefieres y lo aplico ahora.
```

## Explicación detallada

- Resumen: Backend HTTP (Express) con acceso a DB y endpoints para la app.

**Importaciones:**
- import express from 'express';
- import cors from 'cors';
- import { Pool } from 'pg';
- import fs from 'fs';
- import path from 'path';
- import zlib from 'zlib';
- import { fileURLToPath } from 'url';

**Declaraciones top-level (const/let/var):**
- const __filename
- const __dirname
- const PORT
- const ALLOWED_ORIGIN
- const dbConfig
- const pool
- const app
- const mod
- const logsMod
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
- const s
- const rutCandidate
- const cleaned
- const rutSinDv
- const uq
- const now
- const pad
- const YYYY
- const MM
- const DD
- const HH
- const mm
- const ss
- const ms
- const localTimestamp
- const dateKey
- const logDir
- const jsonlPath
- const mdPath
- const entry
- const body
- const payload
- const cleanedPayload
- const v
- const s
- const rutRaw
- const clean
- const dv
- const rutSinDv

**Funciones / Componentes exportados:**
- `rotateAndCompressLogs`: componente o función exportada.

**Estructuras de control detectadas:**
- `await` usos: 17
- `fetch(...)` usos: 0
- bucles `for`: 0
- condicionales `if`: 38
- bloques `try/catch`: 29

**Notas sobre asincronía y peticiones:**
- Este archivo usa `await` para esperar operaciones asíncronas. Revisa las llamadas que retornan Promises (p. ej. `fetch`, `pool.query`, `crearSolicitud`).

**Consultas SQL / Acceso a BD:**
- Este archivo ejecuta consultas SQL (p. ej. `pool.query`) y debe validar parámetros y manejar errores para no exponer información.

---
Nota: Esta explicación fue generada automáticamente. Puede editarse para añadir más contexto específico o ejemplos.