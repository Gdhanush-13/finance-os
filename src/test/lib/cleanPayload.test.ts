import { describe, it, expect } from "vitest";
import { cleanPayload } from "@/lib/cleanPayload";

describe("cleanPayload", () => {
  it("removes empty string values", () => {
    const result = cleanPayload({ name: "Alice", bio: "" });
    expect(result).toEqual({ name: "Alice" });
  });

  it("keeps falsy non-string values", () => {
    const result = cleanPayload({ amount: 0, active: false });
    expect(result).toEqual({ amount: 0, active: false });
  });

  it("keeps null values", () => {
    const result = cleanPayload({ category: null, name: "x" });
    expect(result).toEqual({ category: null, name: "x" });
  });

  it("returns empty object when all values are empty strings", () => {
    expect(cleanPayload({ a: "", b: "" })).toEqual({});
  });
});
