import { CalculatorState, CalculatorSnapshot } from "./calculator-state";
import * as api from "@/lib/api";

jest.mock("@/lib/api");

const mockApi = api as jest.Mocked<typeof api>;

describe("CalculatorState", () => {
  let calc: CalculatorState;

  beforeEach(() => {
    jest.clearAllMocks();
    calc = new CalculatorState();
  });

  describe("initial state", () => {
    it("displays 0 initially", () => {
      expect(calc.getDisplay()).toBe("0");
    });

    it("has empty expression initially", () => {
      expect(calc.getExpression()).toBe("");
    });

    it("is not processing initially", () => {
      expect(calc.isProcessing()).toBe(false);
    });

    it("returns correct snapshot", () => {
      const snap = calc.snapshot();
      expect(snap.display).toBe("0");
      expect(snap.operand).toBeNull();
      expect(snap.operator).toBeNull();
      expect(snap.resetDisplay).toBe(false);
      expect(snap.error).toBeNull();
      expect(snap.processing).toBe(false);
    });
  });

  describe("listener", () => {
    it("notifies listener on state change", async () => {
      const listener = jest.fn();
      calc.setListener(listener);
      await calc.handle("5");
      expect(listener).toHaveBeenCalled();
    });

    it("can remove listener", async () => {
      const listener = jest.fn();
      calc.setListener(listener);
      calc.setListener(null);
      await calc.handle("5");
      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe("digit input", () => {
    it("handles single digit", async () => {
      await calc.handle("5");
      expect(calc.getDisplay()).toBe("5");
    });

    it("handles multiple digits", async () => {
      await calc.handleSequence("123");
      expect(calc.getDisplay()).toBe("123");
    });

    it("replaces leading zero", async () => {
      await calc.handle("0");
      await calc.handle("5");
      expect(calc.getDisplay()).toBe("5");
    });

    it("clears error state on digit input", async () => {
      mockApi.divide.mockRejectedValue(new Error("Error"));
      await calc.handleSequence("5/0=");
      expect(calc.getDisplay()).toBe("Error");
      await calc.handle("3");
      expect(calc.getDisplay()).toBe("3");
      expect(calc.getExpression()).toBe("");
    });
  });

  describe("decimal input", () => {
    it("handles decimal", async () => {
      await calc.handleSequence("1.5");
      expect(calc.getDisplay()).toBe("1.5");
    });

    it("prevents multiple decimals", async () => {
      await calc.handleSequence("1.5.2");
      expect(calc.getDisplay()).toBe("1.52");
    });

    it("starts with 0. for leading decimal", async () => {
      await calc.handle(".");
      expect(calc.getDisplay()).toBe("0.");
    });

    it("clears error state on dot input", async () => {
      mockApi.divide.mockRejectedValue(new Error("Error"));
      await calc.handleSequence("5/0=");
      await calc.handle(".");
      expect(calc.getDisplay()).toBe("0.");
      expect(calc.getExpression()).toBe("");
    });

    it("resets to 0. after resetDisplay flag", async () => {
      mockApi.add.mockResolvedValue("10");
      await calc.handleSequence("5+5=");
      await calc.handle(".");
      expect(calc.getDisplay()).toBe("0.");
    });
  });

  describe("clear", () => {
    it("clears display", async () => {
      await calc.handleSequence("123");
      await calc.handle("c");
      expect(calc.getDisplay()).toBe("0");
    });

    it("clears operator and operand", async () => {
      mockApi.add.mockResolvedValue("8");
      await calc.handleSequence("5+");
      await calc.handle("c");
      expect(calc.getExpression()).toBe("");
    });

    it("clears error state", async () => {
      mockApi.divide.mockRejectedValue(new Error("Error"));
      await calc.handleSequence("5/0=");
      expect(calc.getDisplay()).toBe("Error");
      await calc.handle("c");
      expect(calc.getDisplay()).toBe("0");
    });
  });

  describe("delete", () => {
    it("deletes last digit", async () => {
      await calc.handleSequence("123");
      await calc.handle("d");
      expect(calc.getDisplay()).toBe("12");
    });

    it("resets to 0 when deleting last digit", async () => {
      await calc.handle("5");
      await calc.handle("d");
      expect(calc.getDisplay()).toBe("0");
    });

    it("does nothing during error state", async () => {
      mockApi.divide.mockRejectedValue(new Error("Error"));
      await calc.handleSequence("5/0=");
      await calc.handle("d");
      expect(calc.getDisplay()).toBe("Error");
    });

    it("does nothing when resetDisplay is true", async () => {
      mockApi.add.mockResolvedValue("10");
      await calc.handleSequence("5+5=");
      expect(calc.getDisplay()).toBe("10");
      await calc.handle("d");
      expect(calc.getDisplay()).toBe("10");
    });
  });

  describe("toggle sign", () => {
    it("toggles positive to negative", async () => {
      await calc.handle("5");
      await calc.handle("t");
      expect(calc.getDisplay()).toBe("-5");
    });

    it("toggles negative to positive", async () => {
      await calc.handleSequence("5t");
      await calc.handle("t");
      expect(calc.getDisplay()).toBe("5");
    });

    it("does nothing during error state", async () => {
      mockApi.divide.mockRejectedValue(new Error("Error"));
      await calc.handleSequence("5/0=");
      await calc.handle("t");
      expect(calc.getDisplay()).toBe("Error");
    });
  });

  describe("sqrt", () => {
    it("computes square root via API", async () => {
      mockApi.sqrt.mockResolvedValue("2");
      await calc.handle("4");
      await calc.handle("s");
      expect(mockApi.sqrt).toHaveBeenCalledWith("4");
      expect(calc.getDisplay()).toBe("2");
    });

    it("shows error for API failure", async () => {
      mockApi.sqrt.mockRejectedValue(new Error("Invalid input"));
      await calc.handle("4");
      await calc.handle("s");
      expect(calc.getDisplay()).toBe("Invalid input");
    });

    it("does nothing during error state", async () => {
      mockApi.divide.mockRejectedValue(new Error("Error"));
      await calc.handleSequence("5/0=");
      await calc.handle("s");
      expect(calc.getDisplay()).toBe("Error");
    });
  });

  describe("operators", () => {
    it("sets operand and operator", async () => {
      await calc.handleSequence("5+");
      expect(calc.getExpression()).toBe("5 +");
    });

    it("does nothing during error state", async () => {
      mockApi.divide.mockRejectedValue(new Error("Error"));
      await calc.handleSequence("5/0=");
      await calc.handle("+");
      expect(calc.getExpression()).toBe("");
      expect(calc.getDisplay()).toBe("Error");
    });

    it("chains operations", async () => {
      mockApi.add.mockResolvedValue("8");
      await calc.handleSequence("5+3+");
      expect(mockApi.add).toHaveBeenCalledWith("5", "3");
      expect(calc.getDisplay()).toBe("8");
      expect(calc.getExpression()).toBe("8 +");
    });
  });

  describe("equals", () => {
    it("computes addition", async () => {
      mockApi.add.mockResolvedValue("8");
      await calc.handleSequence("5+3=");
      expect(calc.getDisplay()).toBe("8");
      expect(calc.getExpression()).toBe("");
    });

    it("does nothing without operator", async () => {
      await calc.handle("5");
      await calc.handle("=");
      expect(calc.getDisplay()).toBe("5");
    });

    it("does nothing during error state", async () => {
      mockApi.divide.mockRejectedValue(new Error("Error"));
      await calc.handleSequence("5/0=");
      await calc.handle("=");
      expect(calc.getDisplay()).toBe("Error");
    });
  });

  describe("API operations", () => {
    it("handles subtraction", async () => {
      mockApi.subtract.mockResolvedValue("2");
      await calc.handleSequence("5-3=");
      expect(mockApi.subtract).toHaveBeenCalledWith("5", "3");
      expect(calc.getDisplay()).toBe("2");
    });

    it("handles multiplication", async () => {
      mockApi.multiply.mockResolvedValue("15");
      await calc.handleSequence("5*3=");
      expect(mockApi.multiply).toHaveBeenCalledWith("5", "3");
      expect(calc.getDisplay()).toBe("15");
    });

    it("handles division", async () => {
      mockApi.divide.mockResolvedValue("2");
      await calc.handleSequence("6/3=");
      expect(mockApi.divide).toHaveBeenCalledWith("6", "3");
      expect(calc.getDisplay()).toBe("2");
    });

    it("handles power", async () => {
      mockApi.power.mockResolvedValue("8");
      await calc.handleSequence("2^3=");
      expect(mockApi.power).toHaveBeenCalledWith("2", "3");
      expect(calc.getDisplay()).toBe("8");
    });

    it("handles percentage", async () => {
      mockApi.percentage.mockResolvedValue("25");
      await calc.handleSequence("50%50=");
      expect(mockApi.percentage).toHaveBeenCalledWith("50", "50");
      expect(calc.getDisplay()).toBe("25");
    });

    it("handles API error", async () => {
      mockApi.add.mockRejectedValue(new Error("Network error"));
      await calc.handleSequence("5+3=");
      expect(calc.getDisplay()).toBe("Network error");
    });

    it("handles non-Error rejection", async () => {
      mockApi.add.mockRejectedValue("string error");
      await calc.handleSequence("5+3=");
      expect(calc.getDisplay()).toBe("API Error");
    });
  });

  describe("invalid instruction", () => {
    it("throws error for invalid instruction", async () => {
      await expect(calc.handle("x")).rejects.toThrow("Invalid instruction: x");
    });
  });

  describe("input after result", () => {
    it("replaces display on digit after equals", async () => {
      mockApi.add.mockResolvedValue("8");
      await calc.handleSequence("5+3=");
      await calc.handle("9");
      expect(calc.getDisplay()).toBe("9");
    });
  });
});
