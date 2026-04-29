import { describe, it, expect, vi } from 'vitest';
import { apiUrl, formatFecha, formatApiError } from '../src/utils.js';

describe('apiUrl', () => {
  it('should prepend /api in dev mode', () => {
    vi.stubEnv('DEV', true);
    expect(apiUrl('/eventos')).toBe('/api/eventos');
    expect(apiUrl('eventos')).toBe('/api/eventos');
  });

  it('should use VITE_API_URL when set', () => {
    vi.stubEnv('DEV', false);
    vi.stubEnv('VITE_API_URL', 'http://localhost:8000');
    expect(apiUrl('/eventos')).toBe('http://localhost:8000/eventos');
  });
});

describe('formatFecha', () => {
  it('should return Sin fecha for null/undefined', () => {
    expect(formatFecha(null)).toBe('Sin fecha');
    expect(formatFecha(undefined)).toBe('Sin fecha');
    expect(formatFecha('')).toBe('Sin fecha');
  });

  it('should return Fecha inválida for invalid date', () => {
    expect(formatFecha('not-a-date')).toBe('Fecha inválida');
  });

  it('should format valid date', () => {
    const result = formatFecha('2026-04-24T22:01:50.379494+00:00');
    expect(result).toContain('2026');
  });
});

describe('formatApiError', () => {
  it('should handle string detail', () => {
    expect(formatApiError({ detail: 'Error message' })).toBe('Error message');
  });

  it('should handle array detail', () => {
    const result = formatApiError({ detail: [{ msg: 'Error 1' }, { msg: 'Error 2' }] });
    expect(result).toBe('Error 1; Error 2');
  });

  it('should handle message field', () => {
    expect(formatApiError({ message: 'Msg error' })).toBe('Msg error');
  });

  it('should return unknown error for null', () => {
    expect(formatApiError(null)).toBe('Error desconocido');
  });
});
