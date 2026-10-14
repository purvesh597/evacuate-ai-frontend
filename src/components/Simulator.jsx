import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, Eraser, Navigation, Play, Plus, RotateCcw, Target } from 'lucide-react';
import { Segmented } from './ui.jsx';
import { createGrid, heuristic, runAStar } from '../utils/astar.js';

const START = { x: 1, y: 1 };
const GOAL = { x: 16, y: 10 };
const TOOLS = [
  { id: 'wall', label: 'Wall', icon: Plus },
  { id: 'hazard', label: 'Hazard +5', icon: AlertTriangle },
  { id: 'erase', label: 'Erase', icon: Eraser },
];
const HEURISTICS = [{ id: 'manhattan', label: 'Manhattan' }, { id: 'euclidean', label: 'Euclidean' }];
const SPEEDS = [
  { id: 'slow', label: 'Slow', delay: 70, batch: 1 },
  { id: 'normal', label: 'Normal', delay: 28, batch: 1 },
  { id: 'fast', label: 'Fast', delay: 16, batch: 4 },
  { id: 'instant', label: 'Instant' },
];

const key = (x, y) => `${x},${y}`;
const isStart = (x, y) => x === START.x && y === START.y;
const isGoal = (x, y) => x === GOAL.x && y === GOAL.y;

function applyTool(cell, tool, on) {
  if (tool === 'wall') return { ...cell, blocked: on, penalty: 0 };
  if (tool === 'hazard') return { ...cell, blocked: false, penalty: on ? 5 : 0 };
  return { ...cell, blocked: false, penalty: 0 };
}

export default function Simulator({ onRun }) {
  const [grid, setGrid] = useState(() => createGrid());
  const [tool, setTool] = useState('wall');
  const [heuristicType, setHeuristicType] = useState('manhattan');
  const [speed, setSpeed] = useState('normal');
  const [showCosts, setShowCosts] = useState(false);
  const [result, setResult] = useState(null);
  const [step, setStep] = useState(0);
  const [inspect, setInspect] = useState({ x: 6, y: 2 });
  const timer = useRef(null);
  const paintValue = useRef(null);

  const stop = () => { clearInterval(timer.current); timer.current = null; };
  useEffect(() => stop, []);
  useEffect(() => {
    const release = () => { paintValue.current = null; };
    window.addEventListener('pointerup', release);
    return () => window.removeEventListener('pointerup', release);
  }, []);

  const total = result?.explored.length ?? 0;
  const searching = Boolean(result) && step < total;
  const done = Boolean(result) && step >= total;
  useEffect(() => { if (done) stop(); }, [done]);

  const exploredAt = useMemo(() => new Map(result?.explored.map((p, i) => [key(p.x, p.y), i]) ?? []), [result]);
  const pathAt = useMemo(() => new Map(result?.path.map((p, i) => [key(p.x, p.y), i]) ?? []), [result]);
  const frontier = useMemo(() => new Set(result?.frontier.map((p) => key(p.x, p.y)) ?? []), [result]);

  const clearResult = () => { stop(); setResult(null); setStep(0); };

  const run = () => {
    stop();
    const res = runAStar(grid, START, GOAL, heuristicType);
    const cells = grid.flat();
    setResult(res);
    onRun({
      heuristic: heuristicType,
      explored: res.explored.length,
      steps: res.found ? res.path.length - 1 : null,
      cost: res.found ? res.cost : null,
      walls: cells.filter((c) => c.blocked).length,
      hazards: cells.filter((c) => c.penalty > 0).length,
    });
    const s = SPEEDS.find((o) => o.id === speed);
    if (!s.delay) { setStep(res.explored.length); return; }
    setStep(0);
    timer.current = setInterval(() => setStep((n) => Math.min(n + s.batch, res.explored.length)), s.delay);
  };

  const reset = () => { clearResult(); setGrid(createGrid()); setInspect({ x: 6, y: 2 }); };

  const paint = (x, y, on) => {
    if (isStart(x, y) || isGoal(x, y)) return;
    setGrid((g) => g.map((row) => row.map((c) => (c.x === x && c.y === y ? applyTool(c, tool, on) : c))));
  };

  const onCellDown = (cell) => {
    setInspect({ x: cell.x, y: cell.y });
    if (isStart(cell.x, cell.y) || isGoal(cell.x, cell.y)) return;
    const on = tool === 'wall' ? !cell.blocked : tool === 'hazard' ? !cell.penalty : false;
    paintValue.current = on;
    if (result) clearResult();
    paint(cell.x, cell.y, on);
  };

  const onCellEnter = (cell) => {
    setInspect({ x: cell.x, y: cell.y });
    if (paintValue.current !== null) paint(cell.x, cell.y, paintValue.current);
  };

  const cellClass = (c) => {
    const k = key(c.x, c.y);
    if (isStart(c.x, c.y)) return 'start';
    if (isGoal(c.x, c.y)) return 'goal';
    if (c.blocked) return 'wall';
    const parts = [];
    if (c.penalty) parts.push('hazard');
    if (done && pathAt.has(k)) parts.push('path');
    else if ((exploredAt.get(k) ?? Infinity) < step) parts.push('explored');
    else if (done && frontier.has(k)) parts.push('frontier');
    return parts.join(' ');
  };

  const sk = key(inspect.x, inspect.y);
  const inspectCell = grid[inspect.y]?.[inspect.x];
  const g = done ? result.gScore.get(sk) : undefined;
  const h = heuristic(inspect, GOAL, heuristicType);
  const status = !result ? 'Idle' : searching ? 'Searching…' : result.found ? 'Path found' : 'No path';

  return (
    <div className="sim">
      <div className="card sim-bench">
        <div className="bench-bar">
          <Segmented label="Editing tool" options={TOOLS} value={tool} onChange={setTool} />
          <label className="check"><input type="checkbox" checked={showCosts} onChange={(e) => setShowCosts(e.target.checked)} /> Show g(n)</label>
        </div>
        <div className="grid-wrap">
          <div className="astar-grid" style={{ '--cols': grid[0].length }}>
            {grid.flat().map((c) => {
              const k = key(c.x, c.y);
              const gVal = done && showCosts && !c.blocked ? result.gScore.get(k) : undefined;
              return (
                <button
                  key={k}
                  type="button"
                  aria-label={`Cell ${c.x}, ${c.y}`}
                  className={`cell ${cellClass(c)} ${inspect.x === c.x && inspect.y === c.y ? 'inspecting' : ''}`}
                  style={pathAt.has(k) ? { '--i': pathAt.get(k) } : undefined}
                  onPointerDown={(e) => { e.preventDefault(); onCellDown(c); }}
                  onPointerEnter={() => onCellEnter(c)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onCellDown(c); paintValue.current = null; } }}
                >
                  {isStart(c.x, c.y) ? <Navigation size={12} /> : isGoal(c.x, c.y) ? <Target size={12} /> : gVal !== undefined ? <span>{Math.round(gVal)}</span> : c.penalty ? <AlertTriangle size={10} /> : null}
                </button>
              );
            })}
          </div>
        </div>
        <div className="legend">
          <span><i className="key key-start" />Start</span>
          <span><i className="key key-goal" />Goal</span>
          <span><i className="key key-wall" />Wall</span>
          <span><i className="key key-hazard" />Hazard</span>
          <span><i className="key key-explored" />Explored</span>
          <span><i className="key key-frontier" />Frontier</span>
          <span><i className="key key-path" />Path</span>
        </div>
      </div>

      <aside className="sim-side">
        <div className="card sim-controls">
          <div className="ctl"><span className="label">Heuristic h(n)</span>
            <Segmented label="Heuristic" options={HEURISTICS} value={heuristicType} onChange={(v) => { setHeuristicType(v); clearResult(); }} disabled={searching} />
          </div>
          <div className="ctl"><span className="label">Playback</span>
            <Segmented label="Playback speed" options={SPEEDS} value={speed} onChange={setSpeed} disabled={searching} />
          </div>
          <div className="sim-actions">
            <button type="button" className="btn btn-primary" onClick={run} disabled={searching}><Play size={15} /> {searching ? 'Searching…' : 'Run A*'}</button>
            <button type="button" className="btn btn-ghost" onClick={reset}><RotateCcw size={15} /> Reset</button>
          </div>
        </div>

        <dl className="card readouts">
          <div><dt>Status</dt><dd className={result && !searching ? (result.found ? 'ok' : 'bad') : ''}>{status}</dd></div>
          <div><dt>Nodes explored</dt><dd>{result ? Math.min(step, total) : '—'}</dd></div>
          <div><dt>Path length</dt><dd>{done && result.found ? `${result.path.length - 1} steps` : '—'}</dd></div>
          <div><dt>Path cost</dt><dd>{done && result.found ? result.cost.toFixed(1) : '—'}</dd></div>
        </dl>

        <div className="card inspector">
          <div className="inspector-head"><span className="label">Cell inspector</span><span className="mono">({inspect.x}, {inspect.y})</span></div>
          <div className="costs">
            <div><span>g(n)</span><strong>{g === undefined ? '—' : g.toFixed(1)}</strong></div>
            <div><span>h(n)</span><strong>{h.toFixed(1)}</strong></div>
            <div className="f"><span>f(n)</span><strong>{g === undefined ? '—' : (g + h).toFixed(1)}</strong></div>
          </div>
          <p className="note">
            {inspectCell?.blocked ? 'Wall — this cell cannot be traversed.'
              : inspectCell?.penalty ? `Hazard — entering costs 1 + ${inspectCell.penalty}.`
              : g === undefined ? 'Hover a cell to inspect it. g(n) appears once the search has reached it.'
              : 'Open cell — entering costs 1.'}
          </p>
        </div>
      </aside>
    </div>
  );
}
