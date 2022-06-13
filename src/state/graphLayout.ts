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

export const graphLayoutState = selector({
  key: "graphLayout",
  get: ({ get }) => {
    const nodes = get(nodesStaticState);
    if (!nodes) return new dagre.graphlib.Graph();
    const links = get(linksState);
    const hGutter = get(hGutterState);
    const vGutter = get(vGutterState);
    const margin = get(marginState);
    const columnWidth = get(columnWidthState);
    const closedHeight = get(closedHeightState);

    // this is an easy way to get a nice layout from dagre
    const graph = new dagre.graphlib.Graph();
    graph.setGraph({
      ranker: "longest-path",
      ranksep: hGutter,
      nodesep: vGutter,
      rankdir: "RL",
      marginx: margin,
      marginy: margin,
    });
    graph.setDefaultEdgeLabel(function () {
      return {};
    });
    nodes.forEach((nd) =>
      graph.setNode(nd.qualifiedName, {
        width: columnWidth,
        height: closedHeight,
        label: nd.qualifiedName,
      })
    );
    links.forEach((eg) => graph.setEdge(eg.end, eg.start)); //edge direction are flipped on purpose
    dagre.layout(graph);

    return graph;
  },
});

export const graphNodesSelector = selector({
  key: "graphNodes",
  get: ({ get }) => {
    const graph = get(graphLayoutState);
    return graph.nodes().map((nodeId) => graph.node(nodeId));
  },
});

export const xBasePositionSelector = selectorFamily({
  key: "xBasePosition",
  get:
    (nodeId: NodeId) =>
    ({ get }) => {
      const graphNode = get(graphLayoutState).node(nodeId);
      if (!graphNode) return errorSelector(`Could not find ${nodeId} in graph`);
      const xBasePosition = graphNode.x;
      if (xBasePosition === undefined)
        return errorSelector(`the node id ${nodeId} does not exist in the graph layout`);
      return xBasePosition;
    },
});

export const yBasePositionSelector = selectorFamily({
  key: "yBasePosition",
  get:
    (nodeId: NodeId) =>
    ({ get }) => {
      const graphNode = get(graphLayoutState).node(nodeId);
      const yBasePosition = graphNode.y;
      if (yBasePosition === undefined)
        return errorSelector(`the node id ${nodeId} does not exist in the graph layout`);
      return yBasePosition;
    },
});

export const nodesOfSameColumnSelector = selectorFamily({
  key: "nodesOfSameColumn",
  get:
    (xBasePosition: number) =>
    ({ get }) => {
      const nodes = get(graphNodesSelector);
      return nodes.filter((node) => node.x == xBasePosition);
    },
});

export const nodesAboveSelector = selectorFamily<NodeId[], NodeId>({
  key: "nodesAbove",
  get:
    (nodeId) =>
    ({ get }) => {
      const nodeX = get(xBasePositionSelector(nodeId));
      const nodeY = get(yBasePositionSelector(nodeId));
      const columnNodes = get(nodesOfSameColumnSelector(nodeX));

      const nodesAbove = columnNodes
        .filter((node) => get(yBasePositionSelector(node.label! as NodeId)) < nodeY)
        .map((n) => n.label! as NodeId);
      return nodesAbove;
    },
});
