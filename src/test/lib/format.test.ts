import { describe, it, expect } from "vitest";
import { formatCurrency, formatDate } from "@/lib/format";

describe("formatCurrency", () => {
  it("formats a positive number as USD", () => {
    expect(formatCurrency(1234.56)).toContain("1,234.56");
  });

  it("returns — for null", () => {
    expect(formatCurrency(null)).toBe("—");
  });

  it("returns — for undefined", () => {
    expect(formatCurrency(undefined)).toBe("—");
  });

  it("returns — for NaN", () => {
    expect(formatCurrency(NaN)).toBe("—");
  });

  it("formats zero correctly", () => {
    expect(formatCurrency(0)).toContain("0");
  });
});

describe("formatDate", () => {
  it("formats a date string", () => {
    expect(formatDate("2024-01-15")).toBe("Jan 15, 2024");
  });

  it("returns — for null", () => {
    expect(formatDate(null)).toBe("—");
  });

  it("returns — for undefined", () => {
    expect(formatDate(undefined)).toBe("—");
  });
});
