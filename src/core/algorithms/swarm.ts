import type { AlgorithmProps, GridNode, Snapshot } from '../types';
import { getWeight } from '../types';

export function swarm({ grid, startNode, endNode }: AlgorithmProps): Snapshot[] {
  // Swarm mixes Dijkstra and A* heuristics by applying a weight to the heuristic
  // It effectively pushes the search slightly towards the target but allows wide exploration
  const heuristic = (nodeA: GridNode, nodeB: GridNode) => {
      return (Math.abs(nodeA.row - nodeB.row) + Math.abs(nodeA.col - nodeB.col)) * 0.5; // low weight
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

  takeSnapshot(1, [start], "Initialize swarm open set");

  while (openSet.length > 0) {
    openSet.sort((a, b) => b.f - a.f);
    const current = openSet.pop()!;
    
    current.isEvaluating = true;
    takeSnapshot(3, [current], `Evaluating swarm node [${current.row}, ${current.col}]`);
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
            neighbor.distance = tentativeG;
            
            if (!openSet.find(n => n.row === neighbor.row && n.col === neighbor.col)) {
                openSet.push(neighbor);
            }
        }
    }
    takeSnapshot(6, [current], "Updated swarm neighbors");
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
