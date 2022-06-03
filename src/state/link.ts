import { errorSelector, selectorFamily, selector } from "recoil";

import { Link } from "../types";

import {
  nodesStaticState,
  xPositionSelector,
  yPositionSelector,
  widthSelector,
  heightSelector,
} from "./node";
import { highlightedNodeIdState } from "./graphLayout";

export const linksState = selector<Link[]>({
  key: "links",
  get: ({ get }) => {
    const nodes = get(nodesStaticState);
    if (!nodes) return [];
    let links = [] as Link[];
    let idx = 0;
    const calculatedNodes = nodes.filter((n) => n.isCalculated);
    calculatedNodes.forEach((node) => {
      links = links.concat(
        node.dependsOn.map((d) => {
          idx++;
          return { id: `link-${idx}`, start: d, end: node.name };
        })
      );
    });
    return links;
  },
});

export const linkStaticState = selectorFamily({
  key: "linkStatic",
  get:
    (linkId: string) =>
    ({ get }) => {
      const links = get(linksState);
      const link = links.find((l) => l.id == linkId);
      if (!link) return errorSelector(`link id ${linkId} cannot be found in links`);
      return link;
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
      const startNodeWidth = get(widthSelector(start));
      const startNodeHeight = get(heightSelector(start));
      const endNodeHeight = get(heightSelector(end));
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
