// external
import { convertStringToMappedWorkbook, readWorkbookFromTwbx } from "src/parser";
import {
  getWorkbookList,
  listenForWorkbookListChange,
  storeWorkbook,
  unsubscribeFromWorkbookListChange,
} from "src/storageClient";

// local / state
import { atom, AtomEffect, atomFamily, selector, TransactionInterface_UNSTABLE } from "recoil";

// types
import { getWorkbook } from "src/storageClient";
import type { MappedWorkbook } from "src/types";
import { selectedDatasourceIdxState } from "./datasource";

export const workbookNameState = atom<string>({
  key: "workbookName",
  default: undefined,
});

export const workbookListState = atom<string[]>({
  key: "workbookList",
  default: [],
  effects: [
    ({ setSelf, trigger }) => {
      if (trigger === "get") {
        setSelf(getWorkbookList());
      }

      function workbookListChangeCallback(event: StorageEvent) {
        setSelf(getWorkbookList());
      }

      listenForWorkbookListChange(workbookListChangeCallback);
      return () => unsubscribeFromWorkbookListChange(workbookListChangeCallback);
    },
  ],
});

export const workbookStringsState = atomFamily<string, string>({
  key: "workbookStrings",
  effects: (workbookName) => [workbookStorageEffect(workbookName)],
});

export const workbookStringState = selector({
  key: "workbookString",
  get: ({ get }) => {
    const workbookName = get(workbookNameState);
    if (!workbookName) return undefined;
    const workbookString = get(workbookStringsState(workbookName));
    return workbookString;
  },
});

export const workbookState = selector<undefined | MappedWorkbook>({
  key: "workbook",
  get: ({ get }) => {
    const workbookString = get(workbookStringState);
    if (!workbookString) return;

    return convertStringToMappedWorkbook(workbookString);
  },
});

///////////////////////////
// Effects and Callbacks //
///////////////////////////

const workbookStorageEffect = (workbookName: string) =>
  (({ setSelf, onSet, trigger }) => {
    if (trigger === "get") {
      setSelf(getWorkbook(workbookName)!);
    }

    // Subscribe to local changes and update the server value
    onSet((workbookString) => {
      storeWorkbook(workbookName, workbookString);
    });
  }) as AtomEffect<string>;

export const workbookUploadCallback =
  (transactionInterface: TransactionInterface_UNSTABLE) => (file: File) => {
    const { get, set, reset } = transactionInterface;
    const workbookName = file.name;

    const stringPromise =
      file.type === "application/twbx" ? readWorkbookFromTwbx(file) : file.text();
    stringPromise.then((workbookString) => {
      storeWorkbook(workbookName, workbookString);
      reset(selectedDatasourceIdxState);
      set(workbookNameState, workbookName);
    });
  };
