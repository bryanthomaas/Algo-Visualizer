import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../utils/cn';

// Define AlgorithmType here to match App.tsx if needed, or import if exported. 
// App.tsx defines it internally, but we can just use string.
type AlgorithmType = 'Dijkstra' | 'A*' | 'BFS' | 'DFS' | 'GBFS' | 'Bidirectional Dijkstra' | 'Jump Point Search' | 'Swarm';

interface ScoreBoardProps {
  metrics: Record<AlgorithmType, { ops: number, weight: number } | null>;
  currentAlgorithm: AlgorithmType;
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({ metrics, currentAlgorithm }) => {
  const algorithms: AlgorithmType[] = ['A*', 'GBFS', 'BFS', 'Dijkstra', 'DFS', 'Bidirectional Dijkstra', 'Jump Point Search', 'Swarm'];

  // Sort algorithms by score if metrics exist (lowest weight is best, tiebreaker is lowest ops)
  const sortedAlgorithms = [...algorithms].sort((a, b) => {
    const scoreA = metrics[a];
    const scoreB = metrics[b];
    if (scoreA === null && scoreB === null) return 0;
    if (scoreA === null) return 1;
    if (scoreB === null) return -1;
    
    if (scoreA.weight !== scoreB.weight) {
      return scoreA.weight - scoreB.weight;
    }
    return scoreA.ops - scoreB.ops;
  });

  return (
    <div className="hud-panel p-4 w-72 pointer-events-auto">
      <div className="flex items-center justify-between border-b border-cyan-500/30 pb-3 mb-4">
        <div className="flex w-full justify-between items-end">
          <span className="text-[10px] font-bold text-cyan-500/80 uppercase tracking-widest">Algorithm</span>
          <div className="flex gap-3">
            <span className="text-[10px] font-bold text-emerald-500/80 uppercase tracking-widest text-right w-12">Weight</span>
            <span className="text-[10px] font-bold text-cyan-500/80 uppercase tracking-widest text-right w-12">Ops</span>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col gap-2">
        {sortedAlgorithms.map((algo, index) => {
          const score = metrics[algo];
          const isCurrent = algo === currentAlgorithm;
          
          return (
            <motion.div 
              layout
              key={algo} 
              className={cn(
                "flex justify-between items-center p-3 border transition-colors",
                isCurrent ? "bg-cyan-500/20 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)]" : "bg-cyan-950/20 border-cyan-900/50"
              )}
            >
              <div className="flex items-center gap-2 flex-1 min-w-0 pr-2">
                <span className={cn(
                  "font-mono text-[10px] w-4 flex-shrink-0 opacity-50",
                  isCurrent ? "text-cyan-300" : "text-cyan-600"
                )}>
                  {score !== null ? `#${index + 1}` : '-'}
                </span>
                <span className={cn(
                  "font-mono text-xs tracking-wider break-words",
                  isCurrent ? "text-cyan-50 font-bold" : "text-cyan-500"
                )}>
                  {algo === 'Bidirectional Dijkstra' ? 'Bi-Dijkstra' : algo}
                </span>
              </div>
              <div className="flex gap-3 items-center flex-shrink-0">
                <span className={cn(
                  "font-mono text-sm tracking-wider text-right w-12",
                  isCurrent ? "text-emerald-300 font-bold" : "text-emerald-500/70",
                  !score && "opacity-30"
                )}>
                  {score !== null ? `${score.weight}` : '-'}
                </span>
                <span className={cn(
                  "font-mono text-sm tracking-wider text-right w-12",
                  isCurrent ? "text-cyan-300 font-bold" : "text-cyan-600",
                  !score && "opacity-30"
                )}>
                  {score !== null ? `${score.ops}` : '-'}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
