import { expect, it, describe } from "vitest";
import { tokenize } from "./tokenize";

describe("tokenize", () => {
  it("tokenizes one command", () => {
    expect(tokenize("M 20 20")).toEqual([
      { type: "command", value: "M" },
      { type: "number", value: 20 },
      { type: "number", value: 20 },
    ]);
  });

  it("tokenizes multiple commands", () => {
    expect(tokenize("M 20 20 L 20 20")).toEqual([
      { type: "command", value: "M" },
      { type: "number", value: 20 },
      { type: "number", value: 20 },
      { type: "command", value: "L" },
      { type: "number", value: 20 },
      { type: "number", value: 20 },
    ]);
  });

  it("tokenizes negative numbers", () => {
    expect(tokenize("M -20 -20")).toEqual([
      { type: "command", value: "M" },
      { type: "number", value: -20 },
      { type: "number", value: -20 },
    ]);
  });

  it("tokenizes decimals", () => {
    expect(tokenize("M 20.5 20.5")).toEqual([
      { type: "command", value: "M" },
      { type: "number", value: 20.5 },
      { type: "number", value: 20.5 },
    ]);
  });
});
