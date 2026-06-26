import type { AlgorithmProps, GridNode, Snapshot } from '../types';

export function jps({ grid, startNode, endNode }: AlgorithmProps): Snapshot[] {
  const snapshots: Snapshot[] = [];
  let currentGrid = grid.map(row => row.map(node => ({ ...node, f: Infinity, g: Infinity })));
  
  const start = currentGrid[startNode.row][startNode.col];
  const end = currentGrid[endNode.row][endNode.col];
  
  start.g = 0;
  start.f = Math.abs(start.row - end.row) + Math.abs(start.col - end.col);
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

  // Basic 4-way Jump
  const jump = (r: number, c: number, dr: number, dc: number, dist: number, steps: number = 0): GridNode | null => {
    const nr = r + dr;
    const nc = c + dc;
    
    if (nr < 0 || nr >= grid.length || nc < 0 || nc >= grid[0].length) return steps > 0 ? currentGrid[r][c] : null;
    if (currentGrid[nr][nc].type === 'wall') return steps > 0 ? currentGrid[r][c] : null;
    
    const node = currentGrid[nr][nc];
    
    if (node.type !== 'start' && node.type !== 'end') node.isVisited = true;
    node.distance = dist + 1; // Paint the ray
    
    if (node.row === end.row && node.col === end.col) return node;

    // To ensure 4-way JPS can find targets in open space, stop if we align with the target
    if (dr !== 0 && nr === end.row) return node;
    if (dc !== 0 && nc === end.col) return node;

    // In 4-way, we "jump" until we hit a wall or our target.
    // To make it visually interesting and functional, we branch if there's a perpendicular opening.
    if (dr !== 0) { // Moving vertically
      if ((nc - 1 >= 0 && currentGrid[nr][nc-1].type !== 'wall' && currentGrid[r][nc-1].type === 'wall') ||
          (nc + 1 < grid[0].length && currentGrid[nr][nc+1].type !== 'wall' && currentGrid[r][nc+1].type === 'wall')) {
        return node;
      }
    } else if (dc !== 0) { // Moving horizontally
      if ((nr - 1 >= 0 && currentGrid[nr-1][nc].type !== 'wall' && currentGrid[nr-1][c].type === 'wall') ||
          (nr + 1 < grid.length && currentGrid[nr+1][nc].type !== 'wall' && currentGrid[nr+1][c].type === 'wall')) {
        return node;
      }
    }

    return jump(nr, nc, dr, dc, dist + 1, steps + 1);
  };

  while (openSet.length > 0) {
    openSet.sort((a, b) => b.f - a.f);
    const current = openSet.pop()!;
    
    current.isEvaluating = true;
    takeSnapshot(3, [current], `Evaluating jump point [${current.row}, ${current.col}]`);
    current.isEvaluating = false;

    if (current.row === end.row && current.col === end.col) {
      takeSnapshot(5, [current], "Target reached!");
      break;
    }

    current.isVisited = true;
    const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
    for (const [dr, dc] of directions) {
      // Don't go backwards
      if (current.previousNode) {
        const pr = current.row - current.previousNode.row;
        const pc = current.col - current.previousNode.col;
        if (dr === -Math.sign(pr) && dc === -Math.sign(pc)) continue;
      }

      const jumpPoint = jump(current.row, current.col, dr, dc, current.distance || 0);
      
      if (jumpPoint) {
        const jp = jumpPoint as (GridNode & { f: number, g: number });
        const distToJump = Math.abs(jp.row - current.row) + Math.abs(jp.col - current.col);
        const tentativeG = current.g + distToJump;
        
        if (tentativeG < jp.g) {
          jp.previousNode = current;
          jp.g = tentativeG;
          jp.f = tentativeG + Math.abs(jp.row - end.row) + Math.abs(jp.col - end.col);
          
          if (!openSet.find(n => n.row === jp.row && n.col === jp.col)) {
            openSet.push(jp);
          }
        }
      }
    }
    takeSnapshot(6, [current], "Traced jump rays");
  }

  // Backtrack
  let currentNode: GridNode | null = currentGrid[end.row][end.col];
  const path: GridNode[] = [];
  if (currentNode.previousNode !== null || (currentNode.row === start.row && currentNode.col === start.col)) {
      while (currentNode !== null) {
        path.unshift(currentNode);
        // Paint the straight line between jumps
        if (currentNode.previousNode) {
          const pr = currentNode.previousNode.row;
          const pc = currentNode.previousNode.col;
          const dr = Math.sign(currentNode.row - pr);
          const dc = Math.sign(currentNode.col - pc);
          let r = pr + dr;
          let c = pc + dc;
          while (r !== currentNode.row || c !== currentNode.col) {
            const stepNode = currentGrid[r][c];
            if (stepNode.type !== 'start' && stepNode.type !== 'end') stepNode.isPath = true;
            r += dr;
            c += dc;
          }
        }
        currentNode.isPath = true;
        currentNode = currentNode.previousNode;
        takeSnapshot(9, [], "Backtracking path...");
      }
  }

  return snapshots;
}
