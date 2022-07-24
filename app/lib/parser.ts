import type { PathCommand } from "~/commands";
import type { NumberToken, Token } from "./tokenize";

export const parse = (tokens: Token[]): PathCommand[] => {
  let cursor = 0;
  const pathCursor = { x: 0, y: 0 };

  const nextToken = () => tokens[cursor++];

  const nextNumber = (): NumberToken => {
    const token = nextToken();
    if (token.type !== "number") {
      throw new Error(`Expected number, got ${token.type}`);
    }
    return token;
  };

  const parseMove = (): PathCommand => {
    const x = nextNumber().value;
    const y = nextNumber().value;
    return {
      type: "M",
      source: `M ${x} ${y}`,
      args: { x, y },
      cursor: { x, y },
    };
  };

  const parseRelativeMove = (): PathCommand => {
    const dx = nextNumber().value;
    const dy = nextNumber().value;
    return {
      type: "m",
      source: `m ${dx} ${dy}`,
      args: { dx, dy },
      cursor: { x: pathCursor.x + dx, y: pathCursor.y + dy },
    };
  };

  const parseRelativeVertical = (): PathCommand => {
    const dy = nextNumber().value;
    return {
      type: "v",
      source: `M ${pathCursor.x} ${pathCursor.y} v ${dy}`,
      args: { dy },
      cursor: {
        x: pathCursor.x,
        y: pathCursor.y + dy,
      },
    };
  };

  const parseQuadraticCurve = (): PathCommand => {
    const controlPointX = nextNumber().value;
    const controlPointY = nextNumber().value;
    const x = nextNumber().value;
    const y = nextNumber().value;
    return {
      type: "Q",
      source: `M ${pathCursor.x} ${pathCursor.y} Q ${controlPointX} ${controlPointY} ${x} ${y}`,
      args: { x, y, controlPoint: { x: controlPointX, y: controlPointY } },
      cursor: { x, y },
    };
  };

  const parseCommand = () => {
    const token = nextToken();
    if (token.type !== "command") {
      throw new Error(`Expected command token, received ${token.type}`);
    }

    let command: PathCommand;
    switch (token.value) {
      case "M":
        command = parseMove();
        break;
      case "m":
        command = parseRelativeMove();
        break;
      case "v":
        command = parseRelativeVertical();
        break;
      case "Q":
        command = parseQuadraticCurve();
        break;
      default:
        throw new Error(`Unknown command type: ${token.value}`);
    }
    pathCursor.x = command.cursor.x;
    pathCursor.y = command.cursor.y;
    return command;
  };

  const commands = [] as PathCommand[];
  while (cursor < tokens.length) {
    commands.push(parseCommand());
  }
  return commands;
};
