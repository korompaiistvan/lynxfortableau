import {convertElementToCalculatedColumn, convertElementToDatasource, convertElementToParameter, convertElementToSourceColumn, convertStringToWorkbook, populateColumnDependencies, replaceNamesWithCaptionsInCalculation, stripJunkFromCalc} from '../src/parser/TableauWorkbookParser'
import superstoreString from "../src/utils/Superstore.twb";

test('converts strings to XMLDocs', () =>{
    expect(convertStringToWorkbook(superstoreString)).toBeInstanceOf(Document)
})

describe('removes unneccessary strings from calcs', () => {
    test('line comment', () => {
        const input = 'SUM([Sales]) // This is a comment at the end of the line'
        const output = 'SUM([Sales])'
        expect(stripJunkFromCalc(input)).toBe(output)
    });

    test('leading and trailing whitespace', () => {
        const input = `   SUM([Sales])  `
        const output = 'SUM([Sales])'
        expect(stripJunkFromCalc(input)).toBe(output)
    });
    
    test('string literals (single quote)', () => {
        const input = `IF [This] = 'That' THEN 1 ELSE 0 END`
        const output = `IF [This] =  THEN 1 ELSE 0 END`
        expect(stripJunkFromCalc(input)).toBe(output)
    })

    test('string literals (double quote)', () => {
        const input = `IF [This] = "That" THEN 1 ELSE 0 END`
        const output = `IF [This] =  THEN 1 ELSE 0 END`
        expect(stripJunkFromCalc(input)).toBe(output)
    })
})

describe('replace names with captions in calculations', () => {
    const column = {
        name: '[very_ugly_name_of_calculation_federated_blabla]', // unique within the datasource
        caption: 'Readable Name',
        isCalculated: false,
        isParameter: false,
        sourceTable: 'Orders',
        dependencyGeneration: 0
    }
    test('if it already has the name, do nothing', () => {
        const calculation = 'IF Readable Name = "kiskutya" THEN 1 ELSE 0 END'
        expect(replaceNamesWithCaptionsInCalculation(calculation, [column])).toEqual(calculation)
    })
    test('if it has the name and not the caption, replace it', ()=>{
        const calculation = 'IF [very_ugly_name_of_calculation_federated_blabla] = "kiskutya" THEN 1 ELSE 0 END'
        const replacedCalculation = 'IF [Readable Name] = "kiskutya" THEN 1 ELSE 0 END'
        expect(replaceNamesWithCaptionsInCalculation(calculation, [column])).toEqual(replacedCalculation)

    })
})

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
                    <ordinal>16</ordinal>
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
                    <ordinal>19</ordinal>
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
`
const parser = new DOMParser()
const basicWorkbook = parser.parseFromString(basicWorkbookString, 'text/xml')

describe('translates elements to js objects accurately', ()=>{
    
    test('Parameters', () => {
        const parameterElementString = `
            <column caption='Churn Rate' datatype='real' default-format='p0.00%' name='[Parameter 3]' param-domain-type='range' role='measure' type='quantitative' value='0.064000000000000001'>
                <calculation class='tableau' formula='0.064000000000000001' />
                <range granularity='0.001' max='0.25' min='0.0' />
            </column>
        `
        const parameterElement = parser.parseFromString(parameterElementString, 'text/xml').documentElement
        const parsedParameter = {
            name: '[Parameter 3]',
            caption: 'Churn Rate',
            isCalculated: false,
            isParameter: true,
        }
        expect(convertElementToParameter(parameterElement)).toEqual(parsedParameter)
    })
    test('calculatedColumns', () => {
        const calculatedColumnElementString = `
            <column caption='Profit Ratio' datatype='real' default-format='p0%' name='[Calculation_5571209093911105]' role='measure' type='quantitative'>
                <calculation class='tableau' formula='SUM([Profit])/SUM([Sales])' scope-isolation='false' />
            </column>
        `
        const calculatedColumnElement = parser.parseFromString(calculatedColumnElementString, 'text/xml').documentElement
        const parsedCalculatedColumn = {
            name: '[Calculation_5571209093911105]',
            caption: 'Profit Ratio',
            calculation: 'SUM([Profit])/SUM([Sales])',
            isCalculated: true,
            isParameter: false,
        }
        expect(convertElementToCalculatedColumn(calculatedColumnElement)).toEqual(parsedCalculatedColumn)
    })
    test('sourceColumns', ()=>{
        const sourceColumnElement = basicWorkbook.querySelector('column[name="[Profit]"]')
        const parsedSourceColumn = {
            name: '[Profit]',
            caption: 'Profit',
            isCalculated: false,
            isParameter: false,
            sourceTable: '[Orders]'
        }

        expect(convertElementToSourceColumn(basicWorkbook, sourceColumnElement)).toEqual(parsedSourceColumn)
    })
})

describe('translates datasource element into Datasource object', ()=>{
    test('basic datasource', ()=>{ 
        const datasource = basicWorkbook.querySelector('datasource')
        const expectedDatasource = {
            name: 'federated.1uk8ts01uomc1z17rjjdj1xfe1av',
            caption: 'Sample - Superstore',
            isColumnDependencyMapped: false,
            columns: [
            {
                name: '[Calculation_5571209093911105]',
                caption: 'Profit Ratio',
                calculation: 'SUM([Profit])/SUM([Sales])',
                isCalculated: true,
                isParameter: false
            },
            {
                name: '[Profit]',
                caption: 'Profit',
                isCalculated: false,
                isParameter: false,
                sourceTable: '[Orders]'
            },
            {
                name: '[Sales]',
                caption: 'Sales',
                isCalculated: false,
                isParameter: false,
                sourceTable: '[Orders]'
            }
            ]
        }
        expect(convertElementToDatasource(basicWorkbook, datasource)).toEqual(expectedDatasource)
    })
})

describe('maps the field dependencies accurately', ()=>{
    test('basic datasource', ()=>{
        const basicDatasourceElement = basicWorkbook.querySelector('datasource')
        const basicDatasource = convertElementToDatasource(basicWorkbook, basicDatasourceElement)
        const expectedMappedDatasource = {
            name: 'federated.1uk8ts01uomc1z17rjjdj1xfe1av',
            caption: 'Sample - Superstore',
            isColumnDependencyMapped: true,
            columns: [
            {
                name: '[Calculation_5571209093911105]',
                caption: 'Profit Ratio',
                calculation: 'SUM([Profit])/SUM([Sales])',
                isCalculated: true,
                isParameter: false,
                dependsOn: ['[Profit]', '[Sales]'],
                dependencyGeneration: 1
            },
            {
                name: '[Profit]',
                caption: 'Profit',
                isCalculated: false,
                isParameter: false,
                sourceTable: '[Orders]',
                dependsOn: [],
                dependencyGeneration: 0
            },
            {
                name: '[Sales]',
                caption: 'Sales',
                isCalculated: false,
                isParameter: false,
                sourceTable: '[Orders]',
                dependsOn: [],
                dependencyGeneration: 0
            }
            ]
        }
        expect(populateColumnDependencies(basicDatasource)).toEqual(expectedMappedDatasource)
    })
})