export interface Worksheet {
  name: string; // unique between sheets
  //   primaryDataSource: Datasource["name"];
  //   secondaryDataSources?: Array<Datasource["name"]>;
}

export type Calculation = string;

export interface BaseColumn {
  name: string; // unique within the datasource
  caption: string;

  isCalculated: boolean;
  isParameter: boolean;
}

export interface CalculatedColumn extends BaseColumn {
  isCalculated: true;
  isParameter: false;
  calculation: string;
}

export interface SourceColumn extends BaseColumn {
  isCalculated: false;
  isParameter: false;
  sourceTable: string;
  dependencyGeneration?: 0;
}

export interface Parameter extends BaseColumn {
  isCalculated: false;
  isParameter: true;
  dependencyGeneration?: 0;
}

export type Column = Parameter | SourceColumn | CalculatedColumn;
export type MappedColumn = Column & {
  dependsOn: Array<Column["name"]>;
  dependencyGeneration: number;
};

export interface Datasource {
  name: string;
  caption: string;
  isColumnDependencyMapped: boolean;
  columns: Column[];
}

export interface MappedDatasource extends Datasource {
  isColumnDependencyMapped: true;
  columns: MappedColumn[];
}

export interface ParameterDatasource extends Datasource {
  columns: Parameter[];
}

export interface Workbook {
  datasources: Datasource[];
  parameters: Parameter[];
}
