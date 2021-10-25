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

/**
 * Returns the datasources from a Tableau workbook string
 * @param {string} xmlString - the Tableau workbook
 * @returns {Datasource[]} An array of {@link Datasource} objects, extracted from the workbook string
 */
function getDatasourcesFromWorkbook(xmlString: string): Datasource[] {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, "text/xml");

  const datasources = _evaluateXPath(
    xmlDoc,
    "/workbook/datasources/datasource"
  );

  return datasources.map((ds) => convertElementToDatasource(xmlDoc, ds));
}

/**
 * Evaluates an XPath expression and returns the result as an array
 * @access private
 * @param {Document} document - the document to run the expression on
 * @param {string} xpath - the XPath expression to be evaluated
 * @param {Node} [refNode=workbook] - the node relative to which the expression is evaluated
 * @returns {Element[]} - An array of the resulting Element objects
 */
function _evaluateXPath(
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

/**
 * Takes an Element and attempts to parse it as a Tableau datasource.
 * @param {Document} workbook - the workbook Document the Element is in. This is needed to
 * @param {Element} element - the Element to convert
 * @returns {Datasource} - a Datasource object
 */
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

/**
 * Extracts the column information from a datasource
 * @param {Document} workbook - the workbook that contains the datasource
 * @param {Element} datasource - the datasource to extract the columns from
 * @returns {Column[]} - an array of {@link Column}s
 */
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

/**
 * Converts the input element to a parameter
 * @param {Document} workbook - the workbook the Column element is in
 * @param {Element} element - the element holding the column information
 * @returns {Parameter} the parameter object
 */
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

/**
 * Converts the input element to a Calculated Column
 * @param {Document} workbook - the workbook the Column element is in
 * @param {Element} element - the element holding the column information
 * @returns {CalculatedColumn} a CalculatedColumn object
 */
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

/**
 * Converts the input element to a source column (non-calculated)
 * @param {Document} workbook - the workbook the Column element is in
 * @param {Element} element - the element holding the column information
 * @returns {SourceColumn} a SourceColumn object
 */
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

  // /workbook/datasources/datasource/connection//column//ancestor::datasource/column[@name='\[City\]']
  try {
    const role = otherColumnElement.getAttribute("role") as ColumnRole;
  } catch (error) {
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
