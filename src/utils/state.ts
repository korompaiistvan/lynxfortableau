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
import { Column } from "../types";

interface nodeState {
  colIdx: number;
  isClosed: boolean;
  openHeight: number;
  yIdx: number;
}
export const nodesStateFamily = atomFamily<nodeState, string>({
  key: "nodes",
  default: {
    colIdx: -1,
    isClosed: true,
    openHeight: 0,
    yIdx: -1,
  },
});

export const nodeIdsState = atom({
  key: "nodeIds",
  default: [] as nodeId[],
});

export const createNode = useRecoilTransaction_UNSTABLE(
  ({ get, set }) =>
    (nodeId: string, nodeState?: nodeState) => {
      if (get(nodeIdsState).includes(nodeId)) {
        return errorSelector(
          "the nodeId already exists, set the node directly"
        );
      }

      const newNode = nodesStateFamily(nodeId);
      if (nodeState) {
        set(newNode, nodeState);
      }
      set(nodeIdsState, (oldState) => [...oldState, nodeId]);
    }
);

type sortMode = "shortestLinks"; // later this will be a bit more options :D
export const sortModeState = atom({
  key: "sortMode",
  default: "shortestLinks" as sortMode,
});

type nodeId = Column["name"];
type link = [nodeId, nodeId];
export const linksState = atom({
  key: "links",
  default: [] as link[],
});

export const colIdxSelector = selectorFamily({
  key: "colIdx",
  get:
    (nodeId: string) =>
    ({ get }) => {
      return get(nodesStateFamily(nodeId)).colIdx;
    },
});

export const yIdxSelector = selectorFamily({
  key: "yIdx",
  get:
    (nodeId: string) =>
    ({ get }) => {
      return get(nodesStateFamily(nodeId)).yIdx;
    },
});

export const isClosedSelector = selectorFamily({
  key: "isClosed",
  get:
    (nodeId: string) =>
    ({ get }) => {
      return get(nodesStateFamily(nodeId)).isClosed;
    },
  set:
    (nodeId: string) =>
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

export const openHeightSelector = selectorFamily<number, string>({
  key: "openHeight",
  get:
    (nodeId: string) =>
    ({ get }) => {
      return get(nodesStateFamily(nodeId)).openHeight;
    },
  set:
    (nodeId: string) =>
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

export const hGutterState = constSelector(60);
export const vGutterState = constSelector(32);

export const openWidthState = constSelector(400);
export const closedWidthState = constSelector(260);
export const closedHeightState = constSelector(200);

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
        (item) => !isClosedSelector(item)
      );
      if (openColumnItems.length > 0) {
        return get(openWidthState);
      }
      return get(closedWidthState);
    },
});

export const xPositionSelector = selectorFamily<number, string>({
  key: "xPosition",
  get:
    (nodeId: string) =>
    ({ get }) => {
      const colIdx = get(colIdxSelector(nodeId));
      const hGutter = get(hGutterState);
      let x = hGutter;
      for (let i = 0; i < colIdx; i++) {
        x += get(columnWidthSelector(i)) + hGutter;
      }
      return x;
    },
});

export const yPositionSelector = selectorFamily<number, string>({
  key: "yPosition",
  get:
    (nodeId: string) =>
    ({ get }) => {
      const colIdx = get(colIdxSelector(nodeId));
      const yIdx = get(yIdxSelector(nodeId));
      const aboveItems = get(columnItemsSelector(colIdx)).filter(
        (item) => get(yIdxSelector(item)) < yIdx
      );
      const vGutter = get(vGutterState);
      const yPosition = aboveItems
        .map((n) =>
          get(isClosedSelector(n))
            ? get(closedHeightState)
            : get(openHeightSelector(n))
        )
        .reduce((prev, curr) => {
          return prev + vGutter;
        }, vGutter);
      return yPosition;
    },
});
