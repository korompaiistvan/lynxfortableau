const WORKBOOK_LIST_KEY = "workbooks";

export function storeWorkbook(workbookName: string, workbookString: string) {
  window.localStorage.setItem(workbookName, workbookString);
  addWorkbookNameToWorkbookList(workbookName);
}

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

export function getWorkbook(workbookName: string) {
  const workbookList = getWorkbookList();
  if (!workbookList.some((wb) => wb === workbookName))
    throw new Error(`No workbook name ${workbookName} in localStorage`);

  return window.localStorage.getItem(workbookName);
}
