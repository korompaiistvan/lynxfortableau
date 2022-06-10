import { atom, selector, selectorFamily, errorSelector } from "recoil";
import * as dagre from "dagre";

import {
  columnWidthState,
  hGutterState,
  vGutterState,
  closedHeightState,
  marginState,
} from "./renderingSettings";
import { linksState } from "./linkData";
import { nodesStaticState } from "./nodeData";

import { NodeId } from "../types";

export const graphLayoutState = selector<Map<NodeId, number>>({
  key: "graphLayout",
  get: ({ get }) => {
    const nodes = get(nodesStaticState);
    if (!nodes) return new Map();
    const links = get(linksState);
    const hGutter = get(hGutterState);
    const vGutter = get(vGutterState);
    const columnWidth = get(columnWidthState);
    const closedHeight = get(closedHeightState);
    const margin = get(marginState);

    // this is an easy way to get a nice layout from dagre
    const graph = new dagre.graphlib.Graph();
    graph.setGraph({ ranker: "longest-path", ranksep: hGutter, nodesep: vGutter, rankdir: "RL" });
    graph.setDefaultEdgeLabel(function () {
      return {};
    });
    nodes.forEach((nd) => graph.setNode(nd.name, { width: columnWidth, height: closedHeight }));
    links.forEach((eg) => graph.setEdge(eg.end, eg.start)); //edge direction are flipped on purpose
    dagre.layout(graph);

    let yPositions = new Map(
      nodes.map((n) => {
        const layoutNode = graph.node(n.name);
        return [n.name, margin + layoutNode.y - layoutNode.height / 2];
      })
    );
    return yPositions;
  },
});

export const yBasePositionSelector = selectorFamily({
  key: "yBasePosition",
  get:
    (nodeId: NodeId) =>
    ({ get }) => {
      const yIdx = get(graphLayoutState).get(nodeId);
      if (yIdx === undefined)
        return errorSelector(`the node id ${nodeId} does not exist in the graph layout`);
      return yIdx;
    },
});

// TODO: should be reading from the graph layout
export const colIdxSelector = selectorFamily({
  key: "colIdx",
  get:
    (nodeId: NodeId) =>
    ({ get }) => {
      const nodes = get(nodesStaticState);
      if (!nodes) return errorSelector("there are no nodes yet");
      const node = nodes.find((n) => n.name == nodeId);
      if (!node) {
        return errorSelector("that node does not exist in the nodes list (yet)");
      }
      return node.dependencyGeneration;
    },
});

export const columnItemsSelector = selectorFamily({
  key: "columnItems",
  get:
    (colIdx) =>
    ({ get }) => {
      const nodes = get(nodesStaticState);
      const nodeIds = nodes ? nodes.map((n) => n.name) : [];
      return nodeIds.filter((id) => get(colIdxSelector(id)) === colIdx);
    },
});

export const nodesAboveSelector = selectorFamily<NodeId[], NodeId>({
  key: "nodesAbove",
  get:
    (nodeId) =>
    ({ get }) => {
      const colIdx = get(colIdxSelector(nodeId));
      const yIdx = get(yBasePositionSelector(nodeId));
      const nodesAbove = get(columnItemsSelector(colIdx)).filter(
        (item) => get(yBasePositionSelector(item)) < yIdx
      );
      return nodesAbove;
    },
});
