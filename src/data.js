import { AlertOctagon, Flame, Waves, Wind } from 'lucide-react';

export const SECTIONS = [
  { id: 'aim', label: 'Aim' },
  { id: 'theory', label: 'Theory' },
  { id: 'procedure', label: 'Procedure' },
  { id: 'simulation', label: 'Simulation' },
  { id: 'trial', label: 'Route trial' },
  { id: 'hazards', label: 'Hazards' },
  { id: 'observations', label: 'Observations' },
  { id: 'conclusion', label: 'Conclusion' },
];

export const SEVERITIES = ['Critical', 'High', 'Medium', 'Low'];

// Sample incidents for the demo region — not live emergency data.
export const HAZARDS = [
  { id: 1, type: 'Flooding', place: 'Mula River, Aundh', severity: 'High', road: 'Partially blocked', updated: '2 min ago', icon: Waves },
  { id: 2, type: 'Road blockage', place: 'University Road', severity: 'Critical', road: 'Closed', updated: '5 min ago', icon: AlertOctagon },
  { id: 3, type: 'Heavy rainfall', place: 'Shivajinagar', severity: 'Medium', road: 'Slow traffic', updated: '8 min ago', icon: Wind },
  { id: 4, type: 'Fire alert', place: 'Industrial area, Pimpri', severity: 'High', road: 'Avoid area', updated: '12 min ago', icon: Flame },
  { id: 5, type: 'Waterlogging', place: 'JM Road', severity: 'Low', road: 'Passable', updated: '18 min ago', icon: Waves },
];

// Two candidate routes for the route trial. Exposure is a 0–100 sample hazard score.
export const ROUTES = {
  short: { id: 'short', name: 'Shortest route', distance: 2.9, exposure: 78 },
  safe: { id: 'safe', name: 'Risk-aware route', distance: 4.1, exposure: 22 },
};

export const MODES = [
  { id: 'walk', label: 'Walking', speed: 4.5 },
  { id: 'drive', label: 'Driving', speed: 22 },
  { id: 'emergency', label: 'Emergency', speed: 35 },
];

// cost = (1 − w)·distance·10 + w·exposure·k, where k doubles when hazard penalties are enforced.
export const penaltyFactor = (avoid) => (avoid ? 1 : 0.5);
export const routeCost = (route, w, avoid) => (1 - w) * route.distance * 10 + w * route.exposure * penaltyFactor(avoid);
export const crossover = (avoid) => {
  const a = (ROUTES.safe.distance - ROUTES.short.distance) * 10;
  const b = (ROUTES.short.exposure - ROUTES.safe.exposure) * penaltyFactor(avoid);
  return a / (a + b);
};
