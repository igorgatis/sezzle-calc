import { add, subtract, multiply, divide, power, sqrt, percentage } from "./api";

const mockFetch = jest.fn();
global.fetch = mockFetch;

describe("api", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("add", () => {
    it("returns result on success", async () => {
      mockFetch.mockResolvedValue({
        json: () => Promise.resolve({ result: "8" }),
      });
      const result = await add("5", "3");
      expect(result).toBe("8");
      expect(mockFetch).toHaveBeenCalledWith("/api/v1/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ a: "5", b: "3" }),
      });
    });

    it("throws error on API error", async () => {
      mockFetch.mockResolvedValue({
        json: () => Promise.resolve({ error: "Invalid input" }),
      });
      await expect(add("x", "y")).rejects.toThrow("Invalid input");
    });

    it("throws error when result is empty", async () => {
      mockFetch.mockResolvedValue({
        json: () => Promise.resolve({}),
      });
      await expect(add("5", "3")).rejects.toThrow("Result is empty");
    });
  });

  describe("subtract", () => {
    it("returns result on success", async () => {
      mockFetch.mockResolvedValue({
        json: () => Promise.resolve({ result: "2" }),
      });
      const result = await subtract("5", "3");
      expect(result).toBe("2");
      expect(mockFetch).toHaveBeenCalledWith("/api/v1/subtract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ a: "5", b: "3" }),
      });
    });
  });

  describe("multiply", () => {
    it("returns result on success", async () => {
      mockFetch.mockResolvedValue({
        json: () => Promise.resolve({ result: "15" }),
      });
      const result = await multiply("5", "3");
      expect(result).toBe("15");
      expect(mockFetch).toHaveBeenCalledWith("/api/v1/multiply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ a: "5", b: "3" }),
      });
    });
  });

  describe("divide", () => {
    it("returns result on success", async () => {
      mockFetch.mockResolvedValue({
        json: () => Promise.resolve({ result: "2" }),
      });
      const result = await divide("6", "3");
      expect(result).toBe("2");
      expect(mockFetch).toHaveBeenCalledWith("/api/v1/divide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ a: "6", b: "3" }),
      });
    });
  });

  describe("power", () => {
    it("returns result on success", async () => {
      mockFetch.mockResolvedValue({
        json: () => Promise.resolve({ result: "8" }),
      });
      const result = await power("2", "3");
      expect(result).toBe("8");
      expect(mockFetch).toHaveBeenCalledWith("/api/v1/power", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ a: "2", b: "3" }),
      });
    });
  });

  describe("sqrt", () => {
    it("returns result on success", async () => {
      mockFetch.mockResolvedValue({
        json: () => Promise.resolve({ result: "2" }),
      });
      const result = await sqrt("4");
      expect(result).toBe("2");
      expect(mockFetch).toHaveBeenCalledWith("/api/v1/sqrt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ a: "4" }),
      });
    });
  });

  describe("percentage", () => {
    it("returns result on success", async () => {
      mockFetch.mockResolvedValue({
        json: () => Promise.resolve({ result: "25" }),
      });
      const result = await percentage("50", "50");
      expect(result).toBe("25");
      expect(mockFetch).toHaveBeenCalledWith("/api/v1/percentage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ a: "50", b: "50" }),
      });
    });
  });

  describe("edge cases", () => {
    it("handles numeric result (number 0)", async () => {
      mockFetch.mockResolvedValue({
        json: () => Promise.resolve({ result: 0 }),
      });
      const result = await add("5", "-5");
      expect(result).toBe("0");
    });
  });
});
