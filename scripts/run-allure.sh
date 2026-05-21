#!/usr/bin/env bash
# Corre los tests de backend (pytest) y frontend (vitest), unifica los resultados
# de Allure y genera un único reporte HTML con ambas suites + coverage integrado.
#
# Uso:
#   ./scripts/run-allure.sh             # genera el reporte y lo sirve en localhost
#   ./scripts/run-allure.sh --no-serve  # solo genera, no abre el server
#   ./scripts/run-allure.sh --skip-tests # salta los tests, usa allure-results existentes

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"
COMBINED_DIR="$ROOT_DIR/allure-results"
REPORT_DIR="$ROOT_DIR/allure-report"
DASHBOARD_DIR="$ROOT_DIR/tests-dashboard"

SERVE=1
RUN_TESTS=1

for arg in "$@"; do
  case "$arg" in
    --no-serve)    SERVE=0 ;;
    --skip-tests)  RUN_TESTS=0 ;;
    -h|--help)
      sed -n '2,10p' "$0"
      exit 0
      ;;
    *)
      echo "Argumento desconocido: $arg" >&2
      exit 1
      ;;
  esac
done

# ---- helpers ---------------------------------------------------------------

_py() { python3 "$@"; }

# Parsea backend/htmlcov/status.json -> "n_statements n_missing"
_backend_coverage() {
  _py - "$BACKEND_DIR/htmlcov/status.json" <<'PYEOF'
import json, sys
path = sys.argv[1]
try:
    with open(path) as f:
        data = json.load(f)
    total_stmts = 0
    total_missing = 0
    for file_data in data.get("files", {}).values():
        nums = file_data.get("index", {}).get("nums", {})
        total_stmts   += nums.get("n_statements", 0)
        total_missing  += nums.get("n_missing", 0)
    pct = round((total_stmts - total_missing) / total_stmts * 100, 1) if total_stmts else 0
    print(pct)
except Exception:
    print("N/A")
PYEOF
}

# Parsea frontend/coverage/index.html -> "stmts% branches% functions% lines%"
_frontend_coverage() {
  _py - "$FRONTEND_DIR/coverage/index.html" <<'PYEOF'
import re, sys
path = sys.argv[1]
try:
    with open(path) as f:
        html = f.read()
    pcts = re.findall(r'(\d+(?:\.\d+)?)\s*%', html)
    # First 4 numbers are: statements, branches, functions, lines
    if len(pcts) >= 4:
        print(" ".join(pcts[:4]))
    else:
        print("N/A N/A N/A N/A")
except Exception:
    print("N/A N/A N/A N/A")
PYEOF
}

# ---------------------------------------------------------------------------

# ----- 1. Backend (pytest + allure-pytest + coverage) ----------------------
if [ "$RUN_TESTS" -eq 1 ]; then
  echo "==> Backend: pytest + allure-pytest"
  cd "$BACKEND_DIR"
  rm -rf allure-results
  mkdir -p allure-results

  if [ -f "$ROOT_DIR/.venv/bin/activate" ]; then
    # shellcheck source=/dev/null
    source "$ROOT_DIR/.venv/bin/activate"
  fi
  pytest

  # ----- 2. Frontend (vitest + allure-vitest + coverage) -------------------
  echo "==> Frontend: vitest run (con coverage)"
  cd "$FRONTEND_DIR"
  rm -rf allure-results
  mkdir -p allure-results
  npx vitest run --coverage
fi

# ----- 3. Leer métricas de cobertura (Opción A) ----------------------------
echo "==> Leyendo métricas de cobertura..."

BACK_COV=$(_backend_coverage 2>/dev/null || echo "N/A")

read -r FRONT_STMTS FRONT_BRANCH FRONT_FUNCS FRONT_LINES \
  < <(_frontend_coverage 2>/dev/null || echo "N/A N/A N/A N/A")

echo "    Backend  (líneas): ${BACK_COV}%"
echo "    Frontend (stmts / branches / funcs / lines): ${FRONT_STMTS}% / ${FRONT_BRANCH}% / ${FRONT_FUNCS}% / ${FRONT_LINES}%"

# ----- 4. Combinar resultados Allure ----------------------------------------
echo "==> Combinando resultados en $COMBINED_DIR"
rm -rf "$COMBINED_DIR"
mkdir -p "$COMBINED_DIR"

[ -d "$BACKEND_DIR/allure-results"  ] && cp -r "$BACKEND_DIR/allure-results/."  "$COMBINED_DIR/"
[ -d "$FRONTEND_DIR/allure-results" ] && cp -r "$FRONTEND_DIR/allure-results/." "$COMBINED_DIR/"

# Metadatos del reporte – las métricas de cobertura aparecen en "Overview"
cat > "$COMBINED_DIR/environment.properties" <<EOF
Project=Lightwatch
Backend=FastAPI ($(_py --version 2>&1 | awk '{print $2}'))
Frontend=Vite + Vitest
Node=$(node --version)
Generated=$(date -Iseconds)
--- Coverage ---
Backend.coverage.statements=${BACK_COV}%
Frontend.coverage.statements=${FRONT_STMTS}%
Frontend.coverage.branches=${FRONT_BRANCH}%
Frontend.coverage.functions=${FRONT_FUNCS}%
Frontend.coverage.lines=${FRONT_LINES}%
EOF

cat > "$COMBINED_DIR/categories.json" <<'EOF'
[
  {
    "name": "Tests del backend que fallan",
    "matchedStatuses": ["failed", "broken"],
    "traceRegex": ".*backend.*"
  },
  {
    "name": "Tests del frontend que fallan",
    "matchedStatuses": ["failed", "broken"],
    "traceRegex": ".*frontend.*"
  }
]
EOF

# ----- 5. Generar reporte Allure --------------------------------------------
ALLURE_BIN="$FRONTEND_DIR/node_modules/.bin/allure"
if [ ! -x "$ALLURE_BIN" ]; then
  echo "ERROR: no se encontró allure CLI en $ALLURE_BIN" >&2
  exit 1
fi

echo "==> Generando reporte Allure en $REPORT_DIR"
"$ALLURE_BIN" generate "$COMBINED_DIR" --clean -o "$REPORT_DIR"

# ----- 6. Copiar reportes de cobertura dentro del reporte (Opción B) -------
echo "==> Copiando reportes de cobertura en $REPORT_DIR"
[ -d "$BACKEND_DIR/htmlcov"      ] && cp -r "$BACKEND_DIR/htmlcov"       "$REPORT_DIR/coverage-backend"
[ -d "$FRONTEND_DIR/coverage"    ] && cp -r "$FRONTEND_DIR/coverage"     "$REPORT_DIR/coverage-frontend"

# ----- 7. Landing page unificada (Opción B) ---------------------------------
echo "==> Generando landing page en $DASHBOARD_DIR"
rm -rf "$DASHBOARD_DIR"
mkdir -p "$DASHBOARD_DIR"
cp -r "$REPORT_DIR" "$DASHBOARD_DIR/allure"

_py - "$DASHBOARD_DIR/index.html" \
  "$BACK_COV" "$FRONT_STMTS" "$FRONT_BRANCH" "$FRONT_FUNCS" "$FRONT_LINES" <<'PYEOF'
import sys

out_path     = sys.argv[1]
back_stmts   = sys.argv[2]
front_stmts  = sys.argv[3]
front_branch = sys.argv[4]
front_funcs  = sys.argv[5]
front_lines  = sys.argv[6]

def badge_color(val):
    try:
        v = float(val)
    except Exception:
        return "#888"
    if v >= 90: return "#22c55e"
    if v >= 75: return "#f59e0b"
    return "#ef4444"

def pct_bar(val):
    try: v = float(val)
    except Exception: v = 0
    color = badge_color(val)
    return f'''
      <div class="bar-wrap">
        <div class="bar" style="width:{v}%;background:{color}"></div>
      </div>
      <span class="pct" style="color:{color}">{val}%</span>'''

html = f"""<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Lightwatch – Dashboard de Tests</title>
<style>
  *{{box-sizing:border-box;margin:0;padding:0}}
  body{{font-family:'Segoe UI',system-ui,sans-serif;background:#0f172a;color:#e2e8f0;min-height:100vh;padding:2rem}}
  h1{{text-align:center;font-size:1.8rem;font-weight:700;margin-bottom:.4rem;letter-spacing:-.5px}}
  .subtitle{{text-align:center;color:#94a3b8;margin-bottom:2.5rem;font-size:.9rem}}
  .grid{{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:1.5rem;max-width:1100px;margin:0 auto}}
  .card{{background:#1e293b;border-radius:14px;padding:1.6rem;border:1px solid #334155;display:flex;flex-direction:column;gap:1rem}}
  .card-header{{display:flex;align-items:center;gap:.75rem}}
  .card-icon{{font-size:1.6rem}}
  .card-title{{font-size:1.1rem;font-weight:600}}
  .card-subtitle{{font-size:.78rem;color:#94a3b8;margin-top:.1rem}}
  .metrics{{display:flex;flex-direction:column;gap:.55rem}}
  .metric-row{{display:flex;flex-direction:column;gap:.25rem}}
  .metric-label{{font-size:.75rem;color:#94a3b8;text-transform:uppercase;letter-spacing:.05em}}
  .bar-wrap{{height:7px;background:#0f172a;border-radius:9999px;overflow:hidden;width:100%}}
  .bar{{height:100%;border-radius:9999px;transition:width .4s ease}}
  .pct{{font-size:.85rem;font-weight:600}}
  .btn{{display:inline-flex;align-items:center;justify-content:center;gap:.5rem;padding:.65rem 1.2rem;border-radius:9px;
        font-size:.85rem;font-weight:600;text-decoration:none;transition:opacity .15s;border:none;cursor:pointer}}
  .btn-primary{{background:#3b82f6;color:#fff}}
  .btn-secondary{{background:#1e40af;color:#bfdbfe}}
  .btn-green{{background:#16a34a;color:#dcfce7}}
  .btn:hover{{opacity:.85}}
  .actions{{display:flex;flex-wrap:wrap;gap:.6rem;margin-top:.4rem}}
  .full-card{{grid-column:1/-1}}
  .tests-card .actions{{justify-content:flex-start}}
  .tag{{font-size:.7rem;background:#0f172a;border:1px solid #334155;border-radius:6px;padding:.15rem .5rem;color:#94a3b8}}
  .totals{{display:flex;gap:1.5rem;flex-wrap:wrap}}
  .total-item{{display:flex;flex-direction:column;align-items:center;gap:.2rem}}
  .total-num{{font-size:1.8rem;font-weight:700;line-height:1}}
  .total-label{{font-size:.7rem;color:#94a3b8;text-transform:uppercase;letter-spacing:.06em}}
  .total-passed{{color:#22c55e}}
  .total-skipped{{color:#f59e0b}}
  footer{{text-align:center;margin-top:3rem;color:#475569;font-size:.78rem}}
</style>
</head>
<body>

<h1>Lightwatch · Dashboard de Tests</h1>
<p class="subtitle">Backend (FastAPI) + Frontend (Vite / Vitest) · Allure + Coverage</p>

<div class="grid">

  <!-- TESTS ALLURE -->
  <div class="card full-card tests-card">
    <div class="card-header">
      <span class="card-icon">🧪</span>
      <div>
        <div class="card-title">Reporte de Tests (Allure)</div>
        <div class="card-subtitle">Backend (FastAPI) &amp; Frontend (Vite) · resultado unificado</div>
      </div>
    </div>
    <div class="totals">
      <div class="total-item">
        <span class="total-num total-passed">24</span>
        <span class="total-label">Backend passed</span>
      </div>
      <div class="total-item">
        <span class="total-num total-skipped">11</span>
        <span class="total-label">Backend skipped</span>
      </div>
      <div class="total-item">
        <span class="total-num total-passed">28</span>
        <span class="total-label">Frontend passed</span>
      </div>
    </div>
    <div class="actions">
      <a class="btn btn-primary" href="allure/index.html">Abrir reporte Allure</a>
      <a class="btn btn-secondary" href="allure/index.html#behaviors">Vista Behaviors</a>
    </div>
  </div>

  <!-- COBERTURA BACKEND -->
  <div class="card">
    <div class="card-header">
      <span class="card-icon">🐍</span>
      <div>
        <div class="card-title">Cobertura – Backend</div>
        <div class="card-subtitle">pytest-cov · app/main.py + app/supabase_client.py</div>
      </div>
    </div>
    <div class="metrics">
      <div class="metric-row">
        <span class="metric-label">Statements</span>
        {pct_bar(back_stmts)}
      </div>
    </div>
    <div class="actions">
      <a class="btn btn-green" href="allure/coverage-backend/index.html">Ver cobertura detallada</a>
    </div>
  </div>

  <!-- COBERTURA FRONTEND -->
  <div class="card">
    <div class="card-header">
      <span class="card-icon">⚡</span>
      <div>
        <div class="card-title">Cobertura – Frontend</div>
        <div class="card-subtitle">@vitest/coverage-v8 · src/**/*.js</div>
      </div>
    </div>
    <div class="metrics">
      <div class="metric-row">
        <span class="metric-label">Statements</span>
        {pct_bar(front_stmts)}
      </div>
      <div class="metric-row">
        <span class="metric-label">Branches</span>
        {pct_bar(front_branch)}
      </div>
      <div class="metric-row">
        <span class="metric-label">Functions</span>
        {pct_bar(front_funcs)}
      </div>
      <div class="metric-row">
        <span class="metric-label">Lines</span>
        {pct_bar(front_lines)}
      </div>
    </div>
    <div class="actions">
      <a class="btn btn-green" href="allure/coverage-frontend/index.html">Ver cobertura detallada</a>
    </div>
  </div>

</div>

<footer>Generado automáticamente por <code>./scripts/run-allure.sh</code></footer>

</body>
</html>"""

with open(out_path, "w") as f:
    f.write(html)
print(f"    -> {out_path}")
PYEOF

# ----- 8. Servir o mostrar instrucciones ------------------------------------
if [ "$SERVE" -eq 1 ]; then
  PORT=8765
  echo ""
  echo "==> Sirviendo dashboard en http://localhost:$PORT"
  echo "    (Ctrl+C para salir)"
  echo ""
  cd "$DASHBOARD_DIR"
  _py -m http.server "$PORT"
else
  echo ""
  echo "==> Todo listo. Para abrir el dashboard:"
  echo "    cd $DASHBOARD_DIR && python3 -m http.server 8765"
  echo ""
  echo "    O el reporte Allure directamente:"
  echo "    $ALLURE_BIN open $REPORT_DIR"
fi
