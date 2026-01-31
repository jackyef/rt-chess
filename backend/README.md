# Backend Architecture

This backend follows a clean, modular architecture with clear separation of concerns.

## Directory Structure

```
backend/
├── index.ts                    # Main entry point - server configuration
├── types/                      # Type definitions
│   ├── index.ts               # Barrel export
│   ├── game.types.ts          # Game-related types
│   └── websocket.types.ts     # WebSocket message types
├── routes/                     # HTTP route handlers
│   ├── identity.routes.ts     # Identity/auth routes
│   └── game.routes.ts         # Game CRUD routes
├── handlers/                   # WebSocket event handlers
│   └── websocket.handler.ts   # WebSocket connection/message handlers
├── services/                   # Business logic
│   └── game.service.ts        # Game state transformations
├── middleware/                 # Middleware functions
│   └── auth.ts                # Authentication middleware
├── utils/                      # Utility functions
│   └── websocket.utils.ts     # WebSocket message builders
└── stores/                     # In-memory data stores
    └── gameStores.ts          # Game state management
```

## Design Principles

### 1. **Single Responsibility**

Each module has a clear, focused purpose:

- Routes handle HTTP request/response
- Handlers manage WebSocket events
- Services contain business logic
- Stores manage state
- Utils provide reusable helpers

### 2. **Type Safety**

Types are organized by domain:

- `game.types.ts` - Game domain types
- `websocket.types.ts` - WebSocket communication types

### 3. **Separation of Concerns**

- **Routes**: HTTP endpoint definitions and basic validation
- **Handlers**: WebSocket event processing
- **Services**: Business logic and transformations
- **Middleware**: Cross-cutting concerns (auth, logging, etc.)
- **Utils**: Pure helper functions

### 4. **Testability**

Each module can be tested independently:

- Pure functions in services and utils
- Handlers can be tested with mock WebSocket objects
- Routes can be tested with mock requests

## Key Modules

### `index.ts`

Clean server configuration that imports and wires together all components. Should be easy to read and understand the overall structure.

### `routes/`

HTTP route handlers that:

- Validate requests
- Call appropriate services
- Return responses

### `handlers/`

WebSocket event handlers that:

- Parse incoming messages
- Validate player turns
- Update game state
- Broadcast updates

### `services/`

Business logic that:

- Transforms game state
- Determines game outcomes
- Provides game utilities

### `types/`

TypeScript type definitions that:

- Ensure type safety across the codebase
- Document data structures
- Enable IDE autocomplete

## Adding New Features

1. **New API endpoint**: Add to `routes/`
2. **New WebSocket message**: Update `types/websocket.types.ts` and add handler in `handlers/`
3. **New business logic**: Add to `services/`
4. **New utility function**: Add to `utils/`

## Migration Notes

Old files preserved with `.old` extension can be removed after verification:

- `index.ts.old`
- `lib/auth.ts` → moved to `middleware/auth.ts`
- `lib/gameToBoardState.ts` → moved to `services/game.service.ts`
- `lib/websocket.ts` → split into `types/websocket.types.ts` and `utils/websocket.utils.ts`
- `types.ts` → split into `types/game.types.ts` and `types/websocket.types.ts`
