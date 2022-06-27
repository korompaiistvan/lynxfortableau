// local / state
import { selector } from "recoil";
import { workbookState } from "./workbook";

// type
import type { MappedColumn } from "../types";

export const nodesStaticState = selector<MappedColumn[] | undefined>({
  key: "nodesStatic",
  get: ({ get }) => {
    const workbook = get(workbookState);
    if (!workbook) return;
    const nodes: MappedColumn[] = workbook.datasources.map((d) => d.columns).flat();
    return nodes;
  },
});
