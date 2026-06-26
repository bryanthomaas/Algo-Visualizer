import React from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, RotateCcw } from 'lucide-react';

interface TimelineControlProps {
  currentIndex: number;
  totalSnapshots: number;
  isPlaying: boolean;
  onPlayPause: () => void;
  onScrub: (index: number) => void;
  onReset: () => void;
  description: string;
  speed: number;
  onSpeedChange: (speed: number) => void;
}

export const TimelineControl: React.FC<TimelineControlProps> = ({
  currentIndex,
  totalSnapshots,
  isPlaying,
  onPlayPause,
  onScrub,
  onReset,
  description,
  speed,
  onSpeedChange
}) => {
  return (
    <motion.div 
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[800px] hud-panel p-4 flex flex-col gap-4 z-50 pointer-events-auto"
    >
      <div className="flex justify-between items-center px-4">
        <span className="text-[10px] font-bold text-cyan-400 bg-cyan-950/40 px-3 py-1 border border-cyan-500/30 uppercase tracking-[0.2em] font-mono tabular-nums flex items-center gap-2">
          [SYS_TICK]: {totalSnapshots > 0 ? currentIndex + 1 : 0} / {totalSnapshots}
        </span>
        <span className="text-xs font-bold text-white uppercase tracking-widest font-mono drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]">
          {description || "AWAITING_INPUT"}
        </span>
      </div>

      <div className="flex items-center gap-6 w-full">
        {/* Controls */}
        <div className="flex items-center gap-2">
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onReset}
            className="p-3 bg-cyan-900/20 hover:bg-cyan-500/20 border border-transparent hover:border-cyan-500/50 transition-colors text-cyan-100"
          >
            <RotateCcw className="w-4 h-4" />
          </motion.button>
          
          <motion.button 
            whileHover={currentIndex > 0 ? { scale: 1.1 } : {}}
            whileTap={currentIndex > 0 ? { scale: 0.9 } : {}}
            onClick={() => onScrub(Math.max(0, currentIndex - 1))}
            disabled={currentIndex === 0}
            className="p-3 bg-cyan-900/20 hover:bg-cyan-500/20 border border-transparent hover:border-cyan-500/50 transition-colors text-cyan-100 disabled:opacity-30"
          >
            <SkipBack className="w-4 h-4" />
          </motion.button>

          <motion.button 
            whileHover={totalSnapshots > 0 ? { scale: 1.05 } : {}}
            whileTap={totalSnapshots > 0 ? { scale: 0.95 } : {}}
            onClick={onPlayPause}
            disabled={totalSnapshots === 0}
            className="p-4 bg-cyan-500 text-black shadow-[0_0_20px_rgba(34,211,238,0.6)] transition-colors disabled:opacity-50 disabled:shadow-none font-bold"
          >
            {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
          </motion.button>

          <motion.button 
            whileHover={currentIndex < totalSnapshots - 1 ? { scale: 1.1 } : {}}
            whileTap={currentIndex < totalSnapshots - 1 ? { scale: 0.9 } : {}}
            onClick={() => onScrub(Math.min(totalSnapshots - 1, currentIndex + 1))}
            disabled={currentIndex === totalSnapshots - 1}
            className="p-3 bg-cyan-900/20 hover:bg-cyan-500/20 border border-transparent hover:border-cyan-500/50 transition-colors text-cyan-100 disabled:opacity-30"
          >
            <SkipForward className="w-4 h-4" />
          </motion.button>
        </div>

        {/* Timeline Scrubber */}
        <div className="flex-1 flex items-center px-4">
          <input 
            type="range" 
            min={0} 
            max={Math.max(0, totalSnapshots - 1)} 
            value={currentIndex}
            onChange={(e) => onScrub(parseInt(e.target.value))}
            className="w-full h-1 bg-cyan-900/50 appearance-none cursor-pointer accent-cyan-400 hover:accent-cyan-300 transition-all focus:outline-none"
          />
        </div>

        {/* Speed Control */}
        <div className="flex items-center gap-3 bg-cyan-900/20 px-4 py-3 border border-cyan-500/20">
          <span className="text-[10px] text-cyan-500 font-bold tracking-widest">SPD</span>
          <input 
            type="range" 
            min={10} 
            max={200} 
            step={10}
            value={210 - speed}
            onChange={(e) => onSpeedChange(210 - parseInt(e.target.value))}
            className="w-20 h-1 bg-cyan-900/50 appearance-none cursor-pointer accent-fuchsia-500 hover:accent-fuchsia-400 transition-all focus:outline-none"
          />
        </div>
      </div>
    </motion.div>
  );
};
