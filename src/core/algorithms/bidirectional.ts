import type { AlgorithmProps, GridNode, Snapshot } from '../types';
import { getWeight } from '../types';

export function bidirectional({ grid, startNode, endNode }: AlgorithmProps): Snapshot[] {
  const snapshots: Snapshot[] = [];
  let currentGrid = grid.map(row => row.map(node => ({ ...node, distanceF: Infinity, distanceB: Infinity })));
  
  const start = currentGrid[startNode.row][startNode.col];
  const end = currentGrid[endNode.row][endNode.col];
  
  start.distanceF = 0;
  start.distance = 0;
  
  end.distanceB = 0;
  end.distance = 0;
  
  const openSetF: (GridNode & { distanceF: number, distanceB: number })[] = [start];
  const openSetB: (GridNode & { distanceF: number, distanceB: number })[] = [end];

  const takeSnapshot = (line: number, activeNodes: GridNode[], desc: string) => {
    const queue = [...openSetF, ...openSetB].map(n => ({ row: n.row, col: n.col }));
    snapshots.push({
      grid: currentGrid.map(row => row.map(node => ({ ...node }))),
      activeNodes: activeNodes.map(n => ({ row: n.row, col: n.col })),
      currentLine: line,
      queue,
      description: desc
    });
  };

  takeSnapshot(1, [start, end], "Initialize forward and backward queues");

  let meetingNode: GridNode | null = null;

  while (openSetF.length > 0 && openSetB.length > 0) {
    // Process Forward
    openSetF.sort((a, b) => b.distanceF - a.distanceF);
    const currentF = openSetF.pop()!;
    
    currentF.isEvaluating = true;
    takeSnapshot(3, [currentF], `Forward: Evaluating [${currentF.row}, ${currentF.col}]`);
    currentF.isEvaluating = false;

    if (currentF.distanceB !== Infinity) {
      meetingNode = currentF;
      takeSnapshot(5, [currentF], "Paths met! Target reached.");
      break;
    }

    currentF.isVisited = true;
    const neighborsF = getNeighbors(currentF, currentGrid);
    for (const neighbor of neighborsF) {
      if (neighbor.type === 'wall' || neighbor.type === 'start') continue;
      if (neighbor.distanceF === Infinity) {
        neighbor.previousNode = currentF; // Forward parent
        neighbor.distanceF = currentF.distanceF + getWeight(neighbor.type);
        neighbor.distance = neighbor.distanceF;
        openSetF.push(neighbor);
      }
    }
    
    // Process Backward
    openSetB.sort((a, b) => b.distanceB - a.distanceB);
    const currentB = openSetB.pop()!;
    
    currentB.isEvaluating = true;
    takeSnapshot(7, [currentB], `Backward: Evaluating [${currentB.row}, ${currentB.col}]`);
    currentB.isEvaluating = false;

    if (currentB.distanceF !== Infinity) {
      meetingNode = currentB;
      takeSnapshot(5, [currentB], "Paths met! Target reached.");
      break;
    }

    currentB.isVisited = true;
    const neighborsB = getNeighbors(currentB, currentGrid);
    for (const neighbor of neighborsB) {
      if (neighbor.type === 'wall' || neighbor.type === 'end') continue;
      if (neighbor.distanceB === Infinity) {
        // We use a custom property for backward parent
        (neighbor as any).previousNodeB = currentB;
        neighbor.distanceB = currentB.distanceB + getWeight(neighbor.type);
        neighbor.distance = neighbor.distanceB; // Visual gradient trick
        openSetB.push(neighbor);
      }
    }
    takeSnapshot(9, [currentF, currentB], "Expanded both frontiers");
  }

  // Backtrack
  if (meetingNode) {
    const path: GridNode[] = [];
    
    // Forward path
    let curr: GridNode | null = meetingNode;
    while (curr !== null) {
      if (curr.type !== 'start' && curr.type !== 'end') curr.isPath = true;
      path.push(curr);
      curr = curr.previousNode;
      takeSnapshot(11, [], "Backtracking forward path...");
    }
    
    // Backward path
    curr = (meetingNode as any).previousNodeB || null;
    while (curr !== null) {
      if (curr.type !== 'start' && curr.type !== 'end') curr.isPath = true;
      path.unshift(curr);
      curr = (curr as any).previousNodeB || null;
      takeSnapshot(12, [], "Backtracking backward path...");
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
