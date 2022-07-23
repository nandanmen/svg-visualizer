import React from "react";
import { motion } from "framer-motion";
import type { PathCommand } from "~/commands";

const code = `M 20 20
v 20
m 30 0
v -20
M 10 50
Q 40 70 65 50`;

const GRID_SIZE = 100;
const CELLS_PER_ROW = 10;
const CELL_SIZE = GRID_SIZE / CELLS_PER_ROW;

const range = (num: number) => [...Array(num).keys()];

// We want to turn the path code string into an array of path commands:
const commands: PathCommand[] = [
  {
    type: "M",
    source: "M 20 20",
    args: {
      x: 20,
      y: 20,
    },
    cursor: {
      x: 20,
      y: 20,
    },
  },
  {
    type: "v",
    source: "M 20 20 v 20",
    args: {
      dy: 20,
    },
    cursor: {
      x: 20,
      y: 40,
    },
  },
  {
    type: "m",
    source: "m 30 0",
    args: {
      dx: 30,
      dy: 0,
    },
    cursor: {
      x: 50,
      y: 40,
    },
  },
  {
    type: "v",
    source: "M 50 40 v -20",
    args: {
      dy: -20,
    },
    cursor: {
      x: 50,
      y: 20,
    },
  },
  {
    type: "M",
    source: "M 10 50",
    args: {
      x: 10,
      y: 50,
    },
    cursor: {
      x: 10,
      y: 50,
    },
  },
  {
    type: "Q",
    source: "M 10 50 Q 40 70 65 50",
    args: {
      controlPoint: {
        x: 40,
        y: 70,
      },
      x: 65,
      y: 50,
    },
    cursor: {
      x: 65,
      y: 50,
    },
  },
];

export default function IndexPage() {
  const [path, setPath] = React.useState(code);
  const [activeIndex, setIndex] = React.useState(-1);

  return (
    <div className="font-mono bg-neutral-100 min-h-screen main p-20 gap-16 antialiased">
      <div>
        <header className="py-1 border-b border-neutral-800 mb-10">
          <h2>Path Data</h2>
        </header>
        <textarea
          className="w-full h-[440px] bg-inherit border border-neutral-800 p-8 text-lg"
          value={path}
          onChange={(e) => setPath(e.target.value)}
        />
        <button onClick={() => setIndex(activeIndex + 1)}>Next</button>
        <pre>{JSON.stringify(commands[activeIndex], null, 2)}</pre>
      </div>
      <div>
        <header className="py-1 border-b border-neutral-800 mb-10">
          <h2>Visualisation</h2>
        </header>
        <div className="aspect-square">
          <svg
            width="100%"
            height="100%"
            xmlns="http://www.w3.org/2000/svg"
            viewBox={`-.5 -.5 ${GRID_SIZE} ${GRID_SIZE}`}
          >
            <g>
              {range(CELLS_PER_ROW).map((x) => {
                return range(CELLS_PER_ROW).map((y) => (
                  <circle
                    key={`grid-${x}-${y}`}
                    cx={x * CELL_SIZE}
                    cy={y * CELL_SIZE}
                    fill="currentColor"
                    className="text-neutral-300"
                    r=".5"
                  />
                ));
              })}
            </g>
            <g>
              {commands.slice(0, activeIndex + 1).map((command, index, arr) => {
                const lastCursor = arr[index - 1]?.cursor ?? { x: 0, y: 0 };
                switch (command.type) {
                  case "M":
                    return (
                      <Move
                        x1={0}
                        y1={0}
                        x2={command.args.x}
                        y2={command.args.y}
                      />
                    );
                  case "m":
                    return (
                      <Move
                        x1={lastCursor.x}
                        y1={lastCursor.y}
                        x2={lastCursor.x + command.args.dx}
                        y2={lastCursor.y + command.args.dy}
                      />
                    );
                  case "Q":
                    return (
                      <g className="text-blue-300">
                        <motion.line
                          x1={command.args.controlPoint.x}
                          y1={command.args.controlPoint.y}
                          x2={lastCursor.x}
                          y2={lastCursor.y}
                          strokeWidth="0.5"
                          stroke="currentColor"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 1 }}
                        />
                        <motion.line
                          x1={command.args.controlPoint.x}
                          y1={command.args.controlPoint.y}
                          x2={command.args.x}
                          y2={command.args.y}
                          strokeWidth="0.5"
                          stroke="currentColor"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 1 }}
                        />
                      </g>
                    );
                  default:
                    return null;
                }
              })}
              {commands.map((command, index) => (
                <motion.path
                  key={command.source + index}
                  d={command.source}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  className="text-neutral-900"
                  variants={{
                    active: {
                      pathLength: 1,
                    },
                    idle: {
                      pathLength: 0,
                    },
                  }}
                  animate={index <= activeIndex ? "active" : "idle"}
                  initial="idle"
                  transition={{ duration: 1 }}
                />
              ))}
              <g>
                {commands
                  .slice(0, activeIndex + 1)
                  .map((command, index, arr) => {
                    const lastCursor = arr[index - 1]?.cursor ?? { x: 0, y: 0 };
                    switch (command.type) {
                      case "M":
                        return (
                          <motion.g
                            initial={{ x: 0, y: 0 }}
                            animate={{ x: command.args.x, y: command.args.y }}
                            transition={{ duration: 1 }}
                          >
                            <MoveEndpoint x={0} y={0} />
                          </motion.g>
                        );
                      case "m":
                        return (
                          <motion.g
                            initial={lastCursor}
                            animate={{
                              x: lastCursor.x + command.args.dx,
                              y: lastCursor.y + command.args.dy,
                            }}
                            transition={{ duration: 1 }}
                          >
                            <MoveEndpoint x={0} y={0} />
                          </motion.g>
                        );
                      case "v":
                        return (
                          <motion.g
                            initial={lastCursor}
                            animate={{
                              x: lastCursor.x,
                              y: lastCursor.y + command.args.dy,
                            }}
                            transition={{ duration: 1 }}
                          >
                            <LineEndpoint x={0} y={0} />
                          </motion.g>
                        );
                      case "Q":
                        return (
                          <>
                            <circle
                              className="text-blue-300"
                              fill="currentColor"
                              strokeWidth="0.5"
                              stroke="white"
                              cx={command.args.controlPoint.x}
                              cy={command.args.controlPoint.y}
                              r="1.5"
                            />
                            <circle
                              className="text-blue-300"
                              fill="currentColor"
                              strokeWidth="0.5"
                              stroke="white"
                              cx={command.args.x}
                              cy={command.args.y}
                              r="1.5"
                            />
                          </>
                        );
                      default:
                        return null;
                    }
                  })}
              </g>
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
}

const LineEndpoint = ({ x, y }) => (
  <g className="text-yellow-300">
    <circle
      fill="currentColor"
      strokeWidth="0.5"
      stroke="white"
      cx={x}
      cy={y}
      r="1.5"
    />
  </g>
);

const Move = ({ x1, y1, x2, y2, ...props }) => (
  <g className="text-red-300">
    <line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      strokeWidth="0.5"
      stroke="currentColor"
      strokeDasharray="1.5"
      {...props}
    />
    <motion.line
      x1={x2}
      y1={y2}
      x2={x1}
      y2={y1}
      strokeWidth="0.6"
      stroke="currentColor"
      className="text-neutral-100"
      animate="active"
      initial="idle"
      variants={{
        active: {
          pathLength: 0,
        },
        idle: {
          pathLength: 1,
        },
      }}
      transition={{ duration: 1 }}
    />
  </g>
);

const MoveEndpoint = ({ x, y, ...props }) => (
  <g className="text-red-300">
    <motion.circle
      fill="currentColor"
      strokeWidth="0.5"
      stroke="white"
      cx={x}
      cy={y}
      r="1.5"
      {...props}
    />
  </g>
);
