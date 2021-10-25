import {
  Column,
  Datasource,
  Workbook,
  Parameter,
  SourceColumn,
  CalculatedColumn,
  MappedDatasource,
  MappedColumn,
} from "../types";
import { Graph } from "./graf";

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
    isColumnDependencyMapped: false,
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

  return columns;
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

  return {
    name,
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

  const calculation = _evaluateXPath(
    workbook,
    "./calculation",
    element
  )[0].getAttribute("formula")!;

  return {
    name,
    caption,
    calculation,
    isCalculated: true,
    isParameter: false,
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
  const sourceTable = _evaluateXPath(
    workbook,
    "../..",
    element
  )[0].getAttribute("name")!;

  return {
    name,
    caption: "string",
    isCalculated: false,
    isParameter: false,
    sourceTable,
  };
}

function stripJunkFromCalc(calculation: string): string {
  // first strip string literals
  let cleanCalc = calculation.replaceAll(/".*?"/gs, "");
  // then strip comments, starting with `//`
  cleanCalc = cleanCalc.replaceAll(/\/\/.*/g, "");
  // as well as multiline comments starting with /* and ending with */
  cleanCalc = cleanCalc.replaceAll(/\/\*.*\*\//gs, "");

  return cleanCalc;
}

function populateColumnDependencies(datasource: Datasource): MappedDatasource {
  let mappedColumns: MappedColumn[] = [];
  let graph = new Graph();
  for (let column of datasource.columns) {
    if (column.isCalculated) {
      const calcSyntax = stripJunkFromCalc(column.calculation);
      const dependsOn = datasource.columns
        .filter((c) => calcSyntax.includes(c.name))
        .map((c) => c.name);
      mappedColumns.push({ ...column, dependsOn, dependencyGeneration: 0 });
    } else {
      mappedColumns.push({ ...column, dependsOn: [], dependencyGeneration: 0 });
    }
    graph.addVertex({ id: column.name });
  }

  for (let column of mappedColumns) {
    column.dependsOn.forEach((d) => {
      graph.addEdge({ from: d, to: column.name });
    });
  }
  graph.getTopologicalGenerations();
  graph.vertices.forEach((v) => {
    mappedColumns.filter((c) => c.name == v.id)[0].dependencyGeneration =
      v.topologicalGeneration!;
  });

  return {
    ...datasource,
    isColumnDependencyMapped: true,
    columns: mappedColumns,
  };
}
export { getDatasourcesFromWorkbook, populateColumnDependencies };
