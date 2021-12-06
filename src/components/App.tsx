import { useState, useEffect, Fragment } from "react";
import { MappedDatasource } from "../types";
import { fetchSuperstore } from "../utils/fetchSuperstore";
import ColumnNode from "./ColumnNode";
import {
  useRecoilState,
  atom,
  useSetRecoilState,
  useRecoilValue,
  useRecoilCallback,
} from "recoil";
import {
  nodesStateFamily,
  linksState,
  nodeIdsState,
  NodeState,
  // nodesSelectorFamily
} from "../utils/state";
import type { link } from "../utils/state";
import NodeLink from "./NodeLink";

function initializeApp() {
  const datasources = fetchSuperstore();
  const superstoreDs = datasources[2];
}

function App() {
  const [links, setLinks] = useRecoilState(linksState);
  const [isInitialized, setIsInitialized] = useState(false);
  // const [nodes, setNodes] = useRecoilState(nodesStateFamily);
  const nodeIds = useRecoilValue(nodeIdsState);
  const createNode = useRecoilCallback(
    ({ set }) =>
      (nodeId: string, nodeState) => {
        set(nodeIdsState, (currVal) => [...currVal, nodeId as string]);
        set(nodesStateFamily(nodeId), nodeState as NodeState);
      },
    []
  );

  useEffect(() => {
    if (isInitialized) {
      return;
    }
    const datasources = fetchSuperstore();
    const superstoreDs = datasources[2];
    let links: link[] = [];
    superstoreDs.columns.forEach((col, idx) => {
      createNode(col.name, {
        colIdx: col.dependencyGeneration,
        isClosed: true,
        openHeight: 50,
        yIdx: idx,
        data: col,
      });

      if (col.isCalculated) {
        const newLinks = col.dependsOn.map((d) => [d, col.name] as link);
        links = links.concat(newLinks);
      }
    });
    setLinks(links);
    setIsInitialized(true);
  }, []);

  return (
    <svg viewBox="0 0 1900 2000" width="1900px" height="2000px">
      {links.map((link) => {
        return <NodeLink start={link[0]} end={link[1]} />;
      })}
      {nodeIds.map((nodeId, idx) => {
        return <ColumnNode nodeId={nodeId} key={nodeId} />;
      })}
    </svg>
  );
}

export default App;
