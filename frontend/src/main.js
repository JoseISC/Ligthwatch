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

/** Formatea una cadena ISO de fecha/hora en formato local legible, con fallback. */
function formatFecha(isoString) {
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
  loadEventos();
});

let routeMarkers = [];
let routePoints = [];
let eventoMarkers = [];

/** @type {'route' | 'evento'} */
let interactionMode = 'route';
/** @type {maplibregl.Marker | null} */
let eventoMarker = null;
/** @type {{ lng: number; lat: number } | null} */
let pendingEventoCoords = null;

const routeBtn = document.getElementById('routeBtn');
const eventoModeBtn = document.getElementById('eventoModeBtn');
const newTipoBtn = document.getElementById('newTipoBtn');
const modeHint = document.getElementById('modeHint');
const modalRoot = document.getElementById('modalRoot');

routeBtn.addEventListener('click', getRoute);
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

  if (routePoints.length === 2) {
    routeMarkers.forEach((m) => m.remove());
    routeMarkers = [];
    routePoints = [];
  }

  routePoints.push({ lon: lng, lat });

  const marker = new maplibregl.Marker().setLngLat([lng, lat]).addTo(map);
  routeMarkers.push(marker);
});

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

async function loadEventos() {
  try {
    const res = await fetch(apiUrl('/eventos'));
    if (!res.ok) return;
    const eventos = await res.json();
    eventos.forEach(addEventoMarker);
  } catch (e) {
    console.error('Error loading eventos:', e);
  }
}

function addEventoMarker(evento) {
  const el = document.createElement('div');
  el.className = 'evento-marker-dot';
  el.style.background = '#dc2626';
  el.setAttribute('title', evento.tipo_evento);

  const descripcion = evento.descripcion?.trim() || 'Sin descripción';
  const fecha = formatFecha(evento.created_at);

  const popup = new maplibregl.Popup({ offset: 25, maxWidth: '260px' }).setHTML(`
    <div class="incident-popup">
      <p class="incident-popup__tipo">${evento.tipo_evento}</p>
      <p class="incident-popup__desc">${descripcion}</p>
      <p class="incident-popup__fecha">
        <span class="incident-popup__label">Fecha y hora</span>
        ${fecha}
      </p>
    </div>
  `);

  const marker = new maplibregl.Marker({ element: el })
    .setLngLat([evento.longitud, evento.latitud])
    .setPopup(popup)
    .addTo(map);

  eventoMarkers.push(marker);
}

function toggleEventoMode() {
  const next = interactionMode === 'evento' ? 'route' : 'evento';
  interactionMode = next;
  eventoModeBtn.setAttribute('aria-pressed', next === 'evento' ? 'true' : 'false');

  if (next === 'route') {
    clearEventoPlacement();
    modeHint.classList.add('map-hint--hidden');
    modeHint.textContent = '';
    return;
  }

  modeHint.textContent =
    'Modo Evento: haz clic en el mapa para colocar el marcador. Luego elige el tipo de evento.';
  modeHint.classList.remove('map-hint--hidden');
}

function clearEventoPlacement() {
  if (eventoMarker) {
    eventoMarker.remove();
    eventoMarker = null;
  }
  pendingEventoCoords = null;
  closeEventoModal();
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
          <label for="evento-desc">Descripción</label>
          <textarea id="evento-desc" placeholder="Describe brevemente el evento observado…"></textarea>
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

  const descripcionRaw = eventoModalEl.querySelector('#evento-desc').value.trim();

  const body = {
    tipo_evento: tipo,
    descripcion: descripcionRaw || null,
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
    eventoModalEl.querySelector('#evento-desc').value = '';
    closeEventoModal();
    interactionMode = 'route';
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
