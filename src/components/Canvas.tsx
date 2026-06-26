import React from 'react';
import type { GridNode, Theme } from '../core/types';
import { cn } from '../utils/cn';
import { interpolateColor, hexToRgb } from '../utils/colors';

interface CanvasProps {
  grid: GridNode[][];
  theme: Theme;
  onNodeClick: (row: number, col: number) => void;
  onNodeMouseEnter: (row: number, col: number) => void;
}

interface MemoizedNodeProps {
  node: GridNode;
  theme: Theme;
  maxDist: number;
  onMouseDown: (row: number, col: number) => void;
  onMouseEnter: (row: number, col: number) => void;
}

const MemoizedNode = React.memo(({ node, theme, maxDist, onMouseDown, onMouseEnter }: MemoizedNodeProps) => {
  // Dynamic Color Logic based on User Theme
  const getDynamicStyle = (node: GridNode) => {
    if (node.isEvaluating) return undefined;

    if (node.isPath) {
      return {
        backgroundColor: '#fbbf24',
        boxShadow: `0 0 10px #f59e0b, inset 0 0 15px rgba(255,255,255,0.8)`,
        borderColor: '#ffffff',
      };
    }

    if (node.isVisited && node.distance !== Infinity && node.distance !== undefined && !isNaN(node.distance)) {
      const normalized = Math.min(node.distance / maxDist, 1);
      const color = interpolateColor(theme.startColor, theme.endColor, normalized);
      
      if (node.type === 'swamp') {
        return {
          backgroundColor: `rgba(13, 148, 136, 1)`, // Solid Teal 600
          border: `1px solid rgba(20, 184, 166, 1)`,
          boxShadow: `inset 0 0 15px rgba(0,0,0,0.5)`
        };
      }
      
      if (node.type === 'mountain') {
        return {
          backgroundColor: `rgba(109, 40, 217, 1)`, // Solid Violet 700
          border: `1px solid rgba(139, 92, 246, 1)`,
          boxShadow: `inset 0 0 20px rgba(0,0,0,0.6), 0 5px 10px rgba(0,0,0,0.5)`
        };
      }
      
      return {
        backgroundColor: `rgba(${color.r}, ${color.g}, ${color.b}, 0.5)`,
        borderColor: `rgba(${color.r}, ${color.g}, ${color.b}, 0.8)`,
        boxShadow: `0 0 15px rgba(${color.r}, ${color.g}, ${color.b}, 0.5)`
      };
    }

    if (node.type === 'unvisited') {
      const gridRGB = hexToRgb(theme.gridColor);
      return { backgroundColor: `rgba(${gridRGB.r}, ${gridRGB.g}, ${gridRGB.b}, 0.2)` };
    }
    
    if (node.type === 'wall') {
      const wallRGB = hexToRgb(theme.wallColor);
      return { backgroundColor: `rgba(${wallRGB.r}, ${wallRGB.g}, ${wallRGB.b}, 0.25)` };
    }

    if (node.type === 'swamp') {
      return {
        backgroundColor: `rgba(13, 148, 136, 1)`, // Solid Teal 600
        border: `1px solid rgba(20, 184, 166, 1)`,
        boxShadow: `inset 0 0 15px rgba(0,0,0,0.5)`
      };
    }

    if (node.type === 'mountain') {
      return {
        backgroundColor: `rgba(109, 40, 217, 1)`, // Solid Violet 700
        border: `1px solid rgba(139, 92, 246, 1)`,
        boxShadow: `inset 0 0 20px rgba(0,0,0,0.6), 0 5px 10px rgba(0,0,0,0.5)`
      };
    }

    return undefined;
  };

  let elevationClass = '';
  if (node.isPath) elevationClass = 'elevated-high';
  else if (node.type === 'start' || node.type === 'end') elevationClass = 'elevated-high';
  else if (node.isEvaluating) elevationClass = 'elevated-mid';
  else if (node.type === 'mountain') elevationClass = 'elevated-mid';
  else if (node.type === 'swamp') elevationClass = 'elevated-low';
  else if (node.isVisited) elevationClass = 'elevated-low';

  return (
    <div
      onMouseDown={(e) => {
        e.preventDefault();
        onMouseDown(node.row, node.col);
      }}
      onMouseEnter={(e) => {
        if (e.buttons === 1) {
          onMouseEnter(node.row, node.col);
        }
      }}
      className={cn(
        "isometric-node w-10 h-10 cursor-crosshair relative transition-all duration-300",
        elevationClass,
        "pointer-events-auto cursor-pointer hover:bg-white/20 hover:shadow-[0_0_15px_rgba(255,255,255,0.5)]",
        node.type === 'start' && "bg-emerald-500 border border-emerald-300 shadow-[0_0_30px_rgba(10,185,129,0.8)] !z-30 relative",
        node.type === 'end' && "bg-rose-500 border border-rose-300 shadow-[0_0_30px_rgba(244,63,94,0.8)] !z-30 relative",
        node.isEvaluating && "bg-yellow-400 border border-yellow-200 shadow-[0_0_20px_rgba(250,204,21,1)] !z-40 relative",
        node.isPath && "border-2 z-20 relative"
      )}
      style={getDynamicStyle(node)}
    />
  );
}, (prevProps, nextProps) => {
  if (prevProps.node.type !== nextProps.node.type) return false;
  if (prevProps.node.distance !== nextProps.node.distance) return false;
  if (prevProps.node.isEvaluating !== nextProps.node.isEvaluating) return false;
  if (prevProps.node.isVisited !== nextProps.node.isVisited) return false;
  if (prevProps.node.isPath !== nextProps.node.isPath) return false;
  if (prevProps.theme !== nextProps.theme) return false;
  
  if (prevProps.maxDist !== nextProps.maxDist) {
    if (nextProps.node.isVisited || nextProps.node.isPath) {
      return false; // Force re-render to update dynamic gradient
    }
  }
  return true;
});

export const Canvas: React.FC<CanvasProps> = ({ 
  grid, 
  theme,
  onNodeClick, 
  onNodeMouseEnter
}) => {
  
  // Find start node and max distance ONCE per render for the whole grid
  let maxDist = 1;
  for (let r=0; r<grid.length; r++) {
    for (let c=0; c<grid[r].length; c++) {
      if (grid[r][c].distance !== Infinity && grid[r][c].distance > maxDist) {
        maxDist = grid[r][c].distance;
      }
    }
  }
  return (
    <div className="perspective-container w-full h-full flex items-center justify-center relative">
      <div 
        className="isometric-grid grid gap-[4px]"
        style={{
          gridTemplateColumns: `repeat(${grid[0]?.length || 0}, minmax(0, 1fr))`
        }}
      >
        {grid.map((row, rowIndex) => (
          row.map((node, colIndex) => (
            <MemoizedNode 
              key={`${rowIndex}-${colIndex}`}
              node={node}
              theme={theme}
              maxDist={maxDist}
              onMouseDown={onNodeClick}
              onMouseEnter={onNodeMouseEnter}
            />
          ))
        ))}
      </div>
    </div>
  );
};
