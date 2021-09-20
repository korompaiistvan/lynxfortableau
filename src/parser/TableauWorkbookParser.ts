import {
  Column,
  Datasource,
  Workbook,
  ColumnRole,
  ColumnType,
  ColumnDataType,
  Parameter,
  SourceColumn,
  CalculatedColumn,
} from "../types";

function getDatasourcesFromWorkbook(xmlString: string): Datasource[] {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, "text/xml");

  const datasources = _evaluateXPath(
    xmlDoc,
    "/workbook/datasources/datasource"
  );

  return datasources.map((ds) => convertElementToDatasource(xmlDoc, ds));
}

function _evaluateXPath(
  workbook: Document,
  xpath: string,
  refNode: Node = workbook
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

function convertElementToDatasource(
  workbook: Document,
  element: Element
): Datasource {
  const cols = getColumnsFromDatasourceElement(workbook, element);
  return {
    name: element.getAttribute("name")!,
    caption: element.getAttribute("caption")!,
    columns: cols,
  };
}

function getColumnsFromDatasourceElement(
  workbook: Document,
  datasource: Element
): Array<Column> {
  const dsIsParameters = datasource.getAttribute("name") == "Parameters";
  const calculatedColumnElements = _evaluateXPath(
    workbook,
    "./column[calculation]",
    datasource
  );
  const parameterColumnElements = dsIsParameters
    ? _evaluateXPath(workbook, "./column", datasource)
    : [];
  const sourceColumnElements = _evaluateXPath(
    workbook,
    "./connection//column",
    datasource
  );

  const calculatedColumns = calculatedColumnElements.map((e) =>
    convertElementToCalculatedColumn(workbook, e)
  );
  const parameterColumns = parameterColumnElements.map((e) =>
    convertElementToParameter(workbook, e)
  );
  const sourceColumns = sourceColumnElements.map((e) =>
    convertElementToSourceColumn(workbook, e)
  );

  let columns: Array<Column> = [];
  columns = columns.concat(calculatedColumns, parameterColumns, sourceColumns);

  return [];
}

function convertElementToParameter(
  workbook: Document,
  element: Element
): Parameter {
  const caption = element.getAttribute("caption")!;
  const name = element.getAttribute("name")!;
  const role = element.getAttribute("role")! as ColumnRole;
  const dataType = element.getAttribute("datatype")! as ColumnDataType;
  const type = element.getAttribute("type")! as ColumnType;

  return {
    name,
    role,
    dataType,
    type,
    caption,
    isParameter: true,
    isCalculated: false,
  };
}

function convertElementToCalculatedColumn(
  workbook: Document,
  element: Element
): CalculatedColumn {
  const caption = element.getAttribute("caption")!;
  const name = element.getAttribute("name")!;
  const role = element.getAttribute("role")! as ColumnRole;
  const dataType = element.getAttribute("datatype")! as ColumnDataType;
  const type = element.getAttribute("type")! as ColumnType;

  const calculation = _evaluateXPath(
    workbook,
    "./calculation",
    element
  )[0].getAttribute("formula")!;

  return {
    name,
    caption: "string",
    role: role,
    type: type,
    dataType: dataType,
    calculation,
    isCalculated: true,
    isParameter: false,
    dependsOn: [],
  };
}

function convertElementToSourceColumn(
  workbook: Document,
  element: Element
): SourceColumn {
  // attributes on the column element within the connection element
  const name = element.getAttribute("name")!;
  const dataType = element.getAttribute("datatype")! as ColumnDataType;
  const sourceTable = _evaluateXPath(
    workbook,
    "../..",
    element
  )[0].getAttribute("name")!;

  // attributes only found on the column element that's the child of the datasource
  const datasourceElement = _evaluateXPath(
    workbook,
    ".//ancestor::datasource",
    element
  )[0];

  const otherColumnElement = _evaluateXPath(
    workbook,
    "./column",
    datasourceElement
  );
  console.log(sourceTable);
  console.log(element);
  console.log(datasourceElement);
  console.log(otherColumnElement);

  // /workbook/datasources/datasource/connection//column//ancestor::datasource/column[@name='\[City\]']
  try {
    const role = otherColumnElement.getAttribute("role") as ColumnRole;
  } catch (error) {
    console.log(name);
    throw error;
  }
  const type = otherColumnElement.getAttribute("type") as ColumnType;

  return {
    name,
    caption: "string",
    role,
    type,
    dataType,

    isCalculated: false,
    isParameter: false,

    sourceTable,
  };
}

export { getDatasourcesFromWorkbook };
