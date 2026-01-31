# rt-chess Code Organization

## 📁 Project Structure

```
rt-chess/
├── backend/                    # Node.js/Bun backend
│   ├── index.ts               # 80 lines - Clean server setup
│   ├── types/                 # Domain-separated types
│   ├── routes/                # HTTP endpoint handlers
│   ├── handlers/              # WebSocket event handlers
│   ├── services/              # Business logic
│   ├── middleware/            # Auth & middleware
│   ├── utils/                 # Helper functions
│   ├── stores/                # In-memory state
│   └── README.md              # Backend architecture guide
│
├── src/                       # Vue 3 frontend
│   ├── api/                   # API client layer
│   ├── stores/                # Pinia state management
│   ├── components/            # Reusable components
│   ├── views/                 # Page components
│   ├── router/                # Vue Router config
│   ├── types/                 # TypeScript types
│   └── README.md              # Frontend architecture guide
│
└── e2e/                       # End-to-end tests
```

## 🎯 Architecture Overview

### Backend (Bun + TypeScript)

Clean, modular architecture with clear separation of concerns:

```
HTTP Requests → Routes → Middleware → Services → Stores
WebSocket → Handlers → Services → Stores
```

**Key Features:**

- Routes organized by resource (identity, game)
- WebSocket handlers for real-time communication
- Service layer for business logic
- Type-safe throughout

[→ See backend/README.md for details](./backend/README.md)

### Frontend (Vue 3 + TypeScript)

Layered architecture following Vue 3 best practices:

```
Views/Components → Stores (Pinia) → API Layer → Backend
```

**Key Features:**

- API layer separates HTTP & WebSocket clients
- Pinia stores organized by domain
- Composition API with `<script setup>`
- Shared types ensure API contract

[→ See src/README.md for details](./src/README.md)

## 🚀 Key Improvements

### Backend

- ✅ Main file reduced from **297 → 80 lines**
- ✅ Clear separation: routes, handlers, services, middleware
- ✅ No `any` types - fully type-safe
- ✅ Easy to test and maintain

### Frontend

- ✅ API layer separated from components
- ✅ Stores centralized in `stores/` directory
- ✅ Direct imports from source files
- ✅ Shared types prevent API contract drift

## 📚 Documentation

Each major directory contains its own README:

- **`backend/README.md`** - Backend architecture, design principles, adding features
- **`src/README.md`** - Frontend architecture, data flow, best practices
- **`backend/REFACTORING_SUMMARY.md`** - Backend refactoring details
- **`src/REFACTORING_SUMMARY.md`** - Frontend refactoring details

## 🛠️ Development

### Setup

```bash
bun install
```

### Development

```bash
bun dev          # Run both frontend and backend
bun dev:frontend # Frontend only (port 5173)
bun dev:backend  # Backend only (port 3000)
```

### Build & Lint

```bash
bun build        # Build frontend
bun lint         # Lint all code
```

## 🎓 Design Principles

Both backend and frontend follow these principles:

1. **Single Responsibility** - Each file/module has one clear purpose
2. **Separation of Concerns** - Different layers don't mix responsibilities
3. **Type Safety** - TypeScript throughout for compile-time safety
4. **Layered Architecture** - Clear boundaries between layers
5. **Testability** - Easy to test individual modules
6. **Documentation** - Code structure is self-documenting

## 📈 Before & After

### Backend

```
Before: 6 files, 297-line index.ts
After:  11 files, 80-line index.ts, organized by concern
```

### Frontend

```
Before: 18 files, mixed responsibilities
After:  30 files, clear layers and boundaries
```

## ✨ Benefits

### For Developers

- 🔍 **Easy to find code** - Logical, consistent structure
- 🧪 **Easy to test** - Clear boundaries and dependencies
- 📝 **Easy to understand** - Self-documenting organization
- ➕ **Easy to extend** - Clear patterns for adding features

### For the Project

- 🛡️ **Type-safe** - Fewer runtime errors
- 🔧 **Maintainable** - Changes are localized
- 📚 **Well-documented** - Architecture is explained
- 🚀 **Scalable** - Structure supports growth

---

**Status:** ✅ Production-ready with clean, maintainable architecture!
