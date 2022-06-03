import { atom } from "recoil";
import superstoreString from "../Superstore.twb";

export const workbookStringState = atom<undefined | string>({
  key: "workbookString",
  default: superstoreString,
});

export const workbookNameState = atom<undefined | string>({
  key: "workbookName",
  default: "Sample - Superstore.twbx",
});
