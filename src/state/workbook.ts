// external
import { convertStringToMappedWorkbook } from "src/parser";

// local / state
import { atom, selector } from "recoil";
import superstoreString from "../Superstore.twb";

// types
import type { MappedWorkbook } from "src/types";

export const workbookStringState = atom<undefined | string>({
  key: "workbookString",
  default: superstoreString,
});

export const workbookNameState = atom<undefined | string>({
  key: "workbookName",
  default: "Sample - Superstore.twb",
});

export const workbookState = selector<undefined | MappedWorkbook>({
  key: "workbook",
  get: ({ get }) => {
    const workbookString = get(workbookStringState);
    if (!workbookString) return;

    return convertStringToMappedWorkbook(workbookString);
  },
});
