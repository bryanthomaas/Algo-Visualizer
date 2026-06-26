import type { AlgorithmProps, GridNode, Snapshot } from '../types';
import { getWeight } from '../types';

export function astar({ grid, startNode, endNode }: AlgorithmProps): Snapshot[] {
  // Simple Manhattan distance heuristic
  const heuristic = (nodeA: GridNode, nodeB: GridNode) => {
      return Math.abs(nodeA.row - nodeB.row) + Math.abs(nodeA.col - nodeB.col);
  };

  const snapshots: Snapshot[] = [];
  let currentGrid = grid.map(row => row.map(node => ({ ...node, f: Infinity, g: Infinity })));
  
  const start = currentGrid[startNode.row][startNode.col];
  const end = currentGrid[endNode.row][endNode.col];
  
  start.g = 0;
  start.f = heuristic(start, end);
  start.distance = 0;
  
  const openSet: (GridNode & { f: number, g: number })[] = [start];

  const takeSnapshot = (line: number, activeNodes: GridNode[], desc: string) => {
    snapshots.push({
      grid: currentGrid.map(row => row.map(node => ({ ...node }))),
      activeNodes: activeNodes.map(n => ({ row: n.row, col: n.col })),
      currentLine: line,
      queue: openSet.map(n => ({ row: n.row, col: n.col })),
      description: desc
    });
  };

  takeSnapshot(1, [start], "Initialize open set");

  while (openSet.length > 0) {
    // Sort by f-score descending for fast pop, tie-breaker with h-score
    openSet.sort((a, b) => {
      if (a.f === b.f) {
        const hA = Math.abs(a.row - end.row) + Math.abs(a.col - end.col);
        const hB = Math.abs(b.row - end.row) + Math.abs(b.col - end.col);
        return hB - hA;
      }
      return b.f - a.f;
    });
    const current = openSet.pop()!;
    
    current.isEvaluating = true;
    takeSnapshot(3, [current], `Evaluating node [${current.row}, ${current.col}]`);
    current.isEvaluating = false;

    if (current.row === end.row && current.col === end.col) {
      takeSnapshot(5, [current], "Target reached!");
      break;
    }

        current.isVisited = true;

    const neighbors = getNeighbors(current, currentGrid);
    for (const neighbor of neighbors) {
        if (neighbor.type === 'wall' || neighbor.isVisited || neighbor.type === 'start') continue;
        
        const tentativeG = current.g + getWeight(neighbor.type);
        
        if (tentativeG < neighbor.g) {
            neighbor.previousNode = current;
            neighbor.g = tentativeG;
            neighbor.f = neighbor.g + heuristic(neighbor, end);
            neighbor.distance = tentativeG; // Track absolute search depth
            
            if (!openSet.find(n => n.row === neighbor.row && n.col === neighbor.col)) {
                openSet.push(neighbor);
            }
        }
    }
    takeSnapshot(6, [current], "Updated neighbors");
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

function getNeighbors(node: GridNode, grid: any[][]) {
  const neighbors: any[] = [];
  const { col, row } = node;
  if (row > 0) neighbors.push(grid[row - 1][col]);
  if (row < grid.length - 1) neighbors.push(grid[row + 1][col]);
  if (col > 0) neighbors.push(grid[row][col - 1]);
  if (col < grid[0].length - 1) neighbors.push(grid[row][col + 1]);
  return neighbors;
}
