# Calculator Services
A full-stack calculator application.

This repository has the following revelant folders:
* [docs](./docs/): relvent documentation meant for humans and AI.
* [backend](./backend/README.md): Go service which provides backend functionality.
* [frontend](./frontend/README.md): TypeScript service which serves the frontend.

Please check each individual service's README.md for details.

## Architecture

```mermaid
flowchart LR
    Browser -->|:3000| NextJS[Next.js Frontend]
    NextJS -->|:3001| Go[Go Backend]
```

- **Frontend (Next.js, TypeScript):** Serves the Calculator UI and proxies API calls.
- **Backend (Go, Gin):** Handles calculator operations via REST API.

The frontend proxies `/api/*` requests to the Go backend, avoiding CORS configuration.

## Features

All required and optional operations are implemented:
- Basic: Addition, Subtraction, Multiplication, Division
- Optional: Exponentiation, Square Root, Percentage

## Design Decisions

### Go Backend
- Uses **Gin** for REST API handling.
- Business logic is isolated from HTTP layer, enabling alternative transports (e.g., gRPC).
- Configuration via environment variables. Could be improved with Viper for more complex
  scenarios.

### TypeScript Frontend
- Uses **Next.js** for serving static assets and proxying API calls.
- See [frontend/README.md](./frontend/README.md) for design details.

## API

See [backend/README.md](./backend/README.md) for API examples and documentation.

## Testing

Both services have unit tests with coverage reports:

```bash
# Backend
cd backend && make pre-submit && make open-coverage

# Frontend
cd frontend && pnpm pre-submit && pnpm test:coverage-open
```

## Setup
Each individual service has its own README.md with details how to setup, build,
test and develop each service.

For convenience, you install [mise](https://mise.jdx.dev/getting-started.html)
and run `mise install` to resolve all development tools.

Hint: if need an isoloted environment, try the provided devcontainer.

## Running Locally (in Docker)
You may bring all services up using:
```bash
docker compose up
```
Then open http://localhost:3000 in your browser.

To run each service outside of Docker, check the service's README.md file.
