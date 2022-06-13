import { MappedDatasource, MappedColumn, RawWorkbook, RawDatasource } from "../types";

import { getRawColumnsFromDatasourceElement } from "./columnParse";
import { mapRawColumn } from "./columnMap";

export function convertElementToRawDatasource(workbook: Document, element: Element): RawDatasource {
  const rawCols = getRawColumnsFromDatasourceElement(workbook, element);
  const datasourceName = element.getAttribute("name")!;
  const datasource: RawDatasource = {
    name: datasourceName,
    caption: element.getAttribute("caption") ?? datasourceName,
    isColumnDependencyMapped: false,
    columns: rawCols,
  };

  return datasource;
}

export function mapDatasource(datasource: RawDatasource, workbook: RawWorkbook): MappedDatasource {
  const mappedColumns: MappedColumn[] = datasource.columns.map((c) =>
    mapRawColumn(c, datasource, workbook.datasources)
  );
  return {
    ...datasource,
    columns: mappedColumns,
    isColumnDependencyMapped: true,
  };
}
