import { atom, selector, selectorFamily, errorSelector } from "recoil";
import * as dagre from "dagre";

import { linksState } from "./link";
import { nodesStaticState, nodeIdsState, colIdxSelector, isClosedSelector } from "./node";
import {
  sortModeState,
  openWidthState,
  closedWidthState,
  hGutterState,
  vGutterState,
  closedHeightState,
  marginState,
} from "./renderingSettings";

import { NodeId } from "../types";

export const graphLayoutState = selector<Map<NodeId, number>>({
  key: "graphLayout",
  get: ({ get }) => {
    const nodes = get(nodesStaticState);
    if (!nodes) return new Map();
    const links = get(linksState);
    const sortMode = get(sortModeState); // currently unused
    const hGutter = get(hGutterState);
    const vGutter = get(vGutterState);
    const closedWidth = get(closedWidthState);
    const closedHeight = get(closedHeightState);
    const margin = get(marginState);

    // this is an easy way to get a nice layout from dagre
    const graph = new dagre.graphlib.Graph();
    graph.setGraph({ ranker: "longest-path", ranksep: hGutter, nodesep: vGutter, rankdir: "RL" });
    graph.setDefaultEdgeLabel(function () {
      return {};
    });
    nodes.forEach((nd) => graph.setNode(nd.name, { width: closedWidth, height: closedHeight }));
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

export const columnItemsSelector = selectorFamily({
  key: "columnItems",
  get:
    (colIdx) =>
    ({ get }) => {
      const nodeIds = get(nodeIdsState);
      return nodeIds.filter((id) => get(colIdxSelector(id)) === colIdx);
    },
});

export const columnWidthSelector = selectorFamily<number, number>({
  key: "columnWidth",
  get:
    (colIdx: number) =>
    ({ get }) => {
      const columnItems = get(columnItemsSelector(colIdx));
      if (columnItems.length === 0) return 0;

      const openColumnItems = columnItems.filter((item) => !get(isClosedSelector(item)));
      if (openColumnItems.length > 0) {
        return get(openWidthState);
      }
      return get(closedWidthState);
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

export const highlightedNodeIdState = atom<undefined | NodeId>({
  key: "highlightedNode",
  default: undefined,
});

export const zoomLevelState = atom({
  key: "zoomLevel",
  default: 1 as number,
});

export const viewPortState = atom({
  key: "viewPort",
  default: [0, 0, 1500, 2000],
});
