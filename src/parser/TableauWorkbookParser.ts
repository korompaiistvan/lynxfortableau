import { CalculatedColumn, Datasource, SourceColumn, Workbook } from "../types";

function getDatasourcesFromWorkbook(xmlString: string): Datasource[] {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, "text/xml");

  const datasources = _evaluateXPath(
    xmlDoc,
    "/workbook/datasources/datasource"
  );

  return datasources.map((ds) => convertElementToDatasource(ds));
}

function _evaluateXPath(
  workbook: Document,
  xpath: string,
  refNode = workbook
): Array<Element> {
  const iterator = workbook.evaluate(
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

function convertElementToDatasource(element: Element): Datasource {
  const cols = getColumnsFromDatasourceElement(element);
  return {
    name: element.getAttribute("name")!,
    caption: element.getAttribute("caption")!,
    columns: cols,
  };
}

function getColumnsFromDatasourceElement(
  datasource: Element
): Array<CalculatedColumn | SourceColumn> {
  return [];
}

export { getDatasourcesFromWorkbook };
