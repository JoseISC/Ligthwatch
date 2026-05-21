import { describe, it, expect } from 'vitest';
import { circleCoords, circlePolygon } from '../src/geo.js';

describe('circleCoords (radio en grados)', () => {
  it('cierra el anillo: el primer y el ultimo punto coinciden', () => {
    const coords = circleCoords(0, 0, 0.01, 4);
    expect(coords.length).toBe(5);
    expect(coords[0]).toEqual(coords[4]);
  });

  it('genera puntos alrededor del centro en angulos esperados', () => {
    const coords = circleCoords(0, 0, 0.01, 4);
    expect(coords[0][0]).toBeCloseTo(0.01, 5);
    expect(coords[0][1]).toBeCloseTo(0, 5);
    expect(coords[1][0]).toBeCloseTo(0, 5);
    expect(coords[1][1]).toBeCloseTo(0.01, 5);
    expect(coords[2][0]).toBeCloseTo(-0.01, 5);
    expect(coords[2][1]).toBeCloseTo(0, 5);
  });

  it('respeta el centro especificado', () => {
    const coords = circleCoords(-70, -33, 0.005, 8);
    expect(coords.length).toBe(9);
    coords.forEach(([lng, lat]) => {
      expect(lng).toBeGreaterThan(-70.01);
      expect(lng).toBeLessThan(-69.99);
      expect(lat).toBeGreaterThan(-33.01);
      expect(lat).toBeLessThan(-32.99);
    });
  });

  it('devuelve solo el punto repetido cuando numPoints es 1', () => {
    const coords = circleCoords(0, 0, 1, 1);
    expect(coords.length).toBe(2);
    expect(coords[0]).toEqual(coords[1]);
  });
});

describe('circlePolygon (radio en metros)', () => {
  it('cierra el anillo', () => {
    const coords = circlePolygon(0, 0, 10, 4);
    expect(coords.length).toBe(5);
    expect(coords[0]).toEqual(coords[4]);
  });

  it('produce un radio aproximadamente correcto en grados (1 metro ~ 1/111320 grados en lat)', () => {
    const coords = circlePolygon(0, 0, 111320, 4);
    expect(coords[0][0]).toBeCloseTo(1, 2);
    expect(coords[1][1]).toBeCloseTo(1, 2);
  });

  it('compensa la longitud por la latitud (en latitudes altas el radio en grados es mayor)', () => {
    const ecuador = circlePolygon(0, 0, 1000, 4);
    const sur = circlePolygon(0, -60, 1000, 4);
    const radioLngEcuador = Math.abs(ecuador[0][0]);
    const radioLngSur = Math.abs(sur[0][0]);
    expect(radioLngSur).toBeGreaterThan(radioLngEcuador);
  });

  it('genera la cantidad esperada de puntos para un poligono de 16 lados', () => {
    const coords = circlePolygon(-70.66, -33.45, 50, 16);
    expect(coords.length).toBe(17);
    expect(coords[0]).toEqual(coords[16]);
  });
});
