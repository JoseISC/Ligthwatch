import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const map = new maplibregl.Map({
  container: 'map',
  style: "https://tiles.openfreemap.org/styles/liberty",
  center: [-70.66, -33.45], // Santiago
  zoom: 10
});

new maplibregl.NavigationControl();
map.addControl(new maplibregl.NavigationControl());