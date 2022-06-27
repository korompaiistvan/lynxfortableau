// local
import {
  convertElementToCalculatedColumn,
  convertElementToParameter,
  convertElementToRawDatasource,
  convertElementToSourceColumn,
  convertStringToRawWorkbook,
  stripJunkFromCalc,
} from "..";

// types
import { Parameter, RawCalculatedColumn, RawDatasource, SourceColumn } from "src/types";

import superstoreString from "src/Superstore.twb";
import basicWorkbookString from "./helper/basicManualWorkbook.twb";

import { expectedRawDatasources } from "./helper/expectedSuperstore";

describe("removes unneccessary strings from calcs", () => {
  test("line comment", () => {
    const input = "SUM([Sales]) // This is a comment at the end of the line";
    const output = "SUM([Sales])";
    expect(stripJunkFromCalc(input)).toBe(output);
  });

  test("leading and trailing whitespace", () => {
    const input = `   SUM([Sales])  `;
    const output = "SUM([Sales])";
    expect(stripJunkFromCalc(input)).toBe(output);
  });

  test("string literals (single quote)", () => {
    const input = `IF [This] = 'That' THEN 1 ELSE 0 END`;
    const output = `IF [This] =  THEN 1 ELSE 0 END`;
    expect(stripJunkFromCalc(input)).toBe(output);
  });

  test("string literals (double quote)", () => {
    const input = `IF [This] = "That" THEN 1 ELSE 0 END`;
    const output = `IF [This] =  THEN 1 ELSE 0 END`;
    expect(stripJunkFromCalc(input)).toBe(output);
  });
});

const parser = new DOMParser();

describe("translates elements to js objects accurately", () => {
  test("Parameters", () => {
    const parameterElementString = `
            <column caption='Churn Rate' datatype='real' default-format='p0.00%' name='[Parameter 3]' param-domain-type='range' role='measure' type='quantitative' value='0.064000000000000001'>
                <calculation class='tableau' formula='0.064000000000000001' />
                <range granularity='0.001' max='0.25' min='0.0' />
            </column>
        `;
    const parameterElement = parser.parseFromString(
      parameterElementString,
      "text/xml"
    ).documentElement;
    const parsedParameter: Parameter = {
      name: "[Parameter 3]",
      caption: "Churn Rate",
      type: "parameter",
    };
    expect(convertElementToParameter(parameterElement)).toEqual(parsedParameter);
  });
  test("calculatedColumns", () => {
    const calculatedColumnElementString = `
            <column caption='Profit Ratio' datatype='real' default-format='p0%' name='[Calculation_5571209093911105]' role='measure' type='quantitative'>
                <calculation class='tableau' formula='SUM([Profit])/SUM([Sales])' scope-isolation='false' />
            </column>
        `;
    const calculatedColumnElement = parser.parseFromString(
      calculatedColumnElementString,
      "text/xml"
    ).documentElement;
    const parsedCalculatedColumn: RawCalculatedColumn = {
      name: "[Calculation_5571209093911105]",
      caption: "Profit Ratio",
      rawFormula: "SUM([Profit])/SUM([Sales])",
      type: "calculated",
    };
    expect(convertElementToCalculatedColumn(calculatedColumnElement)).toEqual(
      parsedCalculatedColumn
    );
  });
  test("sourceColumns", () => {
    const basicWorkbook = parser.parseFromString(basicWorkbookString, "text/xml");
    const sourceColumnElement = basicWorkbook.querySelector('column[name="[Profit]"]')!;
    const parsedSourceColumn: SourceColumn = {
      name: "[Profit]",
      caption: "Profit",
      sourceTable: "[Orders]",
      type: "source",
    };

    expect(convertElementToSourceColumn(basicWorkbook, sourceColumnElement)).toEqual(
      parsedSourceColumn
    );
  });
});

describe("translates datasource element into Datasource object", () => {
  test("basic datasource", () => {
    const basicWorkbook = parser.parseFromString(basicWorkbookString, "text/xml");
    const datasource = basicWorkbook.querySelector("datasource")!;
    const expectedDatasource: RawDatasource = {
      name: "federated.1uk8ts01uomc1z17rjjdj1xfe1av",
      caption: "Sample - Superstore",
      isColumnDependencyMapped: false,
      columns: [
        {
          name: "[Calculation_5571209093911105]",
          caption: "Profit Ratio",
          rawFormula: "SUM([Profit])/SUM([Sales])",
          type: "calculated",
        },
        {
          name: "[Profit]",
          caption: "Profit",
          sourceTable: "[Orders]",
          type: "source",
        },
        {
          name: "[Sales]",
          caption: "Sales",
          sourceTable: "[Orders]",
          type: "source",
        },
      ],
    };
    expect(convertElementToRawDatasource(basicWorkbook, datasource)).toEqual(expectedDatasource);
  });
  test("datasource with hidden columns", () => {
    const basicWorkbook = parser.parseFromString(basicWorkbookString, "text/xml");
    const datasourceElement = basicWorkbook.querySelector("datasource")!;
    const metadataRecordElement = parser.parseFromString(
      `<metadata-record class='column'>
        <remote-name>hidden_column</remote-name>
        <local-name>[hidden_column]</local-name>
        <parent-name>[Orders]</parent-name>
        <remote-alias>hidden_column</remote-alias>
      </metadata-record>`,
      "text/xml"
    ).documentElement;
    const calculationElement = parser.parseFromString(
      `<column caption='Calc with Hidden Column' datatype='real' default-format='p0%' name='[Calculation_6698435196813887]' role='measure' type='quantitative'>
        <calculation class='tableau' formula='IF [hidden_column] THEN [Calculation_5571209093911105] END' scope-isolation='false' />
      </column>`,
      "text/xml"
    ).documentElement;
    datasourceElement.querySelector("metadata-records")!.append(metadataRecordElement);
    datasourceElement.append(calculationElement);

    const expectedDatasource: RawDatasource = {
      name: "federated.1uk8ts01uomc1z17rjjdj1xfe1av",
      caption: "Sample - Superstore",
      isColumnDependencyMapped: false,
      columns: [
        {
          name: "[Calculation_5571209093911105]",
          caption: "Profit Ratio",
          rawFormula: "SUM([Profit])/SUM([Sales])",
          type: "calculated",
        },
        {
          name: "[Calculation_6698435196813887]",
          caption: "Calc with Hidden Column",
          rawFormula: "IF [hidden_column] THEN [Calculation_5571209093911105] END",
          type: "calculated",
        },
        {
          name: "[Profit]",
          caption: "Profit",
          sourceTable: "[Orders]",
          type: "source",
        },
        {
          name: "[Sales]",
          caption: "Sales",
          sourceTable: "[Orders]",
          type: "source",
        },
        {
          caption: "hidden_column",
          name: "[hidden_column]",
          sourceTable: "[Orders]",
          type: "source",
        },
      ],
    };

    expect(convertElementToRawDatasource(basicWorkbook, datasourceElement)).toEqual(
      expectedDatasource
    );
  });
});

describe("parses Superstore accurately", () => {
  const rawWorkbook = convertStringToRawWorkbook(superstoreString);
  test("datasources", () => {
    expect(rawWorkbook.datasources).toEqual(expectedRawDatasources);
  });
});
