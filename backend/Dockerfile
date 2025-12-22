# NOTE FOR REVIEWER:
# The following layers are meant to optimize cache.
FROM golang:1.24-alpine AS base

FROM base AS deps
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download

FROM deps AS builder
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o build/server cmd/server/main.go

FROM scratch AS release
WORKDIR /app
COPY --from=builder /app/build/server .
ENV PORT=3001
EXPOSE 3001
ENTRYPOINT ["./server"]
