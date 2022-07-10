// external
import { convertStringToMappedWorkbook } from "src/parser";

// local / state
import { atom, selector } from "recoil";

// types
import { getWorkbook } from "src/storageClient";
import type { MappedWorkbook } from "src/types";

export const workbookStringState = selector({
  key: "workbookString",
  get: ({ get }) => {
    const workbookName = get(workbookNameState);
    if (!workbookName) return undefined;
    const workbookString = getWorkbook(workbookName);
    return workbookString;
  },
});

export const workbookNameState = atom<string>({
  key: "workbookName",
  default: undefined,
});

export const workbookState = selector<undefined | MappedWorkbook>({
  key: "workbook",
  get: ({ get }) => {
    const workbookString = get(workbookStringState);
    if (!workbookString) return;

    return convertStringToMappedWorkbook(workbookString);
  },
});
