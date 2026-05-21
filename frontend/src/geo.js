/**
 * Genera las coordenadas de un poligono circular (anillo cerrado) alrededor
 * de un centro `(centerLng, centerLat)` con un radio expresado en grados.
 *
 * Devuelve un arreglo de `numPoints + 1` puntos `[lng, lat]`, donde el primer
 * y el ultimo punto coinciden para cerrar el poligono.
 */
export function circleCoords(centerLng, centerLat, radiusInDegrees, numPoints) {
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

/**
 * Igual que `circleCoords`, pero el radio se expresa en metros.
 *
 * Convierte metros a grados teniendo en cuenta la latitud (la longitud se
 * "encoge" al alejarse del ecuador), de modo que el circulo dibujado en el
 * mapa quede aproximadamente redondo.
 */
export function circlePolygon(centerLng, centerLat, radiusInMeters, numPoints) {
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
