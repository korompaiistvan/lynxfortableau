// external
import { selectorFamily } from "recoil";

// local / state
import { linkStaticState } from "./linkData";
import {
  highlightedNodeIdState,
  nodeHeightSelector,
  xPositionSelector,
  yPositionSelector,
} from "./nodeDisplay";
import { columnWidthState } from "./renderingSettings";

export const isLinkHighlightedSelector = selectorFamily({
  key: "isLinkHighlighted",
  get:
    (linkId: string) =>
    ({ get }) => {
      const link = get(linkStaticState(linkId));
      const highlightedNodeId = get(highlightedNodeIdState);
      return highlightedNodeId && [link.start, link.end].includes(highlightedNodeId);
    },
});

export const linkDisplayState = selectorFamily({
  key: "linkDisplay",
  get:
    (linkId: string) =>
    ({ get }) => {
      const { start, end } = get(linkStaticState(linkId));
      const startNodeXPosition = get(xPositionSelector(start));
      const startNodeYPosition = get(yPositionSelector(start));
      const endNodeXPosition = get(xPositionSelector(end));
      const endNodeYPosition = get(yPositionSelector(end));
      const startNodeWidth = get(columnWidthState);
      const startNodeHeight = get(nodeHeightSelector(start));
      const endNodeHeight = get(nodeHeightSelector(end));
      const isHighlighted = get(isLinkHighlightedSelector(linkId));
      // const isHighlighted = false;

      return {
        startNodeXPosition,
        startNodeYPosition,
        endNodeXPosition,
        endNodeYPosition,
        startNodeWidth,
        startNodeHeight,
        endNodeHeight,
        isHighlighted,
      };
    },
});
