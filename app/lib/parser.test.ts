import { expect, it, describe } from "vitest";
import { parse } from "./parser";

describe("parser", () => {
  it("parses a move command", () => {
    expect(
      parse([
        { type: "command", value: "M" },
        { type: "number", value: 20 },
        { type: "number", value: 20 },
      ])
    ).toEqual([
      {
        type: "M",
        source: "M 20 20",
        args: { x: 20, y: 20 },
        cursor: { x: 20, y: 20 },
      },
    ]);
  });

  it("parses a relative move command", () => {
    expect(
      parse([
        { type: "command", value: "m" },
        { type: "number", value: 20 },
        { type: "number", value: 20 },
      ])
    ).toEqual([
      {
        type: "m",
        source: "m 20 20",
        args: { dx: 20, dy: 20 },
        cursor: { x: 20, y: 20 },
      },
    ]);
  });

  it("parses a relative vertical command", () => {
    expect(
      parse([
        { type: "command", value: "v" },
        { type: "number", value: 20 },
      ])
    ).toEqual([
      {
        type: "v",
        source: "M 0 0 v 20",
        args: { dy: 20 },
        cursor: { x: 0, y: 20 },
      },
    ]);
  });

  it("parses a quadratic curve command", () => {
    expect(
      parse([
        { type: "command", value: "Q" },
        { type: "number", value: 40 },
        { type: "number", value: 70 },
        { type: "number", value: 65 },
        { type: "number", value: 50 },
      ])
    ).toEqual([
      {
        type: "Q",
        source: "M 0 0 Q 40 70 65 50",
        args: { x: 65, y: 50, controlPoint: { x: 40, y: 70 } },
        cursor: { x: 65, y: 50 },
      },
    ]);
  });

  it("moves the cursor across commands", () => {
    expect(
      parse([
        { type: "command", value: "M" },
        { type: "number", value: 20 },
        { type: "number", value: 20 },
        { type: "command", value: "v" },
        { type: "number", value: 20 },
      ])
    ).toEqual([
      {
        type: "M",
        source: "M 20 20",
        args: { x: 20, y: 20 },
        cursor: { x: 20, y: 20 },
      },
      {
        type: "v",
        source: "M 20 20 v 20",
        args: { dy: 20 },
        cursor: { x: 20, y: 40 },
      },
    ]);
  });
});
