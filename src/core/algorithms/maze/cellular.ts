import type { GridNode, NodeType } from '../../types';

export function generateCellularMaze(grid: GridNode[][], startNode: {row: number, col: number}, endNode: {row: number, col: number}): GridNode[][] {
  const ROWS = grid.length;
  const COLS = grid[0].length;
  
  // Initialize with random walls (chance of 0.45)
  let currentGrid = grid.map((row) => 
    row.map((node) => ({
      ...node,
      type: (Math.random() < 0.45 ? 'wall' : 'unvisited') as NodeType
    }))
  );

  // Border is always walls
  for (let r = 0; r < ROWS; r++) {
    currentGrid[r][0].type = 'wall';
    currentGrid[r][COLS - 1].type = 'wall';
  }
  for (let c = 0; c < COLS; c++) {
    currentGrid[0][c].type = 'wall';
    currentGrid[ROWS - 1][c].type = 'wall';
  }

  // Run CA simulation for 5 generations
  for (let gen = 0; gen < 5; gen++) {
    const nextGrid = currentGrid.map(row => row.map(node => ({ ...node })));
    for (let r = 1; r < ROWS - 1; r++) {
      for (let c = 1; c < COLS - 1; c++) {
        let wallCount = 0;
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            if (currentGrid[r + dr][c + dc].type === 'wall') wallCount++;
          }
        }
        // B5678/S45678 standard cave generation
        if (currentGrid[r][c].type === 'wall') {
          nextGrid[r][c].type = wallCount >= 4 ? 'wall' : 'unvisited';
        } else {
          nextGrid[r][c].type = wallCount >= 5 ? 'wall' : 'unvisited';
        }
      }
    }
    currentGrid = nextGrid;
  }

  // Clear start and end points and their neighbors
  const clearArea = (r: number, c: number) => {
    for (let dr = -2; dr <= 2; dr++) {
      for (let dc = -2; dc <= 2; dc++) {
        if (r + dr > 0 && r + dr < ROWS - 1 && c + dc > 0 && c + dc < COLS - 1) {
          currentGrid[r + dr][c + dc].type = 'unvisited';
        }
      }
    }
  };
  
  clearArea(startNode.row, startNode.col);
  clearArea(endNode.row, endNode.col);

  currentGrid[startNode.row][startNode.col].type = 'start';
  currentGrid[endNode.row][endNode.col].type = 'end';

  // 15% Terrain injection
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const node = currentGrid[r][c];
      if (node.type === 'start' || node.type === 'end') continue;
      if (node.type === 'wall' && Math.random() < 0.15) node.type = 'mountain';
      if (node.type === 'unvisited' && Math.random() < 0.15) node.type = 'swamp';
    }
  }

  return currentGrid;
}
