// local / state
import { atom, atomFamily, errorSelector, selectorFamily } from "recoil";
import { nodesAboveSelector, xBasePositionSelector, yBasePositionSelector } from "./graphLayout";
import { closedHeightState, columnWidthState } from "./renderingSettings";
import { guardRecoilDefaultValue } from "./utils";

// types
import type { NodeId, NodeState } from "../types";

export const nodesDynamicStateFamily = atomFamily<NodeState, NodeId>({
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

export const isClosedSelector = selectorFamily({
  key: "isClosed",
  get:
    (nodeId: NodeId) =>
    ({ get }) => {
      return get(nodesDynamicStateFamily(nodeId)).isClosed;
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

      return set(nodesDynamicStateFamily(nodeId), (prevState) => ({
        ...prevState,
        isClosed: newClosedState,
      }));
    },
});

export const nodeHeightSelector = selectorFamily({
  key: "height",
  get:
    (nodeId: NodeId) =>
    ({ get }) => {
      return get(isClosedSelector(nodeId))
        ? get(closedHeightState)
        : get(openHeightSelector(nodeId));
    },
});

export const openHeightSelector = selectorFamily<number, NodeId>({
  key: "openHeight",
  get:
    (nodeId: NodeId) =>
    ({ get }) => {
      return get(nodesDynamicStateFamily(nodeId)).openHeight;
    },
  set:
    (nodeId: NodeId) =>
    ({ set }, newOpenHeight) => {
      if (guardRecoilDefaultValue(newOpenHeight)) {
        return errorSelector("reset is not implemented on this selector");
      }
      return set(nodesDynamicStateFamily(nodeId), (prevState) => ({
        ...prevState,
        openHeight: newOpenHeight,
      }));
    },
});

export const nodeWidthSelector = selectorFamily({
  key: "width",
  get:
    (nodeId: NodeId) =>
    ({ get }) => {
      return get(columnWidthState);
    },
});

export const xPositionSelector = selectorFamily<number, NodeId>({
  key: "xPosition",
  get:
    (nodeId: NodeId) =>
    ({ get }) => {
      // simple passthrough of base position, might chagne later
      const xBasePosition = get(xBasePositionSelector(nodeId));
      return xBasePosition;
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

export const highlightedNodeIdState = atom<undefined | NodeId>({
  key: "highlightedNode",
  default: undefined,
});
