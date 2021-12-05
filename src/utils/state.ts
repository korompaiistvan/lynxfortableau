import {
  atom,
  atomFamily,
  errorSelector,
  selectorFamily,
  SerializableParam,
  DefaultValue,
  useRecoilTransaction_UNSTABLE,
  useRecoilState,
  constSelector,
  selector,
} from "recoil";
import { MappedColumn, Column } from "../types";

export interface NodeState {
  colIdx: number;
  isClosed: boolean;
  openHeight: number;
  yIdx: number;
  data: undefined | MappedColumn;
}
export const nodesStateFamily = atomFamily<NodeState, NodeId>({
  key: "nodes",
  default: {
    colIdx: -1,
    isClosed: true,
    openHeight: 0,
    yIdx: -1,
    data: undefined,
  },
});

export const nodeIdsState = atom({
  key: "nodeIds",
  default: [] as NodeId[],
});

type SortMode = "shortestLinks"; // later this will be a bit more options :D
export const sortModeState = atom({
  key: "sortMode",
  default: "shortestLinks" as SortMode,
});

type NodeId = Column["name"];
export type link = [NodeId, NodeId];
export const linksState = atom({
  key: "links",
  default: [] as link[],
});

export const colIdxSelector = selectorFamily({
  key: "colIdx",
  get:
    (nodeId: NodeId) =>
    ({ get }) => {
      return get(nodesStateFamily(nodeId)).colIdx;
    },
});

export const yIdxSelector = selectorFamily({
  key: "yIdx",
  get:
    (nodeId: NodeId) =>
    ({ get }) => {
      return get(nodesStateFamily(nodeId)).yIdx;
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

export const zoomLevelState = atom({
  key: "zoomLevel",
  default: 1 as number,
});

export const viewPortState = atom({
  key: "viewPort",
  default: [0, 0, 1500, 2000],
});

export const guardRecoilDefaultValue = (
  candidate: unknown
): candidate is DefaultValue => {
  if (candidate instanceof DefaultValue) return true;
  return false;
};

export const hGutterState = constSelector(260);
export const marginState = constSelector(40);
export const vGutterState = constSelector(40);

export const openWidthState = constSelector(400);
export const closedWidthState = constSelector(260);
export const closedHeightState = constSelector(50);

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

      const openColumnItems = columnItems.filter(
        (item) => !get(isClosedSelector(item))
      );
      if (openColumnItems.length > 0) {
        return get(openWidthState);
      }
      return get(closedWidthState);
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
      const colIdx = get(colIdxSelector(nodeId));
      const yIdx = get(yIdxSelector(nodeId));
      const aboveItems = get(columnItemsSelector(colIdx)).filter(
        (item) => get(yIdxSelector(item)) < yIdx
      );
      const vGutter = get(vGutterState);
      const margin = get(marginState);
      const yPosition = aboveItems
        .map((n) =>
          get(isClosedSelector(n))
            ? get(closedHeightState)
            : get(openHeightSelector(n))
        )
        .reduce((prev, curr) => {
          return prev + curr + vGutter;
        }, margin);
      return yPosition;
    },
});

export const widthSelector = selectorFamily({
  key: "width",
  get:
    (nodeId: NodeId) =>
    ({ get }) => {
      return get(isClosedSelector(nodeId))
        ? get(closedWidthState)
        : get(openWidthState);
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

export const highlightedNodeIdState = atom<undefined | NodeId>({
  key: "highlightedNode",
  default: undefined,
});
