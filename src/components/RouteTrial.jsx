import React, { useMemo, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Polyline, Popup, useMapEvents } from 'react-leaflet';
import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ClipboardPlus, Crosshair } from 'lucide-react';
import { Reveal, Segmented } from './ui.jsx';
import { MODES, ROUTES, crossover, routeCost } from '../data.js';

const CENTER = [18.5204, 73.8567];
const PATHS = {
  short: [[18.5204, 73.8567], [18.526, 73.849], [18.532, 73.843], [18.539, 73.838], [18.545, 73.829]],
  safe: [[18.5204, 73.8567], [18.514, 73.866], [18.522, 73.878], [18.534, 73.875], [18.545, 73.829]],
};
const MARKERS = [
  { pos: [18.532, 73.843], type: 'Flood warning', detail: 'Waterlogging near the river corridor.', level: 'high' },
  { pos: [18.539, 73.851], type: 'Road blockage', detail: 'Road access restricted.', level: 'critical' },
  { pos: [18.514, 73.866], type: 'Heavy rainfall', detail: 'Elevated rainfall intensity.', level: 'medium' },
];
const HAZARD_STYLE = {
  critical: { color: '#9f3a2a', fillColor: '#9f3a2a', fillOpacity: 0.95 },
  high: { color: '#9f3a2a', fillColor: '#c66f5e', fillOpacity: 0.9 },
  medium: { color: '#9f3a2a', fillColor: '#f1e4e1', fillOpacity: 1 },
};
const ink = '#1d1c1b';
const tickStyle = { fill: '#86827d', fontSize: 11, fontFamily: 'IBM Plex Mono' };

function Probe({ onPick }) {
  useMapEvents({ click: (e) => onPick([e.latlng.lat, e.latlng.lng]) });
  return null;
}

function LabMap({ preferred }) {
  const [probe, setProbe] = useState(null);
  const other = preferred === 'safe' ? 'short' : 'safe';
  const fine = typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches;
  return (
    <div className="card map-card">
      <div className="map-frame">
        <MapContainer center={CENTER} zoom={13} scrollWheelZoom={false} dragging={fine}>
          <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Probe onPick={setProbe} />
          <Polyline positions={PATHS[other]} pathOptions={{ color: '#86827d', weight: 3, opacity: 0.8, dashArray: '6 8' }} />
          <Polyline positions={PATHS[preferred]} pathOptions={{ color: ink, weight: 5, opacity: 0.95 }} />
          {MARKERS.map((m) => (
            <CircleMarker key={m.type} center={m.pos} radius={m.level === 'critical' ? 9 : 7} pathOptions={{ ...HAZARD_STYLE[m.level], weight: 2 }}>
              <Popup><b>{m.type}</b><br />{m.detail}<br /><small>Sample scenario — not a live alert</small></Popup>
            </CircleMarker>
          ))}
          <CircleMarker center={PATHS.short.at(-1)} radius={8} pathOptions={{ color: '#fff', fillColor: ink, fillOpacity: 1, weight: 3 }}>
            <Popup><b>Relief centre</b><br />Sample shelter · capacity 240</Popup>
          </CircleMarker>
          <CircleMarker center={CENTER} radius={7} pathOptions={{ color: ink, fillColor: '#fff', fillOpacity: 1, weight: 3 }}>
            <Popup><b>Start</b><br />Shivajinagar</Popup>
          </CircleMarker>
          {probe && <CircleMarker center={probe} radius={5} pathOptions={{ color: '#9f3a2a', fillColor: '#9f3a2a', fillOpacity: 1, weight: 1 }} />}
        </MapContainer>
      </div>
      <div className="map-foot">
        <div className="legend">
          <span><i className="line line-solid" />Preferred</span>
          <span><i className="line line-dash" />Alternative</span>
          <span><i className="dot dot-hazard" />Hazard</span>
          <span><i className="dot dot-shelter" />Shelter</span>
        </div>
        <span className="probe mono"><Crosshair size={13} /> {probe ? `${probe[0].toFixed(4)}, ${probe[1].toFixed(4)}` : 'Click the map to drop a probe'}</span>
      </div>
    </div>
  );
}

export default function RouteTrial({ onRecord }) {
  const [risk, setRisk] = useState(70);
  const [avoid, setAvoid] = useState(true);
  const [mode, setMode] = useState('walk');
  const w = risk / 100;
  const speed = MODES.find((m) => m.id === mode).speed;
  const costs = { short: routeCost(ROUTES.short, w, avoid), safe: routeCost(ROUTES.safe, w, avoid) };
  const preferred = costs.safe <= costs.short ? 'safe' : 'short';
  const switchAt = crossover(avoid);
  const curve = useMemo(() => Array.from({ length: 21 }, (_, i) => {
    const x = i / 20;
    return { w: Math.round(x * 100), short: +routeCost(ROUTES.short, x, avoid).toFixed(1), safe: +routeCost(ROUTES.safe, x, avoid).toFixed(1) };
  }), [avoid]);

  const record = () => onRecord({
    w, avoid, mode: MODES.find((m) => m.id === mode).label,
    short: costs.short, safe: costs.safe, preferred: ROUTES[preferred].name,
    eta: (ROUTES[preferred].distance / speed) * 60,
  });

  return (
    <>
      <div className="trial">
        <Reveal className="card trial-controls">
          <div className="scenario"><span className="label">Scenario</span><strong>Shivajinagar → Kothrud relief centre</strong></div>
          <div className="ctl">
            <div className="slider-head"><label htmlFor="risk" className="label">Risk weight w</label><span className="mono">{w.toFixed(2)}</span></div>
            <input id="risk" type="range" min="0" max="100" value={risk} onChange={(e) => setRisk(Number(e.target.value))} style={{ '--p': `${risk}%` }} />
            <div className="slider-ends"><span>Distance</span><span>Safety</span></div>
          </div>
          <div className="switch-row">
            <div><strong>Enforce hazard penalties</strong><span>Doubles the exposure term k</span></div>
            <button type="button" role="switch" aria-checked={avoid} aria-label="Enforce hazard penalties" className={`switch ${avoid ? 'on' : ''}`} onClick={() => setAvoid(!avoid)}><i /></button>
          </div>
          <div className="ctl"><span className="label">Travel mode</span><Segmented label="Travel mode" options={MODES} value={mode} onChange={setMode} /></div>
          <button type="button" className="btn btn-primary" onClick={record}><ClipboardPlus size={15} /> Record observation</button>
        </Reveal>

        <div className="trial-results">
          <div className="route-pair">
            {[ROUTES.short, ROUTES.safe].map((r, i) => (
              <Reveal key={r.id} delay={i + 1} className={`card route ${preferred === r.id ? 'preferred' : ''}`}>
                <div className="route-top"><span className="label">{r.name}</span>{preferred === r.id && <span className="tag">Preferred</span>}</div>
                <div className="route-cost"><strong>{costs[r.id].toFixed(1)}</strong><span>model cost</span></div>
                <div className="route-stats mono"><span>{r.distance} km</span><span>~{Math.round((r.distance / speed) * 60)} min</span></div>
                <div className="meter"><i style={{ width: `${r.exposure}%` }} /></div>
                <div className="route-meta"><span>Hazard exposure</span><span className="mono">{r.exposure}/100</span></div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={2} className="card chart-card">
            <div className="chart-head"><span className="label">Cost vs. risk weight</span><span className="mono muted">switch at w ≈ {switchAt.toFixed(2)}</span></div>
            <div className="chart">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={curve} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
                  <CartesianGrid stroke="#dcd9d5" strokeDasharray="2 4" vertical={false} />
                  <XAxis dataKey="w" type="number" domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tickFormatter={(v) => (v / 100).toFixed(2)} tick={tickStyle} axisLine={false} tickLine={false} />
                  <YAxis tick={tickStyle} axisLine={false} tickLine={false} />
                  <Tooltip labelFormatter={(v) => `w = ${(v / 100).toFixed(2)}`} contentStyle={{ background: '#fbfbfa', border: '1px solid #dcd9d5', borderRadius: 4, fontSize: 12 }} />
                  <ReferenceLine x={risk} stroke="#9f3a2a" strokeDasharray="3 3" />
                  <Line type="monotone" dataKey="short" name="Shortest" stroke="#86827d" strokeWidth={2} dot={false} isAnimationActive={false} />
                  <Line type="monotone" dataKey="safe" name="Risk-aware" stroke={ink} strokeWidth={2} dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Reveal>
        </div>
      </div>
      <Reveal><LabMap preferred={preferred} /></Reveal>
    </>
  );
}
