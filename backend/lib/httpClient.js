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
