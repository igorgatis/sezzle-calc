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
- Uses **Next.js** despite the app's simplicity. It made serving static assets and proxying
  API calls straightforward.
- The Calculator UI implements a **State Machine** (`CalculatorState` class) that processes
  instructions (keystrokes) and updates internal state:
  - **State:** `display`, `operand`, `operator`, `resetDisplay`, `error`, `processing`
  - **Instructions:** digits (`0-9.`), operators (`+-*/^%`), and commands (`c`lear,
    `d`elete, `s`qrt, `t`oggle sign, `=`)
  - Transitions occur on each instruction, with async API calls for calculations.
- The state machine calls the backend API directly. A better implementation would use an
  interface to decouple from the backend and simplify testing (though mocking was easy).

## API Examples

The backend exposes REST endpoints at `/v1/calc/*`. Examples:

```bash
# Addition
curl "http://localhost:3001/v1/calc/add?a=5&b=3"
# {"result":"8"}

# Division
curl "http://localhost:3001/v1/calc/divide?a=10&b=2"
# {"result":"5"}

# Square Root
curl "http://localhost:3001/v1/calc/sqrt?a=16"
# {"result":"4"}
```

Run `make run` in the backend folder to enable Swagger UI at
http://localhost:3001/swagger/index.html for full API documentation.

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

To run each service outside of Docker, check the service's README.md file.
