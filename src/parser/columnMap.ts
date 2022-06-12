import {
  Datasource,
  Parameter,
  SourceColumn,
  RawCalculatedColumn,
  Column,
  RawColumn,
  MappedDatasource,
  MappedColumn,
  Calculation,
  RawWorkbook,
  RawDatasource,
  Worksheet,
  MappedWorkbook,
  ColumnDependency,
} from "../types";

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

export function replaceNamesWithCaptions(
  calculation: Calculation,
  dependsOn: ColumnDependency[],
  parentDatasource: Datasource,
  datasources: Datasource[]
): Calculation {
  let readableFormula = calculation;

  dependsOn.forEach((dep) => {
    const { datasourceName, columnName } = dep;
    const datasource = datasourceName
      ? datasources.find((d) => d.name == dep.datasourceName)
      : parentDatasource;
    if (!datasource)
      throw new Error(`Datasource ${datasourceName} not found while replacing names with captions`);

    const col = datasource.columns.find((c) => c.name == columnName);
    if (!col)
      throw new Error(
        `Column ${columnName} not found in datasource ${datasource.name} while replacing names with captions`
      );

    const searchName = datasourceName ? `[${datasourceName}].${columnName}` : `${columnName}`;
    const replaceName = datasourceName
      ? `[${datasource.caption}].[${col.caption}]`
      : `[${col.caption}]`;
    readableFormula = readableFormula.replaceAll(searchName, replaceName);
  });
  return readableFormula;
}

function findDependencies(
  column: RawCalculatedColumn,
  parentDatasource: Datasource,
  datasources: RawDatasource[]
): ColumnDependency[] {
  // const allColumns: ColumnDependency[] = datasources
  //   .map((d) =>
  //     d.columns.map((c) => {
  //       return { datasourceName: d.name, columnName: column.name };
  //     })
  //   )
  //   .flat();

  const strippedFormula = stripJunkFromCalc(column.rawFormula);
  const dependsOn = [];

  // look for foreign columns first in case of name collision
  const foreignDatasources = datasources.filter((ds) => ds.name !== parentDatasource.name);
  const foreignColumns: ColumnDependency[] = foreignDatasources
    .map((d) =>
      d.columns.map((c) => {
        return { datasourceName: d.name, columnName: column.name };
      })
    )
    .flat();

  for (let dependency of foreignColumns) {
    const qualifiedName = `[${dependency.datasourceName}].[${dependency.columnName}]`;
    if (!strippedFormula.includes(qualifiedName)) continue;
    dependsOn.push(dependency);
  }

  // then look for siblings
  const siblingColumns = parentDatasource.columns.map((c) => {
    return { columnName: c.name };
  });
  for (let dependency of siblingColumns) {
    const { columnName } = dependency;
    if (!strippedFormula.includes(columnName)) continue;
    dependsOn.push(dependency);
  }

  return dependsOn;
}

export function mapRawColumn(
  column: RawColumn,
  parentDatasource: RawDatasource,
  datasources: RawDatasource[]
): MappedColumn {
  if (column.type !== "calculated") return { ...column, dependsOn: [] };
  const dependsOn = findDependencies(column, parentDatasource, datasources);

  const readableFormula = replaceNamesWithCaptions(
    column.rawFormula,
    dependsOn,
    parentDatasource,
    datasources
  );

  return {
    ...column,
    dependsOn,
    readableFormula,
  };
}
