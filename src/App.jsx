import React, { useState } from 'react';
import { ArrowDown, ArrowRight, Menu, X } from 'lucide-react';
import { Reveal, ScrollProgress, SectionHead, useScrollSpy } from './components/ui.jsx';
import Simulator from './components/Simulator.jsx';
import RouteTrial from './components/RouteTrial.jsx';
import HazardFeed from './components/HazardFeed.jsx';
import Observations from './components/Observations.jsx';
import { SECTIONS } from './data.js';

const CONCEPTS = [
  { term: 'Graph search', text: 'Locations become nodes and roads become edges; the search walks this graph from start to goal.' },
  { term: 'Heuristic', text: 'An estimate of the remaining cost from a node to the goal. It steers the search toward promising nodes.' },
  { term: 'Cost function', text: 'Each edge costs 1. Entering a hazard cell adds a penalty of 5, so risky cells look “longer”.' },
  { term: 'Admissibility', text: 'If h(n) never overestimates the true remaining cost, A* is guaranteed to return an optimal path.' },
];

const STEPS = [
  'Pick a tool — Wall or Hazard — and click or drag across the grid to shape the environment.',
  'Choose a heuristic: Manhattan or Euclidean.',
  'Run A* and watch the explored set grow outward from the start node.',
  'Hover any cell to read its g(n), h(n) and f(n) in the inspector.',
  'Repeat on the same grid with the other heuristic and compare nodes explored in Table 1.',
  'In the route trial, sweep the risk weight w and record where the preferred route switches.',
];

function HeroFigure() {
  const explored = [[1, 2], [2, 1], [1, 3], [2, 2], [1, 4], [2, 3], [1, 5], [2, 4], [3, 6], [2, 5], [4, 6], [3, 5], [5, 7], [4, 7], [5, 8], [6, 8], [7, 9], [8, 9], [9, 9], [10, 9], [11, 9], [12, 9], [13, 9], [6, 9]];
  return (
    <svg className="hero-figure" viewBox="0 0 320 220" role="img" aria-label="A path routing around walls and hazards on a grid">
      <defs><pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1" fill="#c8c4bf" /></pattern></defs>
      <rect width="320" height="220" fill="url(#dots)" />
      {explored.map(([x, y], i) => <rect key={i} className="fig-explored" style={{ '--i': i }} x={x * 20 + 2} y={y * 20 + 2} width="16" height="16" rx="1" />)}
      <rect x="80" y="0" width="20" height="120" fill="#1d1c1b" />
      <rect x="160" y="120" width="80" height="20" fill="#1d1c1b" />
      <rect x="120" y="140" width="40" height="20" fill="#e6cbc5" />
      <polyline className="fig-path" points="30,30 30,130 110,130 110,190 290,190" />
      <circle cx="30" cy="30" r="7" fill="#1d1c1b" />
      <circle className="fig-pulse" cx="290" cy="190" r="7" />
      <circle cx="290" cy="190" r="7" fill="#9f3a2a" />
    </svg>
  );
}

export default function App() {
  const [runs, setRuns] = useState([]);
  const [trials, setTrials] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const active = useScrollSpy(SECTIONS.map((s) => s.id));

  return (
    <>
      <header className="topbar">
        <div className="topbar-inner">
          <a href="#top" className="brand" onClick={() => setMenuOpen(false)}>
            <span className="brand-mark" aria-hidden="true" />
            <span>Evacuate AI</span>
            <span className="brand-sub">Virtual Lab</span>
          </a>
          <nav className={`nav ${menuOpen ? 'open' : ''}`} aria-label="Sections">
            {SECTIONS.map((s, i) => (
              <a key={s.id} href={`#${s.id}`} className={active === s.id ? 'active' : ''} onClick={() => setMenuOpen(false)}>
                <span className="nav-no">{String(i + 1).padStart(2, '0')}</span>{s.label}
              </a>
            ))}
          </nav>
          <button type="button" className="menu-btn" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        <ScrollProgress />
      </header>

      <main id="top">
        <section className="hero">
          <div className="wrap hero-inner">
            <div className="hero-copy">
              <Reveal className="eyebrow">Experiment 01 · Artificial Intelligence</Reveal>
              <Reveal as="h1" delay={1}>Risk-aware <em>evacuation</em> routing with A* search.</Reveal>
              <Reveal as="p" delay={2} className="lede">A hands-on lab for studying how a heuristic and a hazard-weighted cost function decide which way out is safest.</Reveal>
              <Reveal delay={3} className="hero-actions">
                <a className="btn btn-primary" href="#simulation">Start simulation <ArrowRight size={15} /></a>
                <a className="btn btn-ghost" href="#aim">Read the brief <ArrowDown size={15} /></a>
              </Reveal>
            </div>
            <Reveal delay={2} className="specimen">
              <HeroFigure />
              <dl className="specimen-meta">
                <div><dt>Algorithm</dt><dd>A* (informed search)</dd></div>
                <div><dt>Environment</dt><dd>18 × 12 grid · Pune map</dd></div>
                <div><dt>Runs in</dt><dd>Your browser · no backend</dd></div>
                <div><dt>Duration</dt><dd>~20 minutes</dd></div>
              </dl>
            </Reveal>
          </div>
        </section>

        <section id="aim" className="section wrap">
          <SectionHead no="01" label="Aim" title="What this lab sets out to show" />
          <div className="aim">
            <Reveal as="p" className="aim-statement">To study how A* search, guided by a heuristic and a hazard-weighted cost function, finds a lower-risk evacuation path — and how the choice of heuristic and risk weight changes the result.</Reveal>
            <ol className="objectives">
              {['Trace how A* expands nodes using f(n) = g(n) + h(n).', 'Compare search effort under Manhattan and Euclidean heuristics.', 'Measure the distance-vs-safety trade-off in a route choice.'].map((t, i) => (
                <Reveal as="li" key={t} delay={i}><span className="mono">O{i + 1}</span>{t}</Reveal>
              ))}
            </ol>
          </div>
        </section>

        <section id="theory" className="section wrap">
          <SectionHead no="02" label="Theory" title="Search, guided by an estimate" intro="A* keeps a frontier of candidate nodes and always expands the one with the lowest estimated total cost." />
          <Reveal className="formula">
            <div className="formula-eq">f(n) = g(n) + h(n)</div>
            <div className="formula-terms">
              <div><span className="mono">g(n)</span>cost of the path from start to n</div>
              <div><span className="mono">h(n)</span>estimated cost from n to the goal</div>
              <div><span className="mono">f(n)</span>priority used to pick the next node</div>
            </div>
          </Reveal>
          <div className="concepts">
            {CONCEPTS.map((c, i) => (
              <Reveal key={c.term} delay={i} className="concept"><span className="mono">{String.fromCharCode(65 + i)}</span><h3>{c.term}</h3><p>{c.text}</p></Reveal>
            ))}
          </div>
          <div className="heuristics">
            <Reveal className="card heuristic"><span className="label">Manhattan</span><div className="mono eq">|Δx| + |Δy|</div><p>Exactly the obstacle-free distance on a 4-connected grid — admissible and as tight as possible.</p></Reveal>
            <Reveal delay={1} className="card heuristic"><span className="label">Euclidean</span><div className="mono eq">√(Δx² + Δy²)</div><p>Straight-line distance. Still admissible, but it underestimates more, so A* usually explores more nodes.</p></Reveal>
          </div>
        </section>

        <section id="procedure" className="section wrap">
          <SectionHead no="03" label="Procedure" title="How to run the experiment" />
          <ol className="steps">
            {STEPS.map((s, i) => <Reveal as="li" key={i} delay={i % 3}><span className="step-no mono">{String(i + 1).padStart(2, '0')}</span><p>{s}</p></Reveal>)}
          </ol>
        </section>

        <section id="simulation" className="section wrap">
          <SectionHead no="04" label="Simulation" title="A* pathfinding bench" intro="Shape the grid, choose a heuristic and run the search. Every run is logged to Table 1." />
          <Reveal><Simulator onRun={(r) => setRuns((xs) => [...xs, r])} /></Reveal>
        </section>

        <section id="trial" className="section wrap">
          <SectionHead no="05" label="Route trial" title="Distance against safety" intro="Two candidate routes out of Shivajinagar. Cost = (1 − w)·distance·10 + w·exposure·k. Raise w to weigh hazard exposure more heavily." />
          <RouteTrial onRecord={(t) => setTrials((xs) => [...xs, t])} />
        </section>

        <section id="hazards" className="section wrap">
          <SectionHead no="06" label="Hazards" title="Sample incident feed" intro="The hazard signals that feed the cost function. Click a severity to filter." />
          <HazardFeed />
        </section>

        <section id="observations" className="section wrap">
          <SectionHead no="07" label="Observations" title="Lab record" intro="Results from this session. Nothing leaves your browser; reloading the page clears the record." />
          <Observations runs={runs} trials={trials} onClear={() => { setRuns([]); setTrials([]); }} />
        </section>

        <section id="conclusion" className="section wrap">
          <SectionHead no="08" label="Conclusion" title="What A* can — and can’t — tell you" />
          <div className="conclusion">
            <Reveal className="card">
              <span className="label">Limitations</span>
              <ul>
                <li>Results are only as good as the hazard data feeding the costs.</li>
                <li>The weight w is a judgement call; it changes which route wins.</li>
                <li>GPS and networks may fail during a real disaster.</li>
                <li>An optimal path in the model is not a guarantee of real-world safety.</li>
              </ul>
            </Reveal>
            <Reveal delay={1} className="card">
              <span className="label">Future scope</span>
              <ul>
                <li>Live GIS, weather and IoT sensor feeds.</li>
                <li>Learned hazard prediction to set penalties.</li>
                <li>Multi-agent routing to spread evacuees across exits.</li>
                <li>Offline mobile guidance.</li>
              </ul>
            </Reveal>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="wrap footer-inner">
          <span>Evacuate AI · Virtual Lab</span>
          <span>Educational prototype with sample data. Always follow official emergency instructions.</span>
        </div>
      </footer>
    </>
  );
}
