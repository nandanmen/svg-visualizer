import React from "react";
import { motion } from "framer-motion";
import { parseSVG, type Command } from "svg-path-parser";

const code = `M 20 20
v 20
m 30 0
v -20
M 10 50
Q 40 70 65 50`;

const print = `M12 11
c0 3.517-1.099 6.799-2.753 9.571
m-3.44-2.041.054-.09
A13.916 13.916 0 008 11`;

const heart = `M11.995 7.23319
C10.5455 5.60999 8.12832 5.17335 6.31215 6.65972
C4.4959 8.14609 4.2403 10.6312 5.66654 12.3892
L11.995 18.25
L18.3235 12.3892
C19.7498 10.6312 19.5253 8.13046 17.6779 6.65972
C15.8305 5.18899 13.4446 5.60999 11.995 7.23319
Z`;

const GRID_SIZE = 30;
const CELLS_PER_ROW = 5;
const CELL_SIZE = GRID_SIZE / CELLS_PER_ROW;
const ENDPOINT_SCALE_FACTOR = 68;
const ENDPOINT_SIZE = GRID_SIZE / ENDPOINT_SCALE_FACTOR;

const range = (num: number) => [...Array(num).keys()];

const getCursorAtIndex = (commands: Command[], index: number) => {
  const cursor = { x: 0, y: 0 };

  for (const command of commands.slice(0, index + 1)) {
    switch (command.code) {
      case "M":
      case "Q":
      case "L":
      case "C": {
        cursor.x = command.x;
        cursor.y = command.y;
        break;
      }
      case "m":
      case "c": {
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
  const { code, command: _, relative, ...args } = command;
  if (code === "A" || code === "a") {
    return `${code} ${command.rx} ${command.ry} ${command.xAxisRotation} ${
      command.largeArc ? "1" : "0"
    } ${command.sweep ? "1" : "0"} ${command.x} ${command.y}`;
  }
  return `${code} ${Object.values(args).join(" ")}`;
};

export default function IndexPage() {
  const [path, setPath] = React.useState(print);
  const [activeIndex, setIndex] = React.useState(-1);
  const [commands, setCommands] = React.useState<Command[]>([]);
  const [showControlPoints, toggle] = React.useReducer((state) => !state, true);

  const activeCommands = commands.slice(0, activeIndex + 1);

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
        <button onClick={() => setCommands(parseSVG(path))}>Parse</button>
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
                    r={ENDPOINT_SIZE / 3}
                  />
                ));
              })}
            </g>
            {showControlPoints ? (
              <g>
                <g>
                  {activeCommands.map((command, index) => {
                    const lastCursor = getCursorAtIndex(commands, index - 1);
                    switch (command.code) {
                      case "A":
                      case "a": {
                        const {
                          code,
                          command: _command,
                          relative,
                          ...args
                        } = command;
                        const { cx, cy } = svgArcToCenterParam(
                          lastCursor.x,
                          lastCursor.y,
                          ...Object.values(args)
                        );
                        console.log(cx, cy);
                        return (
                          <ellipse
                            className="text-neutral-300"
                            cx={cx}
                            cy={cy}
                            rx={command.rx}
                            ry={command.ry}
                            fill="none"
                            strokeWidth={ENDPOINT_SIZE / 3}
                            stroke="currentColor"
                          />
                        );
                      }
                    }
                  })}
                </g>
                {activeCommands.map((command, index) => {
                  const lastCursor = getCursorAtIndex(commands, index - 1);
                  const path = toPath(command);
                  return (
                    <motion.path
                      key={path + index}
                      d={`M ${lastCursor.x} ${lastCursor.y} ${path}`}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={GRID_SIZE / 100}
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
                {activeCommands.map((command, index, arr) => {
                  const lastCursor = getCursorAtIndex(arr, index - 1);
                  switch (command.code) {
                    case "M":
                      return (
                        <Move x1={0} y1={0} x2={command.x} y2={command.y} />
                      );
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
                            strokeWidth={ENDPOINT_SIZE / 2}
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
                            strokeWidth={ENDPOINT_SIZE / 2}
                            stroke="currentColor"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 1 }}
                          />
                        </g>
                      );
                    case "C":
                      return (
                        <g className="text-blue-300">
                          <motion.line
                            x1={command.x1}
                            y1={command.y1}
                            x2={lastCursor.x}
                            y2={lastCursor.y}
                            strokeWidth={ENDPOINT_SIZE / 2}
                            stroke="currentColor"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 1 }}
                          />
                          <motion.line
                            x1={command.x2}
                            y1={command.y2}
                            x2={command.x}
                            y2={command.y}
                            strokeWidth={ENDPOINT_SIZE / 2}
                            stroke="currentColor"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 1 }}
                          />
                        </g>
                      );
                    case "c":
                      return (
                        <g className="text-blue-300">
                          <motion.line
                            x1={command.x1 + lastCursor.x}
                            y1={command.y1 + lastCursor.y}
                            x2={lastCursor.x}
                            y2={lastCursor.y}
                            strokeWidth={ENDPOINT_SIZE / 2}
                            stroke="currentColor"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 1 }}
                          />
                          <motion.line
                            x1={command.x2 + lastCursor.x}
                            y1={command.y2 + lastCursor.y}
                            x2={command.x + lastCursor.x}
                            y2={command.y + lastCursor.y}
                            strokeWidth={ENDPOINT_SIZE / 2}
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
                <g>
                  {activeCommands.map((command, index, arr) => {
                    const lastCursor = getCursorAtIndex(arr, index - 1);
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
                      case "L":
                        return (
                          <motion.g
                            initial={lastCursor}
                            animate={{
                              x: command.x,
                              y: command.y,
                            }}
                            transition={{ duration: 1 }}
                          >
                            <LineEndpoint x={0} y={0} />
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
                              strokeWidth={ENDPOINT_SIZE / 3}
                              stroke="white"
                              cx={command.x1}
                              cy={command.y1}
                              r={ENDPOINT_SIZE}
                            />
                            <circle
                              className="text-blue-300"
                              fill="currentColor"
                              strokeWidth={ENDPOINT_SIZE / 3}
                              stroke="white"
                              cx={command.x}
                              cy={command.y}
                              r={ENDPOINT_SIZE}
                            />
                          </>
                        );
                      case "C":
                        return (
                          <>
                            <circle
                              className="text-blue-300"
                              fill="currentColor"
                              strokeWidth={ENDPOINT_SIZE / 3}
                              stroke="white"
                              cx={command.x1}
                              cy={command.y1}
                              r={ENDPOINT_SIZE}
                            />
                            <circle
                              className="text-blue-300"
                              fill="currentColor"
                              strokeWidth={ENDPOINT_SIZE / 3}
                              stroke="white"
                              cx={command.x2}
                              cy={command.y2}
                              r={ENDPOINT_SIZE}
                            />
                            <circle
                              className="text-blue-300"
                              fill="currentColor"
                              strokeWidth={ENDPOINT_SIZE / 3}
                              stroke="white"
                              cx={command.x}
                              cy={command.y}
                              r={ENDPOINT_SIZE}
                            />
                          </>
                        );
                      case "c":
                        return (
                          <>
                            <circle
                              className="text-blue-300"
                              fill="currentColor"
                              strokeWidth={ENDPOINT_SIZE / 3}
                              stroke="white"
                              cx={command.x1 + lastCursor.x}
                              cy={command.y1 + lastCursor.y}
                              r={ENDPOINT_SIZE}
                            />
                            <circle
                              className="text-blue-300"
                              fill="currentColor"
                              strokeWidth={ENDPOINT_SIZE / 3}
                              stroke="white"
                              cx={command.x2 + lastCursor.x}
                              cy={command.y2 + lastCursor.y}
                              r={ENDPOINT_SIZE}
                            />
                            <circle
                              className="text-blue-300"
                              fill="currentColor"
                              strokeWidth={ENDPOINT_SIZE / 3}
                              stroke="white"
                              cx={command.x + lastCursor.x}
                              cy={command.y + lastCursor.y}
                              r={ENDPOINT_SIZE}
                            />
                          </>
                        );
                      default:
                        return null;
                    }
                  })}
                </g>
              </g>
            ) : (
              <motion.path
                d={path}
                fill="none"
                stroke="currentColor"
                strokeWidth={GRID_SIZE / 100}
                className="text-neutral-900"
              />
            )}
          </svg>
        </div>
        <label>
          <input
            type="checkbox"
            checked={showControlPoints}
            onChange={toggle}
          />{" "}
          Show control points
        </label>
      </div>
    </div>
  );
}

const LineEndpoint = ({ x, y }) => (
  <g className="text-yellow-300">
    <circle
      fill="currentColor"
      strokeWidth={ENDPOINT_SIZE / 2}
      stroke="white"
      cx={x}
      cy={y}
      r={ENDPOINT_SIZE}
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
      strokeWidth={ENDPOINT_SIZE / 2}
      stroke="currentColor"
      strokeDasharray={ENDPOINT_SIZE}
      {...props}
    />
    <motion.line
      x1={x2}
      y1={y2}
      x2={x1}
      y2={y1}
      strokeWidth={ENDPOINT_SIZE / 2 + 1}
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
      strokeWidth={ENDPOINT_SIZE / 3}
      stroke="white"
      cx={x}
      cy={y}
      r={ENDPOINT_SIZE}
      {...props}
    />
  </g>
);

function radian(ux, uy, vx, vy) {
  var dot = ux * vx + uy * vy;
  var mod = Math.sqrt((ux * ux + uy * uy) * (vx * vx + vy * vy));
  var rad = Math.acos(dot / mod);
  if (ux * vy - uy * vx < 0.0) {
    rad = -rad;
  }
  return rad;
}
//conversion_from_endpoint_to_center_parameterization
//sample :  svgArcToCenterParam(200,200,50,50,0,1,1,300,200)
// x1 y1 rx ry φ fA fS x2 y2
function svgArcToCenterParam(x1, y1, rx, ry, phi, fA, fS, x2, y2) {
  var cx, cy, startAngle, deltaAngle, endAngle;
  var PIx2 = Math.PI * 2.0;

  if (rx < 0) {
    rx = -rx;
  }
  if (ry < 0) {
    ry = -ry;
  }
  if (rx == 0.0 || ry == 0.0) {
    // invalid arguments
    throw Error("rx and ry can not be 0");
  }

  var s_phi = Math.sin(phi);
  var c_phi = Math.cos(phi);
  var hd_x = (x1 - x2) / 2.0; // half diff of x
  var hd_y = (y1 - y2) / 2.0; // half diff of y
  var hs_x = (x1 + x2) / 2.0; // half sum of x
  var hs_y = (y1 + y2) / 2.0; // half sum of y

  // F6.5.1
  var x1_ = c_phi * hd_x + s_phi * hd_y;
  var y1_ = c_phi * hd_y - s_phi * hd_x;

  // F.6.6 Correction of out-of-range radii
  //   Step 3: Ensure radii are large enough
  var lambda = (x1_ * x1_) / (rx * rx) + (y1_ * y1_) / (ry * ry);
  if (lambda > 1) {
    rx = rx * Math.sqrt(lambda);
    ry = ry * Math.sqrt(lambda);
  }

  var rxry = rx * ry;
  var rxy1_ = rx * y1_;
  var ryx1_ = ry * x1_;
  var sum_of_sq = rxy1_ * rxy1_ + ryx1_ * ryx1_; // sum of square
  if (!sum_of_sq) {
    throw Error("start point can not be same as end point");
  }
  var coe = Math.sqrt(Math.abs((rxry * rxry - sum_of_sq) / sum_of_sq));
  if (fA == fS) {
    coe = -coe;
  }

  // F6.5.2
  var cx_ = (coe * rxy1_) / ry;
  var cy_ = (-coe * ryx1_) / rx;

  // F6.5.3
  cx = c_phi * cx_ - s_phi * cy_ + hs_x;
  cy = s_phi * cx_ + c_phi * cy_ + hs_y;

  var xcr1 = (x1_ - cx_) / rx;
  var xcr2 = (x1_ + cx_) / rx;
  var ycr1 = (y1_ - cy_) / ry;
  var ycr2 = (y1_ + cy_) / ry;

  // F6.5.5
  startAngle = radian(1.0, 0.0, xcr1, ycr1);

  // F6.5.6
  deltaAngle = radian(xcr1, ycr1, -xcr2, -ycr2);
  while (deltaAngle > PIx2) {
    deltaAngle -= PIx2;
  }
  while (deltaAngle < 0.0) {
    deltaAngle += PIx2;
  }
  if (fS == false || fS == 0) {
    deltaAngle -= PIx2;
  }
  endAngle = startAngle + deltaAngle;
  while (endAngle > PIx2) {
    endAngle -= PIx2;
  }
  while (endAngle < 0.0) {
    endAngle += PIx2;
  }

  var outputObj = {
    /* cx, cy, startAngle, deltaAngle */ cx: cx,
    cy: cy,
    startAngle: startAngle,
    deltaAngle: deltaAngle,
    endAngle: endAngle,
    clockwise: fS == true || fS == 1,
  };

  return outputObj;
}
