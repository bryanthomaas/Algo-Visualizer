
import { dijkstra } from './src/core/algorithms/dijkstra';
import { astar } from './src/core/algorithms/astar';
import type { GridNode } from './src/core/types';
import { getWeight } from './src/core/types';

const grid: GridNode[][] = [];
for (let r = 0; r < 20; r++) {
  const row: GridNode[] = [];
  for (let c = 0; c < 20; c++) {
    row.push({
      row: r,
      col: c,
      type: 'unvisited',
      distance: Infinity,
      previousNode: null,
    });
  }
  grid.push(row);
}

// Add a swamp
for(let r=0; r<15; r++) {
  for(let c=0; c<15; c++) {
    grid[r][c].type = 'swamp';
  }
}

grid[0][0].type = 'start';
grid[19][19].type = 'end';

const startNode = grid[0][0];
const endNode = grid[19][19];

const snapsAstar = astar({ grid, startNode, endNode });
const lastAstar = snapsAstar[snapsAstar.length - 1];

let aWeight = 1;
lastAstar.grid.forEach((row, r) => row.forEach((node, c) => {
  if (node.type === 'path') aWeight += getWeight(grid[r][c].type);
}));
console.log('A* weight:', aWeight);

const snapsDijkstra = dijkstra({ grid, startNode, endNode });
const lastDijkstra = snapsDijkstra[snapsDijkstra.length - 1];

let dWeight = 1;
lastDijkstra.grid.forEach((row, r) => row.forEach((node, c) => {
  if (node.type === 'path') dWeight += getWeight(grid[r][c].type);
}));
console.log('Dijkstra weight:', dWeight);

