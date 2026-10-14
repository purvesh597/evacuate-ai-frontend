import React from 'react';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Printer, Trash2 } from 'lucide-react';
import { Reveal } from './ui.jsx';

const tickStyle = { fill: '#86827d', fontSize: 11, fontFamily: 'IBM Plex Mono' };
const HEURISTIC_FILL = { manhattan: '#9f3a2a', euclidean: '#1d1c1b' };

function average(runs, h) {
  const xs = runs.filter((r) => r.heuristic === h);
  return xs.length ? xs.reduce((s, r) => s + r.explored, 0) / xs.length : null;
}

function Empty({ children, href, cta }) {
  return <div className="empty">{children} <a href={href}>{cta} →</a></div>;
}

export default function Observations({ runs, trials, onClear }) {
  const m = average(runs, 'manhattan');
  const e = average(runs, 'euclidean');
  const hasData = runs.length > 0 || trials.length > 0;

  return (
    <>
      <div className="obs-grid">
        <Reveal className="card">
          <div className="card-head"><span className="label">Table 1 · A* runs</span><span className="mono muted">{runs.length} recorded</span></div>
          {runs.length ? (
            <div className="table-scroll">
              <table>
                <thead><tr><th>#</th><th>h(n)</th><th>Walls</th><th>Hazards</th><th>Explored</th><th>Steps</th><th>Cost</th></tr></thead>
                <tbody>
                  {runs.map((r, i) => (
                    <tr key={i} className="row-in">
                      <td className="mono">{i + 1}</td><td>{r.heuristic === 'manhattan' ? 'Manhattan' : 'Euclidean'}</td>
                      <td className="mono">{r.walls}</td><td className="mono">{r.hazards}</td><td className="mono">{r.explored}</td>
                      <td className="mono">{r.steps ?? '—'}</td><td className="mono">{r.cost?.toFixed(1) ?? 'no path'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <Empty href="#simulation" cta="Run the simulation">Each A* run is logged here.</Empty>}
        </Reveal>

        <Reveal delay={1} className="card">
          <div className="card-head"><span className="label">Fig. 1 · Nodes explored per run</span>
            <span className="legend"><span><i className="key key-path" />Manhattan</span><span><i className="key key-wall" />Euclidean</span></span>
          </div>
          {runs.length ? (
            <div className="chart">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={runs.map((r, i) => ({ run: `#${i + 1}`, explored: r.explored, heuristic: r.heuristic }))} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                  <CartesianGrid stroke="#dcd9d5" strokeDasharray="2 4" vertical={false} />
                  <XAxis dataKey="run" tick={tickStyle} axisLine={false} tickLine={false} />
                  <YAxis tick={tickStyle} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip cursor={{ fill: '#e8e6e3' }} contentStyle={{ background: '#fbfbfa', border: '1px solid #dcd9d5', borderRadius: 4, fontSize: 12 }} />
                  <Bar dataKey="explored" name="Nodes explored" radius={[2, 2, 0, 0]} maxBarSize={36}>
                    {runs.map((r, i) => <Cell key={i} fill={HEURISTIC_FILL[r.heuristic]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : <Empty href="#simulation" cta="Run with both heuristics">The chart fills in as runs are recorded.</Empty>}
          {m !== null && e !== null && (
            <p className="inference">
              <span className="label">Inference</span> Averaged over recorded runs, Manhattan expanded <b>{m.toFixed(0)}</b> nodes and Euclidean <b>{e.toFixed(0)}</b>.
              {m < e ? ' The tighter heuristic narrowed the search, as theory predicts.' : m > e ? ' Euclidean came out lower here — compare runs on the same grid for a fair test.' : ' Both expanded the same number of nodes.'}
            </p>
          )}
        </Reveal>
      </div>

      <Reveal className="card">
        <div className="card-head"><span className="label">Table 2 · Route trials</span><span className="mono muted">{trials.length} recorded</span></div>
        {trials.length ? (
          <div className="table-scroll">
            <table>
              <thead><tr><th>#</th><th>w</th><th>Penalties</th><th>Mode</th><th>Cost · shortest</th><th>Cost · risk-aware</th><th>Preferred</th><th>ETA</th></tr></thead>
              <tbody>
                {trials.map((t, i) => (
                  <tr key={i} className="row-in">
                    <td className="mono">{i + 1}</td><td className="mono">{t.w.toFixed(2)}</td><td>{t.avoid ? 'On' : 'Off'}</td><td>{t.mode}</td>
                    <td className="mono">{t.short.toFixed(1)}</td><td className="mono">{t.safe.toFixed(1)}</td><td>{t.preferred}</td><td className="mono">{Math.round(t.eta)} min</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <Empty href="#trial" cta="Record a route trial">Vary the risk weight and record where the preference switches.</Empty>}
      </Reveal>

      <Reveal className="obs-actions">
        <button type="button" className="btn btn-ghost" onClick={() => window.print()}><Printer size={15} /> Print lab record</button>
        {hasData && <button type="button" className="btn btn-ghost" onClick={onClear}><Trash2 size={15} /> Clear log</button>}
      </Reveal>
    </>
  );
}
