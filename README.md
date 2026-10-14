# EVACUATE AI — Virtual Lab

A React + Vite virtual lab for studying risk-aware evacuation routing with A* search. It is a single scrolling page laid out like a lab manual: Aim → Theory → Procedure → Simulation → Route trial → Hazards → Observations → Conclusion.

## Requirements
- Node.js 18+ (Node.js 20+ recommended)
- npm
- Internet access for OpenStreetMap tiles and Google Fonts. The rest of the demo UI and A* visualizer run locally.

## Run locally

```bash
npm install
npm run dev
```

Open the local URL printed by Vite (usually `http://localhost:5173`).

To test a production build:

```bash
npm run build
npm run preview
```

## Main features
- **Simulation (A\* bench):** paint walls and hazard cells (click or drag), choose Manhattan or Euclidean, set playback speed, and watch the search expand step by step. A cell inspector shows g(n), h(n) and f(n).
- **Route trial:** sweep the risk weight `w`, toggle hazard penalties and travel mode, and see which of two routes the cost model prefers. A cost-vs-weight chart marks the switch point, and the preferred route is highlighted on an OpenStreetMap view of Pune.
- **Hazard feed:** sample incidents with search, severity filter tiles and sorting.
- **Observations:** every A* run and recorded route trial goes into a lab record with a chart and an automatic inference. Print it or clear it.
- Palette `#f1f1f1` / `#9f3a2a`, scroll-reveal animations, and a reading-progress bar. Animations respect `prefers-reduced-motion`.

## Data and safety notes
- The hazard feed and route values are sample/demo data. They are not live verified emergency information.
- The map uses real OpenStreetMap base tiles, but the displayed incident markers and route lines are simulated.
- The route trial compares illustrative costs. It is not a turn-by-turn navigation service and does not guarantee safety.
- The A* visualizer computes paths locally in the browser; it does not need a backend.
- No Flask endpoints are called by this frontend because no route-planning API schema was provided. Existing backend code is not included or modified.

## Backend integration
The app is intentionally usable without a backend. If integrating with an existing Flask API, inspect its actual endpoints and payload formats first. Keep any API base URL in a central service module and do not expose secret credentials in frontend code.
