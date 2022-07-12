const WORKBOOK_LIST_KEY = "workbooks";

export function getWorkbookList() {
  const workbookList = JSON.parse(window.localStorage.getItem(WORKBOOK_LIST_KEY) ?? "[]");
  return workbookList as string[];
}

function setWorkbookList(workbookList: string[]) {
  window.localStorage.setItem(WORKBOOK_LIST_KEY, JSON.stringify(workbookList));
}

function addWorkbookNameToWorkbookList(workbookName: string) {
  const workbookList = getWorkbookList();
  const newWorkbookList = [...new Set([...workbookList, workbookName])];
  setWorkbookList(newWorkbookList);
}

function removeWorkbookNameFromWorkbookList(workbookName: string) {
  const workbookList = getWorkbookList();
  const newWorkbookList = workbookList.filter((name) => name !== workbookName);
  setWorkbookList(newWorkbookList);
}

export function storeWorkbook(workbookName: string, workbookString: string) {
  window.localStorage.setItem(workbookName, workbookString);
  addWorkbookNameToWorkbookList(workbookName);
}

export function getWorkbook(workbookName: string) {
  const workbookList = getWorkbookList();
  if (!workbookList.some((wb) => wb === workbookName))
    throw new Error(`No workbook name ${workbookName} in localStorage`);

  return window.localStorage.getItem(workbookName);
}

export function removeWorkbook(workbookName: string) {
  window.localStorage.removeItem(workbookName);
  removeWorkbookNameFromWorkbookList(workbookName);
}

type StorageEventHandler = (event: StorageEvent) => void;
export function listenForWorkbookListChange(callback: StorageEventHandler) {
  window.addEventListener("storage", callback);
}

export function unsubscribeFromWorkbookListChange(callback: StorageEventHandler) {
  window.removeEventListener("storage", callback);
}
