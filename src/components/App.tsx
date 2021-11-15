import { useState, useEffect, Fragment } from "react";
import { MappedDatasource } from "../types";
import { fetchSuperstore } from "../utils/fetchSuperstore";
import ColumnNode from "./ColumnNode";
import { useRecoilState, atom } from "recoil";

const datasourcesState = atom({
  key: "datasources",
  default: [] as Array<MappedDatasource>,
});

function App() {
  const [datasources, setDatasources] = useRecoilState(datasourcesState);

  useEffect(() => {
    setDatasources(fetchSuperstore());
  }, []);

  return (
    <svg viewBox="0 0 1500 2000">
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
                  width="1"
                  height="1"
                  style={{ overflow: "visible" }}
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
