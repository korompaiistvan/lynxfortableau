import { atom, errorSelector, selector } from "recoil";

import { workbookStringState } from "./workbook";

import { MappedDatasource } from "../types";

import {
  getDatasourcesFromWorkbook,
  populateColumnDependencies,
} from "../parser/TableauWorkbookParser";

export const datasourceIdxState = atom<number>({
  key: "datasourceIdx",
  default: 1,
});

export const datasourcesState = selector<MappedDatasource[] | undefined>({
  key: "datasources",
  get: ({ get }) => {
    const workbookStr = get(workbookStringState);
    if (!workbookStr) return;

    const datasources = getDatasourcesFromWorkbook(workbookStr).map((ds) =>
      populateColumnDependencies(ds)
    );

    return datasources;
  },
});

export const datasourceNamesState = selector<string[]>({
  key: "datasourceNames",
  get: ({ get }) => {
    const datasources = get(datasourcesState);
    if (!datasources) return [];
    return datasources?.map((ds) => ds.caption);
  },
});

export const selectedDatasourceState = selector<MappedDatasource | undefined>({
  key: "selectedDatasource",
  get: ({ get }) => {
    const datasourceIdx = get(datasourceIdxState);
    const datasources = get(datasourcesState);
    if (!datasources) return;

    if (datasourceIdx >= datasources.length) {
      return errorSelector(`datasourceIdx ${datasourceIdx} out of bounds`);
    }
    return datasources[datasourceIdx];
  },
});
