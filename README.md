# rt-chess

A small real-time online chess app built with Vue and Bun, primarily as a learning project.

## Features

- Vue frontend with Pinia for state management
- Bun backend with a vanilla WebSocket server
- Server-authoritative game state with 3+2 time control
- Client-side chess engine for local interactions
- Evaluation bar powered by Stockfish WASM  
  (https://github.com/nmrugg/stockfish.js)

## Demo
https://github.com/user-attachments/assets/94089f41-e764-42e7-87e0-40cb314a8297

## Scope & Limitations

This project is intentionally **not production-grade**. Some things were deliberately kept minimal or omitted to keep the focus on learning:

- No authentication, players can set arbitrary identities
- No persistence, games are stored in memory and reset on server restart
- Minimal UI, functional over polished
- No draw offer or resignation

The goal was to better understand architecture, reactivity, and real-time communication rather than to build a fully featured product.

## Project Setup

```sh
bun install
```

### Development

```sh
bun dev
bun dev:backend
```

App is available on `localhost:5173`

### Type-Check, Compile and Minify for Production

```sh
bun run build
bun run build:backend
```

### Running on production

```sh
bun run start
```
