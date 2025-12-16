# Diagram Editor – Architecture Notes

## Overview

This project implements a diagram editor for large node networks (≈1000 nodes) using **React**, **TypeScript**, **GoJS**, **MUI**, and **Jest**.  
The architecture focuses on clear separation of concerns, predictable state management using **React state only**, and efficient rendering under the given constraints.

---

## Installation & Run

```bash
npm install
npm run dev      # start development server
npm run build    # production build
npm run preview  # preview build
npm test         # run tests
```

---

## Features

- Create, view, and edit large node networks
- Add single node
- Bulk generate nodes/links
- Node selection with side panel sync
- Unit and integration tests

---

## Architecture

The application is structured around three main parts:

```
NetworkVisualisator (State & orchestration)
├── DiagramWrapper (GoJS integration)
└── SidePanel
```

- **NetworkVisualisator** is the single source of truth for all state:
- nodes, links, model data, selection
- State flows downward into the diagram and UI
- User actions and GoJS events flow upward via callbacks

This ensures no duplicated or conflicting state between React and GoJS.

---

## GoJS Integration

GoJS is fully encapsulated in `DiagramWrapper`:

- The diagram is initialized once and not re-created on re-renders
- Nodes and links use **string keys** (`node-x`, `link-x`)
- Incremental model changes are synced back to React
- `skipsDiagramUpdate` prevents React ↔ GoJS update loops

Diagram selection is synchronized with the side panel via React state.

---

## UI & Performance

The side panel (MUI-based) provides:
- Node list (up to ~1000 items)
- Selection, renaming, add/bulk-generate/clear actions

Performance considerations:
- No external virtualization libraries
- `useMemo` for list rendering
- `useCallback` for stable handlers
- Stable React keys for efficient reconciliation

---

## Testing

Test suits contains:
 - Unit tests for node generation helpers
 - Integration tests that cover following functionality:
    1. Adding a node
    2. Linking nodes
    3. Updating a node name