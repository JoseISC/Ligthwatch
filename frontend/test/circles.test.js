import { describe, it, expect } from 'vitest';

// Test circleCoords directly without importing main.js
function circleCoords(centerLng, centerLat, radiusInDegrees, numPoints) {
  const coords = [];
  for (let i = 0; i < numPoints; i++) {
    const angle = (i / numPoints) * 2 * Math.PI;
    const lng = centerLng + radiusInDegrees * Math.cos(angle);
    const lat = centerLat + radiusInDegrees * Math.sin(angle);
    coords.push([lng, lat]);
  }
  coords.push(coords[0]);
  return coords;
}

function circlePolygon(centerLng, centerLat, radiusInMeters, numPoints) {
  const metersPerDegreeLat = 111320;
  const metersPerDegreeLng = 111320 * Math.cos((centerLat * Math.PI) / 180);
  const radiusLng = radiusInMeters / metersPerDegreeLng;
  const radiusLat = radiusInMeters / metersPerDegreeLat;
  const coords = [];
  for (let i = 0; i < numPoints; i++) {
    const angle = (i / numPoints) * 2 * Math.PI;
    const lng = centerLng + radiusLng * Math.cos(angle);
    const lat = centerLat + radiusLat * Math.sin(angle);
    coords.push([lng, lat]);
  }
  coords.push(coords[0]);
  return coords;
}

describe('circleCoords', () => {
  it('should return correct number of points', () => {
    const coords = circleCoords(0, 0, 0.01, 4);
    expect(coords.length).toBe(5);
    expect(coords[0]).toEqual(coords[4]);
  });

  it('should generate points around center', () => {
    const coords = circleCoords(0, 0, 0.01, 4);
    expect(coords[0][0]).toBeGreaterThan(0);
    expect(coords[1][1]).toBeGreaterThan(0);
    expect(coords[2][0]).toBeLessThan(0);
  });
});

describe('circlePolygon', () => {
  it('should return correct number of points', () => {
    const coords = circlePolygon(0, 0, 10, 4);
    expect(coords.length).toBe(5);
    expect(coords[0]).toEqual(coords[4]);
  });

  it('should generate points in meters', () => {
    const coords = circlePolygon(0, 0, 10, 4);
    expect(coords[0][0]).toBeGreaterThan(0);
    expect(coords[1][1]).toBeGreaterThan(0);
  });
});
