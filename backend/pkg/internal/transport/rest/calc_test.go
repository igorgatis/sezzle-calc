package rest

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
)

type mockCalculator struct {
	result float64
	err    error
}

func (m *mockCalculator) Add(a, b float64) float64                 { return m.result }
func (m *mockCalculator) Subtract(a, b float64) float64            { return m.result }
func (m *mockCalculator) Multiply(a, b float64) float64            { return m.result }
func (m *mockCalculator) Divide(a, b float64) (float64, error)     { return m.result, m.err }
func (m *mockCalculator) Power(a, b float64) (float64, error)      { return m.result, m.err }
func (m *mockCalculator) Sqrt(a float64) (float64, error)          { return m.result, m.err }
func (m *mockCalculator) Percentage(a, b float64) (float64, error) { return m.result, m.err }

func init() {
	gin.SetMode(gin.TestMode)
}

func setupServer(mock *mockCalculator) *httptest.Server {
	engine := gin.New()
	RegisterCalculatorV1(engine, mock)
	return httptest.NewServer(engine)
}

func TestOperationsSanity(t *testing.T) {
	successCases := []struct {
		op     string
		body   string
		result float64
	}{
		{"/v1/add", `{"a": 2, "b": 3}`, 5},
		{"/v1/subtract", `{"a": 5, "b": 3}`, 2},
		{"/v1/multiply", `{"a": 4, "b": 3}`, 12},
		{"/v1/divide", `{"a": 10, "b": 2}`, 5},
		{"/v1/power", `{"a": 2, "b": 3}`, 8},
		{"/v1/percentage", `{"a": 10, "b": 200}`, 20},
		{"/v1/sqrt", `{"a": 9}`, 3},
	}

	for _, tt := range successCases {
		t.Run(tt.op+" success", func(t *testing.T) {
			srv := setupServer(&mockCalculator{result: tt.result})
			defer srv.Close()

			resp, _ := http.Post(srv.URL+tt.op, "application/json",
				bytes.NewBufferString(tt.body))
			defer resp.Body.Close()

			var r Response
			json.NewDecoder(resp.Body).Decode(&r)
			expected := fmt.Sprint(tt.result)
			if r.Result.String() != expected {
				t.Errorf("result = %q, want %q", r.Result, expected)
			}
		})
	}

	errorCases := []struct {
		op   string
		body string
	}{
		{"/v1/divide", `{"a": 1, "b": 0}`},
		{"/v1/sqrt", `{"a": -1}`},
	}

	for _, tt := range errorCases {
		t.Run(tt.op+" error", func(t *testing.T) {
			srv := setupServer(&mockCalculator{err: errors.New("err")})
			defer srv.Close()

			resp, _ := http.Post(srv.URL+tt.op, "application/json",
				bytes.NewBufferString(tt.body))
			defer resp.Body.Close()

			var r ErrorResponse
			json.NewDecoder(resp.Body).Decode(&r)
			if r.Error == "" {
				t.Error("expected error, got none")
			}
		})
	}
}

func TestMissingRoutes(t *testing.T) {
	srv := setupServer(&mockCalculator{result: 42})
	defer srv.Close()

	paths := []string{"/notfound", "/v1", "/add", "/v1/notfound"}
	for _, path := range paths {
		t.Run("POST "+path, func(t *testing.T) {
			resp, _ := http.Post(srv.URL+path, "application/json",
				bytes.NewBufferString(`{"a": 1}`))
			defer resp.Body.Close()
			if resp.StatusCode != http.StatusNotFound {
				t.Errorf("status = %d, want %d", resp.StatusCode, http.StatusNotFound)
			}
		})
	}
}

func TestInvalidMethods(t *testing.T) {
	srv := setupServer(&mockCalculator{result: 42})
	defer srv.Close()

	paths := []string{
		"/v1/add", "/v1/subtract", "/v1/multiply", "/v1/divide",
		"/v1/power", "/v1/percentage", "/v1/sqrt",
	}
	for _, path := range paths {
		t.Run("GET "+path, func(t *testing.T) {
			resp, _ := http.Get(srv.URL + path)
			defer resp.Body.Close()
			if resp.StatusCode != http.StatusNotFound {
				t.Errorf("status = %d, want %d", resp.StatusCode, http.StatusNotFound)
			}
		})
	}
}

func TestBinaryOp(t *testing.T) {
	ptr := func(x float64) *float64 { return &x }
	tests := []struct {
		name           string
		mock           *mockCalculator
		body           string
		expectedStatus int
		expectedResult *float64
		expectError    bool
	}{
		{"happy path", &mockCalculator{result: 5}, `{"a": 2, "b": 3}`, http.StatusOK, ptr(5.0), false},
		{"valid string a", &mockCalculator{result: 5}, `{"a": "2", "b": 3}`, http.StatusOK, ptr(5.0), false},
		{"valid string b", &mockCalculator{result: 5}, `{"a": 2, "b": "3"}`, http.StatusOK, ptr(5.0), false},
		{"large a", &mockCalculator{result: 32921810703292181070}, `{"a": "98765432109876543210" , "b": 3}`, http.StatusOK, ptr(32921810703292181070), false},
		{"large b", &mockCalculator{result: 3.0375e-20}, `{"a": 3, "b": "98765432109876543210"}`, http.StatusOK, ptr(3.0375e-20), false},
		{"missing a", &mockCalculator{}, `{"b": 3}`, http.StatusBadRequest, nil, true},
		{"missing b", &mockCalculator{}, `{"a": 2}`, http.StatusBadRequest, nil, true},
		{"invalid string a", &mockCalculator{}, `{"a": "foo", "b": 3}`, http.StatusBadRequest, nil, true},
		{"invalid string b", &mockCalculator{}, `{"a": 2, "b": "bar"}`, http.StatusBadRequest, nil, true},
		{"calculator error", &mockCalculator{err: errors.New("err")}, `{"a": 1, "b": 2}`, http.StatusBadRequest, nil, true},
		{"invalid json", &mockCalculator{}, `{invalid}`, http.StatusBadRequest, nil, true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			srv := setupServer(tt.mock)
			defer srv.Close()

			resp, _ := http.Post(srv.URL+"/v1/divide", "application/json",
				bytes.NewBufferString(tt.body))
			defer resp.Body.Close()

			assertHTTPResponse(t, resp, tt.expectedStatus, tt.expectedResult, tt.expectError)
		})
	}
}

func TestUnaryOp(t *testing.T) {
	ptr := func(x float64) *float64 { return &x }
	tests := []struct {
		name           string
		mock           *mockCalculator
		body           string
		expectedStatus int
		expectedResult *float64
		expectError    bool
	}{
		{"happy path", &mockCalculator{result: 2}, `{"a": 4}`, http.StatusOK, ptr(2.0), false},
		{"valid string a", &mockCalculator{result: 2}, `{"a": "4"}`, http.StatusOK, ptr(2.0), false},
		{"large a", &mockCalculator{result: 9938079900.5}, `{"a": "98765432109876543210"}`, http.StatusOK, ptr(9938079900.5), false},
		{"missing a", &mockCalculator{}, `{}`, http.StatusBadRequest, nil, true},
		{"invalid string a", &mockCalculator{}, `{"a": "foo"}`, http.StatusBadRequest, nil, true},
		{"calculator error", &mockCalculator{err: errors.New("err")}, `{"a": 1}`, http.StatusBadRequest, nil, true},
		{"invalid json", &mockCalculator{}, `{invalid}`, http.StatusBadRequest, nil, true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			srv := setupServer(tt.mock)
			defer srv.Close()

			resp, _ := http.Post(srv.URL+"/v1/sqrt", "application/json",
				bytes.NewBufferString(tt.body))
			defer resp.Body.Close()

			assertHTTPResponse(t, resp, tt.expectedStatus, tt.expectedResult, tt.expectError)
		})
	}
}

func assertHTTPResponse(t *testing.T, r *http.Response, status int, result *float64, expectErr bool) {
	t.Helper()

	if r.StatusCode != status {
		t.Errorf("status = %d, want %d", r.StatusCode, status)
	}

	if expectErr {
		var resp ErrorResponse
		if err := json.NewDecoder(r.Body).Decode(&resp); err != nil {
			t.Fatalf("failed to decode error response: %v", err)
		}
		if resp.Error == "" {
			t.Error("expected error, got none")
		}
	} else {
		var resp Response
		if err := json.NewDecoder(r.Body).Decode(&resp); err != nil {
			t.Fatalf("failed to decode response: %v", err)
		}
		if result != nil && resp.Result == "" {
			t.Error("expected result, got empty")
		}
	}
}
