# Hide and Seek - Starter

Monorepo: NestJS-Backend & React-Frontend (Vite) with Socket.io minimal setup.

## Dependencies

- Node (siehe .nvmrc)
- pnpm (`brew install pnpm`)

## Install

Install from root.

```bash
pnpm install
```

## Run

Run from root. Starts both applications together.

```bash
pnpm dev
```

- Backend at http://localhost:3000
- Frontend at http://localhost:5173

## Scripts

Run from root.

```bash
pnpm lint          # ESLint
pnpm lint:fix      # ESLint with auto-fix
pnpm format        # Prettier, write
pnpm format:check  # Prettier, check only
pnpm typecheck     # tsc
pnpm check         # lint + format:check + typecheck
pnpm test          # Vitest unit tests
pnpm test:e2e      # backend e2e tests
pnpm build         # build backend and frontend
pnpm sync          # switch to main, pull, install dependencies
pnpm sync:branch   # merge main into the current branch (without committing), install dependencies
```
