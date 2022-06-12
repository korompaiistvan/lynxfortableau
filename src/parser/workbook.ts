import { RawWorkbook, RawDatasource, MappedDatasource, Worksheet, MappedWorkbook } from "../types";

import { convertElementToRawDatasource, mapDatasource } from "./datasource";
import { evaluateXPath } from "./utils";

function convertStringToDocument(xmlString: string) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, "text/xml");
  return xmlDoc;
}

function convertDocumentToRawWorkbook(xmlDoc: Document): RawWorkbook {
  const sheets: Worksheet[] = []; // TODO: actually get them

  const datasourceElements = evaluateXPath(xmlDoc, "/workbook/datasources/datasource");
  const datasources: RawDatasource[] = datasourceElements.map((ds) =>
    convertElementToRawDatasource(xmlDoc, ds)
  );

  return {
    isMapped: false,
    datasources,
    sheets,
  };
}

export function mapRawWorkbook(workbook: RawWorkbook): MappedWorkbook {
  const { datasources } = workbook;
  const mappedDatasources: MappedDatasource[] = datasources.map((ds) =>
    mapDatasource(ds, workbook)
  );

  return {
    ...workbook,
    datasources: mappedDatasources,
    isMapped: true,
  };
}

export function convertStringToMappedWorkbook(xmlString: string) {
  const wbDocument = convertStringToDocument(xmlString);
  const rawWorkbook = convertDocumentToRawWorkbook(wbDocument);
  const mappedWorkbook = mapRawWorkbook(rawWorkbook);
  return mappedWorkbook;
}
