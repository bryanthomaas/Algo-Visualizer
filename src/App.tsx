import { useState, useEffect, useTransition, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas } from './components/Canvas';
import { CodePanel } from './components/CodePanel';
import { TimelineControl } from './components/TimelineControl';
import { CustomDropdown } from './components/CustomDropdown';
import { ScoreBoard } from './components/ScoreBoard';
import { ErrorBoundary } from './ErrorBoundary';
import { getWeight } from './core/types';
import type { GridNode, Snapshot, NodeType, Theme } from './core/types';
import { dijkstra } from './core/algorithms/dijkstra';
import { astar } from './core/algorithms/astar';
import { bfs } from './core/algorithms/bfs';
import { dfs } from './core/algorithms/dfs';
import { gbfs } from './core/algorithms/gbfs';
import { bidirectional } from './core/algorithms/bidirectional';
import { jps } from './core/algorithms/jps';
import { swarm } from './core/algorithms/swarm';
import { generateMaze } from './core/algorithms/maze';
import { generateCellularMaze } from './core/algorithms/maze/cellular';
import { generateKruskalMaze } from './core/algorithms/maze/kruskal';
import { generateRecursiveDivisionMaze } from './core/algorithms/maze/recursiveDivision';
import { initAudio, playTone } from './utils/audio';


const ROWS = 20;
const COLS = 20;

type AlgorithmType = 'Dijkstra' | 'A*' | 'BFS' | 'DFS' | 'GBFS' | 'Bidirectional Dijkstra' | 'Jump Point Search' | 'Swarm';
const ALGORITHMS: AlgorithmType[] = ['Dijkstra', 'A*', 'BFS', 'DFS', 'GBFS', 'Bidirectional Dijkstra', 'Jump Point Search', 'Swarm'];
type AlgoMetrics = Record<AlgorithmType, { ops: number, weight: number } | null>;

type MazeAlgorithmType = 'Recursive Backtracker' | 'Cellular Automata' | 'Kruskal' | 'Recursive Division';
const MAZE_ALGORITHMS: MazeAlgorithmType[] = ['Recursive Backtracker', 'Cellular Automata', 'Kruskal', 'Recursive Division'];

export type BrushType = 'wall' | 'swamp' | 'mountain' | 'eraser';

const createInitialGrid = (start: {row: number, col: number}, end: {row: number, col: number}): GridNode[][] => {
  const grid: GridNode[][] = [];
  for (let r = 0; r < ROWS; r++) {
    const currentRow: GridNode[] = [];
    for (let c = 0; c < COLS; c++) {
      currentRow.push({
        row: r,
        col: c,
        type: (r === start.row && c === start.col) ? 'start' : 
              (r === end.row && c === end.col) ? 'end' : 'unvisited',
        distance: Infinity,
        previousNode: null,
      });
    }
    grid.push(currentRow);
  }
  return grid;
};

export default function App() {
  const draggingNode = useRef<'start' | 'end' | null>(null);
  const theme: Theme = {
    startColor: '#22c55e', // Bright green
    endColor: '#ef4444',   // Bright red
    wallColor: '#475569',  // Slate 600
    gridColor: '#0f172a',  // Slate 900
  };
  
  const [grid, setGrid] = useState<GridNode[][]>(createInitialGrid({ row: 10, col: 5 }, { row: 10, col: 15 }));
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [algorithm, setAlgorithm] = useState<AlgorithmType>('Dijkstra');
  const [mazeAlgorithm, setMazeAlgorithm] = useState<MazeAlgorithmType>('Recursive Backtracker');
  const [currentBrush, setCurrentBrush] = useState<BrushType>('wall');
  const [metrics, setMetrics] = useState<AlgoMetrics>({
    'Dijkstra': null, 'A*': null, 'BFS': null, 'DFS': null, 'GBFS': null,
    'Bidirectional Dijkstra': null, 'Jump Point Search': null, 'Swarm': null
  });
  const [optimalStatus, setOptimalStatus] = useState<{optimal: number, actual: number, isSuboptimal: boolean, noPath: boolean} | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState(50); // ms per frame
  const [, startTransition] = useTransition();

  // Fix stale closures in Canvas MemoizedNodes
  const stateRef = useRef({ currentBrush, hasSnapshots: snapshots.length > 0 });
  stateRef.current = { currentBrush, hasSnapshots: snapshots.length > 0 };

  // Auto-playback logic
  useEffect(() => {
    if (isPlaying && currentIndex < snapshots.length - 1) {
      const timer = setTimeout(() => {
        startTransition(() => {
          setCurrentIndex(prev => prev + 1);
          
          // Play synth tone based on playback progress for uniform pitch
          const progress = (currentIndex + 1) / snapshots.length;
          const nextSnap = snapshots[currentIndex + 1];
          if (nextSnap.activeNodes.length > 0) {
            const activeNode = nextSnap.grid[nextSnap.activeNodes[0].row][nextSnap.activeNodes[0].col];
            // Stop playing synth when we reach the path tracing phase
            if (activeNode.type !== 'path' && activeNode.type !== 'end') {
              playTone(progress);
            }
          }
        });
      }, playbackSpeed);
      return () => clearTimeout(timer);
    } else if (currentIndex >= snapshots.length - 1) {
      setIsPlaying(false);
    }
  }, [isPlaying, currentIndex, snapshots.length, playbackSpeed]);

  const executeAlgorithm = (algo: AlgorithmType) => {
    initAudio(); // Start audio context on user interaction
    let startNode = grid[10][5];
    let endNode = grid[10][15];
    for (const row of grid) {
      for (const node of row) {
        if (node.type === 'start') startNode = node;
        if (node.type === 'end') endNode = node;
      }
    }
    
    // Clear previous visited/path states but keep walls, swamps, and mountains
    const cleanGrid = grid.map(row => row.map(n => ({
      ...n,
      distance: Infinity,
      distanceF: Infinity,
      distanceB: Infinity,
      previousNode: null,
      previousNodeF: null,
      previousNodeB: null,
      isEvaluating: false,
      isVisited: false,
      isPath: false
    })));

    // Helper to score algorithms only if they find a path
    const getScore = (snaps: Snapshot[]) => {
      const lastSnap = snaps[snaps.length - 1];
      if (!lastSnap) return null;
      // If the last snapshot is backtracking or target reached, it succeeded
      if (lastSnap.description?.includes("Backtrack") || lastSnap.description?.includes("Target reached")) {
        let weight = 0;
        lastSnap.grid.forEach((row, r) => row.forEach((node, c) => {
          if ((node.isPath || node.type === 'end') && node.type !== 'start') weight += getWeight(cleanGrid[r][c].type);
        }));
        return { ops: snaps.length, weight };
      }
      return null; // Failed to find path
    };

    // Get the visual snapshots for the currently selected algorithm first
    let resultSnapshots: Snapshot[] = [];
    switch (algo) {
      case 'A*': resultSnapshots = astar({ grid: cleanGrid, startNode, endNode }); break;
      case 'BFS': resultSnapshots = bfs({ grid: cleanGrid, startNode, endNode }); break;
      case 'DFS': resultSnapshots = dfs({ grid: cleanGrid, startNode, endNode }); break;
      case 'GBFS': resultSnapshots = gbfs({ grid: cleanGrid, startNode, endNode }); break;
      case 'Bidirectional Dijkstra': resultSnapshots = bidirectional({ grid: cleanGrid, startNode, endNode }); break;
      case 'Jump Point Search': resultSnapshots = jps({ grid: cleanGrid, startNode, endNode }); break;
      case 'Swarm': resultSnapshots = swarm({ grid: cleanGrid, startNode, endNode }); break;
      case 'Dijkstra':
      default: resultSnapshots = dijkstra({ grid: cleanGrid, startNode, endNode }); break;
    }

    startTransition(() => {
      setSnapshots(resultSnapshots);
      setCurrentIndex(0);
      setIsPlaying(true);
    });

    // Run ALL algorithms asynchronously to populate the scoreboard without blocking the UI
    setTimeout(() => {
      const dijkstraSnaps = algo === 'Dijkstra' ? resultSnapshots : dijkstra({ grid: cleanGrid, startNode, endNode });
      
      const actualScoreObj = getScore(resultSnapshots);
      const actualCost = actualScoreObj ? actualScoreObj.weight : Infinity;

      const optimalScoreObj = getScore(dijkstraSnaps);
      const optimalCost = optimalScoreObj ? optimalScoreObj.weight : Infinity;

      if (actualCost === Infinity || optimalCost === Infinity) {
        setOptimalStatus({
          optimal: 0,
          actual: 0,
          isSuboptimal: false,
          noPath: true
        });
      } else {
        setOptimalStatus({
          optimal: optimalCost,
          actual: actualCost,
          isSuboptimal: actualCost > optimalCost,
          noPath: false
        });
      }

      const actualScore = getScore(resultSnapshots);

      const computedMetrics = {
        'Dijkstra': algo === 'Dijkstra' ? actualScore : getScore(dijkstraSnaps),
        'A*': algo === 'A*' ? actualScore : getScore(astar({ grid: cleanGrid, startNode, endNode })),
        'BFS': algo === 'BFS' ? actualScore : getScore(bfs({ grid: cleanGrid, startNode, endNode })),
        'DFS': algo === 'DFS' ? actualScore : getScore(dfs({ grid: cleanGrid, startNode, endNode })),
        'GBFS': algo === 'GBFS' ? actualScore : getScore(gbfs({ grid: cleanGrid, startNode, endNode })),
        'Bidirectional Dijkstra': algo === 'Bidirectional Dijkstra' ? actualScore : getScore(bidirectional({ grid: cleanGrid, startNode, endNode })),
        'Jump Point Search': algo === 'Jump Point Search' ? actualScore : getScore(jps({ grid: cleanGrid, startNode, endNode })),
        'Swarm': algo === 'Swarm' ? actualScore : getScore(swarm({ grid: cleanGrid, startNode, endNode })),
      };
      setMetrics(computedMetrics);
    }, 10);
  };

  const handleRun = () => executeAlgorithm(algorithm);

  const handleReset = () => {
    setIsPlaying(false);
    setSnapshots([]);
    setCurrentIndex(0);
    setMetrics({ 
      'Dijkstra': null, 'A*': null, 'BFS': null, 'DFS': null, 'GBFS': null,
      'Bidirectional Dijkstra': null, 'Jump Point Search': null, 'Swarm': null 
    });
    setOptimalStatus(null);
    setGrid(createInitialGrid({ row: 10, col: 5 }, { row: 10, col: 15 }));
  };

  const handleGenerateMaze = () => {
    if (isPlaying) return;
    let startPos = { row: 10, col: 5 };
    let endPos = { row: 10, col: 15 };
    for (const row of grid) {
      for (const node of row) {
        if (node.type === 'start') startPos = { row: node.row, col: node.col };
        if (node.type === 'end') endPos = { row: node.row, col: node.col };
      }
    }
    
    let newGrid = grid;
    switch (mazeAlgorithm) {
      case 'Recursive Backtracker': newGrid = generateMaze(grid, startPos, endPos); break;
      case 'Cellular Automata': newGrid = generateCellularMaze(grid, startPos, endPos); break;
      case 'Kruskal': newGrid = generateKruskalMaze(grid, startPos, endPos); break;
      case 'Recursive Division': newGrid = generateRecursiveDivisionMaze(grid, startPos, endPos); break;
    }
    setGrid(newGrid);
    setSnapshots([]);
    setCurrentIndex(0);
  };

  const handleScrub = (index: number) => {
    setIsPlaying(false);
    startTransition(() => {
      setCurrentIndex(index);
    });
  };

  const handleMouseUp = () => {
    draggingNode.current = null;
  };

  useEffect(() => {
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, []);

  const applyBrush = (row: number, col: number) => {
    if (stateRef.current.hasSnapshots) return; // Disable drawing if algo ran
    setGrid(prevGrid => {
      const newGrid = [...prevGrid];
      const node = newGrid[row][col];
      if (node.type === 'start' || node.type === 'end') return prevGrid;
      
      const brush = stateRef.current.currentBrush;
      let targetType: NodeType = 'unvisited';
      if (brush === 'wall') targetType = 'wall';
      else if (brush === 'swamp') targetType = 'swamp';
      else if (brush === 'mountain') targetType = 'mountain';
      
      if (node.type !== targetType) {
        newGrid[row] = [...newGrid[row]];
        newGrid[row][col] = { ...node, type: targetType };
        return newGrid;
      }
      return prevGrid;
    });
  };

  const moveNode = (row: number, col: number, type: 'start' | 'end') => {
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
  };

  const handleMouseDown = (row: number, col: number) => {
    if (stateRef.current.hasSnapshots) return;
    const node = grid[row][col];
    
    draggingNode.current = null; // Clear stuck drag states
    
    if (node.type === 'start') {
      draggingNode.current = 'start';
      return;
    }
    if (node.type === 'end') {
      draggingNode.current = 'end';
      return;
    }
    
    applyBrush(row, col);
  };

  const handleMouseEnter = (row: number, col: number) => {
    if (stateRef.current.hasSnapshots) return;
    
    if (draggingNode.current) {
      moveNode(row, col, draggingNode.current);
      return;
    }
    
    applyBrush(row, col);
  };

  // Determine current grid to show:
  const currentSnapshot = snapshots[currentIndex];
  const displayGrid = currentSnapshot ? currentSnapshot.grid : grid;

  return (
    <div className="relative h-screen w-screen overflow-hidden flex text-cyan-50 selection:bg-cyan-500/30">

      {/* Main 3D Canvas Area */}
      <div className="absolute inset-0 z-10 flex items-center justify-center">
        <Canvas 
          grid={displayGrid}
          theme={theme}
          onNodeClick={handleMouseDown}
          onNodeMouseEnter={handleMouseEnter}
        />
      </div>

      {/* Floating HUD Panels */}
      
      {/* Top Left HUD */}
      <div className="absolute top-8 left-8 bottom-28 z-50 w-72 flex flex-col pointer-events-none">
        <div className="hud-panel p-4 border-cyan-500/30 relative z-50 pointer-events-auto flex-shrink-0">
          <h1 className="text-xl font-bold text-cyan-400 mb-0.5 tracking-[0.2em] uppercase drop-shadow-[0_0_10px_cyan]">
            AlgoVision
          </h1>
          <p className="text-cyan-500/50 text-[10px] font-semibold tracking-widest uppercase mb-3">Sys.Pathfinder v3.0</p>
          
          {/* Legend */}
          <div className="flex flex-wrap gap-x-2 gap-y-1.5 mb-4 text-[9px] uppercase tracking-wider font-bold text-cyan-500/80">
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-emerald-500 border border-emerald-300"></div> START</div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-rose-500 border border-rose-300"></div> END</div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-amber-400 border border-white"></div> PATH</div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-slate-600 border border-slate-500"></div> WALL</div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-teal-600 border border-teal-500"></div> SWAMP (5)</div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-violet-700 border border-violet-500"></div> MOUNT (10)</div>
          </div>
          
          <div className="space-y-4">
            <div className="relative z-[60]">
              <label className="text-[9px] font-bold text-cyan-500/80 uppercase tracking-widest mb-1 block">
                Target Algorithm
              </label>
              <CustomDropdown 
                options={ALGORITHMS}
                value={algorithm}
                onChange={(v) => {
                  const newAlgo = v as AlgorithmType;
                  setAlgorithm(newAlgo);
                  if (snapshots.length > 0) {
                    executeAlgorithm(newAlgo);
                  }
                }}
                disabled={isPlaying}
              />
            </div>

            <div className="space-y-1.5 relative z-[55]">
              <label className="text-[9px] font-bold text-cyan-500/80 uppercase tracking-widest mb-1 block">
                Paintbrush Tool
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'wall', label: 'Wall (∞)' },
                  { id: 'swamp', label: 'Swamp (5)' },
                  { id: 'mountain', label: 'Mount (10)' },
                  { id: 'eraser', label: 'Eraser' }
                ].map((brush) => (
                  <button
                    key={brush.id}
                    onClick={() => setCurrentBrush(brush.id as BrushType)}
                    disabled={isPlaying || snapshots.length > 0}
                    className={`py-1.5 px-1.5 text-[9px] font-bold tracking-widest uppercase transition-all border ${
                      currentBrush === brush.id 
                        ? 'bg-cyan-500/30 border-cyan-400 text-cyan-100 shadow-[0_0_10px_rgba(34,211,238,0.3)]' 
                        : 'bg-cyan-950/20 border-cyan-900/50 text-cyan-600 hover:bg-cyan-900/40 hover:border-cyan-500/30'
                    } ${snapshots.length > 0 || isPlaying ? 'opacity-30 cursor-not-allowed' : ''}`}
                  >
                    {brush.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex gap-2">
                {snapshots.length === 0 ? (
                  <button 
                    onClick={handleRun}
                    className="flex-1 py-2 px-3 bg-cyan-500/20 hover:bg-cyan-400/30 border border-cyan-500/50 text-cyan-50 font-bold tracking-[0.2em] text-[10px] transition-all"
                  >
                    EXECUTE
                  </button>
                ) : (
                  <button 
                    onClick={() => {
                      setSnapshots([]);
                      setIsPlaying(false);
                      setCurrentIndex(0);
                    }}
                    className="flex-1 py-2 px-3 bg-yellow-500/20 hover:bg-yellow-400/30 border border-yellow-500/50 text-yellow-100 font-bold tracking-[0.2em] text-[10px] transition-all"
                  >
                    EDIT MAZE
                  </button>
                )}
                <button 
                  onClick={handleReset}
                  className="flex-1 py-2 px-3 bg-red-500/20 hover:bg-red-400/30 border border-red-500/50 text-red-100 font-bold tracking-[0.2em] text-[10px] transition-all"
                >
                  CLEAR ALL
                </button>
              </div>
              <AnimatePresence>
                {snapshots.length === 0 && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
                    animate={{ opacity: 1, height: 'auto', overflow: 'visible' }}
                    exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                    transition={{ duration: 0.3 }}
                    className="space-y-3 border-t border-cyan-500/30 relative z-[50]"
                  >
                    <div className="pt-3 space-y-3">
                      <div>
                        <label className="text-[9px] font-bold text-emerald-500/80 uppercase tracking-widest mb-1.5 block">
                          Maze Generator
                        </label>
                        <CustomDropdown 
                          options={MAZE_ALGORITHMS}
                          value={mazeAlgorithm}
                          onChange={(v) => setMazeAlgorithm(v as MazeAlgorithmType)}
                          disabled={isPlaying || snapshots.length > 0}
                        />
                      </div>
                      
                      <button 
                        onClick={handleGenerateMaze}
                        disabled={snapshots.length > 0 || isPlaying}
                        className="w-full py-2 px-3 bg-emerald-500/20 hover:bg-emerald-400/30 border border-emerald-500/50 text-emerald-100 font-bold tracking-[0.2em] text-[10px] transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-emerald-500/20"
                      >
                        BUILD MAZE
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {snapshots.length > 0 && currentSnapshot && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="pointer-events-auto flex-1 min-h-0 flex flex-col w-full max-w-full"
            >
              <CodePanel 
                algorithm={algorithm} 
                currentLine={currentSnapshot.currentLine} 
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Top Right HUD: Scoreboard */}
      <div className="absolute top-8 right-8 z-50 pointer-events-none flex flex-col gap-6 bottom-28 w-80">
        <div className="pointer-events-auto flex-shrink-0">
          <ScoreBoard metrics={metrics} currentAlgorithm={algorithm} />
        </div>
      </div>

      {/* Optimal Checker Badge */}
      {snapshots.length > 0 && optimalStatus && (
        <div className="absolute top-8 left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
          {optimalStatus.noPath ? (
            <div className="hud-panel px-6 py-3 border-yellow-500/50 bg-yellow-950/40 flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-yellow-500 shadow-[0_0_10px_yellow] animate-pulse" />
              <span className="text-yellow-400 font-bold tracking-widest text-[10px] uppercase">
                No Valid Path Found
              </span>
            </div>
          ) : optimalStatus.isSuboptimal ? (
            <div className="hud-panel px-6 py-3 border-red-500/50 bg-red-950/40 flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_10px_red] animate-pulse" />
              <span className="text-red-400 font-bold tracking-widest text-[10px] uppercase">
                Suboptimal Path Found: Path Weight {optimalStatus.actual} (Optimal is {optimalStatus.optimal})
              </span>
            </div>
          ) : (
            <div className="hud-panel px-6 py-3 border-emerald-500/50 bg-emerald-950/40 flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
              <span className="text-emerald-400 font-bold tracking-widest text-[10px] uppercase">
                Optimal Path Guaranteed (Path Weight {optimalStatus.actual})
              </span>
            </div>
          )}
        </div>
      )}

      {/* Bottom HUD */}
      {snapshots.length > 0 && currentSnapshot && (
        <TimelineControl 
          currentIndex={currentIndex}
          totalSnapshots={snapshots.length}
          isPlaying={isPlaying}
          onPlayPause={() => setIsPlaying(!isPlaying)}
          onScrub={handleScrub}
          onReset={handleReset}
          description={currentSnapshot.description || ""}
          speed={playbackSpeed}
          onSpeedChange={setPlaybackSpeed}
        />
      )}
    </div>
  );
}
