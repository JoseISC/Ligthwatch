import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import polyline from "@mapbox/polyline";

const map = new maplibregl.Map({
  container: 'map',
  style: "https://tiles.openfreemap.org/styles/liberty",
  center: [-70.66, -33.45], // Santiago
  zoom: 10
});

document.getElementById('routeBtn').addEventListener('click', getRoute);

map.addControl(new maplibregl.NavigationControl());

let markers = [];
let points = [];

map.on('click', (e) => {
  const { lng, lat } = e.lngLat;

  // Limit to 2 points
  if (points.length === 2) {
    // Reset
    markers.forEach(m => m.remove());
    markers = [];
    points = [];
  }

  // Store point
  points.push({ lon: lng, lat: lat });

  // Add marker
  const marker = new maplibregl.Marker()
    .setLngLat([lng, lat])
    .addTo(map);

  markers.push(marker);
});

async function getRoute() {
  if (points.length < 2) {
    alert("Select 2 points first");
    return;
  }

  const body = {
    locations: points,
    costing: "pedestrian",
    costing_options:{"pedestrian":{"shortest":true}}
  };

  console.log(body);

  const res = await fetch("http://localhost:8000/route", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  const data = await res.json();
  console.log("FULL RESPONSE:", data);
  console.log("Shape:", data.trip?.legs?.[0]?.shape);
  drawRoute(data);
}

function drawRoute(data) {
  const shape = data.trip.legs[0].shape;

  // Decode with precision 6 (Valhalla default)
  const coords = polyline.decode(shape, 6).map(([lat, lon]) => [lon, lat]);

  const geojson = {
    type: "Feature",
    geometry: {
      type: "LineString",
      coordinates: coords
    }
  };

  function addRouteLayer() {
    if (map.getSource("route")) {
      map.removeLayer("route");
      map.removeSource("route");
    }

    map.addSource("route", { type: "geojson", data: geojson });

    map.addLayer({
      id: "route",
      type: "line",
      source: "route",
      paint: {
        "line-color": "#ff0000",
        "line-width": 5
      }
    });

    // Build a proper LngLatBounds object
    const bounds = coords.reduce(
      (b, coord) => b.extend(coord),
      new maplibregl.LngLatBounds(coords[0], coords[0])
    );
    map.fitBounds(bounds, { padding: 50 });
  }

  if (!map.isStyleLoaded()) {
    map.once('load', addRouteLayer);
  } else {
    addRouteLayer();
  }
}
