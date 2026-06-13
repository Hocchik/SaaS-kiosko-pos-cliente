// En desarrollo, los navegadores resuelven *.localhost a 127.0.0.1 sin configurar DNS.
// Usar el mismo hostname para la API permite que el backend resuelva el tenant por subdominio
// igual que en producción (ej. cafeteria-lucia.localhost:5173 -> cafeteria-lucia.localhost:8081).
const { hostname } = window.location;
const isLocalDev = hostname === 'localhost' || hostname.endsWith('.localhost');

export const API_BASE_URL: string = isLocalDev
  ? `http://${hostname}:8081`
  : import.meta.env.VITE_API_URL;
