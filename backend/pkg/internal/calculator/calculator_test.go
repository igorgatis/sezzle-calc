package calculator

import (
	"testing"
)

func TestAdd(t *testing.T) {
	calc := New()
	tests := []struct {
		name     string
		a, b     float64
		expected float64
	}{
		{"positive numbers", 2, 3, 5},
		{"negative numbers", -2, -3, -5},
		{"mixed signs", -2, 3, 1},
		{"decimals", 1.5, 2.5, 4},
		{"zeros", 0, 0, 0},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := calc.Add(tt.a, tt.b)
			if result != tt.expected {
				t.Errorf("Add(%v, %v) = %v, want %v", tt.a, tt.b, result, tt.expected)
			}
		})
	}
}

func TestSubtract(t *testing.T) {
	calc := New()
	tests := []struct {
		name     string
		a, b     float64
		expected float64
	}{
		{"positive numbers", 5, 3, 2},
		{"negative result", 3, 5, -2},
		{"negative numbers", -2, -3, 1},
		{"decimals", 5.5, 2.5, 3},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := calc.Subtract(tt.a, tt.b)
			if result != tt.expected {
				t.Errorf("Subtract(%v, %v) = %v, want %v", tt.a, tt.b, result, tt.expected)
			}
		})
	}
}

func TestMultiply(t *testing.T) {
	calc := New()
	tests := []struct {
		name     string
		a, b     float64
		expected float64
	}{
		{"positive numbers", 2, 3, 6},
		{"with zero", 5, 0, 0},
		{"negative numbers", -2, -3, 6},
		{"mixed signs", -2, 3, -6},
		{"decimals", 1.5, 2, 3},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := calc.Multiply(tt.a, tt.b)
			if result != tt.expected {
				t.Errorf("Multiply(%v, %v) = %v, want %v", tt.a, tt.b, result, tt.expected)
			}
		})
	}
}

func TestDivide(t *testing.T) {
	calc := New()
	tests := []struct {
		name      string
		a, b      float64
		expected  float64
		expectErr error
	}{
		{"positive numbers", 6, 3, 2, nil},
		{"decimals", 5, 2, 2.5, nil},
		{"negative numbers", -6, -3, 2, nil},
		{"mixed signs", -6, 3, -2, nil},
		{"division by zero", 5, 0, 0, ErrDivisionByZero},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result, err := calc.Divide(tt.a, tt.b)
			if err != tt.expectErr {
				t.Errorf("Divide(%v, %v) error = %v, want %v", tt.a, tt.b, err, tt.expectErr)
			}
			if result != tt.expected {
				t.Errorf("Divide(%v, %v) = %v, want %v", tt.a, tt.b, result, tt.expected)
			}
		})
	}
}

func TestPower(t *testing.T) {
	calc := New()
	tests := []struct {
		name      string
		a, b      float64
		expected  float64
		expectErr error
	}{
		{"positive exponent", 2, 3, 8, nil},
		{"zero exponent", 5, 0, 1, nil},
		{"negative exponent", 2, -1, 0.5, nil},
		{"fractional exponent", 4, 0.5, 2, nil},
		{"negative base integer exponent", -2, 3, -8, nil},
		{"negative base fractional exponent", -4, 0.5, 0, ErrNegativeSqrt},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result, err := calc.Power(tt.a, tt.b)
			if err != tt.expectErr {
				t.Errorf("Power(%v, %v) error = %v, want %v", tt.a, tt.b, err, tt.expectErr)
			}
			if result != tt.expected {
				t.Errorf("Power(%v, %v) = %v, want %v", tt.a, tt.b, result, tt.expected)
			}
		})
	}
}

func TestSqrt(t *testing.T) {
	calc := New()
	tests := []struct {
		name      string
		a         float64
		expected  float64
		expectErr error
	}{
		{"positive number", 4, 2, nil},
		{"zero", 0, 0, nil},
		{"decimal", 2.25, 1.5, nil},
		{"negative number", -4, 0, ErrNegativeSqrt},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result, err := calc.Sqrt(tt.a)
			if err != tt.expectErr {
				t.Errorf("Sqrt(%v) error = %v, want %v", tt.a, err, tt.expectErr)
			}
			if result != tt.expected {
				t.Errorf("Sqrt(%v) = %v, want %v", tt.a, result, tt.expected)
			}
		})
	}
}

func TestPercentage(t *testing.T) {
	calc := New()
	tests := []struct {
		name      string
		a, b      float64
		expected  float64
		expectErr error
	}{
		{"10 percent of 100", 10, 100, 10, nil},
		{"10 percent of -100", 10, -100, -10, nil},
		{"zero percent of 100", 0, 100, 0, nil},
		{"100 percent", 100, 50, 50, nil},
		{"negative percent", -10, 100, 0, ErrNegativePercentage},
		{"negative percent of negative", -10, -100, 0, ErrNegativePercentage},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result, err := calc.Percentage(tt.a, tt.b)
			if err != tt.expectErr {
				t.Errorf("Percentage(%v, %v) error = %v, want %v", tt.a, tt.b, err, tt.expectErr)
			}
			if result != tt.expected {
				t.Errorf("Percentage(%v, %v) = %v, want %v", tt.a, tt.b, result, tt.expected)
			}
		})
	}
}
