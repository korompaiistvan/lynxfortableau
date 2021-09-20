import "./App.module.css";
import * as WorkbookParser from "../parser/TableauWorkbookParser";
import { useState, useEffect } from "react";
import { Datasource } from "../types";

// AJAX

function App() {
  const [datasources, setDatasources] = useState<Array<Datasource>>([]);
  useEffect(() => {
    const request = new XMLHttpRequest();
    request.open("GET", "/Superstore.twb");
    request.send();
    request.onreadystatechange = (e) => {
      const responseXml = request.responseText;
      const datasources =
        WorkbookParser.getDatasourcesFromWorkbook(responseXml);
      setDatasources(datasources);
    };
  }, []);

  return (
    <div>
      <div>
        {datasources.map((d) => (
          <p>{JSON.stringify(d)}</p>
        ))}
      </div>
    </div>
  );
}

export default App;
