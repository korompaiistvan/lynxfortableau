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
