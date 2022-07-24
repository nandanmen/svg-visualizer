import React from "react";
import { motion } from "framer-motion";
import { parseSVG, type Command } from "svg-path-parser";

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

const getCursorAtIndex = (commands: Command[], index: number) => {
  const cursor = { x: 0, y: 0 };

  for (const command of commands.slice(0, index + 1)) {
    switch (command.code) {
      case "M":
      case "Q": {
        cursor.x = command.x;
        cursor.y = command.y;
        break;
      }
      case "m": {
        cursor.x += command.x;
        cursor.y += command.y;
        break;
      }
      case "v": {
        cursor.y += command.y;
        break;
      }
    }
  }

  return cursor;
};

const toPath = (command: Command) => {
  switch (command.code) {
    case "M":
      return `M ${command.x} ${command.y}`;
    case "m":
      return `m ${command.x} ${command.y}`;
    case "Q":
      return `Q ${command.x1} ${command.y1} ${command.x} ${command.y}`;
    case "v":
      return `v ${command.y}`;
    default:
      return "";
  }
};

export default function IndexPage() {
  const [path, setPath] = React.useState(code);
  const [activeIndex, setIndex] = React.useState(-1);

  const commands = React.useMemo(() => parseSVG(path), [path]);

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
              {commands.map((command, index, arr) => {
                const lastCursor = getCursorAtIndex(arr, index - 1);
                switch (command.code) {
                  case "M":
                    return <Move x1={0} y1={0} x2={command.x} y2={command.y} />;
                  case "m":
                    return (
                      <Move
                        x1={lastCursor.x}
                        y1={lastCursor.y}
                        x2={lastCursor.x + command.x}
                        y2={lastCursor.y + command.y}
                      />
                    );
                  case "Q":
                    return (
                      <g className="text-blue-300">
                        <motion.line
                          x1={command.x1}
                          y1={command.y1}
                          x2={lastCursor.x}
                          y2={lastCursor.y}
                          strokeWidth="0.5"
                          stroke="currentColor"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 1 }}
                        />
                        <motion.line
                          x1={command.x1}
                          y1={command.y1}
                          x2={command.x}
                          y2={command.y}
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
              {commands.map((command, index) => {
                const lastCursor = getCursorAtIndex(commands, index - 1);
                const path = toPath(command);
                return (
                  <motion.path
                    key={path + index}
                    d={`M ${lastCursor.x} ${lastCursor.y} ${path}`}
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
                    animate="active"
                    initial="idle"
                    transition={{ duration: 1 }}
                  />
                );
              })}
              <g>
                {commands.map((command, index, arr) => {
                  const lastCursor = getCursorAtIndex(arr, index - 1);
                  console.log(lastCursor, command);
                  switch (command.code) {
                    case "M":
                      return (
                        <motion.g
                          initial={{ x: 0, y: 0 }}
                          animate={{ x: command.x, y: command.y }}
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
                            x: lastCursor.x + command.x,
                            y: lastCursor.y + command.y,
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
                            y: lastCursor.y + command.y,
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
                            cx={command.x1}
                            cy={command.y1}
                            r="1.5"
                          />
                          <circle
                            className="text-blue-300"
                            fill="currentColor"
                            strokeWidth="0.5"
                            stroke="white"
                            cx={command.x}
                            cy={command.y}
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
