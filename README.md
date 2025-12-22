# Calculator Services
A full-stack calculator application.

This repository has the following revelant folders:
* [docs](./docs/): relvent documentation meant for humans and AI.
* [backend](./backend/README.md): Go service which provides backend functionality.
* [frontend](./frontend/README.md): TypeScript service which serves the frontend.

Please check each individual service's README.md for details.

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
