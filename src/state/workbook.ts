// external
import { convertStringToMappedWorkbook, readWorkbookFromTwbx } from "src/parser";
import { getWorkbookList, removeWorkbook, storeWorkbook } from "src/storageClient";

// local / state
import { atom, AtomEffect, atomFamily, CallbackInterface, selector } from "recoil";
import { logChangesEffect } from "./utils";

// types
import { getWorkbook } from "src/storageClient";
import type { MappedWorkbook } from "src/types";
import { selectedDatasourceIdxState } from "./datasource";

export const currentWorkbookNameState = atom<string>({
  key: "currentWorkbookName",
  default: undefined,
  effects: [logChangesEffect("Current workbook name")],
});

export const workbookListState = atom<string[]>({
  key: "workbookList",
  default: [],
  effects: [
    ({ setSelf, trigger }) => {
      if (trigger == "get") {
        setSelf(getWorkbookList());
      }
    },
    logChangesEffect("Workbooklist"),
  ],
});

export const workbookStringsState = atomFamily<string, string>({
  key: "workbookStrings",
  effects: (workbookName) => [workbookStorageEffect(workbookName)],
});

export const currentWorkbookStringState = selector({
  key: "currentWorkbookString",
  get: ({ get }) => {
    const workbookName = get(currentWorkbookNameState);
    if (!workbookName) return undefined;
    const workbookString = get(workbookStringsState(workbookName));
    return workbookString;
  },
});

export const workbookState = selector<undefined | MappedWorkbook>({
  key: "workbook",
  get: ({ get }) => {
    const workbookString = get(currentWorkbookStringState);
    if (!workbookString) return;

    return convertStringToMappedWorkbook(workbookString);
  },
});

const workbookStorageEffect = (workbookName: string) =>
  (({ setSelf, onSet, trigger }) => {
    // If there's a persisted value - set it on load
    const loadPersisted = async () => {
      const savedValue = await getWorkbook(workbookName);

      if (savedValue != null) {
        setSelf(savedValue);
      }
    };

    // Asynchronously set the persisted data
    if (trigger === "get") {
      loadPersisted();
    }

    // Subscribe to state changes and persist them to localForage
    onSet((newValue, _, isReset) => {
      isReset ? removeWorkbook(workbookName) : storeWorkbook(workbookName, newValue);
    });
  }) as AtomEffect<string>;

export const workbookUploadCallback =
  (callbackInterface: CallbackInterface) => async (file: File) => {
    const { set, reset } = callbackInterface;
    const workbookName = file.name;

    const workbookString = await (file.type === "application/twbx"
      ? readWorkbookFromTwbx(file)
      : file.text());
    set(workbookStringsState(workbookName), workbookString);
    reset(selectedDatasourceIdxState);
    set(currentWorkbookNameState, workbookName);
  };
