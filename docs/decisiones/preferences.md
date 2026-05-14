Sincronizar C:\Users\claudio.navarro\AppData\Roaming\Code\User\globalStorage\github.copilot-chat\memory-tool\memories\preferences.md en base a este documento

# Preferencias del proyecto: SIIAC

Este documento centraliza las preferencias que usan los agentes y las herramientas de apoyo en este repositorio. Su objetivo es fijar convenciones operativas, puntos de sincronización entre memoria local/global y el procedimiento de registro de sesiones.

## Resumen de objetivos
- Evitar la exposición de razonamiento interno o flujos de "thinking" en la UI pública del chat.
- Mantener trazabilidad de cambios en `log/`.
- Sincronizar la copia de preferencias en la memoria local del agente con la fuente de verdad del proyecto (`docs/decisiones/preferences.md`).

## Ruta de sincronización
- Fuente de verdad (repositorio): [docs/decisiones/preferences.md](docs/decisiones/preferences.md)
- Copia en memoria del agente (global del usuario): C:\Users\claudio.navarro\AppData\Roaming\Code\User\globalStorage\github.copilot-chat\memory-tool\memories\preferences.md

Regla: actualizar la copia global únicamente desde la versión en el repositorio. No editar la copia global como fuente primaria.

## Reglas principales (resumidas)
- No mostrar flujos de `Thinking`, `Analyzing`, `Evaluating` o `Working`, ni razonamiento interno en el chat visible. El contenido interno agregarlo al archivvo de log. Si es necesario conservar contexto operativo, registrarlo en archivos dentro de `log/` y mantener [log/index.md](log/index.md) como índice y resumen de arranque.
- Mostrar solo avances breves en el chat: acciones ejecutadas y resultados, sin contenido de razonamiento interno.

- Ser preciso y rápido en las respuestas concisas.

- Para cualquier cambio en el workspace, registrar en log actual los archivos creados o modificados y una descripción exacta de lo realizado (rutas relativas y breve propósito).
- Registrar cada instrucción o solicitud explícita del usuario en el archivo de log activo (`log/aaaammdd.md`) como una observación inmediata. Formato requerido para la observación:

- Por cada archivo `.tsx` o `.js` del repositorio debe existir un archivo Markdown con el mismo nombre (por ejemplo `Componente.tsx.md`). En ese Markdown se copiará el código fuente completo y se añadirá una explicación detallada que describa qué hace cada función, variable, constante, bucle `for`, condicional `if`, expresiones `await`, llamadas `fetch`, y otros elementos relevantes; las explicaciones deben ser suficientemente detalladas para estudiar el código. Al actualizar cualquier archivo fuente `.tsx` o `.js`, su correspondiente `.md` debe actualizarse para reflejar los cambios.

 - Registrar cada instrucción o solicitud explícita del usuario en el archivo de log activo (`log/aaaammdd.md`) como una observación inmediata. Formato requerido para la observación:

	- `- YYYY-MM-DD HH:MM:SS Dev solicita: <texto de la solicitud>`

	El agente debe añadir esta observación inmediatamente después de ejecutar la acción solicitada. Esta regla aplica para todas las solicitudes directas del usuario y debe mantenerse en la copia de preferencias del repositorio y en la memoria del agente.

## Reglas para archivos de log (`log/`)

Estructura obligatoria en la cabecera de cada archivo de log:

- Primera línea: exactamente 10 palabras clave separadas por espacios (campo obligatorio). Esta primera línea debe existir y actualizarse cuando proceda.

- `Resumen inicial:` — breve descripción del propósito del log.

- Con las palabras clave y el resumen inicial se podrá obtener el contexto de lo realizado, actualizando [log/index.md] (log/index.md)

- Agregar cada input del usuario con la fecha hora: prompts, instrucciones, consultas, requests

Flujo de edición:

1. Al agregar contenido, precederlo con una línea de marca temporal `YYYY-MM-DD HH:MM:SS` seguida del contenido a añadir, por cada acción que ejecutes añade una observación en el log.


Convenciones operativas adicionales:

- Mantener codificación UTF-8 en todos los archivos del proyecto

## Referencias y buenas prácticas
- Leer siempre `log/index.md` y luego las tres últimas sesiones (en orden descendente) al iniciar una nueva tarea para recuperar contexto.
- Usar `docs/base-de-datos/BBDD.md` como referencia principal para estructura y cambios de la base de datos.

## Registro de cambios
- 2026-04-24 16:20:00 - Adaptado el formato y aclaradas reglas operativas. Cambios aplicados por el agente.

---
Nota: esta versión está pensada para ser la fuente de verdad en el repositorio; después de validar los cambios, sincronizar manualmente la copia en la memoria global del usuario si corresponde en C:\Users\claudio.navarro\AppData\Roaming\Code\User\globalStorage\github.copilot-chat\memory-tool\memories\preferences.md.