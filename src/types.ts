export interface Worksheet {
  name: string; // unique between sheets
  //   primaryDataSource: Datasource["name"];
  //   secondaryDataSources?: Array<Datasource["name"]>;
}

export type Calculation = string;
export type ColumnType = "source" | "calculated" | "parameter"; // | 'group' | 'set' | 'bin'

interface BaseColumn {
  name: string; // unique within the datasource
  caption: string;
  type: ColumnType;
}

export interface SourceColumn extends BaseColumn {
  type: "source";
  sourceTable: string;
}
export interface Parameter extends BaseColumn {
  type: "parameter";
}
export interface RawCalculatedColumn extends BaseColumn {
  type: "calculated";
  rawFormula: string;
}
export type RawColumn = Parameter | SourceColumn | RawCalculatedColumn;

export interface ColumnDependency {
  datasourceName: Datasource["name"];
  columnName: Column["name"];
}

export type QualifiedName = `[${Datasource["name"]}].${Column["name"]}`; // Column names are already surrounded by brackets
export type MappedColumn = (
  | Parameter
  | SourceColumn
  | (RawCalculatedColumn & { readableFormula: Calculation })
) & { dependsOn: ColumnDependency[]; qualifiedName: QualifiedName };

export type Column = RawColumn | MappedColumn;

export interface BaseDatasource {
  name: string;
  caption: string;
  isColumnDependencyMapped: boolean;
}

export interface RawDatasource extends BaseDatasource {
  isColumnDependencyMapped: false;
  columns: RawColumn[];
}

export interface MappedDatasource extends BaseDatasource {
  isColumnDependencyMapped: true;
  columns: MappedColumn[];
}

export type Datasource = RawDatasource | MappedDatasource;

export interface Workbook {
  isMapped: boolean;
  datasources: Datasource[];
  sheets: Worksheet[];
}

export interface RawWorkbook extends Workbook {
  isMapped: false;
  datasources: RawDatasource[];
}

export interface MappedWorkbook extends Workbook {
  isMapped: true;
  datasources: MappedDatasource[];
}

/////////////////////////
// State-related types //
/////////////////////////

export type NodeId = MappedColumn["qualifiedName"];
export type Link = { id: string; start: NodeId; end: NodeId };

export interface NodeState {
  isClosed: boolean;
  openHeight: number;
}
