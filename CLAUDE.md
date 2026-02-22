# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Space-themed FPS browser game** built with React, TypeScript, Vite, and Babylon.js. The game features an immersive 3D FPS experience with laser shooting mechanics, enemy targets, and a scoring system.

### Architecture

- **Frontend Framework**: React 19 + TypeScript
- **Build Tool**: Vite 7
- **3D Engine**: Babylon.js 8
- **Styling**: Inline CSS in React components (no external CSS framework)

### Key Components

- **BabylonScene** (`src/components/BabylonScene.tsx`) - Main game component that handles:
  - Babylon.js engine initialization and scene setup
  - FPS camera with WASD controls and mouse look
  - Pointer lock functionality
  - Laser shooting mechanics with raycasting
  - Enemy creation and collision detection
  - HUD overlay (crosshair, score, instructions)
  - Game state management (score tracking)

- **App** (`src/App.tsx`) - Simple wrapper that renders BabylonScene

- **Entry Point** (`src/main.tsx`) - React root setup with StrictMode

## Development Commands

```bash
npm run dev      # Start Vite dev server with HMR (http://localhost:5173)
npm run build    # Compile TypeScript and build for production
npm run lint     # Run ESLint checks
npm run preview  # Preview production build locally
```

## Project Structure

```
space-fps/
├── src/
│   ├── components/
│   │   └── BabylonScene.tsx    # Main game component
│   ├── App.tsx                  # Root component
│   ├── main.tsx                 # React entry point
│   ├── index.css                # Global styles
│   └── App.css                  # App styles (unused)
├── index.html                   # HTML entry point
├── vite.config.ts               # Vite configuration
├── tsconfig.json                # TypeScript configuration (composite)
├── tsconfig.app.json            # App TypeScript config
├── tsconfig.node.json           # Node TypeScript config
├── eslint.config.js             # ESLint configuration
└── package.json
```

## Key Implementation Details

### Babylon.js Scene Setup

- Engine initialization with automatic resize handling
- Scene with gravity and collision detection enabled
- FPS camera (UniversalCamera) with collision ellipsoid
- Standard materials used for all mesh visuals (no advanced shaders currently)

### Game Mechanics

1. **Movement**: WASD keyboard input, gravity affects vertical movement
2. **Camera Control**: Mouse look with pointer lock on canvas click (ESC to unlock)
3. **Shooting**: Left click to fire lasers; uses raycasting to detect hits
4. **Hit Detection**: Babylon.js `pickWithRay()` checks for collisions with enemy meshes
5. **Enemy Behavior**: Enemies float with sine-wave animation and rotate continuously
6. **Enemy Destruction**: Explosion effect (scale + fade) when hit, adds 10 points to score

### HUD System

- Overlay div with `pointerEvents: 'none'` so clicks pass through to canvas
- Crosshair: Fixed red lines centered on screen
- Score Display: Top-right corner
- Instructions: Bottom center

### Performance Considerations

- Uses `LinesMesh` for laser visuals (efficient for temporary effects)
- Removes enemies from scene via `dispose()` when destroyed
- Clears intervals and cleans up resources in useEffect cleanup
- Collision detection enabled only for necessary meshes

## Important Notes

- **Canvas Management**: The Babylon.js canvas uses `requestPointerLock()` for immersive mouse control. ESC key or manual pointer unlock is required to exit
- **Materials**: All meshes use `StandardMaterial`. For better visuals, consider switching to `PBRMaterial` or adding texture assets
- **State Management**: Score is managed via React state. For future multiplayer or advanced features, consider a state management library
- **Cleanup**: The useEffect cleanup function properly disposes of the scene and engine to prevent memory leaks

## Future Enhancement Areas

- Sound effects and background music
- More sophisticated enemy AI (pathfinding, attacking)
- Health/lives system for the player
- Multiple weapon types with different mechanics
- 3D model assets instead of procedural geometry
- Particle effects system
- Level/wave progression
- Skybox texture replacement
