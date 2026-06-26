import type { AlgorithmProps, GridNode, Snapshot } from '../types';

export function gbfs({ grid, startNode, endNode }: AlgorithmProps): Snapshot[] {
  const heuristic = (nodeA: GridNode, nodeB: GridNode) => {
      return Math.abs(nodeA.row - nodeB.row) + Math.abs(nodeA.col - nodeB.col);
  };

  const snapshots: Snapshot[] = [];
  let currentGrid = grid.map(row => row.map(node => ({ ...node, distance: Infinity })));
  
  const start = currentGrid[startNode.row][startNode.col];
  const end = currentGrid[endNode.row][endNode.col];
  
  start.distance = 0; // True search depth
  
  // We need a separate property for the heuristic since `distance` is now path depth
  const openSet: (GridNode & { h: number })[] = [{...start, h: heuristic(start, end)}];

  const takeSnapshot = (line: number, activeNodes: GridNode[], desc: string) => {
    snapshots.push({
      grid: currentGrid.map(row => row.map(node => ({ ...node }))),
      activeNodes: activeNodes.map(n => ({ row: n.row, col: n.col })),
      currentLine: line,
      queue: openSet.map(n => ({ row: n.row, col: n.col })),
      description: desc
    });
  };

  takeSnapshot(1, [start], "Initialize priority queue");

  while (openSet.length > 0) {
    openSet.sort((a, b) => {
      if (a.h === b.h) {
        return b.distance - a.distance;
      }
      return b.h - a.h;
    });
    const currentWrapper = openSet.pop()!;
    const current = currentGrid[currentWrapper.row][currentWrapper.col];
    
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
        
        if (neighbor.distance === Infinity) {
            neighbor.previousNode = current;
            neighbor.distance = current.distance + 1;
            openSet.push({...neighbor, h: heuristic(neighbor, end)});
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

function getNeighbors(node: GridNode, grid: GridNode[][]) {
  const neighbors: GridNode[] = [];
  const { col, row } = node;
  if (row > 0) neighbors.push(grid[row - 1][col]);
  if (row < grid.length - 1) neighbors.push(grid[row + 1][col]);
  if (col > 0) neighbors.push(grid[row][col - 1]);
  if (col < grid[0].length - 1) neighbors.push(grid[row][col + 1]);
  return neighbors;
}
