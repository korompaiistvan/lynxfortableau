import {
  Column,
  Datasource,
  Parameter,
  SourceColumn,
  CalculatedColumn,
  MappedDatasource,
  MappedColumn,
} from "../types";
import { Graph } from "./graf";

const DISCARDED_COLUMN_NAMES = ["[:Measure Names]", "[Number of Records]"];

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

export function stripJunkFromCalc(calculation: string): string {
  let cleanCalc = calculation;
  // first strip string literals
  cleanCalc = cleanCalc.replaceAll(/".*?"/gs, "");
  cleanCalc = cleanCalc.replaceAll(/'.*?'/gs, "");
  // then strip comments, starting with `//`
  cleanCalc = cleanCalc.replaceAll(/\/\/.*/g, "");
  // as well as multiline comments starting with /* and ending with */
  cleanCalc = cleanCalc.replaceAll(/\/\*.*\*\//gs, "");
  cleanCalc = cleanCalc.trim();
  return cleanCalc;
}

export function replaceNamesWithCaptionsInCalculation(
  calculation: CalculatedColumn["calculation"],
  dependsOn: Column[]
): CalculatedColumn["calculation"] {
  // Tableau sometimes stores the names of columns in the calculations instead of the captions like in the UI
  let calcWithCaptions = calculation;
  dependsOn.forEach((col) => {
    calcWithCaptions = calcWithCaptions.replaceAll(col.name, `[${col.caption}]`);
  });
  return calcWithCaptions;
}

export function convertStringToWorkbook(xmlString: string) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, "text/xml");
  return xmlDoc;
}

export function getDatasourcesFromWorkbook(xmlString: string): Datasource[] {
  const xmlDoc = convertStringToWorkbook(xmlString);

  const datasources = _evaluateXPath(xmlDoc, "/workbook/datasources/datasource");

  return datasources.map((ds) => convertElementToDatasource(xmlDoc, ds));
}

export function convertElementToDatasource(workbook: Document, element: Element): Datasource {
  const cols = getColumnsFromDatasourceElement(workbook, element);
  return {
    name: element.getAttribute("name")!,
    caption: element.getAttribute("caption")!,
    isColumnDependencyMapped: false,
    columns: cols,
  };
}

export function getSourceColumnElementsFromDatasourceElement(
  workbook: Document,
  datasource: Element
): Array<Element> {
  return _evaluateXPath(workbook, "./column[not(calculation)]", datasource);
}

export function getColumnsFromDatasourceElement(
  workbook: Document,
  datasource: Element
): Array<Column> {
  const dsIsParameters = datasource.getAttribute("name") === "Parameters";
  const allColumns = _evaluateXPath(workbook, "./column", datasource).filter(
    (c) => !DISCARDED_COLUMN_NAMES.includes(c.getAttribute("name")!)
  );
  const parameterColumnElements = dsIsParameters ? allColumns : [];
  const calculatedColumnElements = dsIsParameters
    ? []
    : allColumns.filter((c) => Array.from(c.children).some((ce) => ce.nodeName == "calculation"));
  const sourceColumnElements = dsIsParameters
    ? []
    : allColumns.filter((c) => !Array.from(c.children).some((ce) => ce.nodeName == "calculation"));

  const calculatedColumns = calculatedColumnElements.map((e) =>
    convertElementToCalculatedColumn(e)
  );
  const parameterColumns = parameterColumnElements.map((e) => convertElementToParameter(e));
  const sourceColumns = sourceColumnElements.map((e) => convertElementToSourceColumn(workbook, e));

  // since Tableau's twb format sucks, we have to extend the sourceColumns list
  // based on metadata-record
  const metadataOnlySourceColumns: Array<SourceColumn> = _evaluateXPath(
    workbook,
    ".//metadata-record[@class='column']",
    datasource
  ).map((metadataRecord) => {
    const sourceTable = _evaluateXPath(workbook, "./parent-name", metadataRecord)[0].textContent!;
    const name = _evaluateXPath(workbook, "./local-name", metadataRecord)[0].textContent!;

    return {
      caption: name, // not necessarily the case, but a rename is not captured in the metadata record
      name: name,
      sourceTable: sourceTable,
      isCalculated: false, // as I understand, only sourceColumns have metadata records
      isParameter: false,
      dependencyGeneration: 0, // by definition
    };
  });

  // TODO: fix this for name collisions between columns of different datasources
  for (let column of metadataOnlySourceColumns) {
    if (sourceColumns.filter((c) => c.name === column.name).length > 0) continue;
  }

  let columns: Array<Column> = [];
  columns = columns.concat(calculatedColumns, parameterColumns, sourceColumns);

  return columns;
}

export function convertElementToParameter(element: Element): Parameter {
  const caption = element.getAttribute("caption")!;
  const name = element.getAttribute("name")!;

  return {
    name,
    caption,
    isParameter: true,
    isCalculated: false,
  };
}

export function convertElementToCalculatedColumn(element: Element): CalculatedColumn {
  const caption = element.getAttribute("caption")!;
  const name = element.getAttribute("name")!;

  const calculationNode = Array.from(element.children).find((e) => e.nodeName == "calculation");
  if (!calculationNode) throw new Error("Supplied element has no <calculation> chlid");

  const calculation = calculationNode.getAttribute("formula");
  if (!calculation) throw new Error("Cannot find formula attribute of calculation");
  return {
    name,
    caption,
    calculation,
    isCalculated: true,
    isParameter: false,
  };
}

export function convertElementToSourceColumn(workbook: Document, element: Element): SourceColumn {
  const name = element.getAttribute("name")!;
  // find the metadata record in the datasource
  const datasource = _evaluateXPath(workbook, "ancestor::datasource", element)[0];

  const metadataRecord = _evaluateXPath(
    workbook,
    `./connection/metadata-records/metadata-record[@class='column' and local-name[text()='${name}']]`,
    datasource
  )[0];

  const sourceTable = metadataRecord ? _evaluateXPath(workbook, "./parent-name", metadataRecord)[0].textContent! : 'Unknown';

  return {
    name,
    caption: name.replace(/\[|\]/g, ""),
    isCalculated: false,
    isParameter: false,
    sourceTable,
  };
}

export function populateColumnDependencies(datasource: Datasource): MappedDatasource {
  let mappedColumns: MappedColumn[] = [];
  let graph = new Graph();

  for (let column of datasource.columns) {
    if (column.isCalculated) {
      const calcSyntax = stripJunkFromCalc(column.calculation);
      const dependsOn = datasource.columns.filter((c) => calcSyntax.includes(c.name));

      const calculationWithCaptions = replaceNamesWithCaptionsInCalculation(
        column.calculation,
        dependsOn
      );

      mappedColumns.push({
        ...column,
        dependsOn: dependsOn.map((c) => c.name),
        calculation: calculationWithCaptions,
        dependencyGeneration: 0,
      });
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
    mappedColumns.find((c) => c.name === v.id)!.dependencyGeneration = v.topologicalGeneration!;
  });

  return {
    ...datasource,
    isColumnDependencyMapped: true,
    columns: mappedColumns,
  };
}
