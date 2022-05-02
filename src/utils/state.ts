import {
  atom,
  atomFamily,
  errorSelector,
  selectorFamily,
  DefaultValue,
  constSelector,
  selector,
} from "recoil";
import {
  getDatasourcesFromWorkbook,
  populateColumnDependencies,
} from "../parser/TableauWorkbookParser";
import { MappedColumn, Column, MappedDatasource } from "../types";
import superstoreString from "./Superstore.twb";

type NodeId = Column["name"];
export type link = [NodeId, NodeId];

export const hGutterState = constSelector(260);
export const marginState = constSelector(40);
export const vGutterState = constSelector(40);

export const openWidthState = constSelector(400);
export const closedWidthState = constSelector(260);
export const closedHeightState = constSelector(50);

export const workbookStringState = atom<undefined | string>({
  key: "workbookString",
  default: superstoreString,
});

export const datasourceIdxState = atom<number>({
  key: "datasourceIdx",
  default: 1,
});

export const datasourceState = selector<MappedDatasource | undefined>({
  key: "datasource",
  get: ({ get }) => {
    const workbookStr = get(workbookStringState);
    if (!workbookStr) return;

    const datasources = getDatasourcesFromWorkbook(workbookStr).map((ds) =>
      populateColumnDependencies(ds)
    );

    const datasourceIdx = get(datasourceIdxState);
    if (datasourceIdx >= datasources.length) {
      return errorSelector(`datasourceIdx ${datasourceIdx} out of bounds`);
    }
    return datasources[datasourceIdx];
  },
});

export const nodesStaticState = selector<MappedColumn[] | undefined>({
  key: "nodesStatic",
  get: ({ get }) => {
    const datasource = get(datasourceState);
    return datasource?.columns;
  },
});

export interface NodeState {
  isClosed: boolean;
  openHeight: number;
}
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

export const linksState = selector<link[]>({
  key: "links",
  get: ({ get }) => {
    const nodes = get(nodesStaticState);
    if (!nodes) return [];
    let links = [] as link[];
    const calculatedNodes = nodes.filter((n) => n.isCalculated);
    calculatedNodes.forEach((node) => {
      links = links.concat(node.dependsOn.map((d) => [d, node.name]));
    });
    return links;
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
        return errorSelector(
          "that node does not exist in the nodes list (yet)"
        );
      }
      return node.dependencyGeneration;
    },
});

type SortMode = "shortestLinks"; // later this will be a bit more options :D
export const sortModeState = atom({
  key: "sortMode",
  default: "shortestLinks" as SortMode,
});

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
        return errorSelector(
          `the node id ${nodeId} does not exist in the graph layout`
        );
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

      const openColumnItems = columnItems.filter(
        (item) => !get(isClosedSelector(item))
      );
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
      const vGutter = get(vGutterState);
      const margin = get(marginState);
      const yPosition = nodesAbove
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
