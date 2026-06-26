import type { GridNode, NodeType } from '../types';

export function generateMaze(grid: GridNode[][], startNode: {row: number, col: number}, endNode: {row: number, col: number}): GridNode[][] {
  const ROWS = grid.length;
  const COLS = grid[0].length;
  
  const newGrid = grid.map((row) => 
    row.map((node) => ({
      ...node,
      type: 'wall' as NodeType
    }))
  );

  const isValid = (r: number, c: number) => r > 0 && r < ROWS - 1 && c > 0 && c < COLS - 1;

  const carve = (r: number, c: number) => {
    newGrid[r][c].type = 'unvisited';
    
    // Randomize directions
    const directions = [
      [0, -2], [0, 2], [-2, 0], [2, 0]
    ].sort(() => Math.random() - 0.5);

    for (const [dr, dc] of directions) {
      const nr = r + dr;
      const nc = c + dc;
      if (isValid(nr, nc) && newGrid[nr][nc].type === 'wall') {
        newGrid[r + dr/2][c + dc/2].type = 'unvisited';
        carve(nr, nc);
      }
    }
  };

  carve(1, 1);
  
  newGrid[startNode.row][startNode.col].type = 'start';
  newGrid[endNode.row][endNode.col].type = 'end';
  
  // Ensure paths connect to start/end if they are blocked by parity
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
