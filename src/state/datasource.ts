import { atom, errorSelector, selector } from "recoil";

import { workbookState } from "./workbook";

import { MappedDatasource } from "../types";

export const datasourceCaptionsState = selector<string[]>({
  key: "datasource",
  get: ({ get }) => {
    const workbook = get(workbookState);
    return workbook ? workbook.datasources.map((d) => d.caption) : [];
  },
});

export const selectedDatasourceIdxState = atom<number>({
  key: "datasourceIdx",
  default: 1,
});

// export const selectedDatasourceState = selector<MappedDatasource | undefined>({
//   key: "selectedDatasource",
//   get: ({ get }) => {
//     const datasourceIdx = get(selectedDatasourceIdxState);
//     const workbook = get(workbookState);
//     if (!workbook) return;

//     if (datasourceIdx >= workbook.datasources.length) {
//       return errorSelector(`datasourceIdx ${datasourceIdx} out of bounds`);
//     }
//     return workbook.datasources[datasourceIdx];
//   },
// });
