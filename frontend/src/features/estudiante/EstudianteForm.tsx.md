# Documentación detallada de frontend/src/features/estudiante/EstudianteForm.tsx

Este documento describe la implementación actual del componente `EstudianteForm.tsx`,
sus validaciones y los endpoints del backend que consume.

## Resumen

- `EstudianteForm.tsx` muestra el identificador de la solicitud (`solicitudId`) y
  contiene el formulario de datos del estudiante (Parte 1). El formulario usa
  campos controlados con `useState`, carga catálogos desde el backend y valida
  todos los campos al presionar `Siguiente`. Los campos inválidos reciben el
  fondo `rgb(255,192,192)` según el requerimiento.

## Endpoints usados (backend)

- `GET /api/sexo` → devuelve lista de objetos `{ id, nombre }` desde tabla `sexo`.
- `GET /api/genero` → devuelve `{ id, nombre }` desde tabla `genero`.
- `GET /api/edad` → devuelve `{ id, nombre }` desde tabla `edad`.
- `GET /api/pueblos` → devuelve `{ id, nombre }` desde tabla `pueblos`.
- `GET /api/pais` → devuelve `{ id, nombre }` desde tabla `pais`.
- `GET /api/region` → devuelve `{ id, nombre }` desde tabla `region`.
- `GET /api/comunas?regionId=<regionId>` → devuelve comunas (`corepa`) filtradas
  por `regionId` (se hace `JOIN` con `provincia` para aplicar el filtro).

Estas rutas fueron añadidas en `backend/index.js` y devuelven JSON arrays con los
campos `id` y `nombre` (tal como los consume el formulario en el frontend).

## Comportamiento del formulario

- Campos incluidos (todos obligatorios):
  - `Rut estudiante`: se formatea al perder foco y se valida con algoritmo DV.
  - `Nombres` (máx. 100)
  - `Primer Apellido` (máx. 50)
  - `Segundo Apellido` (máx. 50)
  - `Sexo` (select desde `/api/sexo`)
  - `Género` (select desde `/api/genero`)
  - `Edad` (select desde `/api/edad`)
  - `Teléfono / Celular` (valida con `^(\\+56)?\\s?9\\d{8}$` o `^(\\+56)?\\s?\\d{9}$`)
  - `Correo Electrónico` (valida formato básico `^\\S+@\\S+\\.\\S+$`)
  - `Repita Correo Electrónico` (debe coincidir con el anterior)
  - `Nacionalidad` (radio: `Chilena` / `Extranjero`)
    - Si `Chilena`: aparece `Perteneciente a Pueblos Originarios` (select `/api/pueblos`).
    - Si `Extranjero`: aparece `País` (select `/api/pais`). Si se elige `Otro`, aparece
      el input `Ingrese su país`.
  - `Región de Residencia` (select `/api/region`)
  - `Comuna de Residencia` (select `/api/comunas?regionId=...`) — se recarga al cambiar región.
  - `Institución de Educación` (máx. 100)

- Validación: al presionar `Siguiente` se ejecuta `validateAll()` que marca los
  campos inválidos en el objeto `invalid`. La interfaz aplica `bg-[rgb(255,192,192)]`
  y `border-red-500` a los campos listados en `invalid`.

## Puntos técnicos y decisiones

- Formato y validación de RUT:
  - `formatRut(value)` limpia caracteres no válidos, inserta puntos y guion, y
    conserva la K si corresponde.
  - `validateRut(rut)` implementa el algoritmo módulo 11 para comprobar el DV.

- Carga de catálogos:
  - El componente realiza `fetch` a los endpoints señalados arriba en `useEffect`.
  - Si la llamada falla, el select queda vacío y la validación marcará el campo
    como inválido hasta que se seleccione un valor.

- Filtrado de comunas por región:
  - Cuando cambia `region` se solicita `/api/comunas?regionId=...` que internamente
    hace `JOIN` entre `corepa` y `provincia` para filtrar por `regionid`.

## Integración y pasos siguientes recomendados

- Estilado: el componente usa clases Tailwind; adapte utilidades o tema si su
  proyecto usa una configuración Tailwind diferente.
- Localización/labels: si requiere textos en otro idioma o ajustes en accesibilidad,
  actualice los `label` y atributos `aria-` según necesidad.
- Persistencia: en `handleSubmit` actualmente se construye `payload` y se hace
  `console.log`. Puede enviar `payload` a la ruta `/api/solicitud` (ya existente)
  o a otra ruta de su preferencia para persistir los datos.

## Registro de cambios

- 2026-04-29: Actualizada documentación para reflejar implementación del formulario y los endpoints añadidos en `backend/index.js`.
