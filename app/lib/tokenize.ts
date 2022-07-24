const knownCommands = new Set<CommandType>(["m", "M", "v", "Q", "L"]);

export type CommandType = "M" | "m" | "v" | "Q" | "L";

export type Token = NumberToken | CommandToken;

export type NumberToken = { type: "number"; value: number };

export type CommandToken = { type: "command"; value: CommandType };

export const tokenize = (source: string): Token[] => {
  const tokens = [] as Token[];
  let cursor = 0;
  while (cursor < source.length) {
    const char = source[cursor];
    if (isNumberStart(char)) {
      const numberStart = cursor;
      while (isNumberStart(source[cursor])) {
        cursor++;
      }
      tokens.push(number(source.slice(numberStart, cursor)));
    } else if (knownCommands.has(char as CommandType)) {
      tokens.push(command(char as CommandType));
      cursor++;
    } else if (isWhitespace(char)) {
      cursor++;
    } else {
      throw new Error(`Unknown character ${char}`);
    }
  }
  return tokens;
};

const command = (value: CommandType): Token => {
  return { type: "command", value };
};

const number = (value: string): Token => {
  return { type: "number", value: parseFloat(value) };
};

const isNumberStart = (char: string) => {
  return isDigit(char) || char === "-" || char === ".";
};

const isDigit = (char: string) => {
  return /\d/.test(char);
};

const isWhitespace = (char: string) => {
  return /\s/.test(char);
};
