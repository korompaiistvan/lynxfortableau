// local / state
import { atom, selector } from "recoil";
import { workbookState } from "./workbook";

export const datasourceCaptionsState = selector<string[]>({
  key: "datasource",
  get: ({ get }) => {
    const workbook = get(workbookState);
    return workbook ? ["All", ...workbook.datasources.map((d) => d.caption)] : [];
  },
});

export const selectedDatasourceIdxState = atom<number>({
  key: "datasourceIdx",
  default: 0,
});

export const selectedDatasourcesState = selector({
  key: "selectedDatasources",
  get: ({ get }) => {
    const workbook = get(workbookState);
    const datasourceCaptions = get(datasourceCaptionsState);
    const selectedDatasourceIdx = get(selectedDatasourceIdxState);
    const selectedDatasourceCaption = datasourceCaptions[selectedDatasourceIdx];

    if (selectedDatasourceCaption === "All") {
      return workbook ? workbook.datasources : [];
    } else {
      return workbook ? [workbook.datasources[selectedDatasourceIdx - 1]] : [];
    }
  },
});
