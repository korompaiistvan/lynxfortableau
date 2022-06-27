// external
import * as zip from "@zip.js/zip.js";

// types
import type { ColumnDependency, QualifiedName } from "src/types";

export const DISCARDED_COLUMN_NAMES = ["[:Measure Names]", "[Number of Records]"];

export function evaluateXPath(
  document: Document,
  xpath: string,
  refNode: Node = document
): Array<Element> {
  const iterator = document.evaluate(
    xpath,
    refNode,
    null,
    XPathResult.UNORDERED_NODE_ITERATOR_TYPE
  );
  let resultNodes = [];
  let nextNode = iterator.iterateNext() as Element;
  while (nextNode) {
    resultNodes.push(nextNode);
    nextNode = iterator.iterateNext() as Element;
  }

  return resultNodes;
}

export function qualifiedNameFromDependency(dependency: ColumnDependency) {
  return `[${dependency.datasourceName}].${dependency.columnName}` as QualifiedName;
}

export async function readWorkbookFromTwbx(twbx: File) {
  const reader = new zip.ZipReader(new zip.BlobReader(twbx));
  const entries = await reader.getEntries();

  if (entries.length === 0) throw new Error("There are no entries in this file");

  const twbEntry = entries.find((e) => e.filename.match(/\.twb$/) !== null);
  if (!twbEntry) throw new Error("No twb found in twbx");

  const workbookStr = await twbEntry.getData!(new zip.TextWriter());
  await reader.close();
  return workbookStr;
}
