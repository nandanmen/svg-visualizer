import React from "react";

const code = `M 20 20
v 20
m 30 0
v -20
M 10 50
Q 40 70 65 50`;

const GRID_SIZE = 80;
const CELLS_PER_ROW = 8;
const CELL_SIZE = GRID_SIZE / CELLS_PER_ROW;

const commands = [
  {
    type: "M",
    x: 20,
    y: 20,
  },
  {
    type: "v",
    dy: 20,
  },
  {
    type: "m",
    dx: 30,
    dy: 0,
  },
  {
    type: "v",
    dy: -20,
  },
];

export default function IndexPage() {
  const [path, setPath] = React.useState(code);

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
            viewBox={`0 0 ${GRID_SIZE} ${GRID_SIZE}`}
          >
            <defs>
              <pattern
                id="grid"
                width={CELL_SIZE}
                height={CELL_SIZE}
                patternUnits="userSpaceOnUse"
              >
                <path
                  d={`M ${CELL_SIZE} 0 L 0 0 0 ${CELL_SIZE}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.5"
                  className="text-neutral-200"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            <path
              d={`M 0 ${GRID_SIZE} L ${GRID_SIZE} ${GRID_SIZE} L ${GRID_SIZE} 0`}
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-neutral-200"
            />
            <g>
              <Move x1={0} y1={0} x2={20} y2={20} />
              <Move x1={20} y1={40} x2={50} y2={40} />
              <Move x1={0} y1={0} x2={10} y2={50} />
              <g className="text-blue-300">
                <line
                  x1="40"
                  y1="70"
                  x2="10"
                  y2="50"
                  strokeWidth="0.5"
                  stroke="currentColor"
                />
                <line
                  x1="40"
                  y1="70"
                  x2="65"
                  y2="50"
                  strokeWidth="0.5"
                  stroke="currentColor"
                />
                <circle
                  fill="currentColor"
                  strokeWidth="0.5"
                  stroke="white"
                  cx="40"
                  cy="70"
                  r="1.5"
                />
              </g>
              <path
                d={path}
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                className="text-neutral-900"
              />
              <g>
                <LineEndpoint x={20} y={40} />
                <LineEndpoint x={50} y={20} />
                <MoveEndpoint x={20} y={20} />
                <MoveEndpoint x={50} y={40} />
                <MoveEndpoint x={10} y={50} />
                <MoveEndpoint x={65} y={50} />
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

const Move = ({ x1, y1, x2, y2 }) => (
  <g className="text-red-300">
    <line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      strokeWidth="0.5"
      stroke="currentColor"
      strokeDasharray="1.5"
    />
  </g>
);

const MoveEndpoint = ({ x, y }) => (
  <g className="text-red-300">
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
