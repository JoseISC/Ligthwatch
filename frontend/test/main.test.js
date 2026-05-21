import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiUrl, formatFecha, formatApiError } from '../src/utils.js';

describe('apiUrl', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  it('antepone /api en modo dev', () => {
    vi.stubEnv('DEV', true);
    expect(apiUrl('/eventos')).toBe('/api/eventos');
  });

  it('usa VITE_API_URL cuando esta definido', () => {
    vi.stubEnv('DEV', false);
    vi.stubEnv('VITE_API_URL', 'http://localhost:8000');
    expect(apiUrl('/eventos')).toBe('http://localhost:8000/eventos');
  });

  it('elimina la barra final de VITE_API_URL para evitar dobles slashes', () => {
    vi.stubEnv('DEV', false);
    vi.stubEnv('VITE_API_URL', 'http://localhost:8000/');
    expect(apiUrl('/eventos')).toBe('http://localhost:8000/eventos');
  });

  it('agrega la barra inicial cuando el path no la trae', () => {
    vi.stubEnv('DEV', true);
    expect(apiUrl('eventos')).toBe('/api/eventos');
  });

  it('cae al fallback http://localhost:8000 en produccion sin VITE_API_URL', () => {
    vi.stubEnv('DEV', false);
    vi.stubEnv('VITE_API_URL', '');
    expect(apiUrl('/eventos')).toBe('http://localhost:8000/eventos');
  });
});

describe('formatFecha', () => {
  it('devuelve "Sin fecha" cuando recibe null', () => {
    expect(formatFecha(null)).toBe('Sin fecha');
  });

  it('devuelve "Sin fecha" cuando recibe undefined', () => {
    expect(formatFecha(undefined)).toBe('Sin fecha');
  });

  it('devuelve "Sin fecha" cuando recibe cadena vacia', () => {
    expect(formatFecha('')).toBe('Sin fecha');
  });

  it('formatea una fecha ISO valida', () => {
    const result = formatFecha('2026-04-24T22:01:50.379494+00:00');
    expect(result).toContain('2026');
  });

  it('devuelve "Fecha invalida" para una cadena que no parsea', () => {
    expect(formatFecha('no-es-una-fecha')).toBe('Fecha inválida');
  });

  it('devuelve "Fecha invalida" cuando el constructor Date lanza una excepcion (rama catch)', () => {
    vi.stubGlobal('Date', function () { throw new Error('fallo interno'); });
    try {
      expect(formatFecha('2026-01-01')).toBe('Fecha inválida');
    } finally {
      vi.unstubAllGlobals();
    }
  });
});

describe('formatApiError', () => {
  it('extrae detail cuando es un string', () => {
    expect(formatApiError({ detail: 'Error' })).toBe('Error');
  });

  it('devuelve "Error desconocido" para null', () => {
    expect(formatApiError(null)).toBe('Error desconocido');
  });

  it('devuelve "Error desconocido" para undefined', () => {
    expect(formatApiError(undefined)).toBe('Error desconocido');
  });

  it('extrae mensajes de un array de errores de validacion FastAPI', () => {
    const data = {
      detail: [
        { msg: 'campo requerido', loc: ['body', 'tipo_evento'] },
        { msg: 'numero invalido', loc: ['body', 'latitud'] },
      ],
    };
    const result = formatApiError(data);
    expect(result).toContain('campo requerido');
    expect(result).toContain('numero invalido');
    expect(result).toContain(';');
  });

  it('serializa items sin msg dentro de un array', () => {
    const result = formatApiError({ detail: ['error simple', { foo: 'bar' }] });
    expect(result).toContain('error simple');
  });

  it('extrae message cuando no hay detail', () => {
    expect(formatApiError({ message: 'Algo fallo' })).toBe('Algo fallo');
  });

  it('hace JSON.stringify de objetos sin detail ni message', () => {
    const data = { code: 500, status: 'down' };
    const result = formatApiError(data);
    expect(result).toContain('500');
    expect(result).toContain('down');
  });

  it('devuelve "Error desconocido" cuando JSON.stringify lanza (referencia circular)', () => {
    const circular = {};
    circular.self = circular;
    expect(formatApiError(circular)).toBe('Error desconocido');
  });
});
