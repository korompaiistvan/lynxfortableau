import {
  Datasource,
  Parameter,
  SourceColumn,
  RawCalculatedColumn,
  RawColumn,
  MappedDatasource,
  MappedColumn,
  Calculation,
  RawWorkbook,
  RawDatasource,
  Worksheet,
  MappedWorkbook,
} from "../types";

import { evaluateXPath, DISCARDED_COLUMN_NAMES } from "./utils";

export function convertElementToParameter(element: Element): Parameter {
  const caption = element.getAttribute("caption")!;
  const name = element.getAttribute("name")!;
  return {
    name,
    caption,
    type: "parameter",
  };
}

export function convertElementToCalculatedColumn(element: Element): RawCalculatedColumn {
  const name = element.getAttribute("name")!;
  const caption = element.getAttribute("caption") ?? name.replaceAll(/[\[|\]]/g, "");

  const calculationNode = Array.from(element.children).find((e) => e.nodeName == "calculation");
  if (!calculationNode)
    throw new Error(`Supplied column element ${name} has no <calculation> chlid`);

  let formula = "";
  if (calculationNode.getAttribute("class") === "categorical-bin") {
    // TODO: handle categorical bins i.e. groups properly
    formula = "This is a group";
  } else {
    formula = calculationNode.getAttribute("formula") ?? "";
    if (!formula) throw new Error(`Cannot find formula attribute of calculation ${name}`);
  }
  return {
    name,
    caption,
    type: "calculated",
    rawFormula: formula,
  };
}

export function convertElementToSourceColumn(workbook: Document, element: Element): SourceColumn {
  const name = element.getAttribute("name")!;
  // find the metadata record in the datasource
  const datasource = evaluateXPath(workbook, "ancestor::datasource", element)[0];

  const metadataRecord = evaluateXPath(
    workbook,
    `./connection/metadata-records/metadata-record[@class='column' and local-name[text()='${name}']]`,
    datasource
  )[0];

  const sourceTable = metadataRecord
    ? evaluateXPath(workbook, "./parent-name", metadataRecord)[0].textContent!
    : "Unknown";

  return {
    name,
    caption: name.replace(/\[|\]/g, ""),
    type: "source",
    sourceTable,
  };
}

function getMetadataOnlySourceColumns(
  workbook: Document,
  datasource: Element,
  sourceColumns: SourceColumn[]
) {
  const metadataRecordElements = evaluateXPath(
    workbook,
    ".//metadata-record[@class='column']",
    datasource
  );
  const metadataSourceColumns: Array<SourceColumn> = metadataRecordElements.map(
    (metadataRecord) => {
      const sourceTable = evaluateXPath(workbook, "./parent-name", metadataRecord)[0].textContent!;
      const name = evaluateXPath(workbook, "./local-name", metadataRecord)[0].textContent!;

      return {
        caption: name.replaceAll(/[\[\]]/g, ""), // not necessarily the case, but a rename is not captured in the metadata record
        name: name,
        sourceTable: sourceTable,
        type: "source",
      };
    }
  );

  const metadataOnlySourceColumns = metadataSourceColumns.filter(
    (col) => !sourceColumns.some((c) => c.name === col.name)
  );
  return metadataOnlySourceColumns;
}

export function getRawColumnsFromDatasourceElement(
  workbook: Document,
  datasource: Element
): Array<RawColumn> {
  const dsIsParameters = datasource.getAttribute("name") === "Parameters";
  const columnElements = evaluateXPath(workbook, "./column", datasource).filter(
    (c) => !DISCARDED_COLUMN_NAMES.includes(c.getAttribute("name")!)
  );

  if (dsIsParameters) {
    const parameterColumns = columnElements.map((e) => convertElementToParameter(e));
    return parameterColumns;
  }

  const isSourceColumnElement = (el: Element) =>
    !Array.from(el.children).some((ce) => ce.nodeName == "calculation");
  const calculatedColumnElements = columnElements.filter((e) => !isSourceColumnElement(e));
  const sourceColumnElements = columnElements.filter((e) => isSourceColumnElement(e));

  const calculatedColumns = calculatedColumnElements.map((e) =>
    convertElementToCalculatedColumn(e)
  );
  const sourceColumns = sourceColumnElements.map((e) => convertElementToSourceColumn(workbook, e));
  const metadataOnlySourceColumns = getMetadataOnlySourceColumns(
    workbook,
    datasource,
    sourceColumns
  );
  return [...calculatedColumns, ...sourceColumns, ...metadataOnlySourceColumns];
}
