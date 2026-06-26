# AlgoVisualizer

An interactive, isometric algorithm visualizer built with React, TypeScript, and Tailwind CSS. 
AlgoVisualizer allows you to build custom mazes, place start and end points, and watch pathfinding algorithms search for the optimal route in real-time.

## Features

- **Multiple Algorithms**: Visualize A*, Dijkstra, Breadth-First Search (BFS), Depth-First Search (DFS), Greedy Best-First Search (GBFS), Bidirectional Dijkstra, Jump Point Search, and Swarm.
- **Dynamic Terrain**: Paint the grid with walls, high-cost mountains, and low-cost swamps to see how algorithms adapt.
- **Maze Generators**: Instantly generate complex mazes using Recursive Backtracking, Cellular Automata, Kruskal's, or Recursive Division algorithms.
- **3D Isometric View**: Beautiful, hardware-accelerated 3D isometric rendering with CSS transforms and Tailwind.
- **Real-Time Leaderboard**: Compete algorithms against each other to see which one performs the fewest operations to find the target.

## Running Locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

## Tech Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS v4
- Framer Motion
- Lucide Icons
