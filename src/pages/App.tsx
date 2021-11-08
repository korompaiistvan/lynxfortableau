import "./App.module.css";
import { useState, useEffect, Fragment } from "react";
import { MappedDatasource } from "../types";
import { fetchSuperstore } from "../utils/fetchSuperstore";
import ColumnNode from "../components/ColumnNode";

function App() {
  const [datasources, setDatasources] = useState<Array<MappedDatasource>>([]);

  useEffect(() => {
    setDatasources(fetchSuperstore());
  }, []);

  return (
    <svg viewBox="0 0 2000 2000">
      <g fill="white" stroke="green" strokeWidth="5">
        <circle cx="40" cy="40" r="25" />
        <circle cx="60" cy="60" r="25" />
      </g>
      {datasources.map((datasource, idx) => {
        return (
          <g
            key={datasource.name}
            className="boardColumn"
            transform={`translate(${idx * 320}, 0)`}
            width="320"
          >
            {datasource.columns.map((col, idx) => {
              return (
                <foreignObject
                  key={col.name}
                  y={`${idx * 200}`}
                  x="0"
                  width="320"
                  height="300"
                >
                  <ColumnNode {...col} />
                </foreignObject>
              );
            })}
          </g>
        );
      })}
    </svg>
  );
}

export default App;
