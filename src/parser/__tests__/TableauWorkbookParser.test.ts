import {
  Datasource,
  MappedColumn,
  MappedDatasource,
  MappedWorkbook,
  Parameter,
  RawCalculatedColumn,
  RawDatasource,
  SourceColumn,
} from "src/types";
import {
  convertElementToCalculatedColumn,
  convertElementToRawDatasource,
  convertElementToParameter,
  convertElementToSourceColumn,
  mapRawColumn,
  mapRawWorkbook,
  stripJunkFromCalc,
} from "..";

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

const basicWorkbookString = `
    <datasource caption='Sample - Superstore' inline='true' name='federated.1uk8ts01uomc1z17rjjdj1xfe1av' version='18.1'>
        <connection class='federated'>
            <named-connections>
                <named-connection caption='Sample - EU Superstore' name='excel-direct.1ma24b61n2cxsp167yev81x2rxr1'>
                <connection class='excel-direct' cleaning='no' compat='no' dataRefreshTime='' filename='Data/Superstore/Sample - EU Superstore.xls' interpretationMode='0' password='' server='' validate='no' />
                </named-connection>
            </named-connections>
            <cols>
                <map key='[Profit]' value='[Orders].[Profit]' />
                <map key='[Sales]' value='[Orders].[Sales]' />
            </cols>
            <metadata-records>
                <metadata-record class='capability'>
                    <remote-name />
                    <remote-type>0</remote-type>
                    <parent-name>[Orders]</parent-name>
                    <remote-alias />
                    <aggregation>Count</aggregation>
                    <contains-null>true</contains-null>
                    <attributes>
                        <attribute datatype='integer' name='context'>0</attribute>
                        <attribute datatype='string' name='gridOrigin'>&quot;A1:T10001:no:A1:T10001:0&quot;</attribute>
                        <attribute datatype='boolean' name='header'>true</attribute>
                        <attribute datatype='integer' name='outcome'>6</attribute>
                    </attributes>
                </metadata-record>
                <metadata-record class='column'>
                    <remote-name>Sales</remote-name>
                    <remote-type>5</remote-type>
                    <local-name>[Sales]</local-name>
                    <parent-name>[Orders]</parent-name>
                    <remote-alias>Sales</remote-alias>
                    <ordinal>1</ordinal>
                    <local-type>real</local-type>
                    <aggregation>Sum</aggregation>
                    <precision>15</precision>
                    <contains-null>true</contains-null>
                    <attributes>
                        <attribute datatype='string' name='DebugRemoteType'>&quot;R8&quot;</attribute>
                    </attributes>
                <_.fcp.ObjectModelEncapsulateLegacy.true...object-id>[Orders_562B9EED3F4F475E846CE7CDBC13B588]</_.fcp.ObjectModelEncapsulateLegacy.true...object-id>
                </metadata-record>
                <metadata-record class='column'>
                    <remote-name>Profit</remote-name>
                    <remote-type>5</remote-type>
                    <local-name>[Profit]</local-name>
                    <parent-name>[Orders]</parent-name>
                    <remote-alias>Profit</remote-alias>
                    <ordinal>2</ordinal>
                    <local-type>real</local-type>
                    <aggregation>Sum</aggregation>
                    <precision>15</precision>
                    <contains-null>true</contains-null>
                    <attributes>
                        <attribute datatype='string' name='DebugRemoteType'>&quot;R8&quot;</attribute>
                    </attributes>
                    <_.fcp.ObjectModelEncapsulateLegacy.true...object-id>[Orders_562B9EED3F4F475E846CE7CDBC13B588]</_.fcp.ObjectModelEncapsulateLegacy.true...object-id>
                </metadata-record>
            </metadata-records>
        </connection>
        <aliases enabled='yes' />
        <column caption='Profit Ratio' datatype='real' default-format='p0%' name='[Calculation_5571209093911105]' role='measure' type='quantitative'>
            <calculation class='tableau' formula='SUM([Profit])/SUM([Sales])' scope-isolation='false' />
        </column>
        <column datatype='real' default-format='c&quot;£&quot;#,##0;-&quot;£&quot;#,##0' name='[Profit]' role='measure' type='quantitative' />
        <column datatype='real' default-format='c&quot;£&quot;#,##0;-&quot;£&quot;#,##0' name='[Sales]' role='measure' type='quantitative' />
    </datasource>
`;
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

describe("maps the field dependencies accurately", () => {
  test("singe datasource without parameters", () => {
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
        },
        {
          type: "source",
          caption: "Source Col B",
          name: "[source_column_b]",
          sourceTable: "Actually not sure",
          dependsOn: [],
        },
        {
          type: "calculated",
          caption: "1st level Calc",
          name: "[level_1_calc]",
          rawFormula: "[source_column_a] + [source_column_b]",
          readableFormula: "[Source Col A] + [Source Col B]",
          // dependsOn: [expectedColumns[0], expectedColumns[1]],
          dependsOn: [{ columnName: "[source_column_a]" }, { columnName: "[source_column_b]" }],
        },
        {
          type: "calculated",
          caption: "2nd level Calc",
          name: "[level_2_calc]",
          rawFormula: "[level_1_calc] + [source_column_b]",
          readableFormula: "[1st level Calc] + [Source Col B]",
          // dependsOn: [expectedColumns[1], expectedColumns[2]],
          dependsOn: [{ columnName: "[source_column_b]" }, { columnName: "[level_1_calc]" }],
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
});
