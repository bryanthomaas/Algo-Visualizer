import { motion } from 'framer-motion';
import { cn } from '../utils/cn';

interface CodePanelProps {
  algorithm: string;
  currentLine: number;
}

const DIJKSTRA_CODE = [
  { id: 1, text: "function Dijkstra(Graph, source):" },
  { id: 2, text: "  for each vertex v in Graph:" },
  { id: 3, text: "    dist[v] ← infinity" },
  { id: 4, text: "    prev[v] ← undefined" },
  { id: 5, text: "    add v to Q" },
  { id: 6, text: "  dist[source] ← 0" },
  { id: 7, text: "  while Q is not empty:" },
  { id: 8, text: "    u ← vertex in Q with min dist[u]" },
  { id: 9, text: "    remove u from Q" },
  { id: 10, text: "    for each neighbor v of u:" },
  { id: 11, text: "      alt ← dist[u] + length(u, v)" },
  { id: 12, text: "      if alt < dist[v]:" },
  { id: 13, text: "        dist[v] ← alt" },
  { id: 14, text: "        prev[v] ← u" },
];

const ASTAR_CODE = [
  { id: 1, text: "function A_Star(start, goal):" },
  { id: 2, text: "  openSet := {start}" },
  { id: 3, text: "  gScore[start] := 0" },
  { id: 4, text: "  fScore[start] := h(start)" },
  { id: 5, text: "  while openSet is not empty:" },
  { id: 6, text: "    current := lowest fScore[] node" },
  { id: 7, text: "    if current = goal:" },
  { id: 8, text: "      return reconstruct_path()" },
  { id: 9, text: "    openSet.Remove(current)" },
  { id: 10, text: "    for each neighbor:" },
  { id: 11, text: "      tent_gScore := gScore + d" },
  { id: 12, text: "      if tent_gScore < gScore:" },
  { id: 13, text: "        cameFrom[n] := current" },
  { id: 14, text: "        gScore[n] := tent_gScore" },
  { id: 15, text: "        fScore[n] := tent_gScore + h" },
];

const BFS_CODE = [
  { id: 1, text: "function BFS(start, goal):" },
  { id: 2, text: "  Queue Q := {start}" },
  { id: 3, text: "  mark start as visited" },
  { id: 4, text: "  while Q is not empty:" },
  { id: 5, text: "    current := Q.dequeue()" },
  { id: 6, text: "    if current = goal:" },
  { id: 7, text: "      return reconstruct_path()" },
  { id: 8, text: "    for each neighbor:" },
  { id: 9, text: "      if neighbor is not visited:" },
  { id: 10, text: "        mark neighbor as visited" },
  { id: 11, text: "        cameFrom[n] := current" },
  { id: 12, text: "        Q.enqueue(neighbor)" },
];

const DFS_CODE = [
  { id: 1, text: "function DFS(start, goal):" },
  { id: 2, text: "  Stack S := {start}" },
  { id: 3, text: "  while S is not empty:" },
  { id: 4, text: "    current := S.pop()" },
  { id: 5, text: "    if current is not visited:" },
  { id: 6, text: "      mark current as visited" },
  { id: 7, text: "      if current = goal:" },
  { id: 8, text: "        return reconstruct_path()" },
  { id: 9, text: "      for each neighbor:" },
  { id: 10, text: "        cameFrom[n] := current" },
  { id: 11, text: "        S.push(neighbor)" },
];

const GBFS_CODE = [
  { id: 1, text: "function Greedy_Best_First(start, goal):" },
  { id: 2, text: "  PriorityQueue PQ := {start}" },
  { id: 3, text: "  while PQ is not empty:" },
  { id: 4, text: "    current := PQ.dequeue() (min h)" },
  { id: 5, text: "    if current = goal:" },
  { id: 6, text: "      return reconstruct_path()" },
  { id: 7, text: "    mark current as visited" },
  { id: 8, text: "    for each neighbor:" },
  { id: 9, text: "      if neighbor is not visited:" },
  { id: 10, text: "        cameFrom[n] := current" },
  { id: 11, text: "        PQ.enqueue(neighbor)" },
];

const BIDIJKSTRA_CODE = [
  { id: 1, text: "function Bidirectional_Dijkstra(start, goal):" },
  { id: 2, text: "  openSetF := {start}, openSetB := {goal}" },
  { id: 3, text: "  while openSetF and openSetB not empty:" },
  { id: 4, text: "    currentF := min dist node in openSetF" },
  { id: 5, text: "    if currentF in openSetB: return path" },
  { id: 6, text: "    expand currentF neighbors into openSetF" },
  { id: 7, text: "    currentB := min dist node in openSetB" },
  { id: 8, text: "    if currentB in openSetF: return path" },
  { id: 9, text: "    expand currentB neighbors into openSetB" },
  { id: 10, text: "  return No_Path_Found" },
];

const JPS_CODE = [
  { id: 1, text: "function Jump_Point_Search(start, goal):" },
  { id: 2, text: "  openSet := {start}" },
  { id: 3, text: "  while openSet is not empty:" },
  { id: 4, text: "    current := lowest fScore[] node" },
  { id: 5, text: "    if current = goal: return path" },
  { id: 6, text: "    for each direction in cardinal_directions:" },
  { id: 7, text: "      jump_point := jump(current, direction)" },
  { id: 8, text: "      if jump_point is valid:" },
  { id: 9, text: "        update costs and add to openSet" },
];

const SWARM_CODE = [
  { id: 1, text: "function Swarm_Search(start, goal):" },
  { id: 2, text: "  openSet := {start}" },
  { id: 3, text: "  while openSet is not empty:" },
  { id: 4, text: "    current := lowest fScore[] node" },
  { id: 5, text: "    if current = goal: return path" },
  { id: 6, text: "    for each neighbor:" },
  { id: 7, text: "      tentativeG = current.g + 1" },
  { id: 8, text: "      if tentativeG < neighbor.g:" },
  { id: 9, text: "        neighbor.f = g + h_weight * heuristic()" },
  { id: 10, text: "        openSet.add(neighbor)" },
];

export const CodePanel: React.FC<CodePanelProps> = ({ algorithm, currentLine }) => {
  const getCodeLines = () => {
    switch (algorithm) {
      case 'A*': return ASTAR_CODE;
      case 'BFS': return BFS_CODE;
      case 'DFS': return DFS_CODE;
      case 'GBFS': return GBFS_CODE;
      case 'Bidirectional Dijkstra': return BIDIJKSTRA_CODE;
      case 'Jump Point Search': return JPS_CODE;
      case 'Swarm': return SWARM_CODE;
      case 'Dijkstra':
      default:
        return DIJKSTRA_CODE;
    }
  };
  
  const getMappedLine = () => {
    switch (algorithm) {
      case 'Dijkstra': {
        const mapping: Record<number, number> = { 1: 3, 3: 8, 5: 7, 6: 12, 8: 7, 9: 14 };
        return mapping[currentLine] || 1;
      }
      case 'A*': {
        const mapping: Record<number, number> = { 1: 2, 3: 6, 5: 8, 6: 12, 8: 5, 9: 8 };
        return mapping[currentLine] || 1;
      }
      case 'BFS': {
        const mapping: Record<number, number> = { 1: 2, 3: 5, 5: 7, 7: 12, 9: 7 };
        return mapping[currentLine] || 1;
      }
      case 'DFS': {
        const mapping: Record<number, number> = { 1: 2, 3: 4, 5: 8, 7: 11, 9: 8 };
        return mapping[currentLine] || 1;
      }
      case 'GBFS': {
        const mapping: Record<number, number> = { 1: 2, 3: 4, 5: 6, 7: 11, 9: 6 };
        return mapping[currentLine] || 1;
      }
      case 'Bidirectional Dijkstra': {
        // Line mappings based on bidirectional.ts snapshot points
        // 1: init, 3: eval F, 5: met, 7: eval B, 9: expanded, 11/12: backtrack
        const mapping: Record<number, number> = { 1: 2, 3: 4, 5: 5, 7: 7, 9: 3, 11: 5, 12: 8 };
        return mapping[currentLine] || 1;
      }
      case 'Jump Point Search': {
        // Line mappings based on jps.ts snapshot points
        // 1: init, 3: eval, 5: target reached, 6: traced rays, 9: backtrack
        const mapping: Record<number, number> = { 1: 2, 3: 4, 5: 5, 6: 9, 9: 5 };
        return mapping[currentLine] || 1;
      }
      case 'Swarm': {
        // Line mappings based on swarm.ts snapshot points
        // 1: init, 3: eval, 5: target reached, 6: update neighbors, 9: backtrack
        const mapping: Record<number, number> = { 1: 2, 3: 4, 5: 5, 6: 10, 9: 5 };
        return mapping[currentLine] || 1;
      }
      default: return 1;
    }
  };

  const codeLines = getCodeLines();
  const activeLine = getMappedLine();

  return (
    <div className="flex flex-col hud-panel overflow-hidden mt-6 flex-1 min-h-0 pointer-events-auto relative z-40">
      <div className="flex items-center gap-3 p-4 border-b border-cyan-500/20 bg-cyan-900/10">
        <div className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_8px_cyan]" />
        <h2 className="font-bold text-cyan-100 tracking-[0.2em] text-[10px] uppercase">{algorithm}_EXEC.sh</h2>
      </div>
      
      <div className="p-4 flex flex-col gap-[2px] overflow-y-auto font-mono text-[11px] leading-tight">
        {codeLines.map((line) => {
          const isActive = line.id === activeLine;
          return (
            <div 
              key={line.id} 
              className={cn(
                "px-3 py-1 transition-colors duration-200 relative overflow-hidden",
                isActive ? "bg-cyan-500/20 text-cyan-100 font-bold shadow-[inset_0_0_15px_rgba(34,211,238,0.2)]" : "text-cyan-100/40"
              )}
            >
              {isActive && (
                <motion.div 
                  layoutId="active-hud-line"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className="absolute left-0 top-0 bottom-0 w-[2px] bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,1)]"
                />
              )}
              <span className="opacity-30 mr-5 w-4 inline-block text-right select-none">{line.id}</span>
              <span className="whitespace-pre tracking-wider">{line.text}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
