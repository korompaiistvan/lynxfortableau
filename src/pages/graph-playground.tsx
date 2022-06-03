import { useEffect, useState, Fragment } from "react";
import * as dagre from "dagre";

const nodes = [
  { id: "A", label: "A", width: 100, height: 100 },
  { id: "B", label: "B", width: 100, height: 100 },
  { id: "C", label: "C", width: 100, height: 100 },
  { id: "D", label: "D", width: 100, height: 100 },
  { id: "E", label: "E", width: 100, height: 100 },
  { id: "F", label: "F", width: 100, height: 100 },
  { id: "G", label: "G", width: 100, height: 100 },
  { id: "H", label: "H", width: 100, height: 100 },
];

const edges = [
  ["A", "D"],
  ["B", "D"],
  ["B", "E"],
  ["C", "E"],
  ["C", "F"],
  ["E", "F"],
  ["G", "F"],
  ["G", "H"],
  ["F", "H"],
];

function Main() {
  const [graph, setGraph] = useState<dagre.graphlib.Graph>();
  useEffect(() => {
    const newGraph = new dagre.graphlib.Graph();
    newGraph.setGraph({ ranker: "longest-path", ranksep: 75, nodesep: 75, rankdir: "RL" });
    newGraph.setDefaultEdgeLabel(function () {
      return {};
    });
    nodes.forEach((nd) => newGraph.setNode(nd["id"], nd));
    edges.forEach((eg) => newGraph.setEdge(eg[1], eg[0]));
    dagre.layout(newGraph);
    setGraph(newGraph);
  }, []);

  const edgePaths = graph
    ?.edges()
    .map((e) => graph.edge(e))
    .map((eg) => {
      const pts = eg.points;
      const instructions = [`M ${pts[0].x} ${pts[0].y}`];
      //   pts
      //     .slice(1, -1)
      //     .forEach((pt, idx) =>
      //       instructions.push(`S ${pt.x} ${pt.y}, ${pts[idx + 2].x} ${pts[idx + 2].y}`)
      //     );
      pts.slice(1, -1).forEach((pt, idx) => {
        if (idx % 2 == 0) {
          instructions.push(`Q ${pt.x} ${pt.y}, ${pts[idx + 2].x} ${pts[idx + 2].y}`);
        }
      });
      console.log(eg, instructions);
      return instructions.join(" ");
    });
  return (
    <svg width={"800px"} height={"800px"}>
      {graph
        ?.edges()
        .map((e) => graph.edge(e))
        .map((eg, idx) => (
          <path d={edgePaths![idx]} fill="none" stroke="black" />
        ))}
      {graph
        ?.nodes()
        .map((n) => graph.node(n))
        .map((nd) => (
          <g key={`n${nd.x}-${nd.y}`}>
            <rect
              x={nd.x - nd.width / 2}
              y={nd.y - nd.height / 2}
              width={nd.width}
              height={nd.height}
              rx="5"
              fill="#bbb"
            />
            <text x={nd.x} y={nd.y}>
              {nd.label}
            </text>
          </g>
        ))}
    </svg>
  );
}

export default Main;
