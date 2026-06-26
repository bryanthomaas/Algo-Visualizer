import type { GridNode, NodeType } from '../../types';

export function generateRecursiveDivisionMaze(grid: GridNode[][], startNode: {row: number, col: number}, endNode: {row: number, col: number}): GridNode[][] {
  const ROWS = grid.length;
  const COLS = grid[0].length;
  
  // Start with an empty grid bordered by walls
  const newGrid = grid.map((row, r) => 
    row.map((node, c) => ({
      ...node,
      type: (r === 0 || r === ROWS - 1 || c === 0 || c === COLS - 1) ? 'wall' as NodeType : 'unvisited' as NodeType
    }))
  );

  const divide = (r1: number, r2: number, c1: number, c2: number) => {
    const width = c2 - c1;
    const height = r2 - r1;
    
    if (width < 2 || height < 2) return;

    // Determine orientation
    const horizontal = height > width || (height === width && Math.random() < 0.5);

    if (horizontal) {
      // Wall must be on an even coordinate, passage on an odd coordinate
      let wallR = Math.floor(Math.random() * (height - 1)) + r1 + 1;
      if (wallR % 2 !== 0) wallR++; // Force even
      
      let passC = Math.floor(Math.random() * width) + c1;
      if (passC % 2 === 0) passC++; // Force odd

      if (wallR >= r2 || passC >= c2) return; // Bounds check after adjusting parity

      for (let c = c1; c < c2; c++) {
        if (c !== passC) newGrid[wallR][c].type = 'wall';
      }

      divide(r1, wallR, c1, c2);
      divide(wallR + 1, r2, c1, c2);
    } else {
      let wallC = Math.floor(Math.random() * (width - 1)) + c1 + 1;
      if (wallC % 2 !== 0) wallC++; // Force even
      
      let passR = Math.floor(Math.random() * height) + r1;
      if (passR % 2 === 0) passR++; // Force odd

      if (wallC >= c2 || passR >= r2) return; // Bounds check after adjusting parity

      for (let r = r1; r < r2; r++) {
        if (r !== passR) newGrid[r][wallC].type = 'wall';
      }

      divide(r1, r2, c1, wallC);
      divide(r1, r2, wallC + 1, c2);
    }
  };

  // We operate inside the boundary walls
  divide(1, ROWS - 1, 1, COLS - 1);

  newGrid[startNode.row][startNode.col].type = 'start';
  newGrid[endNode.row][endNode.col].type = 'end';
  
  // Guarantee start and end aren't walled off completely
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
