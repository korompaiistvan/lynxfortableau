export type ColumnRole = "measure" | "dimension";
export type ColumnType = "quantitative" | "nominal";
export type ColumnDataType = "real" | "integer" | "string";

export interface Worksheet {
  name: string; // unique between sheets
  //   primaryDataSource: Datasource["name"];
  //   secondaryDataSources?: Array<Datasource["name"]>;
}

export type Calculation = string;

export interface Column {
  name: string; // unique within the datasource
  role: ColumnRole;
  type: ColumnType;
  dataType: ColumnDataType;

  isCalculated: boolean;
  isParameter: boolean;

  usedIn?: Array<{
    worksheet: Worksheet["name"];
    asFilter: boolean;
  }>;

  dependencyGeneration?: number;
}

export interface CalculatedColumn extends Column {
  isCalculated: true;
  isParameter: false;
  calculation: string;
  dependsOn: Array<Column["name"]>;
}

export interface SourceColumn extends Column {
  isCalculated: false;
  isParameter: false;
  sourceTable: string;
  dependencyGeneration?: 0;
}

export interface Parameter extends Column {
  isCalculated: false;
  isParameter: true;
  dependencyGeneration: 0;
}

export interface Datasource {
  name: string;
  caption: string;
  columns: Array<CalculatedColumn | SourceColumn>;
  parameters?: Array<Parameter>;
}

export interface Workbook {
  datasources: Datasource[];
  parameters: Parameter[];
}
