import * as localforage from "localforage";

export async function getWorkbookList() {
  return localforage.keys();
}

export async function getWorkbook(workbookName: string) {
  return localforage.getItem(workbookName) as Promise<string>;
}

export function storeWorkbook(workbookName: string, workbookString: string) {
  localforage.setItem(workbookName, workbookString);
}

export function removeWorkbook(workbookName: string) {
  localforage.removeItem(workbookName);
}
