import React, { useState } from 'react';
import { Settings, X } from 'lucide-react';
import type { Theme } from '../core/types';

interface SettingsPanelProps {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ theme, setTheme }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [localTheme, setLocalTheme] = useState(theme);

  // Debounce the heavy Canvas re-render to make the color picker smooth
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setTheme(localTheme);
    }, 30);
    return () => clearTimeout(timer);
  }, [localTheme, setTheme]);

  const handleReset = () => {
    const defaultTheme = {
      startColor: '#ff00aa', // Hot Pink
      endColor: '#39ff14',   // Bright Green
      wallColor: '#38bdf8',  // Frosted Sky Blue
      gridColor: '#13111c',  // Deep Void Purple
    };
    setLocalTheme(defaultTheme);
    setTheme(defaultTheme);
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="absolute bottom-8 right-8 z-50 p-4 bg-black/90 border border-cyan-500/50 text-cyan-400 hover:text-cyan-300 hover:bg-black hover:border-cyan-400 rounded-full shadow-[0_0_20px_rgba(0,255,255,0.2)] transition-all pointer-events-auto"
      >
        <Settings size={24} />
      </button>

      {isOpen && (
        <div className="absolute bottom-28 right-8 w-72 bg-black/95 border border-cyan-500/50 p-6 z-50 shadow-[0_0_50px_rgba(0,255,255,0.2)] backdrop-blur-xl pointer-events-auto flex flex-col gap-6">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-cyan-400 font-bold tracking-[0.2em] text-sm uppercase">Theme Settings</h2>
            <button onClick={() => setIsOpen(false)} className="text-cyan-500/50 hover:text-cyan-400 transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between group">
              <label className="text-xs font-semibold text-cyan-100/70 tracking-widest uppercase group-hover:text-cyan-100 transition-colors cursor-pointer">Start Color</label>
              <div 
                className="relative w-8 h-8 rounded ring-1 ring-cyan-500/50 shadow-[0_0_10px_rgba(0,255,255,0.2)] overflow-hidden"
                style={{ backgroundColor: localTheme.startColor }}
              >
                <input 
                  type="color" 
                  value={localTheme.startColor} 
                  onChange={(e) => setLocalTheme({...localTheme, startColor: e.target.value})}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between group">
              <label className="text-xs font-semibold text-cyan-100/70 tracking-widest uppercase group-hover:text-cyan-100 transition-colors cursor-pointer">End Color</label>
              <div 
                className="relative w-8 h-8 rounded ring-1 ring-cyan-500/50 shadow-[0_0_10px_rgba(0,255,255,0.2)] overflow-hidden"
                style={{ backgroundColor: localTheme.endColor }}
              >
                <input 
                  type="color" 
                  value={localTheme.endColor} 
                  onChange={(e) => setLocalTheme({...localTheme, endColor: e.target.value})}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
              </div>
            </div>

            <div className="flex items-center justify-between group">
              <label className="text-xs font-semibold text-cyan-100/70 tracking-widest uppercase group-hover:text-cyan-100 transition-colors cursor-pointer">Wall Color</label>
              <div 
                className="relative w-8 h-8 rounded ring-1 ring-cyan-500/50 shadow-[0_0_10px_rgba(0,255,255,0.2)] overflow-hidden"
                style={{ backgroundColor: localTheme.wallColor }}
              >
                <input 
                  type="color" 
                  value={localTheme.wallColor} 
                  onChange={(e) => setLocalTheme({...localTheme, wallColor: e.target.value})}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
              </div>
            </div>

            <div className="flex items-center justify-between group">
              <label className="text-xs font-semibold text-cyan-100/70 tracking-widest uppercase group-hover:text-cyan-100 transition-colors cursor-pointer">Grid Color</label>
              <div 
                className="relative w-8 h-8 rounded ring-1 ring-cyan-500/50 shadow-[0_0_10px_rgba(0,255,255,0.2)] overflow-hidden"
                style={{ backgroundColor: localTheme.gridColor }}
              >
                <input 
                  type="color" 
                  value={localTheme.gridColor} 
                  onChange={(e) => setLocalTheme({...localTheme, gridColor: e.target.value})}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
              </div>
            </div>
          </div>
          
          <button 
            onClick={handleReset}
            className="mt-2 py-2 px-4 w-full bg-cyan-950/50 hover:bg-cyan-900 border border-cyan-800 text-cyan-400 text-xs font-semibold tracking-widest uppercase rounded transition-colors"
          >
            Reset to Default
          </button>
        </div>
      )}
    </>
  );
};
