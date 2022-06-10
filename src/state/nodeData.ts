import { selector } from "recoil";

import { selectedDatasourceState } from "./datasource";

import { MappedColumn } from "../types";

export const nodesStaticState = selector<MappedColumn[] | undefined>({
  key: "nodesStatic",
  get: ({ get }) => {
    const datasource = get(selectedDatasourceState);
    return datasource?.columns;
  },
});
