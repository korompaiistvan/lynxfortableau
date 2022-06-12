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
  MappedCalculatedColumn,
  RawWorkbook,
  RawDatasource,
  Worksheet,
  MappedWorkbook,
  RawColumnWithDatasourceRef,
  QualifiedName,
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

export function mapRawColumn(
  column: RawColumnWithDatasourceRef,
  datasources: RawDatasource[]
): MappedColumn {
  // this function does two things:
  //   - determine what other columns a given calculation depends on
  //   - replace those references to include the caption of the column instead of the name
  // the only reason they are not separated is easier type annotations (avoid defining an additional version of Column)

  if (column.type !== "calculated") {
    return { ...column, dependsOn: [] };
  }

  const allColumns = datasources.map((d) => d.columns).flat();
  let readableFormula = column.rawFormula;
  const strippedFormula = stripJunkFromCalc(column.rawFormula);
  const dependsOn = [];

  for (let dependentColumn of allColumns) {
    if (dependentColumn.datasource.name === column.datasource.name) {
      if (!strippedFormula.includes(column.name)) continue;
      dependsOn.push(dependentColumn);
      readableFormula = readableFormula.replaceAll(
        dependentColumn.name,
        `[${dependentColumn.caption}]`
      );
    } else {
      const qualifiedName = `[${dependentColumn.datasource.name}].[${dependentColumn.name}]`;
      if (!strippedFormula.includes(qualifiedName)) continue;
      dependsOn.push(dependentColumn);
      readableFormula = readableFormula.replaceAll(
        qualifiedName,
        `[${dependentColumn.datasource.caption}].${dependentColumn.caption}`
      );
    }
  }

  return {
    ...column,
    dependsOn,
    readableFormula,
  };
}
