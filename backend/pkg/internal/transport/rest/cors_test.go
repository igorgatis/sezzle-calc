package rest

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
)

func TestCORSMiddleware(t *testing.T) {
	gin.SetMode(gin.TestMode)

	tests := []struct {
		name           string
		method         string
		expectedStatus int
	}{
		{"preflight OPTIONS", http.MethodOptions, http.StatusOK},
		{"regular POST", http.MethodPost, http.StatusOK},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			engine := gin.New()
			engine.Use(CORSMiddleware())
			engine.POST("/test", func(c *gin.Context) {
				c.Status(http.StatusOK)
			})
			engine.OPTIONS("/test", func(c *gin.Context) {
				c.Status(http.StatusOK)
			})

			req := httptest.NewRequest(tt.method, "/test", nil)
			rec := httptest.NewRecorder()
			engine.ServeHTTP(rec, req)

			if rec.Code != tt.expectedStatus {
				t.Errorf("status = %d, want %d", rec.Code, tt.expectedStatus)
			}
			if rec.Header().Get("Access-Control-Allow-Origin") != "*" {
				t.Error("missing CORS header")
			}
		})
	}
}
