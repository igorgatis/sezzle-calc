package service

import (
	"fmt"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"

	_ "github.com/igorgatis/sezzle/backend/docs"
	"github.com/igorgatis/sezzle/backend/pkg/internal/calculator"
	"github.com/igorgatis/sezzle/backend/pkg/internal/transport/rest"
)

type Service interface {
	Serve()
}

type restService struct {
	port     int
	engine   *gin.Engine
	logFatal func(...any)
}

// @title Calculator API
// @version 1.0
// @description A REST API service that provides calculator operations
// @host localhost:3001
// @BasePath /
func NewRest(cfg Config) *restService {
	gin.SetMode(gin.ReleaseMode)
	engine := gin.New()
	engine.Use(gin.Recovery())

	if cfg.AllowCORS {
		log.Println("CORS headers enabled")
		engine.Use(rest.CORSMiddleware())
	}

	rest.RegisterCalculatorV1(engine, calculator.New())

	if cfg.EnableSwagger {
		engine.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))
	}

	return &restService{
		port:     cfg.Port,
		engine:   engine,
		logFatal: log.Fatal,
	}
}

func (s *restService) Handler() http.Handler {
	return s.engine
}

func (s *restService) Serve() {
	addr := fmt.Sprintf(":%d", s.port)
	log.Printf("Server starting on %s", addr)
	log.Printf("Swagger UI: http://localhost%s/swagger/index.html", addr)
	if err := s.engine.Run(addr); err != nil {
		s.logFatal(err)
	}
}
