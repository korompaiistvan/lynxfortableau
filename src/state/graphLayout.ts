import { atom, selector, selectorFamily, errorSelector } from "recoil";

import { linksState } from "./link";
import { nodesStaticState, nodeIdsState, colIdxSelector, isClosedSelector } from "./node";
import { sortModeState, openWidthState, closedWidthState } from "./renderingSettings";

import { NodeId } from "../types";

export const graphLayoutState = selector<Map<NodeId, number>>({
  key: "graphLayout",
  get: ({ get }) => {
    const nodes = get(nodesStaticState);
    const links = get(linksState);
    const sortMode = get(sortModeState); // currently unused
    // the below is a very basic implementation to get it working
    // this is the next area that will be reworked
    // TODO: implement actual layout algorithm based on sortMode value
    let yPositions = new Map();
    let currentCol = 0;
    let currentColItems = get(columnItemsSelector(currentCol));
    while (currentColItems.length > 0) {
      currentColItems.forEach((nodeId, idx) => {
        yPositions.set(nodeId, idx);
      });
      currentCol++;
      currentColItems = get(columnItemsSelector(currentCol));
    }
    return yPositions;
  },
});

export const yIdxSelector = selectorFamily({
  key: "yIdx",
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
      const yIdx = get(yIdxSelector(nodeId));
      const nodesAbove = get(columnItemsSelector(colIdx)).filter(
        (item) => get(yIdxSelector(item)) < yIdx
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
