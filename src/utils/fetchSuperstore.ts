import { MappedDatasource } from "../types";
import {
  getDatasourcesFromWorkbook,
  populateColumnDependencies,
} from "../parser/TableauWorkbookParser";
import superstoreString from "./Superstore.twb";

export function fetchSuperstore(): MappedDatasource[] {
  const datasources = getDatasourcesFromWorkbook(superstoreString);
  return datasources.map((ds) => populateColumnDependencies(ds));
}
