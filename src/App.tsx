import "./App.css";
import * as WorkbookParser from "./parser/TableauWorkbookParser";
import * as fs from "fs";

const superstoreWorkBook = fs.readFileSync("./parser/Superstore.twb");
console.log(superstoreWorkBook);

function App() {
  WorkbookParser.getDatasourcesFromWorkbook("szar");
  return <div></div>;
}

export default App;
