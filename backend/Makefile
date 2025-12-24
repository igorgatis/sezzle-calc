.PHONY: help deps swagger build test coverage open-coverage clean pre-submit run

## help: Show this help message.
help:
	@grep -E '^## ' $(MAKEFILE_LIST) | sed 's/^## //' | \
		awk 'BEGIN {FS = ": "}; {printf "  %-15s %s\n", $$1, $$2}'

## deps: Download dependencies.
deps:
	go mod download

## swagger: Generate swagger documentation.
swagger:
	go tool swag init -g pkg/service/service.go -o docs

## build: Build targets.
build: swagger
	go build -o build/server cmd/server/main.go

## run: runs server locally
run: swagger
	ENABLE_SWAGGER=true \
	ARTIFICIAL_DELAY_MS=1000 \
	go run cmd/server/main.go

## test: Run tests with verbose output.
test:
	go test -v ./...

## coverage: Generate test coverage report.
coverage:
	@mkdir -p build
	go test -coverprofile=build/coverage.out ./...
	go tool cover -html=build/coverage.out -o build/coverage.html

## open-coverage: opens coverage report in browser.
open-coverage: coverage
	@if command -v xdg-open >/dev/null 2>&1; then \
		xdg-open build/coverage.html; \
	elif command -v open >/dev/null 2>&1; then \
		open build/coverage.html; \
	else \
		echo "Coverage report: build/coverage.html"; \
	fi

## clean: Removes all untracked files.
clean:
	git clean -f -x -d

## pre-submit: runs common tasks pre-submitting changes.
pre-submit:
	go mod tidy
	go fmt ./...
	@$(MAKE) swagger
	@$(MAKE) build
	@$(MAKE) coverage
