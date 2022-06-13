import { errorSelector, selectorFamily, selector } from "recoil";

import { Link, QualifiedName } from "src/types";

import { nodesStaticState } from "./nodeData";

export const linksState = selector<Link[]>({
  key: "links",
  get: ({ get }) => {
    const nodes = get(nodesStaticState);
    if (!nodes) return [];
    let links = [] as Link[];
    let idx = 0;
    const calculatedNodes = nodes.filter((n) => n.type == "calculated");

    // TODO: this is ugly, refactor it into something a bit more readable
    calculatedNodes.forEach((node) => {
      links = links.concat(
        node.dependsOn.map((d) => {
          idx++;
          const dependeeQualifiedName = `[${d.datasourceName}].${d.columnName}` as QualifiedName;
          const dependeeNode = nodes.find((n) => n.qualifiedName === dependeeQualifiedName);
          // if (!dependeeNode) return errorSelector('could not find dependee node in graph')
          return { id: `link-${idx}`, start: dependeeNode!.qualifiedName, end: node.qualifiedName };
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
