export type MoveCommand = {
  type: "M";
  args: {
    x: number;
    y: number;
  };
  cursor: {
    x: number;
    y: number;
  };
};

export type RelativeMoveCommand = {
  type: "m";
  args: {
    dx: number;
    dy: number;
  };
};

export type RelativeVerticalLineCommand = {
  type: "v";
  args: {
    dy: number;
  };
};

export type QuadraticCurveCommand = {
  type: "Q";
  args: {
    x: number;
    y: number;
    controlPoint: {
      x: number;
      y: number;
    };
  };
};

export type PathCommandType =
  | MoveCommand
  | RelativeMoveCommand
  | RelativeVerticalLineCommand
  | QuadraticCurveCommand;

export type PathCommand = {
  source: string;
  cursor: { x: number; y: number };
} & PathCommandType;
