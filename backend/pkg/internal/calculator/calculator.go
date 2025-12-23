package calculator

import (
	"errors"
	"math"
)

var (
	ErrDivisionByZero     = errors.New("division by zero")
	ErrNegativeSqrt       = errors.New("sqrt negative number")
	ErrNegativePercentage = errors.New("negative percentage")
)

type Calculator interface {
	Add(a, b float64) float64
	Subtract(a, b float64) float64
	Multiply(a, b float64) float64
	Divide(a, b float64) (float64, error)
	Power(a, b float64) (float64, error)
	Sqrt(a float64) (float64, error)
	Percentage(a, b float64) (float64, error)
}

type simpleCalc struct{}

func New() Calculator {
	return &simpleCalc{}
}

func (c *simpleCalc) Add(a, b float64) float64 {
	return a + b
}

func (c *simpleCalc) Subtract(a, b float64) float64 {
	return a - b
}

func (c *simpleCalc) Multiply(a, b float64) float64 {
	return a * b
}

func (c *simpleCalc) Divide(a, b float64) (float64, error) {
	if b == 0 {
		return 0, ErrDivisionByZero
	}
	return a / b, nil
}

func (c *simpleCalc) Power(a, b float64) (float64, error) {
	result := math.Pow(a, b)
	if math.IsNaN(result) {
		return 0, ErrNegativeSqrt
	}
	return result, nil
}

func (c *simpleCalc) Sqrt(a float64) (float64, error) {
	if a < 0 {
		return 0, ErrNegativeSqrt
	}
	return math.Sqrt(a), nil
}

func (c *simpleCalc) Percentage(a, b float64) (float64, error) {
	if a < 0 {
		return 0, ErrNegativePercentage
	}
	return (a / 100) * b, nil
}
