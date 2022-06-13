import { atom, selector } from "recoil";
import { convertStringToMappedWorkbook } from "src/parser";
import { MappedWorkbook } from "src/types";

import superstoreString from "../Superstore.twb";

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
