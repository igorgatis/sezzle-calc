package service

import (
	"testing"
)

func TestParseEnvVarsHelp(t *testing.T) {
	exitCode := -1
	p := &parser{ExitFn: func(code int) { exitCode = code }}

	p.Parse([]string{"test", "-help"})

	if exitCode != 0 {
		t.Errorf("expected exit code 0, got %d", exitCode)
	}
}

func TestParseEnvVars(t *testing.T) {
	tests := []struct {
		name          string
		port          string
		allowCORS     string
		enableSwagger string
		wantPort      int
		wantCORS      bool
		wantSwagger   bool
	}{
		{
			name:          "sane defaults",
			port:          "",
			allowCORS:     "",
			enableSwagger: "",
			wantPort:      3001,
			wantCORS:      false,
			wantSwagger:   false,
		},
		{
			name:          "custom values",
			port:          "3123",
			allowCORS:     "true",
			enableSwagger: "true",
			wantPort:      3123,
			wantCORS:      true,
			wantSwagger:   true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if tt.port != "" {
				t.Setenv("PORT", tt.port)
			}
			if tt.allowCORS != "" {
				t.Setenv("ALLOW_CORS", tt.allowCORS)
			}
			if tt.enableSwagger != "" {
				t.Setenv("ENABLE_SWAGGER", tt.enableSwagger)
			}

			cfg := ParseEnvVars()

			if cfg.Port != tt.wantPort {
				t.Errorf("ParseEnvVars().Port = %v, want %v", cfg.Port, tt.wantPort)
			}
			if cfg.AllowCORS != tt.wantCORS {
				t.Errorf("ParseEnvVars().AllowCORS = %v, want %v", cfg.AllowCORS, tt.wantCORS)
			}
			if cfg.EnableSwagger != tt.wantSwagger {
				t.Errorf("ParseEnvVars().EnableSwagger = %v, want %v",
					cfg.EnableSwagger, tt.wantSwagger)
			}
		})
	}
}

func TestParseEnvVarsInvalidPort(t *testing.T) {
	t.Setenv("PORT", "invalid")

	exitCode := -1
	p := &parser{ExitFn: func(code int) { exitCode = code }}
	p.Parse([]string{"test"})

	if exitCode != 1 {
		t.Errorf("expected exit code 1, got %d", exitCode)
	}
}

func TestParseEnvVarsInvalidAllowCORS(t *testing.T) {
	t.Setenv("ALLOW_CORS", "invalid")

	exitCode := -1
	p := &parser{ExitFn: func(code int) { exitCode = code }}
	p.Parse([]string{"test"})

	if exitCode != 1 {
		t.Errorf("expected exit code 1, got %d", exitCode)
	}
}

func TestParseEnvVarsInvalidEnableSwagger(t *testing.T) {
	t.Setenv("ENABLE_SWAGGER", "invalid")

	exitCode := -1
	p := &parser{ExitFn: func(code int) { exitCode = code }}
	p.Parse([]string{"test"})

	if exitCode != 1 {
		t.Errorf("expected exit code 1, got %d", exitCode)
	}
}
