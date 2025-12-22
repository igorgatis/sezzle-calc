package rest

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/igorgatis/sezzle/backend/pkg/internal/calculator"
)

type BinaryOperand struct {
	A json.Number `json:"a" binding:"required" example:"12.3" swaggertype:"number"`
	B json.Number `json:"b" binding:"required" example:"4.5" swaggertype:"number"`
}

type UnaryOperand struct {
	A json.Number `json:"a" binding:"required" example:"6.7" swaggertype:"number"`
}

type Response struct {
	Result json.Number `json:"result" example:"8.9" swaggertype:"number"`
}

type ErrorResponse struct {
	Error string `json:"error" example:"invalid input"`
}

func RegisterCalculatorV1(r gin.IRouter, calc calculator.Calculator) {
	g := r.Group("/v1")
	g.POST("/add", addHandler(calc))
	g.POST("/subtract", subtractHandler(calc))
	g.POST("/multiply", multiplyHandler(calc))
	g.POST("/divide", divideHandler(calc))
	g.POST("/power", powerHandler(calc))
	g.POST("/sqrt", sqrtHandler(calc))
	g.POST("/percentage", percentageHandler(calc))
}

func writeResponse(c *gin.Context, result float64) {
	c.JSON(http.StatusOK, Response{
		Result: json.Number(strconv.FormatFloat(result, 'f', -1, 64)),
	})
}

func writeErrorResponse(c *gin.Context, err error) {
	c.JSON(http.StatusBadRequest, ErrorResponse{Error: err.Error()})
}

// @Summary Add two numbers
// @Param input body BinaryOperand true "Operands"
// @Success 200 {object} Response
// @Failure 400 {object} ErrorResponse
// @Router /v1/add [post]
func addHandler(calc calculator.Calculator) gin.HandlerFunc {
	return binaryOp(calc.Add)
}

// @Summary Subtract two numbers
// @Param input body BinaryOperand true "Operands"
// @Success 200 {object} Response
// @Failure 400 {object} ErrorResponse
// @Router /v1/subtract [post]
func subtractHandler(calc calculator.Calculator) gin.HandlerFunc {
	return binaryOp(calc.Subtract)
}

// @Summary Multiply two numbers
// @Param input body BinaryOperand true "Operands"
// @Success 200 {object} Response
// @Failure 400 {object} ErrorResponse
// @Router /v1/multiply [post]
func multiplyHandler(calc calculator.Calculator) gin.HandlerFunc {
	return binaryOp(calc.Multiply)
}

// @Summary Divide two numbers
// @Param input body BinaryOperand true "Operands"
// @Success 200 {object} Response
// @Failure 400 {object} ErrorResponse
// @Router /v1/divide [post]
func divideHandler(calc calculator.Calculator) gin.HandlerFunc {
	return binaryOpErr(calc.Divide)
}

// @Summary Power operation
// @Param input body BinaryOperand true "Operands"
// @Success 200 {object} Response
// @Failure 400 {object} ErrorResponse
// @Router /v1/power [post]
func powerHandler(calc calculator.Calculator) gin.HandlerFunc {
	return binaryOpErr(calc.Power)
}

// @Summary Square root
// @Param input body UnaryOperand true "Operand"
// @Success 200 {object} Response
// @Failure 400 {object} ErrorResponse
// @Router /v1/sqrt [post]
func sqrtHandler(calc calculator.Calculator) gin.HandlerFunc {
	return unaryOpErr(calc.Sqrt)
}

// @Summary Percentage calculation
// @Param input body BinaryOperand true "Operands"
// @Success 200 {object} Response
// @Failure 400 {object} ErrorResponse
// @Router /v1/percentage [post]
func percentageHandler(calc calculator.Calculator) gin.HandlerFunc {
	return binaryOpErr(calc.Percentage)
}

func binaryOp(op func(a, b float64) float64) gin.HandlerFunc {
	return binaryOpErr(func(a, b float64) (float64, error) {
		return op(a, b), nil
	})
}

func binaryOpErr(op func(a, b float64) (float64, error)) gin.HandlerFunc {
	return func(c *gin.Context) {
		var input BinaryOperand
		if err := c.ShouldBindJSON(&input); err != nil {
			writeErrorResponse(c, err)
			return
		}
		a, err := input.A.Float64()
		if err != nil {
			writeErrorResponse(c, err) // Should never happen.
			return
		}
		b, err := input.B.Float64()
		if err != nil {
			writeErrorResponse(c, err) // Should never happen.
			return
		}
		result, err := op(a, b)
		if err != nil {
			writeErrorResponse(c, err)
			return
		}
		writeResponse(c, result)
	}
}

func unaryOpErr(op func(a float64) (float64, error)) gin.HandlerFunc {
	return func(c *gin.Context) {
		var input UnaryOperand
		if err := c.ShouldBindJSON(&input); err != nil {
			writeErrorResponse(c, err)
			return
		}
		a, err := input.A.Float64()
		if err != nil {
			writeErrorResponse(c, err) // Should never happen.
			return
		}
		result, err := op(a)
		if err != nil {
			writeErrorResponse(c, err)
			return
		}
		writeResponse(c, result)
	}
}
