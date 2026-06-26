import type { AlgorithmProps, GridNode, Snapshot } from '../types';
import { getWeight } from '../types';

export function dijkstra({ grid, startNode, endNode }: AlgorithmProps): Snapshot[] {
  const snapshots: Snapshot[] = [];
  const visitedNodesInOrder: GridNode[] = [];
  
  // Clone grid to avoid mutating the original until we want to
  let currentGrid = grid.map(row => row.map(node => ({ ...node })));
  const unvisitedNodes: GridNode[] = [];
  
  for (const row of currentGrid) {
    for (const node of row) {
      if (node.row === startNode.row && node.col === startNode.col) {
        node.distance = 0;
      } else {
        node.distance = Infinity;
      }
      unvisitedNodes.push(node);
    }
  }

  const takeSnapshot = (line: number, activeNodes: GridNode[], queue: GridNode[], desc: string) => {
    snapshots.push({
      grid: currentGrid.map(row => row.map(node => ({ ...node }))),
      activeNodes: activeNodes.map(n => ({ row: n.row, col: n.col })),
      currentLine: line,
      queue: queue.map(n => ({ row: n.row, col: n.col })),
      description: desc
    });
  };

  takeSnapshot(1, [], unvisitedNodes, "Initialize distances");

  while (!!unvisitedNodes.length) {
    unvisitedNodes.sort((a, b) => b.distance - a.distance);
    const closestNode = unvisitedNodes.pop()!;
    
    // If we encounter a wall, we skip it.
    if (closestNode.type === 'wall') continue;
    
    // If the closest node is at a distance of infinity, we must be trapped.
    if (closestNode.distance === Infinity) {
        takeSnapshot(8, [], unvisitedNodes, "Trapped! Target unreachable.");
        break;
    }
    
    closestNode.isEvaluating = true;
    takeSnapshot(3, [closestNode], unvisitedNodes, `Evaluating node at [${closestNode.row}, ${closestNode.col}]`);
    closestNode.isEvaluating = false;

      closestNode.isVisited = true;
    
    visitedNodesInOrder.push(closestNode);
    
    if (closestNode.row === endNode.row && closestNode.col === endNode.col) {
      takeSnapshot(5, [closestNode], unvisitedNodes, "Target reached!");
      break;
    }
    
    updateUnvisitedNeighbors(closestNode, currentGrid);
    takeSnapshot(6, [closestNode], unvisitedNodes, "Updated neighbors of current node");
  }

  // Backtrack to find the shortest path
  let currentNode: GridNode | null = currentGrid[endNode.row][endNode.col];
  const path: GridNode[] = [];
  if (currentNode.previousNode !== null || (currentNode.row === startNode.row && currentNode.col === startNode.col)) {
      while (currentNode !== null) {
        path.unshift(currentNode);
            currentNode.isPath = true;
        currentNode = currentNode.previousNode;
        takeSnapshot(9, [], [], "Backtracking path...");
      }
  }

  return snapshots;
}

function updateUnvisitedNeighbors(node: GridNode, grid: GridNode[][]) {
  const unvisitedNeighbors = getUnvisitedNeighbors(node, grid);
  for (const neighbor of unvisitedNeighbors) {
    if (node.distance + getWeight(neighbor.type) < neighbor.distance) {
        neighbor.distance = node.distance + getWeight(neighbor.type);
        neighbor.previousNode = node;
    }
  }
}

function getUnvisitedNeighbors(node: GridNode, grid: GridNode[][]) {
  const neighbors: GridNode[] = [];
  const { col, row } = node;
  if (row > 0) neighbors.push(grid[row - 1][col]);
  if (row < grid.length - 1) neighbors.push(grid[row + 1][col]);
  if (col > 0) neighbors.push(grid[row][col - 1]);
  if (col < grid[0].length - 1) neighbors.push(grid[row][col + 1]);
  return neighbors.filter(neighbor => !neighbor.isVisited && neighbor.type !== 'start');
}
