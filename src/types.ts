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
  // datasource: Datasource;
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
export type RawColumnWithDatasourceRef = RawColumn & {
  datasource: RawDatasource;
};

interface ColumnMappingInfo {
  dependsOn: RawColumnWithDatasourceRef[];
  datasource: MappedDatasource;
}
export type MappedCalculatedColumn = RawCalculatedColumn &
  ColumnMappingInfo & {
    // qualifiedFormula: Calculation;
    readableFormula: Calculation;
  };

// export type MappedColumn =
//   | ((Parameter | SourceColumn) & ColumnMappingInfo)
//   | MappedCalculatedColumn;

export type MappedColumnGeneric<Type> = (Type extends RawCalculatedColumn
  ? Type & {
      readableFormula: Calculation;
    }
  : Type) &
  ColumnMappingInfo;
export type MappedColumn = MappedColumnGeneric<RawColumnWithDatasourceRef>;

export type Column = RawColumn | MappedColumn;

export interface Datasource {
  name: string;
  caption: string;
  isColumnDependencyMapped: boolean;
  columns: Column[];
}

export interface RawDatasource extends Datasource {
  isColumnDependencyMapped: false;
  columns: RawColumnWithDatasourceRef[];
}
export interface MappedDatasource extends Datasource {
  isColumnDependencyMapped: true;
  columns: MappedColumn[];
}

export interface ParameterDatasource extends Datasource {
  columns: Parameter[];
}

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

export type NodeId = Column["name"];
export type Link = { id: string; start: NodeId; end: NodeId };

export interface NodeState {
  isClosed: boolean;
  openHeight: number;
}
