Resumen técnico del sistema SIIAC

Este documento recoge la arquitectura, flujos de ejecución y procedimientos operativos principales del proyecto.
Contiene rutas relevantes, comandos de arranque, variables de entorno, convenciones de sesiones y notas de integración (Tailwind, ngrok, proxy de Vite, PostgreSQL).

1) Arquitectura general

- Frontend: React 19 + TypeScript, empaquetado con Vite. Código principal en `frontend/src`.
- Backend: Node.js + Express (CommonJS), micro-API mínima para exponer datos desde PostgreSQL. Código en `backend/index.js`.
- Base de datos: PostgreSQL (`siiac`), consultas documentadas en `BBDD.md`.
- Tunneling / Exposición: ngrok usado para exponer el servidor de desarrollo Vite a Internet durante pruebas y acceso desde móviles.

2) Frontend (detalles operativos)

- Ubicación principal: [frontend](frontend/)
- Entrada dev: `npm run dev` (ejecuta `vite`). Scripts en `frontend/package.json`:

	- `dev`: servidor de desarrollo Vite
	- `build`: `tsc -b && vite build` (TypeScript + bundling)
	- `preview`: `vite preview`

- Configuración importante: `frontend/vite.config.ts` contiene:
	- `server.host: '0.0.0.0'` para aceptar conexiones desde la red local (necesario para ngrok y acceso móvil).
	- `server.port: 5173` (puerto por defecto de dev).
	- `server.allowedHosts` incluye el hostname público que ngrok proporciona para evitar bloqueo por host no permitido.
	- Proxy: todas las rutas `/api` se redirigen a `http://127.0.0.1:3001` para consumir el backend en desarrollo sin CORS mediante mismo origen.

- Integración CSS: Tailwind CSS instalado y registrado en `frontend/vite.config.ts` y `frontend/src/index.css`.

- Componentes clave:
	- `frontend/src/forms/InicioForm.tsx`: formulario principal. Recupera `campaignHtml` desde `/api/campana-activa`, maneja estado `selectedUserType` y `selectedUserDetail` (campo obligatorio cuando el tipo es "Otro") y controla habilitado/deshabilitado del botón "Siguiente".

3) Backend (detalles operativos)

- Ubicación principal: [backend](backend/)
- Script de inicio: `npm start` ejecuta `node index.js`.
- Dependencias principales: `express`, `cors`, `pg`.
- Variables de entorno soportadas (si no están definidas, el backend usa valores por defecto legibles para desarrollo):
	- `PORT` (por defecto `3001`) — puerto donde escucha el backend.
	- `FRONTEND_ORIGIN` (por defecto `http://localhost:5173`) — origen permitido por CORS en desarrollo.
	- `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD` — configuración de conexión a PostgreSQL. Ver `BBDD.md` para credenciales operativas y notas de seguridad; no incluir credenciales sensibles en este archivo.

- Endpoint principal para el formulario:
	- `GET /api/health` → `{ ok: true }` (chequeo rápido)
	- `GET /api/campana-activa` → devuelve `{ campaignHtml }` con `campanadescripcion` de la campaña activa.

- Consulta SQL usada (ejemplo):

```sql
select campanadescripcion
from public.campana
where campanahabilitado = 1
	and campanasistema = 1
order by campanaid asc
limit 1;
```

4) PostgreSQL

- El repositorio incluye `BBDD.md` con la documentación de tablas, campos y consultas utilizadas. Usar ese archivo para cualquier modificación de consultas o despliegue a otros entornos.
- Recomendación: para entornos de staging/producción, gestionar credenciales con variables de entorno seguras y no versionarlas en el repo.

5) Exposición vía ngrok (dev/test móvil)

- Para exponer el dev server Vite (puerto 5173) por ngrok:

```powershell
# desde la raíz del proyecto
cd frontend
npm run dev -- --host 0.0.0.0 --port 5173
# en otra terminal (si ngrok está en PATH)
ngrok http 5173
```

- En caso de error `ERR_NGROK_334` (túnel ya activo), consultar la API local de ngrok para recuperar túneles existentes:

```text
http://127.0.0.1:4040/api/tunnels
```

- Añadir el host público de ngrok a `frontend/vite.config.ts` en `server.allowedHosts` para que Vite acepte solicitudes provenientes de ese host.

6) Convenciones de sesiones y trazabilidad

- Ubicación: directorio de historial de sesiones (archivos con formato `session_YYYYMMDDHHMMSS.md`).
- Regla de nombres: el sufijo `YYYYMMDDHHMMSS` debe corresponder a la marca `Session init timestamp` convertida a TZ `America/Santiago` (hora local). Si el archivo fue creado o renombrado con UTC previamente, renombrar para reflejar el `Session init timestamp` local.
- Cabecera de sesión (se espera):
	- Primera línea: exactamente 10 palabras clave separadas por comas o espacios.
	- Debajo: `Session init timestamp: YYYY-MM-DD HH:MM:SS` — debe reflejar la hora de inicio de la sesión (TZ=America/Santiago).
	- Al final del archivo: `Session end timestamp: YYYY-MM-DD HH:MM:SS` — debe corresponder a la última fecha de modificación del archivo (mtime) convertida a TZ=America/Santiago. Nota: esta marca debe reflejar el `mtime` del sistema de archivos, no la hora actual al ejecutar la operación.

- Comando operativo (convención humana): cuando el usuario indique `guarda sesion`, el asistente debe:
	1. Asegurar que la primera línea tenga exactamente 10 palabras clave (crear o actualizar según sea necesario).
	2. Insertar o actualizar `Session init timestamp` debajo de las palabras clave (valor = creación del archivo o la hora indicada por el usuario, en TZ America/Santiago).
	3. Añadir o actualizar `Session end timestamp` al final del archivo con el valor de `mtime` convertido a TZ America/Santiago.

7) Seguridad y buenas prácticas

- No almacenar contraseñas en ficheros del repositorio. Usar variables de entorno o un gestor de secretos para despliegues.
- Revisar `BBDD.md` antes de ejecutar consultas que modifiquen datos; el archivo contiene las consultas de referencia y la política de registro de cambios.

8) Comandos rápidos de desarrollo

Frontend (desarrollo):
```bash
cd frontend
npm install
npm run dev -- --host 0.0.0.0 --port 5173
```

Backend (desarrollo):
```bash
cd backend
npm install
export PGHOST=... # o setx en Windows / usar .env según preferencia
npm start
```

Exponer por ngrok (ejemplo Windows PowerShell):
```powershell
ngrok http 5173
# consultar túneles activos
Invoke-RestMethod http://127.0.0.1:4040/api/tunnels
```

9) Puntos de interés en el repo (rutas)

- `frontend/src/forms/InicioForm.tsx` — formulario principal, validaciones y render del HTML de campaña.
- `frontend/vite.config.ts` — configuración dev, `allowedHosts`, proxy `/api`.
- `backend/index.js` — servidor Express, endpoint `/api/campana-activa`, configuración `Pool` para PostgreSQL.
- `BBDD.md` — documentación de base de datos y consultas.
- Historial de sesiones (directorio de historial) — historial y trazabilidad.
- `preferences.md` — preferencias operativas del agente y reglas para sesiones.

10) Notas finales y recomendaciones

- Para replicar el entorno local en otra máquina, instalar Node.js (LTS), npm, PostgreSQL y ngrok (opcional). Clonar el repo, ejecutar `npm install` en `frontend` y `backend`, configurar variables de entorno de base de datos y arrancar ambos servidores.
- Antes de exponer el frontend con ngrok, asegurarse de que Vite esté corriendo con `--host 0.0.0.0` y agregar el host público a `server.allowedHosts` si Vite bloquea solicitudes externas.
- Para cualquier cambio en consultas SQL o estructura de la base, documentarlo en `BBDD.md` y registrar la acción en la sesión activa dentro del historial de sesiones.

---

Archivo generado/actualizado automáticamente por el asistente el 2026-04-23 (hora local America/Santiago). Para preguntas puntuales sobre algún punto, indica la sección que quieres ampliar.

## Diagrama de componentes (vectorial)

El siguiente diagrama está en formato Mermaid (vectorial) y representa los componentes principales del sistema, sus responsabilidades y las conexiones típicas en desarrollo.

```mermaid
flowchart LR
	Browser[Browser / Mobile]
	Ngrok[ngrok (túnel público)]
	subgraph Frontend[Frontend]
		Vite[Vite Dev Server\n(frontend)]
		React[React 19 + TypeScript\n(frontend/src)]
	end
	subgraph Backend[Backend]
		Express[Express API\n(backend/index.js)]
		PG[PostgreSQL\n(siiac)]
	end
	BBDD_md[BBDD.md]\n(Documentación SQL)
	History[Historial]\n(Historial de sesiones)
	Preferences[preferences.md]\n(Preferencias + reglas)

	Browser -->|HTTP (dev)| Vite
	Browser -->|Acceso público| Ngrok
	Ngrok --> Vite
	Vite -->|Proxy /api| Express
	Express -->|pg Pool| PG
	Express -->|Consulta / actualiza| BBDD_md
	History -->|Registra cambios y consultas| BBDD_md
	Preferences --> History
	React -->|consume| Vite
	DevMachine[Desarrollador] --> Vite
	DevMachine --> Express

	classDef docs fill:#f3f4f6,stroke:#111,stroke-width:1px;
	class BBDD_md,History,Preferences docs;

```

Este diagrama es vectorial y puede renderizarse directamente en plataformas que soporten Mermaid. Si deseas, puedo generar y añadir un SVG exportado al repo (por ejemplo `docs/diagrama-componentes.svg`).
