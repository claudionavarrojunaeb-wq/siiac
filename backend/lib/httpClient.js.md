# Documentación detallada de backend/lib/httpClient.js

## Código fuente

```js
import axios from 'axios';
import axiosRetry from 'axios-retry';

// Cliente axios centralizado para llamadas externas desde el backend
// Configurable: timeout, retries, headers comunes y logging básico

const client = axios.create({
  timeout: 8000, // ms
  headers: { 'User-Agent': 'siiac-backend/1.0' },
});

axiosRetry(client, {
  retries: 2,
  retryDelay: axiosRetry.exponentialDelay,
  shouldResetTimeout: true,
  retryCondition: (error) => {
    return axiosRetry.isNetworkOrIdempotentRequestError(error) || (error.response && error.response.status >= 500);
  },
});

client.interceptors.response.use(
  (resp) => resp,
  (err) => {
    console.error('[httpClient] request error:', err.message || err);
    return Promise.reject(err);
  },
);

export default client;

```

## Explicación detallada

- Resumen: Backend HTTP (Express) con acceso a DB y endpoints para la app.

**Importaciones:**
- import axios from 'axios';
- import axiosRetry from 'axios-retry';

**Declaraciones top-level (const/let/var):**
- const client

**Estructuras de control detectadas:**
- `await` usos: 0
- `fetch(...)` usos: 0
- bucles `for`: 0
- condicionales `if`: 0
- bloques `try/catch`: 0

---
Nota: Esta explicación fue generada automáticamente. Puede editarse para añadir más contexto específico o ejemplos.