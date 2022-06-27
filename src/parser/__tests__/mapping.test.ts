// external
import superstoreString from "src/Superstore.twb";

// local
import { convertStringToMappedWorkbook, mapRawWorkbook } from "..";
import { expectedMappedDatasources } from "./helper/expectedSuperstore";

// types
import { MappedDatasource, MappedWorkbook, RawDatasource } from "src/types";

describe("maps the field dependencies accurately", () => {
  test("single datasource without parameters", () => {
    const datasource: RawDatasource = {
      caption: "Best DS ever",
      name: "federated_kljbasoidhfoiuabef",
      isColumnDependencyMapped: false,
      columns: [
        {
          type: "source",
          caption: "Source Col A",
          name: "[source_column_a]",
          sourceTable: "Actually not sure",
        },
        {
          type: "source",
          caption: "Source Col B",
          name: "[source_column_b]",
          sourceTable: "Actually not sure",
        },
        {
          type: "calculated",
          caption: "1st level Calc",
          name: "[level_1_calc]",
          rawFormula: "[source_column_a] + [source_column_b]",
        },
        {
          type: "calculated",
          caption: "2nd level Calc",
          name: "[level_2_calc]",
          rawFormula: "[level_1_calc] + [source_column_b]",
        },
      ],
    };

    const expectedDatasource: MappedDatasource = {
      caption: "Best DS ever",
      name: "federated_kljbasoidhfoiuabef",
      isColumnDependencyMapped: true,
      columns: [
        {
          type: "source",
          caption: "Source Col A",
          name: "[source_column_a]",
          sourceTable: "Actually not sure",
          dependsOn: [],
          qualifiedName: "[federated_kljbasoidhfoiuabef].[source_column_a]",
        },
        {
          type: "source",
          caption: "Source Col B",
          name: "[source_column_b]",
          sourceTable: "Actually not sure",
          dependsOn: [],
          qualifiedName: "[federated_kljbasoidhfoiuabef].[source_column_b]",
        },
        {
          type: "calculated",
          caption: "1st level Calc",
          name: "[level_1_calc]",
          rawFormula: "[source_column_a] + [source_column_b]",
          readableFormula: "[Source Col A] + [Source Col B]",
          // dependsOn: [expectedColumns[0], expectedColumns[1]],
          dependsOn: [
            { datasourceName: "federated_kljbasoidhfoiuabef", columnName: "[source_column_a]" },
            { datasourceName: "federated_kljbasoidhfoiuabef", columnName: "[source_column_b]" },
          ],
          qualifiedName: "[federated_kljbasoidhfoiuabef].[level_1_calc]",
        },
        {
          type: "calculated",
          caption: "2nd level Calc",
          name: "[level_2_calc]",
          rawFormula: "[level_1_calc] + [source_column_b]",
          readableFormula: "[1st level Calc] + [Source Col B]",
          // dependsOn: [expectedColumns[1], expectedColumns[2]],
          dependsOn: [
            { datasourceName: "federated_kljbasoidhfoiuabef", columnName: "[source_column_b]" },
            { datasourceName: "federated_kljbasoidhfoiuabef", columnName: "[level_1_calc]" },
          ],
          qualifiedName: "[federated_kljbasoidhfoiuabef].[level_2_calc]",
        },
      ],
    };
    const expectedWorkbook: MappedWorkbook = {
      isMapped: true,
      datasources: [expectedDatasource],
      sheets: [],
    };

    const receivedWorkbook = mapRawWorkbook({
      isMapped: false,
      datasources: [datasource],
      sheets: [],
    });

    // sort columns before equality check
    expect(receivedWorkbook).toEqual(expectedWorkbook);
  });
  test("the Superstore workbook", () => {
    const mappedSuperstore = convertStringToMappedWorkbook(superstoreString); // parsing tested by parser.test
    expect(mappedSuperstore.datasources).toEqual(expectedMappedDatasources);
  });
});
