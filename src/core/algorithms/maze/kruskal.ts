import type { GridNode, NodeType } from '../../types';

export function generateKruskalMaze(grid: GridNode[][], startNode: {row: number, col: number}, endNode: {row: number, col: number}): GridNode[][] {
  const ROWS = grid.length;
  const COLS = grid[0].length;
  
  const newGrid = grid.map((row) => 
    row.map((node) => ({
      ...node,
      type: 'wall' as NodeType
    }))
  );

  const sets: Map<string, string> = new Map();
  const edges: { r: number, c: number, dr: number, dc: number }[] = [];

  // Initialize sets for every other node (the cells)
  for (let r = 1; r < ROWS; r += 2) {
    for (let c = 1; c < COLS; c += 2) {
      const id = `${r},${c}`;
      sets.set(id, id);
      
      // Add right edge
      if (c + 2 < COLS) edges.push({ r, c, dr: 0, dc: 2 });
      // Add down edge
      if (r + 2 < ROWS) edges.push({ r, c, dr: 2, dc: 0 });
    }
  }

  // Shuffle edges randomly
  edges.sort(() => Math.random() - 0.5);

  const find = (id: string): string => {
    if (sets.get(id) === id) return id;
    const parent = find(sets.get(id)!);
    sets.set(id, parent);
    return parent;
  };

  const union = (id1: string, id2: string) => {
    sets.set(find(id1), find(id2));
  };

  for (const edge of edges) {
    const r1 = edge.r;
    const c1 = edge.c;
    const r2 = edge.r + edge.dr;
    const c2 = edge.c + edge.dc;

    const id1 = `${r1},${c1}`;
    const id2 = `${r2},${c2}`;

    if (find(id1) !== find(id2)) {
      union(id1, id2);
      // Carve the cells and the wall between them
      newGrid[r1][c1].type = 'unvisited';
      newGrid[r2][c2].type = 'unvisited';
      newGrid[r1 + edge.dr / 2][c1 + edge.dc / 2].type = 'unvisited';
    }
  }

  newGrid[startNode.row][startNode.col].type = 'start';
  newGrid[endNode.row][endNode.col].type = 'end';
  
  // Ensure paths connect to start/end if blocked by parity
  const unwallNeighbors = (r: number, c: number) => {
    const neighbors = [[0,1], [1,0], [0,-1], [-1,0]];
    for (const [dr, dc] of neighbors) {
      if (r+dr > 0 && r+dr < ROWS-1 && c+dc > 0 && c+dc < COLS-1) {
        newGrid[r+dr][c+dc].type = 'unvisited';
      }
    }
  };
  unwallNeighbors(startNode.row, startNode.col);
  unwallNeighbors(endNode.row, endNode.col);

  // 15% Terrain injection
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const node = newGrid[r][c];
      if (node.type === 'start' || node.type === 'end') continue;
      if (node.type === 'wall' && Math.random() < 0.15) node.type = 'mountain';
      if (node.type === 'unvisited' && Math.random() < 0.15) node.type = 'swamp';
    }
  }

  return newGrid;
}
