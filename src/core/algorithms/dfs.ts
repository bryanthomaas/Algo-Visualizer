import type { AlgorithmProps, GridNode, Snapshot } from '../types';

export function dfs({ grid, startNode, endNode }: AlgorithmProps): Snapshot[] {
  const snapshots: Snapshot[] = [];
  let currentGrid = grid.map(row => row.map(node => ({ ...node })));
  
  const start = currentGrid[startNode.row][startNode.col];
  const end = currentGrid[endNode.row][endNode.col];
  
  start.distance = 0;
  
  const stack: GridNode[] = [start];
  
  const takeSnapshot = (line: number, activeNodes: GridNode[], desc: string) => {
    snapshots.push({
      grid: currentGrid.map(row => row.map(node => ({ ...node }))),
      activeNodes: activeNodes.map(n => ({ row: n.row, col: n.col })),
      currentLine: line,
      queue: stack.map(n => ({ row: n.row, col: n.col })),
      description: desc
    });
  };

  takeSnapshot(1, [start], "Initialize stack with start node");

  while (stack.length > 0) {
    const current = stack.pop()!;
    
    if (current.isVisited) continue;

    current.isEvaluating = true;
    takeSnapshot(3, [current], `Evaluating node [${current.row}, ${current.col}]`);
    current.isEvaluating = false;

    if (current.row === end.row && current.col === end.col) {
      takeSnapshot(5, [current], "Target reached!");
      break;
    }

    current.isVisited = true;

    const neighbors = getNeighbors(current, currentGrid);
    // Reverse neighbors to explore top/left first if desired, or just push normally
    for (let i = neighbors.length - 1; i >= 0; i--) {
        const neighbor = neighbors[i];
        if (neighbor.type === 'wall' || neighbor.isVisited || neighbor.type === 'start') continue;
        
        // We set previousNode here, but DFS might overwrite it if reached via multiple paths
        if (!neighbor.previousNode) {
             neighbor.previousNode = current;
             neighbor.distance = current.distance === Infinity ? 1 : current.distance + 1;
        }
        stack.push(neighbor);
    }
    takeSnapshot(7, [current], "Pushed unvisited neighbors to stack");
  }

  // Backtrack
  let currentNode: GridNode | null = currentGrid[end.row][end.col];
  const path: GridNode[] = [];
  if (currentNode.previousNode !== null || (currentNode.row === start.row && currentNode.col === start.col)) {
      while (currentNode !== null) {
        path.unshift(currentNode);
        currentNode.isPath = true;
        currentNode = currentNode.previousNode;
        takeSnapshot(9, [], "Backtracking path...");
      }
  }

  return snapshots;
}

function getNeighbors(node: GridNode, grid: GridNode[][]) {
  const neighbors: GridNode[] = [];
  const { col, row } = node;
  if (row > 0) neighbors.push(grid[row - 1][col]);
  if (row < grid.length - 1) neighbors.push(grid[row + 1][col]);
  if (col > 0) neighbors.push(grid[row][col - 1]);
  if (col < grid[0].length - 1) neighbors.push(grid[row][col + 1]);
  return neighbors;
}
