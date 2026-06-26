import { dijkstra } from './core/algorithms/dijkstra';
import { astar } from './core/algorithms/astar';
import { bfs } from './core/algorithms/bfs';
import { dfs } from './core/algorithms/dfs';
import { gbfs } from './core/algorithms/gbfs';
import { bidirectional } from './core/algorithms/bidirectional';
import { jps } from './core/algorithms/jps';
import { swarm } from './core/algorithms/swarm';

let wallViolation = false;

for (let iter = 0; iter < 100; iter++) {
  const grid = Array(20).fill(0).map((_, r) => Array(20).fill(0).map((_, c) => ({ row: r, col: c, type: Math.random() < 0.3 ? 'wall' : 'unvisited', distance: Infinity, previousNode: null, isVisited: false, isPath: false })));
  grid[0][0].type = 'start';
  grid[19][19].type = 'end';
  
  [dijkstra, astar, bfs, dfs, gbfs, bidirectional, jps, swarm].forEach(algo => {
    // deep clone grid
    const cleanGrid = grid.map(row => row.map(n => ({...n})));
    const snaps = algo({ grid: cleanGrid, startNode: cleanGrid[0][0], endNode: cleanGrid[19][19] });
    const last = snaps[snaps.length - 1];
    if (last && last.grid) {
      last.grid.forEach(row => row.forEach(n => {
        if (n.type === 'wall' && n.isPath) {
          console.log(algo.name, 'VIOLATION at', n.row, n.col);
          wallViolation = true;
        }
      }));
    }
  });
}
console.log('Any wall violations?', wallViolation);

