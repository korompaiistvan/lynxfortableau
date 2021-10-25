import "./App.module.css";
import * as WorkbookParser from "../parser/TableauWorkbookParser";
import { useState, useEffect } from "react";
import { MappedDatasource } from "../types";

function App() {
  const [datasources, setDatasources] = useState<Array<MappedDatasource>>([]);
  useEffect(() => {
    console.log("useEffect runs");
    const request = new XMLHttpRequest();
    request.open("GET", "/Superstore.twb");
    request.send();
    request.onreadystatechange = (e) => {
      if (request.readyState !== 4 || request.status !== 200) {
        return;
      }
      console.log("parsers run");
      const responseXml = request.responseText;
      const datasources =
        WorkbookParser.getDatasourcesFromWorkbook(responseXml);
      setDatasources(
        datasources.map((ds) => {
          console.log("parser running for", ds);
          return WorkbookParser.populateColumnDependencies(ds);
        })
      );
    };
  }, []);

  return (
    <div>
      <div>
        {datasources.map((d) => (
          <code key={d.name}>
            <pre>{JSON.stringify(d, null, "\t")}</pre>
          </code>
        ))}
      </div>
    </div>
  );
}

export default App;
