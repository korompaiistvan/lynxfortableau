import {
  MappedDatasource,
  MappedColumn,
  RawWorkbook,
  RawDatasource,
  RawColumnWithDatasourceRef,
} from "../types";

import { getRawColumnsFromDatasourceElement } from "./columnParse";
import { mapRawColumn } from "./columnMap";

export function convertElementToRawDatasource(workbook: Document, element: Element): RawDatasource {
  const rawCols = getRawColumnsFromDatasourceElement(workbook, element);
  let datasource: RawDatasource = {
    name: element.getAttribute("name")!,
    caption: element.getAttribute("caption")!,
    isColumnDependencyMapped: false,
    columns: [] as RawColumnWithDatasourceRef[],
  };

  datasource.columns = rawCols.map((c) => {
    return { ...c, datasource };
  });

  return datasource;
}

export function mapDatasource(datasource: RawDatasource, workbook: RawWorkbook): MappedDatasource {
  const mappedColumns: MappedColumn[] = datasource.columns.map((c) =>
    mapRawColumn(c, workbook.datasources)
  );
  return {
    ...datasource,
    columns: mappedColumns,
    isColumnDependencyMapped: true,
  };
}
