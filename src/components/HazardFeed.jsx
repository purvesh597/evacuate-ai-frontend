import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import { Reveal, Segmented, Severity } from './ui.jsx';
import { HAZARDS, SEVERITIES } from '../data.js';

const SORTS = [{ id: 'newest', label: 'Newest' }, { id: 'severity', label: 'Severity' }];

export default function HazardFeed() {
  const [query, setQuery] = useState('');
  const [level, setLevel] = useState(null);
  const [sort, setSort] = useState('newest');

  const rows = HAZARDS
    .filter((h) => (!level || h.severity === level) && `${h.type} ${h.place} ${h.road}`.toLowerCase().includes(query.trim().toLowerCase()))
    .sort((a, b) => (sort === 'severity' ? SEVERITIES.indexOf(a.severity) - SEVERITIES.indexOf(b.severity) : a.id - b.id));
  const filtered = Boolean(query || level);

  return (
    <>
      <div className="sev-strip">
        {SEVERITIES.map((s, i) => (
          <Reveal as="button" type="button" key={s} delay={i} aria-pressed={level === s} className={`sev-tile ${level === s ? 'on' : ''}`} onClick={() => setLevel(level === s ? null : s)}>
            <span className="label">{s}</span>
            <strong>{String(HAZARDS.filter((h) => h.severity === s).length).padStart(2, '0')}</strong>
          </Reveal>
        ))}
      </div>
      <Reveal className="card table-card">
        <div className="toolbar">
          <label className="search"><Search size={15} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search type, place or road status" aria-label="Search hazards" /></label>
          <Segmented label="Sort" options={SORTS} value={sort} onChange={setSort} />
          {filtered && <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setQuery(''); setLevel(null); }}><X size={14} /> Clear</button>}
        </div>
        <div className="table-scroll">
          <table>
            <thead><tr><th>Hazard</th><th>Location</th><th>Severity</th><th>Road status</th><th>Updated</th></tr></thead>
            <tbody>
              {rows.map((h) => (
                <tr key={h.id}>
                  <td><span className="hz"><h.icon size={15} />{h.type}</span></td>
                  <td>{h.place}</td>
                  <td><Severity level={h.severity} /></td>
                  <td>{h.road}</td>
                  <td className="mono muted">{h.updated}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && <p className="empty">No hazards match this filter.</p>}
        </div>
      </Reveal>
    </>
  );
}
