package main

import "github.com/igorgatis/sezzle/backend/pkg/service"

func main() {
	cfg := service.ParseEnvVars()
	service.NewRest(cfg).Serve()
}
