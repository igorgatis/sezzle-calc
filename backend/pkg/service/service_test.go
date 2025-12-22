package service

import (
	"bytes"
	"io"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
)

func init() {
	gin.SetMode(gin.TestMode)
}

func TestNewRest(t *testing.T) {
	tests := []struct {
		name     string
		cfg      Config
		wantCORS bool
	}{
		{"happy path with CORS", Config{AllowCORS: true}, true},
		{"happy path without CORS", Config{AllowCORS: false}, false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			h := NewRest(tt.cfg)
			srv := httptest.NewServer(h.Handler())
			defer srv.Close()

			resp, err := http.Post(srv.URL+"/v1/add", "application/json",
				bytes.NewBufferString(`{"a": 2, "b": 3}`))
			if err != nil {
				t.Fatalf("request failed: %v", err)
			}
			defer resp.Body.Close()

			if resp.StatusCode != http.StatusOK {
				t.Errorf("status = %d, want %d", resp.StatusCode, http.StatusOK)
			}

			body, _ := io.ReadAll(resp.Body)
			if got, want := string(body), `{"result":5}`; got != want {
				t.Errorf("body = %q, want %q", got, want)
			}

			corsHeader := resp.Header.Get("Access-Control-Allow-Origin")
			if tt.wantCORS && corsHeader != "*" {
				t.Error("expected CORS header, got none")
			}
			if !tt.wantCORS && corsHeader != "" {
				t.Errorf("unexpected CORS header: %s", corsHeader)
			}
		})
	}
}

func TestEnableSwagger(t *testing.T) {
	tests := []struct {
		name       string
		enabled    bool
		wantStatus int
	}{
		{"swagger enabled", true, http.StatusOK},
		{"swagger disabled", false, http.StatusNotFound},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			h := NewRest(Config{EnableSwagger: tt.enabled})
			srv := httptest.NewServer(h.Handler())
			defer srv.Close()

			resp, err := http.Get(srv.URL + "/swagger/index.html")
			if err != nil {
				t.Fatalf("request failed: %v", err)
			}
			defer resp.Body.Close()

			if resp.StatusCode != tt.wantStatus {
				t.Errorf("status = %d, want %d", resp.StatusCode, tt.wantStatus)
			}
		})
	}
}
