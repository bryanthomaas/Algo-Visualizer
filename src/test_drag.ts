import * as fs from 'fs';
import * as path from 'path';

// We can't strictly run React DOM tests in this raw node environment without Jest/RTL setup.
// However, we can simulate the logic of `moveNode` and `applyBrush` from App.tsx 
// to prove that functional updates prevent race conditions and artifacts.

console.log("Simulating React functional state updates for rapid dragging...");

const ROWS = 20;
const COLS = 20;
type NodeType = 'unvisited' | 'wall' | 'start' | 'end';

interface GridNode {
  row: number;
  col: number;
  type: NodeType;
}

let grid: GridNode[][] = [];
for (let r = 0; r < ROWS; r++) {
  const row: GridNode[] = [];
  for (let c = 0; c < COLS; c++) {
    row.push({ row: r, col: c, type: 'unvisited' });
  }
  grid.push(row);
}
grid[5][5].type = 'start';

let currentGrid = grid;

// Simulate React's setGrid with functional updates
const stateQueue: Array<(prev: GridNode[][]) => GridNode[][]> = [];

function setGrid(updater: (prev: GridNode[][]) => GridNode[][]) {
  stateQueue.push(updater);
}

function processStateQueue() {
  for (const updater of stateQueue) {
    currentGrid = updater(currentGrid);
  }
  stateQueue.length = 0;
}

// Simulated moveNode logic exactly as written in App.tsx
function moveNode(row: number, col: number, type: 'start' | 'end') {
  setGrid(prevGrid => {
    const newGrid = [...prevGrid];
    
    // Validate bounds and not overlapping
    if (newGrid[row][col].type === 'start' || newGrid[row][col].type === 'end') return prevGrid;

    // Find the existing node and clear it
    let foundRow = -1;
    let foundCol = -1;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (newGrid[r][c].type === type) {
          foundRow = r;
          foundCol = c;
          break;
        }
      }
      if (foundRow !== -1) break;
    }

    if (foundRow !== -1) {
      newGrid[foundRow] = [...newGrid[foundRow]];
      newGrid[foundRow][foundCol] = { ...newGrid[foundRow][foundCol], type: 'unvisited' };
    }

    // Set new
    newGrid[row] = [...newGrid[row]];
    newGrid[row][col] = { ...newGrid[row][col], type: type };
    
    return newGrid;
  });
}

// Simulate user dragging mouse instantly across 5 cells before React re-renders
moveNode(5, 6, 'start');
moveNode(5, 7, 'start');
moveNode(5, 8, 'start');
moveNode(5, 9, 'start');
moveNode(5, 10, 'start');

processStateQueue();

// Verify that only ONE start node exists and it's at (5, 10)
let startNodeCount = 0;
let startNodePos = { r: -1, c: -1 };

for (let r = 0; r < ROWS; r++) {
  for (let c = 0; c < COLS; c++) {
    if (currentGrid[r][c].type === 'start') {
      startNodeCount++;
      startNodePos = { r, c };
    }
  }
}

console.log(`Start node count: ${startNodeCount} (Expected: 1)`);
console.log(`Final start position: (${startNodePos.r}, ${startNodePos.c}) (Expected: 5, 10)`);

if (startNodeCount === 1 && startNodePos.r === 5 && startNodePos.c === 10) {
  console.log("SUCCESS: Rapid dragging successfully moves the node without leaving artifacts!");
} else {
  console.error("FAILED: Artifacts detected or node did not reach destination.");
  process.exit(1);
}
