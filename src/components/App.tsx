import { Fragment } from "react";
import ColumnNode from "./ColumnNode";
import { useRecoilValue } from "recoil";

import { linksState, nodesStaticState } from "../utils/state";
import NodeLink from "./NodeLink";
import AppBarDrawer from "./AppBarDrawer";

function App() {
  const links = useRecoilValue(linksState);
  // const [isInitialized, setIsInitialized] = useState(false);
  // const [nodes, setNodes] = useRecoilState(nodesStateFamily);
  const nodes = useRecoilValue(nodesStaticState);
  return (
    <Fragment>
      <svg
        viewBox="0 0 4000 2000"
        width="4000px"
        height="2000px"
        style={{ position: "absolute", top: "64px" }}
      >
        {links.map((link, idx) => {
          return <NodeLink start={link[0]} end={link[1]} key={`link${idx}`} />;
        })}
        {nodes?.map((col, idx) => {
          return <ColumnNode {...col} key={col.name} />;
        })}
      </svg>
      <AppBarDrawer />
    </Fragment>
  );
}

export default App;
