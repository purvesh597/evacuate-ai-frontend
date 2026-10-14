export function heuristic(a, b, type = 'manhattan') {
  const dx = Math.abs(a.x - b.x), dy = Math.abs(a.y - b.y);
  return type === 'euclidean' ? Math.sqrt(dx * dx + dy * dy) : dx + dy;
}

export function runAStar(grid, start, goal, heuristicType = 'manhattan') {
  const key = (p) => `${p.x},${p.y}`;
  const open = [start];
  const cameFrom = new Map();
  const gScore = new Map([[key(start), 0]]);
  const fScore = new Map([[key(start), heuristic(start, goal, heuristicType)]]);
  const explored = [];
  const frontier = new Set([key(start)]);
  const closed = new Set();
  const getCell = (p) => grid[p.y]?.[p.x];
  const neighbours = (p) => [{ x: p.x + 1, y: p.y }, { x: p.x - 1, y: p.y }, { x: p.x, y: p.y + 1 }, { x: p.x, y: p.y - 1 }]
    .filter(n => n.x >= 0 && n.y >= 0 && n.y < grid.length && n.x < grid[0].length && !getCell(n)?.blocked);

  while (open.length) {
    open.sort((a, b) => (fScore.get(key(a)) ?? Infinity) - (fScore.get(key(b)) ?? Infinity));
    const current = open.shift();
    const ck = key(current); frontier.delete(ck);
    if (closed.has(ck)) continue;
    explored.push({ ...current, g: gScore.get(ck) ?? 0, h: heuristic(current, goal, heuristicType), f: fScore.get(ck) ?? 0 });
    if (current.x === goal.x && current.y === goal.y) {
      const path = [current]; let cursor = ck;
      while (cameFrom.has(cursor)) { const prev = cameFrom.get(cursor); path.unshift(prev); cursor = key(prev); }
      return { path, explored, frontier: [...frontier].map(s => { const [x,y] = s.split(',').map(Number); return {x,y}; }), cost: gScore.get(ck), found: true, gScore, fScore };
    }
    closed.add(ck);
    for (const next of neighbours(current)) {
      const nk = key(next); if (closed.has(nk)) continue;
      const cell = getCell(next); const tentative = (gScore.get(ck) ?? Infinity) + 1 + (cell?.penalty ?? 0);
      if (tentative < (gScore.get(nk) ?? Infinity)) {
        cameFrom.set(nk, current); gScore.set(nk, tentative); fScore.set(nk, tentative + heuristic(next, goal, heuristicType));
        if (!frontier.has(nk)) { open.push(next); frontier.add(nk); }
      }
    }
  }
  return { path: [], explored, frontier: [...frontier].map(s => { const [x,y] = s.split(',').map(Number); return {x,y}; }), cost: Infinity, found: false, gScore, fScore };
}

export function createGrid(rows = 12, cols = 18) {
  const grid = Array.from({ length: rows }, (_, y) => Array.from({ length: cols }, (_, x) => ({ x, y, blocked: false, penalty: 0 })));
  // Demonstration obstacles and hazard cells; the route is computed at runtime.
  [[4,1],[4,2],[4,3],[4,4],[4,5],[8,6],[9,6],[10,6],[11,6],[13,2],[13,3],[13,4]].forEach(([x,y]) => { if (grid[y]?.[x]) grid[y][x].blocked = true; });
  [[6,2],[6,3],[6,4],[7,4],[7,5],[12,8],[12,9]].forEach(([x,y]) => { if (grid[y]?.[x]) grid[y][x].penalty = 5; });
  return grid;
}
