import "./App.module.css";
import { useState, useEffect } from "react";
import { MappedDatasource } from "../types";
import { fetchSuperstore } from "../utils/fetchSuperstore";

function App() {
  const [datasources, setDatasources] = useState<Array<MappedDatasource>>([]);
  useEffect(() => {
    setDatasources(fetchSuperstore());
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
