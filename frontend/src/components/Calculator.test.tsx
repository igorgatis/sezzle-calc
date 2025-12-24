import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import Calculator from "./Calculator";
import * as api from "@/lib/api";

jest.mock("@/lib/api");

const mockApi = api as jest.Mocked<typeof api>;

describe("Calculator", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders calculator with display showing 0", () => {
    render(<Calculator />);
    expect(screen.getByTestId("display")).toHaveTextContent("0");
  });

  it("displays digits when number buttons are clicked", () => {
    render(<Calculator />);
    fireEvent.click(screen.getByText("1"));
    fireEvent.click(screen.getByText("2"));
    fireEvent.click(screen.getByText("3"));
    expect(screen.getByTestId("display")).toHaveTextContent("123");
  });

  it("handles decimal input", () => {
    render(<Calculator />);
    fireEvent.click(screen.getByText("1"));
    fireEvent.click(screen.getByText("."));
    fireEvent.click(screen.getByText("5"));
    expect(screen.getByTestId("display")).toHaveTextContent("1.5");
  });

  it("prevents multiple decimal points", () => {
    render(<Calculator />);
    fireEvent.click(screen.getByText("1"));
    fireEvent.click(screen.getByText("."));
    fireEvent.click(screen.getByText("5"));
    fireEvent.click(screen.getByText("."));
    fireEvent.click(screen.getByText("2"));
    expect(screen.getByTestId("display")).toHaveTextContent("1.52");
  });

  it("clears display when C is clicked", () => {
    render(<Calculator />);
    fireEvent.click(screen.getByText("1"));
    fireEvent.click(screen.getByText("2"));
    fireEvent.click(screen.getByText("C"));
    expect(screen.getByTestId("display")).toHaveTextContent("0");
  });

  it("performs addition via API", async () => {
    mockApi.add.mockResolvedValue("8");

    render(<Calculator />);
    fireEvent.click(screen.getByText("5"));
    fireEvent.click(screen.getByText("+"));
    fireEvent.click(screen.getByText("3"));
    fireEvent.click(screen.getByText("="));

    await waitFor(() => {
      expect(screen.getByTestId("display")).toHaveTextContent("8");
    });
    expect(mockApi.add).toHaveBeenCalledWith("5", "3");
  });

  it("performs subtraction via API", async () => {
    mockApi.subtract.mockResolvedValue("7");

    render(<Calculator />);
    fireEvent.click(screen.getByText("1"));
    fireEvent.click(screen.getByText("0"));
    fireEvent.click(screen.getByText("-"));
    fireEvent.click(screen.getByText("3"));
    fireEvent.click(screen.getByText("="));

    await waitFor(() => {
      expect(screen.getByTestId("display")).toHaveTextContent("7");
    });
    expect(mockApi.subtract).toHaveBeenCalledWith("10", "3");
  });

  it("performs multiplication via API", async () => {
    mockApi.multiply.mockResolvedValue("15");

    render(<Calculator />);
    fireEvent.click(screen.getByText("5"));
    fireEvent.click(screen.getByText("*"));
    fireEvent.click(screen.getByText("3"));
    fireEvent.click(screen.getByText("="));

    await waitFor(() => {
      expect(screen.getByTestId("display")).toHaveTextContent("15");
    });
    expect(mockApi.multiply).toHaveBeenCalledWith("5", "3");
  });

  it("performs division via API", async () => {
    mockApi.divide.mockResolvedValue("5");

    render(<Calculator />);
    fireEvent.click(screen.getByText("1"));
    fireEvent.click(screen.getByText("0"));
    fireEvent.click(screen.getByText("/"));
    fireEvent.click(screen.getByText("2"));
    fireEvent.click(screen.getByText("="));

    await waitFor(() => {
      expect(screen.getByTestId("display")).toHaveTextContent("5");
    });
    expect(mockApi.divide).toHaveBeenCalledWith("10", "2");
  });

  it("displays error from API", async () => {
    mockApi.divide.mockRejectedValue(new Error("division by zero"));

    render(<Calculator />);
    fireEvent.click(screen.getByText("5"));
    fireEvent.click(screen.getByText("/"));
    fireEvent.click(screen.getByRole("button", { name: "0" }));
    fireEvent.click(screen.getByText("="));

    await waitFor(() => {
      expect(screen.getByTestId("display")).toHaveTextContent("division by zero");
    });
  });

  it("performs power operation via API", async () => {
    mockApi.power.mockResolvedValue("8");

    render(<Calculator />);
    fireEvent.click(screen.getByText("2"));
    const powerButton = screen.getByRole("button", { name: /x y/i });
    fireEvent.click(powerButton);
    fireEvent.click(screen.getByText("3"));
    fireEvent.click(screen.getByText("="));

    await waitFor(() => {
      expect(screen.getByTestId("display")).toHaveTextContent("8");
    });
    expect(mockApi.power).toHaveBeenCalledWith("2", "3");
  });

  it("performs percentage operation via API", async () => {
    mockApi.percentage.mockResolvedValue("100");

    render(<Calculator />);
    fireEvent.click(screen.getByText("5"));
    fireEvent.click(screen.getByText("0"));
    fireEvent.click(screen.getByText("x% of y"));
    fireEvent.click(screen.getByText("2"));
    fireEvent.click(screen.getByRole("button", { name: "0" }));
    fireEvent.click(screen.getByRole("button", { name: "0" }));
    fireEvent.click(screen.getByText("="));

    await waitFor(() => {
      expect(screen.getByTestId("display")).toHaveTextContent("100");
    });
    expect(mockApi.percentage).toHaveBeenCalledWith("50", "200");
  });

  it("toggles sign with +/- button", () => {
    render(<Calculator />);
    fireEvent.click(screen.getByText("5"));
    fireEvent.click(screen.getByText("+/-"));
    expect(screen.getByTestId("display")).toHaveTextContent("-5");
    fireEvent.click(screen.getByText("+/-"));
    expect(screen.getByTestId("display")).toHaveTextContent("5");
  });

  it("deletes last digit with DEL button", () => {
    render(<Calculator />);
    fireEvent.click(screen.getByText("1"));
    fireEvent.click(screen.getByText("2"));
    fireEvent.click(screen.getByText("3"));
    fireEvent.click(screen.getByText("DEL"));
    expect(screen.getByTestId("display")).toHaveTextContent("12");
  });

  it("resets to 0 when deleting last digit", () => {
    render(<Calculator />);
    fireEvent.click(screen.getByText("5"));
    fireEvent.click(screen.getByText("DEL"));
    expect(screen.getByTestId("display")).toHaveTextContent("0");
  });

  it("performs sqrt operation via API", async () => {
    mockApi.sqrt.mockResolvedValue("2");
    render(<Calculator />);
    fireEvent.click(screen.getByRole("button", { name: "4" }));
    const sqrtButton = screen.getByRole("button", { name: /√x/i });
    fireEvent.click(sqrtButton);
    await waitFor(() => {
      expect(screen.getByTestId("display")).toHaveTextContent("2");
    });
    expect(mockApi.sqrt).toHaveBeenCalledWith("4");
  });

  it("shows error for sqrt API failure", async () => {
    mockApi.sqrt.mockRejectedValue(new Error("Invalid input"));
    render(<Calculator />);
    fireEvent.click(screen.getByRole("button", { name: "4" }));
    const sqrtButton = screen.getByRole("button", { name: /√x/i });
    fireEvent.click(sqrtButton);
    await waitFor(() => {
      expect(screen.getByTestId("display")).toHaveTextContent("Invalid input");
    });
  });

  describe("keyboard input", () => {
    it("handles digit keys", () => {
      render(<Calculator />);
      fireEvent.keyDown(window, { key: "5" });
      expect(screen.getByTestId("display")).toHaveTextContent("5");
    });

    it("handles Backspace key for delete", () => {
      render(<Calculator />);
      fireEvent.click(screen.getByText("1"));
      fireEvent.click(screen.getByText("2"));
      fireEvent.keyDown(window, { key: "Backspace" });
      expect(screen.getByTestId("display")).toHaveTextContent("1");
    });

    it("handles Escape key for clear", () => {
      render(<Calculator />);
      fireEvent.click(screen.getByText("1"));
      fireEvent.click(screen.getByText("2"));
      fireEvent.keyDown(window, { key: "Escape" });
      expect(screen.getByTestId("display")).toHaveTextContent("0");
    });

    it("handles Enter key for equals", async () => {
      mockApi.add.mockResolvedValue("8");
      render(<Calculator />);
      fireEvent.keyDown(window, { key: "5" });
      fireEvent.keyDown(window, { key: "+" });
      fireEvent.keyDown(window, { key: "3" });
      fireEvent.keyDown(window, { key: "Enter" });
      await waitFor(() => {
        expect(screen.getByTestId("display")).toHaveTextContent("8");
      });
    });

    it("handles operator keys", async () => {
      mockApi.subtract.mockResolvedValue("2");
      render(<Calculator />);
      fireEvent.keyDown(window, { key: "5" });
      fireEvent.keyDown(window, { key: "-" });
      fireEvent.keyDown(window, { key: "3" });
      fireEvent.keyDown(window, { key: "=" });
      await waitFor(() => {
        expect(screen.getByTestId("display")).toHaveTextContent("2");
      });
    });

    it("handles / key for division", async () => {
      mockApi.divide.mockResolvedValue("2");
      render(<Calculator />);
      fireEvent.keyDown(window, { key: "6" });
      fireEvent.keyDown(window, { key: "/" });
      fireEvent.keyDown(window, { key: "3" });
      fireEvent.keyDown(window, { key: "=" });
      await waitFor(() => {
        expect(screen.getByTestId("display")).toHaveTextContent("2");
      });
    });

    it("ignores invalid keys", () => {
      render(<Calculator />);
      fireEvent.keyDown(window, { key: "x" });
      expect(screen.getByTestId("display")).toHaveTextContent("0");
    });
  });

  describe("display text sizing", () => {
    it("uses default size for short numbers", () => {
      render(<Calculator />);
      fireEvent.click(screen.getByRole("button", { name: "5" }));
      const display = screen.getByTestId("display");
      expect(display).toHaveClass("text-3xl");
    });

    it("reduces text size for medium numbers (15-18 chars)", () => {
      render(<Calculator />);
      const btn = screen.getByRole("button", { name: "1" });
      for (let i = 0; i < 16; i++) {
        fireEvent.click(btn);
      }
      const display = screen.getByTestId("display");
      expect(display).toHaveClass("text-2xl");
    });

    it("reduces text size further for longer numbers (19-21 chars)", () => {
      render(<Calculator />);
      const btn = screen.getByRole("button", { name: "1" });
      for (let i = 0; i < 20; i++) {
        fireEvent.click(btn);
      }
      const display = screen.getByTestId("display");
      expect(display).toHaveClass("text-xl");
    });

    it("uses text-lg for numbers 22-24 chars", () => {
      render(<Calculator />);
      const btn = screen.getByRole("button", { name: "1" });
      for (let i = 0; i < 23; i++) {
        fireEvent.click(btn);
      }
      const display = screen.getByTestId("display");
      expect(display).toHaveClass("text-lg");
    });

    it("uses text-base for numbers 25-27 chars", () => {
      render(<Calculator />);
      const btn = screen.getByRole("button", { name: "1" });
      for (let i = 0; i < 26; i++) {
        fireEvent.click(btn);
      }
      const display = screen.getByTestId("display");
      expect(display).toHaveClass("text-base");
    });

    it("uses smallest text for very long numbers (28+ chars)", () => {
      render(<Calculator />);
      const btn = screen.getByRole("button", { name: "1" });
      for (let i = 0; i < 30; i++) {
        fireEvent.click(btn);
      }
      const display = screen.getByTestId("display");
      expect(display).toHaveClass("text-sm");
    });
  });

  describe("all buttons coverage", () => {
    it("clicks all digit buttons", () => {
      render(<Calculator />);
      fireEvent.click(screen.getByRole("button", { name: "7" }));
      fireEvent.click(screen.getByRole("button", { name: "8" }));
      fireEvent.click(screen.getByRole("button", { name: "9" }));
      fireEvent.click(screen.getByRole("button", { name: "4" }));
      fireEvent.click(screen.getByRole("button", { name: "6" }));
      expect(screen.getByTestId("display")).toHaveTextContent("78946");
    });
  });

  describe("expression display", () => {
    it("shows expression when operator is selected", async () => {
      render(<Calculator />);
      fireEvent.click(screen.getByRole("button", { name: "5" }));
      fireEvent.click(screen.getByText("+"));
      await waitFor(() => {
        const displayContainer = screen.getByTestId("display").parentElement;
        expect(displayContainer?.textContent).toContain("5 +");
      });
    });
  });
});
