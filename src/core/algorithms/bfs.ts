import type { AlgorithmProps, GridNode, Snapshot } from '../types';

export function bfs({ grid, startNode, endNode }: AlgorithmProps): Snapshot[] {
  const snapshots: Snapshot[] = [];
  let currentGrid = grid.map(row => row.map(node => ({ ...node })));
  
  const start = currentGrid[startNode.row][startNode.col];
  const end = currentGrid[endNode.row][endNode.col];
  
  const queue: GridNode[] = [start];
  let head = 0;
  
  const takeSnapshot = (line: number, activeNodes: GridNode[], desc: string) => {
    snapshots.push({
      grid: currentGrid.map(row => row.map(node => ({ ...node }))),
      activeNodes: activeNodes.map(n => ({ row: n.row, col: n.col })),
      currentLine: line,
      queue: queue.slice(head).map(n => ({ row: n.row, col: n.col })),
      description: desc
    });
  };

  takeSnapshot(1, [start], "Initialize queue with start node");
  start.distance = 0; // use distance to mark visited

  while (head < queue.length) {
    const current = queue[head++];
    
    current.isEvaluating = true;
    takeSnapshot(3, [current], `Evaluating node [${current.row}, ${current.col}]`);
    current.isEvaluating = false;

    current.isVisited = true;
    if (current.row === end.row && current.col === end.col) {
      takeSnapshot(5, [current], "Target reached!");
      break;
    }

    const neighbors = getNeighbors(current, currentGrid).filter(neighbor => !neighbor.isVisited && neighbor.type !== 'wall');
    for (const neighbor of neighbors) {
        neighbor.isVisited = true;
        neighbor.distance = current.distance + 1;
        neighbor.previousNode = current;
        queue.push(neighbor);
    }
    takeSnapshot(7, [current], "Added unvisited neighbors to queue");
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
