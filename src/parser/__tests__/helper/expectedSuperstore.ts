import type { RawDatasource } from "src/types";

export const expectedDatasources: RawDatasource[] = [
  {
    name: "Parameters",
    caption: "Parameters",
    isColumnDependencyMapped: false,
    columns: [
      {
        name: "[Base Salary]",
        caption: "Base Salary",
        type: "parameter",
      },
      {
        name: "[Commission Rate]",
        caption: "Commission Rate",
        type: "parameter",
      },
      { name: "[New Quota]", caption: "New Quota", type: "parameter" },
      { name: "[Parameter 1 1]", caption: "Sort by", type: "parameter" },
      {
        name: "[Parameter 1]",
        caption: "New Business Growth",
        type: "parameter",
      },
      { name: "[Parameter 2]", caption: "Churn Rate", type: "parameter" },
    ],
  },
  {
    name: "federated.0hgpf0j1fdpvv316shikk0mmdlec",
    caption: "Sales Target (US)",
    isColumnDependencyMapped: false,
    columns: [
      {
        caption: "Category",
        name: "[Category]",
        sourceTable: "[Sheet1]",
        type: "source",
      },
      {
        caption: "Order Date",
        name: "[Order Date]",
        sourceTable: "[Sheet1]",
        type: "source",
      },
      {
        caption: "Segment",
        name: "[Segment]",
        sourceTable: "[Sheet1]",
        type: "source",
      },
      {
        caption: "Sales Target",
        name: "[Sales Target]",
        sourceTable: "[Sheet1]",
        type: "source",
      },
    ],
  },
  {
    name: "federated.0a01cod1oxl83l1f5yves1cfciqo",
    caption: "Sales Commission",
    isColumnDependencyMapped: false,
    columns: [
      {
        name: "[Achievement (copy)]",
        caption: "Achievement (estimated)",
        type: "calculated",
        rawFormula: "[Sales]",
      },
      {
        name: "[Achievement (variable) (copy)]",
        caption: "Achieved Quota",
        type: "calculated",
        rawFormula:
          'if SUM([Achievement (copy)]) >= [Parameters].[New Quota] then "100% +"\r\n' +
          'elseif SUM([Achievement (copy)]) >= 0.75 * [Parameters].[New Quota] then "75-100%"\r\n' +
          'elseif SUM([Achievement (copy)]) >= 0.5 * [Parameters].[New Quota] then "50-75%"\r\n' +
          'else "Below 50%" end',
      },
      {
        name: "[Base (Variable)]",
        caption: "Base (Variable)",
        type: "calculated",
        rawFormula: "[Parameters].[Base Salary]",
      },
      {
        name: "[Calculation_0440925131659539]",
        caption: "% of quota achieved",
        type: "calculated",
        rawFormula: "AVG([Achievement (copy)])/[Parameters].[New Quota]",
      },
      {
        name: "[Calculation_4120925132203686]",
        caption: "Rank over 3",
        type: "calculated",
        rawFormula: "ROUND(INDEX() / 3 - 0.6,0) + 1",
      },
      {
        name: "[Calculation_8140925133029303]",
        caption: "Sort by field",
        type: "calculated",
        rawFormula:
          'if [Parameters].[Parameter 1 1]="Names" then 0\r\n' +
          'elseif [Parameters].[Parameter 1 1]="% quota descending" then -[Calculation_0440925131659539]\r\n' +
          "else [Calculation_0440925131659539] end",
      },
      {
        name: "[Commission (Variable)]",
        caption: "Commission (Variable)",
        type: "calculated",
        rawFormula: "([Parameters].[Commission Rate]*[Sales])/100",
      },
      {
        name: "[Estimate Compensation label]",
        caption: "Estimate Compensation label",
        type: "calculated",
        rawFormula: '"Estimated Compensation:"',
      },
      {
        name: "[OTE (Variable)]",
        caption: "OTE (Variable)",
        type: "calculated",
        rawFormula:
          "[Parameters].[Base Salary] + ([Parameters].[Commission Rate]*[Parameters].[New Quota])/100",
      },
      {
        name: "[Total Compensation]",
        caption: "Total Compensation",
        type: "calculated",
        rawFormula: "MIN([Base (Variable)]) + SUM([Commission (Variable)])",
      },
      {
        name: "[Total Sales label]",
        caption: "Total Sales label",
        type: "calculated",
        rawFormula: '"Total Sales:"',
      },
      {
        name: "[Sales]",
        caption: "Sales",
        type: "source",
        sourceTable: "[Sales Commission.csv]",
      },
      {
        caption: "Order Date",
        name: "[Order Date]",
        sourceTable: "[Sales Commission.csv]",
        type: "source",
      },
      {
        caption: "Region",
        name: "[Region]",
        sourceTable: "[Sales Commission.csv]",
        type: "source",
      },
      {
        caption: "Sales Person",
        name: "[Sales Person]",
        sourceTable: "[Sales Commission.csv]",
        type: "source",
      },
    ],
  },
  {
    name: "federated.10nnk8d1vgmw8q17yu76u06pnbcj",
    caption: "Sample - Superstore",
    isColumnDependencyMapped: false,
    columns: [
      {
        name: "[Calculation_0831103151444568]",
        caption: "Days to Ship Actual",
        type: "calculated",
        rawFormula: "DATEDIFF('day',[Order Date],[Ship Date])",
      },
      {
        name: "[Calculation_5421109230915137]",
        caption: "Sales Forecast",
        type: "calculated",
        rawFormula: "[Sales]*(1-[Parameters].[Parameter 2])*(1+[Parameters].[Parameter 1])",
      },
      {
        name: "[Calculation_6401103171259723]",
        caption: "Ship Status",
        type: "calculated",
        rawFormula:
          'if [Calculation_0831103151444568]> [Calculation_6861103170623145] then "Shipped Late" \r\n' +
          'elseIF [Calculation_0831103151444568]= [Calculation_6861103170623145] then "Shipped On Time"\r\n' +
          'Else "Shipped Early" end',
      },
      {
        name: "[Calculation_6861103170623145]",
        caption: "Days to Ship Scheduled",
        type: "calculated",
        rawFormula:
          "CASE  [Ship Mode]\r\n" +
          'WHEN "Same Day" THEN 0\r\n' +
          'WHEN "First Class" THEN 1\r\n' +
          'WHEN "Second Class" THEN 3\r\n' +
          'WHEN "Standard Class" THEN 6\r\n' +
          "END",
      },
      {
        name: "[Calculation_9060122104947471]",
        caption: "Order Profitable?",
        type: "calculated",
        rawFormula:
          "{fixed [Order ID]:sum([Profit])}>0\r\n" + "// calculates the profit at the order level",
      },
      {
        name: "[Calculation_9321103144526191]",
        caption: "Sales per Customer",
        type: "calculated",
        rawFormula: "Sum([Sales])/countD([Customer Name])",
      },
      {
        name: "[Calculation_9921103144103743]",
        caption: "Profit Ratio",
        type: "calculated",
        rawFormula: "sum([Profit])/sum([Sales])",
      },
      {
        name: "[Calculation_9951107165644870]",
        caption: "Sales above Target?",
        type: "calculated",
        rawFormula:
          'If Sum([Sales])>SUM([federated.0hgpf0j1fdpvv316shikk0mmdlec].[Sales Target]) then "Above Target" else "Below Target" end',
      },
      {
        name: "[Sales est (copy)]",
        caption: "Units estimate",
        type: "calculated",
        rawFormula:
          "ROUND([Quantity]*(1-[Parameters].[Parameter 2])*(1+[Parameters].[Parameter 1]),0)",
      },
      {
        name: "[Sales per Customer (copy)]",
        caption: "Profit per Order",
        type: "calculated",
        rawFormula: "Sum([Profit])/countD([Order ID])",
      },
      {
        name: "[Category]",
        caption: "Category",
        type: "source",
        sourceTable: "[Orders]",
      },
      {
        name: "[City]",
        caption: "City",
        type: "source",
        sourceTable: "[Orders]",
      },
      {
        name: "[Country/Region]",
        caption: "Country/Region",
        type: "source",
        sourceTable: "[Orders]",
      },
      {
        name: "[Customer Name]",
        caption: "Customer Name",
        type: "source",
        sourceTable: "[Orders]",
      },
      {
        name: "[Discount]",
        caption: "Discount",
        type: "source",
        sourceTable: "[Orders]",
      },
      {
        name: "[Order Date]",
        caption: "Order Date",
        type: "source",
        sourceTable: "[Orders]",
      },
      {
        name: "[Order ID (Returns)]",
        caption: "Order ID (Returns)",
        type: "source",
        sourceTable: "[Returns]",
      },
      {
        name: "[Order ID]",
        caption: "Order ID",
        type: "source",
        sourceTable: "[Orders]",
      },
      {
        name: "[Postal Code]",
        caption: "Postal Code",
        type: "source",
        sourceTable: "[Orders]",
      },
      {
        name: "[Product Name]",
        caption: "Product Name",
        type: "source",
        sourceTable: "[Orders]",
      },
      {
        name: "[Profit]",
        caption: "Profit",
        type: "source",
        sourceTable: "[Orders]",
      },
      {
        name: "[Region (People)]",
        caption: "Region (People)",
        type: "source",
        sourceTable: "[People]",
      },
      {
        name: "[Region]",
        caption: "Region",
        type: "source",
        sourceTable: "[Orders]",
      },
      {
        name: "[Row ID]",
        caption: "Row ID",
        type: "source",
        sourceTable: "[Orders]",
      },
      {
        name: "[Sales]",
        caption: "Sales",
        type: "source",
        sourceTable: "[Orders]",
      },
      {
        name: "[Segment]",
        caption: "Segment",
        type: "source",
        sourceTable: "[Orders]",
      },
      {
        name: "[Ship Mode]",
        caption: "Ship Mode",
        type: "source",
        sourceTable: "[Orders]",
      },
      {
        name: "[State]",
        caption: "State",
        type: "source",
        sourceTable: "[Orders]",
      },
      {
        name: "[Sub-Category]",
        caption: "Sub-Category",
        type: "source",
        sourceTable: "[Orders]",
      },
      {
        caption: "Ship Date",
        name: "[Ship Date]",
        sourceTable: "[Orders]",
        type: "source",
      },
      {
        caption: "Customer ID",
        name: "[Customer ID]",
        sourceTable: "[Orders]",
        type: "source",
      },
      {
        caption: "Product ID",
        name: "[Product ID]",
        sourceTable: "[Orders]",
        type: "source",
      },
      {
        caption: "Quantity",
        name: "[Quantity]",
        sourceTable: "[Orders]",
        type: "source",
      },
      {
        caption: "Regional Manager",
        name: "[Regional Manager]",
        sourceTable: "[People]",
        type: "source",
      },
      {
        caption: "Returned",
        name: "[Returned]",
        sourceTable: "[Returns]",
        type: "source",
      },
    ],
  },
];
