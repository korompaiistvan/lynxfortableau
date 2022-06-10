import { errorSelector, selectorFamily, selector } from "recoil";

import { Link } from "../types";

import { nodesStaticState } from "./nodeData";

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
