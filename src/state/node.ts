import { atomFamily, errorSelector, selectorFamily, selector } from "recoil";

import { selectedDatasourceState } from "./datasource";
import {
  closedHeightState,
  marginState,
  hGutterState,
  closedWidthState,
  vGutterState,
  openWidthState,
} from "./renderingSettings";
import { guardRecoilDefaultValue } from "./utils";
import { columnWidthSelector, nodesAboveSelector, yBasePositionSelector } from "./graphLayout";

import { MappedColumn, NodeId, NodeState } from "../types";

export const nodesStaticState = selector<MappedColumn[] | undefined>({
  key: "nodesStatic",
  get: ({ get }) => {
    const datasource = get(selectedDatasourceState);
    return datasource?.columns;
  },
});

export const nodesStateFamily = atomFamily<NodeState, NodeId>({
  key: "nodeState",
  default: selectorFamily({
    key: "nodeState/Default",
    get:
      () =>
      ({ get }) => {
        return {
          isClosed: true,
          openHeight: get(closedHeightState), // this will be overwritten when the node is first opened
        };
      },
  }),
});

export const nodeIdsState = selector<NodeId[]>({
  key: "nodeIds",
  get: ({ get }) => {
    const nodes = get(nodesStaticState);
    return nodes ? nodes.map((n) => n.name) : [];
  },
});

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

export const isClosedSelector = selectorFamily({
  key: "isClosed",
  get:
    (nodeId: NodeId) =>
    ({ get }) => {
      return get(nodesStateFamily(nodeId)).isClosed;
    },
  set:
    (nodeId: NodeId) =>
    ({ set }, newClosedState) => {
      if (guardRecoilDefaultValue(newClosedState)) {
        return errorSelector("reset is not implemented on this selector");
      }

      if (typeof newClosedState !== "boolean") {
        return errorSelector("isClosed needs to be a boolean");
      }

      return set(nodesStateFamily(nodeId), (prevState) => ({
        ...prevState,
        isClosed: newClosedState,
      }));
    },
});

export const openHeightSelector = selectorFamily<number, NodeId>({
  key: "openHeight",
  get:
    (nodeId: NodeId) =>
    ({ get }) => {
      return get(nodesStateFamily(nodeId)).openHeight;
    },
  set:
    (nodeId: NodeId) =>
    ({ set }, newOpenHeight) => {
      if (guardRecoilDefaultValue(newOpenHeight)) {
        return errorSelector("reset is not implemented on this selector");
      }

      if (typeof newOpenHeight !== "number") {
        return errorSelector("newOpenHeight needs to be a number");
      }

      return set(nodesStateFamily(nodeId), (prevState) => ({
        ...prevState,
        openHeight: newOpenHeight,
      }));
    },
});

export const xPositionSelector = selectorFamily<number, NodeId>({
  key: "xPosition",
  get:
    (nodeId: NodeId) =>
    ({ get }) => {
      const colIdx = get(colIdxSelector(nodeId));
      const margin = get(marginState);
      const hGutter = get(hGutterState);
      let x = margin;
      for (let i = 0; i < colIdx; i++) {
        const columnWidth = get(columnWidthSelector(i));
        x += columnWidth + hGutter;
      }
      return x;
    },
});

export const yPositionSelector = selectorFamily<number, NodeId>({
  key: "yPosition",
  get:
    (nodeId: NodeId) =>
    ({ get }) => {
      const nodesAbove = get(nodesAboveSelector(nodeId));
      const yBasePosition = get(yBasePositionSelector(nodeId));
      const closedHeight = get(closedHeightState);

      const offset = nodesAbove
        .map((n) => {
          return get(isClosedSelector(n)) ? 0 : get(openHeightSelector(n)) - closedHeight;
        })
        .reduce((prev, curr) => {
          return prev + curr;
        }, 0);
      return yBasePosition + offset;
    },
});

export const widthSelector = selectorFamily({
  key: "width",
  get:
    (nodeId: NodeId) =>
    ({ get }) => {
      return get(isClosedSelector(nodeId)) ? get(closedWidthState) : get(openWidthState);
    },
});

export const heightSelector = selectorFamily({
  key: "height",
  get:
    (nodeId: NodeId) =>
    ({ get }) => {
      return get(isClosedSelector(nodeId))
        ? get(closedHeightState)
        : get(openHeightSelector(nodeId));
    },
});
