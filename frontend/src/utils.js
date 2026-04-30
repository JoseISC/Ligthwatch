/** Base URL del backend (ver README: VITE_API_URL en build; en dev se usa proxy /api). */
export function apiUrl(path) {
  const p = path.startsWith('/') ? path : `/${path}`;
  const fromEnv = import.meta.env.VITE_API_URL?.replace(/\/$/, '');
  if (fromEnv) return `${fromEnv}${p}`;
  if (import.meta.env.DEV) return `/api${p}`;
  return `http://localhost:8000${p}`;
}

/** Formatea una cadena ISO de fecha/hora en formato local legible, con fallback. */
export function formatFecha(isoString) {
  if (!isoString) return 'Sin fecha';
  try {
    const d = new Date(isoString);
    if (Number.isNaN(d.getTime())) return 'Fecha inválida';
    return d.toLocaleString('es-CL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'Fecha inválida';
  }
}

/** Mensaje legible desde respuestas FastAPI (`detail` string o lista de validación). */
export function formatApiError(data) {
  if (data == null) return 'Error desconocido';
  if (typeof data.detail === 'string') return data.detail;
  if (Array.isArray(data.detail)) {
    return data.detail.map((x) => (typeof x === 'object' && x.msg ? x.msg : String(x))).join('; ');
  }
  if (typeof data.message === 'string') return data.message;
  try {
    return JSON.stringify(data);
  } catch {
    return 'Error desconocido';
  }
}
