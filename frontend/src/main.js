import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import polyline from '@mapbox/polyline';
import './map-ui.css';
import { apiUrl, formatFecha, formatApiError } from './utils.js';

const map = new maplibregl.Map({
  container: 'map',
  style: 'https://tiles.openfreemap.org/styles/liberty',
  center: [-70.66, -33.45],
  zoom: 10,
});

map.addControl(new maplibregl.NavigationControl());

map.on('load', () => {
  loadEventos();
});

let routeMarkers = [];
let routePoints = [];
let eventoMarkers = [];

/** @type {'idle' | 'route' | 'evento'} */
let interactionMode = 'idle';
/** @type {maplibregl.Marker | null} */
let eventoMarker = null;
/** @type {{ lng: number; lat: number } | null} */
let pendingEventoCoords = null;

const routeBtn = document.getElementById('routeBtn');
const eventoModeBtn = document.getElementById('eventoModeBtn');
const newTipoBtn = document.getElementById('newTipoBtn');
const modeHint = document.getElementById('modeHint');
const modalRoot = document.getElementById('modalRoot');

routeBtn.addEventListener('click', toggleRouteMode);
eventoModeBtn.addEventListener('click', toggleEventoMode);
newTipoBtn.addEventListener('click', () => openTipoModal());

map.on('click', (e) => {
  const { lng, lat } = e.lngLat;

  if (interactionMode === 'evento') {
    setEventoMarker(lng, lat);
    pendingEventoCoords = { lng, lat };
    openEventoModal();
    return;
  }

  if (interactionMode === 'route') {
    if (routePoints.length === 2) {
      routeMarkers.forEach((m) => m.remove());
      routeMarkers = [];
      routePoints = [];
    }

    routePoints.push({ lon: lng, lat });

    const marker = new maplibregl.Marker().setLngLat([lng, lat]).addTo(map);
    routeMarkers.push(marker);

    updateRouteHint();
  }
});

// --- Modo Ruta ---

function toggleRouteMode() {
  if (interactionMode === 'route') {
    clearRouteMode();
    return;
  }

  if (interactionMode === 'evento') {
    clearEventoPlacement();
    eventoModeBtn.setAttribute('aria-pressed', 'false');
  }

  interactionMode = 'route';
  routeBtn.setAttribute('aria-pressed', 'true');
  updateRouteHint();
}

function clearRouteMode() {
  routeMarkers.forEach((m) => m.remove());
  routeMarkers = [];
  routePoints = [];
  clearRouteLine();
  interactionMode = 'idle';
  routeBtn.setAttribute('aria-pressed', 'false');
  setHintVisible(false);
}

function updateRouteHint() {
  if (interactionMode !== 'route') return;

  if (routePoints.length === 0) {
    setHintVisible(true, 'Modo Ruta: haz clic en el mapa para añadir el punto de origen.', false);
  } else if (routePoints.length === 1) {
    setHintVisible(true, 'Ahora haz clic para añadir el punto de destino.', false);
  } else {
    setHintVisible(true, 'Puntos listos.', true);
  }
}

function clearRouteLine() {
  if (map.getSource('route')) {
    map.removeLayer('route');
    map.removeSource('route');
  }
}

function setEventoMarker(lng, lat) {
  if (eventoMarker) {
    eventoMarker.remove();
    eventoMarker = null;
  }
  const el = document.createElement('div');
  el.className = 'evento-marker-dot';
  el.setAttribute('title', 'Ubicación del Evento');
  eventoMarker = new maplibregl.Marker({ element: el }).setLngLat([lng, lat]).addTo(map);
}

function circleCoords(centerLng, centerLat, radiusInMeters, numPoints) {
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

async function loadEventos() {
  try {
    const res = await fetch(apiUrl('/eventos'));
    if (!res.ok) {
      console.warn('GET /eventos respondió', res.status);
      return;
    }
    const eventos = await res.json();
    console.log(`Cargando ${eventos.length} eventos`);
    eventos.forEach((evento) => addEventoMarker(evento));
  } catch (e) {
    console.error('Error loading eventos:', e);
  }
}

function addEventoMarker(evento) {
  const lng = Number(evento.longitud);
  const lat = Number(evento.latitud);
  if (!Number.isFinite(lng) || !Number.isFinite(lat)) {
    console.warn('Evento descartado por coordenadas inválidas:', evento);
    return;
  }

  const el = document.createElement('div');
  el.className = 'evento-marker-dot';
  const isNegativo = evento.evento_negativo === true || evento.evento_negativo === 'true';
  el.style.background = isNegativo ? '#dc2626' : '#22c55e';
  el.setAttribute('title', evento.tipo_evento || 'Evento');

  el.addEventListener('click', (e) => {
    e.stopPropagation();
    openDetalleModal(evento, marker);
  });

  const marker = new maplibregl.Marker({ element: el })
    .setLngLat([lng, lat])
    .addTo(map);

  eventoMarkers.push(marker);

const radius = evento.radius || 10;
  const puntuacion = evento.puntuacion ?? 1;
  const opacity = Math.min(Math.max(puntuacion / 10, 0.1), 0.5);
  const circleColor = isNegativo ? '#dc2626' : '#22c55e';

  const circleGeoJSON = {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [circleCoords(evento.longitud, evento.latitud, radius, 32)],
    },
  };

  const sourceId = `evento-circle-${evento.id}`;
  if (!map.getSource(sourceId)) {
    map.addSource(sourceId, { type: 'geojson', data: circleGeoJSON });
  }
  if (!map.getLayer(sourceId)) {
    map.addLayer({
      id: sourceId,
      type: 'fill',
      source: sourceId,
      paint: {
        'fill-color': circleColor,
        'fill-opacity': opacity,
      },
    });
  }
}

// --- Modal Detalles Evento ---

let detalleModalEl = null;
let detalleDeleteBtn = null;
let detalleCleanup = null;

function openDetalleModal(evento, marker) {
  if (!detalleModalEl) {
    detalleModalEl = document.createElement('div');
    detalleModalEl.className = 'modal-overlay';
    detalleModalEl.setAttribute('role', 'presentation');
    detalleModalEl.innerHTML = `
      <div class="modal-panel" role="dialog" aria-modal="true" aria-labelledby="detalle-title" tabindex="-1">
        <h2 id="detalle-title">Detalles del Evento</h2>
        <div class="modal-field">
          <label>Tipo</label>
          <p id="detalle-tipo" class="modal-value"></p>
        </div>
        <div class="modal-field">
          <label>Descripción</label>
          <p id="detalle-desc" class="modal-value"></p>
        </div>
        <div class="modal-field">
          <label>Fecha y hora</label>
          <p id="detalle-fecha" class="modal-value"></p>
        </div>
        <div class="modal-field">
          <label>Ubicación</label>
          <p id="detalle-coords" class="modal-value"></p>
        </div>
        <div class="modal-error" id="detalle-error" hidden></div>
        <div class="modal-actions">
          <button type="button" id="detalle-cancel">Cerrar</button>
          <button type="button" id="detalle-delete" class="modal-btn--danger">Eliminar evento</button>
        </div>
      </div>
    `;
    modalRoot.appendChild(detalleModalEl);

    detalleModalEl.querySelector('#detalle-cancel').addEventListener('click', closeDetalleModal);
    detalleModalEl.addEventListener('click', (ev) => {
      if (ev.target === detalleModalEl) closeDetalleModal();
    });

    detalleDeleteBtn = detalleModalEl.querySelector('#detalle-delete');
  }

  const descripcion = evento.descripcion?.trim() || evento.descripcion_evento?.trim() || 'Sin descripción';

  detalleModalEl.querySelector('#detalle-tipo').textContent = evento.tipo_evento || 'Sin tipo';
  detalleModalEl.querySelector('#detalle-desc').textContent = descripcion;
  detalleModalEl.querySelector('#detalle-fecha').textContent = formatFecha(evento.created_at);
  detalleModalEl.querySelector('#detalle-coords').textContent =
    `${Number(evento.latitud).toFixed(6)}, ${Number(evento.longitud).toFixed(6)}`;
  detalleModalEl.querySelector('#detalle-error').hidden = true;

  if (detalleCleanup) detalleCleanup();
  const handleDelete = () => deleteEvento(evento.id ?? evento.evento_id, marker);
  detalleDeleteBtn.addEventListener('click', handleDelete);
  detalleCleanup = () => detalleDeleteBtn.removeEventListener('click', handleDelete);

  detalleModalEl.hidden = false;
  detalleModalEl.querySelector('.modal-panel').focus();
}

function closeDetalleModal() {
  if (detalleModalEl) detalleModalEl.hidden = true;
  if (detalleCleanup) {
    detalleCleanup();
    detalleCleanup = null;
  }
}

async function deleteEvento(id, marker) {
  const err = detalleModalEl.querySelector('#detalle-error');
  err.hidden = true;

  if (!id) {
    err.hidden = false;
    err.textContent = 'No se puede eliminar: el evento no tiene ID.';
    return;
  }

  try {
    const res = await fetch(apiUrl(`/eventos/${id}`), { method: 'DELETE' });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(formatApiError(data));
    }
    marker.remove();
    eventoMarkers = eventoMarkers.filter((m) => m !== marker);
    closeDetalleModal();
  } catch (e) {
    err.hidden = false;
    err.textContent = e.message || 'Error al eliminar el evento.';
  }
}

function toggleEventoMode() {
  const next = interactionMode === 'evento' ? 'idle' : 'evento';

  if (next === 'evento' && interactionMode === 'route') {
    clearRouteMode();
  }

  interactionMode = next;
  eventoModeBtn.setAttribute('aria-pressed', next === 'evento' ? 'true' : 'false');

  if (next === 'idle') {
    clearEventoPlacement();
    setHintVisible(false);
    return;
  }

  setHintVisible(
    true,
    'Modo Evento: haz clic en el mapa para colocar el marcador. Luego elige el tipo de evento.',
    false,
  );
}

function clearEventoPlacement() {
  if (eventoMarker) {
    eventoMarker.remove();
    eventoMarker = null;
  }
  pendingEventoCoords = null;
  closeEventoModal();
}

/**
 * @param {boolean} show
 * @param {string} text
 * @param {boolean} showCalcBtn — muestra el botón "Calcular ruta" dentro del hint
 */
function setHintVisible(show, text = '', showCalcBtn = false) {
  if (!show) {
    modeHint.classList.add('map-hint--hidden');
    modeHint.innerHTML = '';
    return;
  }

  if (showCalcBtn) {
    modeHint.innerHTML = `<span>${text}</span><button type="button" id="calcRouteBtn" class="map-hint__btn">Calcular ruta</button>`;
    modeHint.querySelector('#calcRouteBtn').addEventListener('click', getRoute);
  } else {
    modeHint.textContent = text;
  }

  modeHint.classList.remove('map-hint--hidden');
}

// --- Modales ---

let eventoModalEl = null;
let tipoModalEl = null;

function closeEventoModal() {
  if (eventoModalEl) {
    eventoModalEl.hidden = true;
  }
}

function openEventoModal() {
  if (!pendingEventoCoords) return;

  if (!eventoModalEl) {
    eventoModalEl = document.createElement('div');
    eventoModalEl.className = 'modal-overlay';
    eventoModalEl.setAttribute('role', 'presentation');
    eventoModalEl.innerHTML = `
      <div class="modal-panel" role="dialog" aria-modal="true" aria-labelledby="evento-title" tabindex="-1">
        <h2 id="evento-title">Registrar Evento</h2>
        <p class="sub">Coordenadas del marcador. Elige un tipo de evento existente (desde Supabase).</p>
        <div class="modal-field">
          <label for="evento-tipo">Tipo de evento</label>
          <select id="evento-tipo" required></select>
        </div>
        <div class="modal-field">
          <label>Ubicación</label>
          <input type="text" id="evento-coords" readonly />
        </div>
        <div class="modal-error" id="evento-error" hidden></div>
        <div class="modal-actions">
          <button type="button" id="evento-cancel">Cancelar</button>
          <button type="submit" id="evento-submit">Guardar Evento</button>
        </div>
      </div>
    `;
    modalRoot.appendChild(eventoModalEl);

    eventoModalEl.querySelector('#evento-cancel').addEventListener('click', () => {
      clearEventoPlacement();
    });
    eventoModalEl.addEventListener('click', (ev) => {
      if (ev.target === eventoModalEl) clearEventoPlacement();
    });
    eventoModalEl.querySelector('#evento-submit').addEventListener('click', submitEvento);
  }

  const err = eventoModalEl.querySelector('#evento-error');
  err.hidden = true;
  err.textContent = '';

  const coordsInput = eventoModalEl.querySelector('#evento-coords');
  coordsInput.value = `${pendingEventoCoords.lat.toFixed(6)}, ${pendingEventoCoords.lng.toFixed(6)}`;

  const select = eventoModalEl.querySelector('#evento-tipo');
  select.innerHTML = '<option value="">Cargando…</option>';
  select.disabled = true;

  eventoModalEl.hidden = false;

  fetchTiposEventos()
    .then((rows) => {
      select.disabled = false;
      select.innerHTML = '';
      if (!rows.length) {
        const opt = document.createElement('option');
        opt.value = '';
        opt.textContent = 'No hay tipos — crea uno primero';
        select.appendChild(opt);
        select.disabled = true;
        return;
      }
      const placeholder = document.createElement('option');
      placeholder.value = '';
      placeholder.textContent = 'Selecciona un tipo…';
      select.appendChild(placeholder);
      for (const row of rows) {
        const opt = document.createElement('option');
        opt.value = row.tipo_evento;
        opt.textContent = row.descripcion_evento
          ? `${row.tipo_evento} — ${row.descripcion_evento}`
          : row.tipo_evento;
        select.appendChild(opt);
      }
    })
    .catch((e) => {
      select.disabled = false;
      select.innerHTML = '';
      const opt = document.createElement('option');
      opt.value = '';
      opt.textContent = 'Error al cargar tipos';
      select.appendChild(opt);
      err.hidden = false;
      err.textContent =
        e.message || 'No se pudieron cargar los tipos. ¿Está el backend en marcha y con Supabase configurado?';
    });
}

async function fetchTiposEventos() {
  const res = await fetch(apiUrl('/tipo-eventos?solo_activos=true'));
  if (!res.ok) {
    const t = await res.text();
    throw new Error(t || `HTTP ${res.status}`);
  }
  return res.json();
}

async function submitEvento() {
  const err = eventoModalEl.querySelector('#evento-error');
  err.hidden = true;

  const select = eventoModalEl.querySelector('#evento-tipo');
  const tipo = select.value?.trim();
  if (!tipo || !pendingEventoCoords) {
    err.hidden = false;
    err.textContent = 'Selecciona un tipo de evento.';
    return;
  }

  const body = {
    tipo_evento: tipo,
    latitud: pendingEventoCoords.lat,
    longitud: pendingEventoCoords.lng,
    activo: true,
  };

  try {
    const res = await fetch(apiUrl('/eventos'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(formatApiError(data));
    }
    addEventoMarker(data);
    closeEventoModal();
    interactionMode = 'idle';
    eventoModeBtn.setAttribute('aria-pressed', 'false');
    setHintVisible(false);
    clearEventoPlacement();
    alert('Evento registrado correctamente.');
  } catch (e) {
    err.hidden = false;
    err.textContent = e.message || 'Error al guardar.';
  }
}

function openTipoModal() {
  if (!tipoModalEl) {
    tipoModalEl = document.createElement('div');
    tipoModalEl.className = 'modal-overlay';
    tipoModalEl.innerHTML = `
      <div class="modal-panel" role="dialog" aria-modal="true" aria-labelledby="tipo-title" tabindex="-1">
        <h2 id="tipo-title">Nuevo tipo de evento</h2>
        <p class="sub">Se guarda en Supabase (tabla TipoEventos) via la API.</p>
        <div class="modal-field">
          <label for="tipo-codigo">Código / ID del tipo</label>
          <input id="tipo-codigo" type="text" required maxlength="200" placeholder="ej. incendio_vehicular" autocomplete="off" />
        </div>
        <div class="modal-field">
          <label for="tipo-desc">Descripcion</label>
          <textarea id="tipo-desc" required placeholder="Descripcion del tipo de evento"></textarea>
        </div>
        <div class="modal-field">
          <label for="tipo-dur">Duracion (opcional)</label>
          <input id="tipo-dur" type="number" step="1" min="0" placeholder="Opcional — columna duracion en BD" />
        </div>
        <div class="modal-field modal-row-inline">
          <input id="tipo-activo" type="checkbox" checked />
          <label for="tipo-activo">Activo</label>
        </div>
        <div class="modal-error" id="tipo-error" hidden></div>
        <div class="modal-actions">
          <button type="button" id="tipo-cancel">Cerrar</button>
          <button type="button" id="tipo-submit">Crear tipo</button>
        </div>
      </div>
    `;
    modalRoot.appendChild(tipoModalEl);

    tipoModalEl.querySelector('#tipo-cancel').addEventListener('click', () => {
      tipoModalEl.hidden = true;
    });
    tipoModalEl.addEventListener('click', (ev) => {
      if (ev.target === tipoModalEl) tipoModalEl.hidden = true;
    });
    tipoModalEl.querySelector('#tipo-submit').addEventListener('click', submitTipo);
  }

  tipoModalEl.querySelector('#tipo-error').hidden = true;
  tipoModalEl.hidden = false;
  tipoModalEl.querySelector('#tipo-codigo').focus();
}

async function submitTipo() {
  const err = tipoModalEl.querySelector('#tipo-error');
  err.hidden = true;

  const tipo_evento = tipoModalEl.querySelector('#tipo-codigo').value.trim();
  const descripcion_evento = tipoModalEl.querySelector('#tipo-desc').value.trim();
  const activo = tipoModalEl.querySelector('#tipo-activo').checked;
  const durRaw = tipoModalEl.querySelector('#tipo-dur').value.trim();
  const duracion = durRaw === '' ? null : Number(durRaw);

  if (!tipo_evento || !descripcion_evento) {
    err.hidden = false;
    err.textContent = 'Completa código y descripción.';
    return;
  }

  const body = { tipo_evento, descripcion_evento, activo };
  if (duracion !== null && !Number.isNaN(duracion)) {
    body.duracion = duracion;
  }

  try {
    const res = await fetch(apiUrl('/tipo-eventos'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(formatApiError(data));
    }
    tipoModalEl.hidden = true;
    tipoModalEl.querySelector('#tipo-codigo').value = '';
    tipoModalEl.querySelector('#tipo-desc').value = '';
    tipoModalEl.querySelector('#tipo-dur').value = '';
    alert('Tipo de evento creado.');
  } catch (e) {
    err.hidden = false;
    err.textContent = e.message || 'Error al crear el tipo.';
  }
}

// --- Ruta (Valhalla) ---

async function getRoute() {
  if (routePoints.length < 2) {
    alert('Selecciona 2 puntos en el mapa para la ruta.');
    return;
  }

  const excludePolygons = await buildExcludePolygons();

  const body = {
    locations: routePoints,
    costing: 'pedestrian',
    costing_options: { pedestrian: { shortest: true } },
  };

  if (excludePolygons.length > 0) {
    body.exclude_polygons = excludePolygons;
  }

  const res = await fetch(apiUrl('/route'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    alert(formatApiError(data) || 'Error al calcular la ruta');
    return;
  }
  drawRoute(data);
}

async function buildExcludePolygons() {
  try {
    const res = await fetch(apiUrl('/eventos'));
    if (!res.ok) return [];
    const eventos = await res.json();

    if (eventos.length === 0) return [];

    const polygons = [];
    for (const evento of eventos) {
      const isNegativo = evento.evento_negativo === true || evento.evento_negativo === 'true';
      if (!isNegativo) continue;
      const radius = evento.radius || 10;
      const [lng, lat] = [evento.longitud, evento.latitud];
      const polygon = circlePolygon(lng, lat, radius, 16);
      polygons.push(polygon);
    }
    return polygons;
  } catch (e) {
    console.error('Error building exclude polygons:', e);
    return [];
  }
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

function drawRoute(data) {
  const shape = data.trip.legs[0].shape;
  const coords = polyline.decode(shape, 6).map(([lat, lon]) => [lon, lat]);

  const geojson = {
    type: 'Feature',
    geometry: {
      type: 'LineString',
      coordinates: coords,
    },
  };

  function addRouteLayer() {
    clearRouteLine();

    map.addSource('route', { type: 'geojson', data: geojson });

    map.addLayer({
      id: 'route',
      type: 'line',
      source: 'route',
      paint: {
        'line-color': '#ff0000',
        'line-width': 5,
      },
    });

    const bounds = coords.reduce(
      (b, coord) => b.extend(coord),
      new maplibregl.LngLatBounds(coords[0], coords[0]),
    );
    map.fitBounds(bounds, { padding: 50 });
  }

  if (!map.isStyleLoaded()) {
    map.once('load', addRouteLayer);
  } else {
    addRouteLayer();
  }
}
