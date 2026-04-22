import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import polyline from '@mapbox/polyline';
import './map-ui.css';

/** Base URL del backend (ver README: VITE_API_URL en build; en dev se usa proxy /api). */
function apiUrl(path) {
  const p = path.startsWith('/') ? path : `/${path}`;
  const fromEnv = import.meta.env.VITE_API_URL?.replace(/\/$/, '');
  if (fromEnv) return `${fromEnv}${p}`;
  if (import.meta.env.DEV) return `/api${p}`;
  return `http://localhost:8000${p}`;
}

/** Mensaje legible desde respuestas FastAPI (`detail` string o lista de validación). */
function formatApiError(data) {
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

const map = new maplibregl.Map({
  container: 'map',
  style: 'https://tiles.openfreemap.org/styles/liberty',
  center: [-70.66, -33.45],
  zoom: 10,
});

map.addControl(new maplibregl.NavigationControl());

map.on('load', () => {
  loadIncidents();
});

let routeMarkers = [];
let routePoints = [];
let incidentMarkers = [];

/** @type {'route' | 'incident'} */
let interactionMode = 'route';
/** @type {maplibregl.Marker | null} */
let incidentMarker = null;
/** @type {{ lng: number; lat: number } | null} */
let pendingIncidentCoords = null;

const routeBtn = document.getElementById('routeBtn');
const incidentModeBtn = document.getElementById('incidentModeBtn');
const newTipoBtn = document.getElementById('newTipoBtn');
const modeHint = document.getElementById('modeHint');
const modalRoot = document.getElementById('modalRoot');

routeBtn.addEventListener('click', getRoute);
incidentModeBtn.addEventListener('click', toggleIncidentMode);
newTipoBtn.addEventListener('click', () => openTipoModal());

map.on('click', (e) => {
  const { lng, lat } = e.lngLat;

  if (interactionMode === 'incident') {
    setIncidentMarker(lng, lat);
    pendingIncidentCoords = { lng, lat };
    openIncidentModal();
    return;
  }

  if (routePoints.length === 2) {
    routeMarkers.forEach((m) => m.remove());
    routeMarkers = [];
    routePoints = [];
  }

  routePoints.push({ lon: lng, lat });

  const marker = new maplibregl.Marker().setLngLat([lng, lat]).addTo(map);
  routeMarkers.push(marker);
});

function setIncidentMarker(lng, lat) {
  if (incidentMarker) {
    incidentMarker.remove();
    incidentMarker = null;
  }
  const el = document.createElement('div');
  el.className = 'incident-marker-dot';
  el.setAttribute('title', 'Ubicación del incidente');
  incidentMarker = new maplibregl.Marker({ element: el }).setLngLat([lng, lat]).addTo(map);
}

async function loadIncidents() {
  try {
    const res = await fetch(apiUrl('/incidentes'));
    if (!res.ok) return;
    const incidents = await res.json();
    incidents.forEach(addIncidentMarker);
  } catch (e) {
    console.error('Error loading incidents:', e);
  }
}

function addIncidentMarker(incident) {
  const el = document.createElement('div');
  el.className = 'incident-marker-dot';
  el.style.background = '#dc2626';
  el.setAttribute('title', incident.tipo_incidente);

  const popup = new maplibregl.Popup({ offset: 25 }).setHTML(`
    <div class="incident-popup">
      <strong>${incident.tipo_incidente}</strong><br/>
      <span>Lat: ${incident.latitud?.toFixed(6)}</span><br/>
      <span>Lon: ${incident.longitud?.toFixed(6)}</span>
    </div>
  `);

  const marker = new maplibregl.Marker({ element: el })
    .setLngLat([incident.longitud, incident.latitud])
    .setPopup(popup)
    .addTo(map);

  incidentMarkers.push(marker);
}

function toggleIncidentMode() {
  const next = interactionMode === 'incident' ? 'route' : 'incident';
  interactionMode = next;
  incidentModeBtn.setAttribute('aria-pressed', next === 'incident' ? 'true' : 'false');

  if (next === 'route') {
    clearIncidentPlacement();
    modeHint.classList.add('map-hint--hidden');
    modeHint.textContent = '';
    return;
  }

  modeHint.textContent =
    'Modo incidente: haz clic en el mapa para colocar el marcador. Luego elige el tipo de incidente.';
  modeHint.classList.remove('map-hint--hidden');
}

function clearIncidentPlacement() {
  if (incidentMarker) {
    incidentMarker.remove();
    incidentMarker = null;
  }
  pendingIncidentCoords = null;
  closeIncidentModal();
}

function setHintVisible(show, text) {
  if (show) {
    modeHint.textContent = text;
    modeHint.classList.remove('map-hint--hidden');
  } else {
    modeHint.classList.add('map-hint--hidden');
  }
}

// --- Modales ---

let incidentModalEl = null;
let tipoModalEl = null;

function closeIncidentModal() {
  if (incidentModalEl) {
    incidentModalEl.hidden = true;
  }
}

function openIncidentModal() {
  if (!pendingIncidentCoords) return;

  if (!incidentModalEl) {
    incidentModalEl = document.createElement('div');
    incidentModalEl.className = 'modal-overlay';
    incidentModalEl.setAttribute('role', 'presentation');
    incidentModalEl.innerHTML = `
      <div class="modal-panel" role="dialog" aria-modal="true" aria-labelledby="incident-title" tabindex="-1">
        <h2 id="incident-title">Registrar incidente</h2>
        <p class="sub">Coordenadas del marcador. Elige un tipo existente (desde Supabase).</p>
        <div class="modal-field">
          <label for="incident-tipo">Tipo de incidente</label>
          <select id="incident-tipo" required></select>
        </div>
        <div class="modal-field">
          <label>Ubicación</label>
          <input type="text" id="incident-coords" readonly />
        </div>
        <div class="modal-error" id="incident-error" hidden></div>
        <div class="modal-actions">
          <button type="button" id="incident-cancel">Cancelar</button>
          <button type="submit" id="incident-submit">Guardar incidente</button>
        </div>
      </div>
    `;
    modalRoot.appendChild(incidentModalEl);

    incidentModalEl.querySelector('#incident-cancel').addEventListener('click', () => {
      clearIncidentPlacement();
    });
    incidentModalEl.addEventListener('click', (ev) => {
      if (ev.target === incidentModalEl) clearIncidentPlacement();
    });
    incidentModalEl.querySelector('#incident-submit').addEventListener('click', submitIncident);
  }

  const err = incidentModalEl.querySelector('#incident-error');
  err.hidden = true;
  err.textContent = '';

  const coordsInput = incidentModalEl.querySelector('#incident-coords');
  coordsInput.value = `${pendingIncidentCoords.lat.toFixed(6)}, ${pendingIncidentCoords.lng.toFixed(6)}`;

  const select = incidentModalEl.querySelector('#incident-tipo');
  select.innerHTML = '<option value="">Cargando…</option>';
  select.disabled = true;

  incidentModalEl.hidden = false;

  fetchTipos()
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
        opt.value = row.tipo_incidente;
        opt.textContent = row.descripcion_incidente
          ? `${row.tipo_incidente} — ${row.descripcion_incidente}`
          : row.tipo_incidente;
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

async function fetchTipos() {
  const res = await fetch(apiUrl('/tipo-incidentes?solo_activos=true'));
  if (!res.ok) {
    const t = await res.text();
    throw new Error(t || `HTTP ${res.status}`);
  }
  return res.json();
}

async function submitIncident() {
  const err = incidentModalEl.querySelector('#incident-error');
  err.hidden = true;

  const select = incidentModalEl.querySelector('#incident-tipo');
  const tipo = select.value?.trim();
  if (!tipo || !pendingIncidentCoords) {
    err.hidden = false;
    err.textContent = 'Selecciona un tipo de incidente.';
    return;
  }

  const body = {
    tipo_incidente: tipo,
    latitud: pendingIncidentCoords.lat,
    longitud: pendingIncidentCoords.lng,
    activo: true,
  };

  try {
    const res = await fetch(apiUrl('/incidentes'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(formatApiError(data));
    }
    addIncidentMarker(data);
    closeIncidentModal();
    interactionMode = 'route';
    incidentModeBtn.setAttribute('aria-pressed', 'false');
    setHintVisible(false);
    clearIncidentPlacement();
    alert('Incidente registrado correctamente.');
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
        <h2 id="tipo-title">Nuevo tipo de incidente</h2>
        <p class="sub">Se guarda en Supabase (tabla TipoIncidentes) vía la API.</p>
        <div class="modal-field">
          <label for="tipo-codigo">Código / ID del tipo</label>
          <input id="tipo-codigo" type="text" required maxlength="200" placeholder="ej. incendio_vehicular" autocomplete="off" />
        </div>
        <div class="modal-field">
          <label for="tipo-desc">Descripción</label>
          <textarea id="tipo-desc" required placeholder="Descripción del tipo de incidente"></textarea>
        </div>
        <div class="modal-field">
          <label for="tipo-dur">Duración (opcional)</label>
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

  const tipo_incidente = tipoModalEl.querySelector('#tipo-codigo').value.trim();
  const descripcion_incidente = tipoModalEl.querySelector('#tipo-desc').value.trim();
  const activo = tipoModalEl.querySelector('#tipo-activo').checked;
  const durRaw = tipoModalEl.querySelector('#tipo-dur').value.trim();
  const duracion = durRaw === '' ? null : Number(durRaw);

  if (!tipo_incidente || !descripcion_incidente) {
    err.hidden = false;
    err.textContent = 'Completa código y descripción.';
    return;
  }

  const body = { tipo_incidente, descripcion_incidente, activo };
  if (duracion !== null && !Number.isNaN(duracion)) {
    body.duracion = duracion;
  }

  try {
    const res = await fetch(apiUrl('/tipo-incidentes'), {
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
    alert('Tipo de incidente creado.');
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

  const body = {
    locations: routePoints,
    costing: 'pedestrian',
    costing_options: { pedestrian: { shortest: true } },
  };

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
    if (map.getSource('route')) {
      map.removeLayer('route');
      map.removeSource('route');
    }

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
