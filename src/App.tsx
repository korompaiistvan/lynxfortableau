import "./App.css";
import ColumnNode from "./components/ColumnNode";
import { CalculatedColumn, SourceColumn } from "./types";

function App() {
  const testColumns: Array<CalculatedColumn | SourceColumn> = [
    {
      name: "Sales per Customer",
      role: "measure",
      type: "quantitative",
      dataType: "string",

      isCalculated: true,
      isParameter: false,

      usedIn: [{ worksheet: "not much", asFilter: false }],
      calculation: "ugly calculation syntax",
      dependsOn: ["Sales", "Customer Name"],
    },
    {
      name: "Order ID",
      role: "dimension",
      type: "nominal",
      dataType: "string",
      isCalculated: false,
      isParameter: false,
      sourceTable: "Orders",
      usedIn: [
        { worksheet: "almost", asFilter: false },
        { worksheet: "every single", asFilter: false },
        { worksheet: "chart", asFilter: false },
        { worksheet: "there is", asFilter: false },
        { worksheet: "even those with very long names", asFilter: false },
      ],
    },
  ];
  return (
    <div>
      {testColumns.map((tc) => {
        return <ColumnNode {...tc} />;
      })}
    </div>
  );
}

export default App;
