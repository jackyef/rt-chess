# Frontend Architecture

This Vue 3 frontend follows modern best practices with clear separation of concerns and organized code structure.

## Directory Structure

```
src/
├── main.ts                     # Application entry point
├── App.vue                     # Root component
│
├── api/                        # API client layer (HTTP & WebSocket)
│   ├── identity.api.ts        # Identity/auth API
│   ├── game.api.ts            # Game state API
│   └── websocket.api.ts       # WebSocket client
│
├── stores/                     # Pinia state management
│   ├── identity.ts            # Identity store
│   └── game/                  # Game-related stores
│       ├── chessboard.ts      # Solo game store
│       └── chessboardPvp.ts   # PvP game store
│
├── components/                 # Reusable Vue components
│   ├── IdentityForm.vue       # User identity form
│   └── ChessBoard/            # Chess board components
│       ├── ChessBoard.vue     # Solo chess board, used when starting a prototype. Unused now.
│       ├── ChessBoardPvp.vue  # PvP chess board
│       ├── ChessPiece.vue     # Individual piece
│       ├── ChessSquare.vue    # Board square
│       ├── CountdownTimer.vue # Game timer
│       ├── GameStatus.vue     # Game status display
│       ├── JoinGame.vue       # Join game UI
│       ├── PlayerInfo.vue     # Player information
│       ├── PromotionDialog.vue# Pawn promotion UI
│       ├── constants.ts       # Chess constants
│       └── assets/            # Chess piece images
│
├── views/                      # Page-level components
│   ├── HomeView.vue           # Home page
│   ├── PvPView.vue            # PvP lobby
│   ├── PvPGameView.vue        # PvP game page
│   └── SoloView.vue           # Solo game page
│
├── router/                     # Vue Router configuration
│   └── index.ts               # Route definitions
│
├── types/                      # TypeScript type definitions
│   ├── api.types.ts           # Shared API types
│   └── errors.ts              # Custom error classes
│
└── assets/                     # Global styles and assets
    ├── base.css               # Base styles
    └── main.css               # Main styles
```

## Architecture Principles

### 1. **Layered Architecture**

- **API Layer** (`api/`) - Handles all external communication
- **State Layer** (`stores/`) - Manages application state with Pinia
- **Component Layer** (`components/`, `views/`) - UI presentation
- **Router Layer** (`router/`) - Navigation management

### 2. **API Layer Design**

Clean separation of concerns:

- `identity.api.ts` - Authentication and user identity
- `game.api.ts` - Game CRUD operations (create, join, get state)
- `websocket.api.ts` - Real-time communication with pub/sub pattern

Benefits:

- Easy to mock for testing
- Can swap implementations (e.g., mock vs real API)
- Clear boundaries between frontend and backend

### 3. **Store Organization**

Pinia stores organized by domain:

- `identity.ts` - User identity management
- `game/chessboard.ts` - Solo game logic
- `game/chessboardPvp.ts` - PvP game logic with WebSocket integration

Each store:

- Encapsulates related state
- Provides clear actions/getters
- Can be composed with other stores

### 4. **Component Organization**

- **Atomic components** - `ChessPiece`, `ChessSquare` (pure presentation)
- **Molecular components** - `ChessBoard`, `PlayerInfo` (composed features)
- **Views** - Page-level components with routing

ChessBoard components are colocated:

- Easy to find related code
- Clear component boundaries
- Direct imports from source files

### 5. **Type Safety**

- `api.types.ts` - Shared types matching backend API contract
- `errors.ts` - Custom error classes for better error handling
- TypeScript throughout for compile-time safety

## Data Flow

```
User Action
     ↓
Component (views/, components/)
     ↓
Store (stores/)
     ↓
API Client (api/)
     ↓
Backend
     ↓
WebSocket (for real-time updates)
     ↓
Store (updates state)
     ↓
Component (re-renders)
```

## Key Features

### Real-time Updates

WebSocket client with pub/sub pattern:

```typescript
const client = createWebSocketGameClient(gameId)
client.subscribe((message) => {
  // Handle real-time updates
})
```

### Error Handling

Custom error classes for better error handling:

- `NetworkError` - HTTP/network issues
- `ValidationError` - Input validation failures
- `GameError` - Game-specific errors

### State Management

Pinia stores with Composition API:

- Reactive state with `ref`/`reactive`
- Computed properties for derived state
- Actions for state mutations

## Adding New Features

### New API Endpoint

1. Add function to appropriate `*.api.ts` file
2. Update types in `api.types.ts` if needed
3. Use in store or component

### New Store

1. Create new file in `stores/` or `stores/game/`
2. Define with `defineStore`
3. Import directly in components: `import { useYourStore } from '@/stores/yourStore'`

### New Component

1. Create `.vue` file in appropriate directory
2. Import directly in parent component
3. Keep related components colocated

## Best Practices

### Import Paths

- Use `@/` alias for `src/` directory
- Import directly from source files (no barrel exports)
- Import from API layer, not directly from backend

### Component Design

- Keep components focused on single responsibility
- Use props for data down, events for data up
- Prefer Composition API with `<script setup>`

### State Management

- Keep stores domain-focused
- Avoid cross-store dependencies when possible
- Use `storeToRefs()` to destructure reactive properties

### Error Handling

- Use try/catch in async operations
- Throw custom error classes
- Display user-friendly error messages

## Migration Notes

### Removed

- `src/stores/counter.ts` - Unused template boilerplate
- `src/lib/clients/gameClient.ts` - Split into API layer

### Reorganized

- API clients moved from `lib/clients/` → `api/`
- Chess stores moved from `components/ChessBoard/stores/` → `stores/game/`
- Types extracted to `types/api.types.ts` for sharing
