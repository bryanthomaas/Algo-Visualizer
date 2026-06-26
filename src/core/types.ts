export type NodeType = 'unvisited' | 'visited' | 'wall' | 'path' | 'start' | 'end' | 'swamp' | 'mountain';

export const getWeight = (type: NodeType): number => {
  if (type === 'swamp') return 5;
  if (type === 'mountain') return 10;
  if (type === 'wall') return Infinity;
  return 1;
};

export interface GridNode {
  row: number;
  col: number;
  type: NodeType;
  distance: number;
  isEvaluating?: boolean; // Currently being checked in the algorithm
  isVisited?: boolean; // Replaces type='visited'
  isPath?: boolean; // Replaces type='path'
  previousNode: GridNode | null;
}

export interface Snapshot {
  grid: GridNode[][];
  activeNodes: { row: number; col: number }[];
  currentLine: number; // For code syncing
  queue: { row: number; col: number }[]; // Coordinates in queue/stack
  description?: string;
}

export interface Theme {
  startColor: string; // Gradient start
  endColor: string;   // Gradient end
  wallColor: string;
  gridColor: string;
}

export interface AlgorithmProps {
  grid: GridNode[][];
  startNode: GridNode;
  endNode: GridNode;
}
