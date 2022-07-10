// external
import { convertStringToMappedWorkbook } from "src/parser";

// local / state
import { atom, selector } from "recoil";

// types
import type { MappedWorkbook } from "src/types";

export const workbookStringState = atom<undefined | string>({
  key: "workbookString",
  default: undefined,
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
