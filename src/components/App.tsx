import { Fragment, useEffect } from "react";
import ColumnNode from "./ColumnNode";
import { useSetRecoilState, useRecoilValue } from "recoil";

import { linksState, workbookStringState, nodesStaticState } from "../utils/state";
import NodeLink from "./NodeLink";
import { AppBar, Toolbar, Typography, Button, Box } from "@material-ui/core";

function App() {
  const setWorkbookString = useSetRecoilState(workbookStringState);
  const links = useRecoilValue(linksState);
  // const [isInitialized, setIsInitialized] = useState(false);
  // const [nodes, setNodes] = useRecoilState(nodesStateFamily);
  const nodes = useRecoilValue(nodesStaticState);

  function handleWorkbookChange(event: React.ChangeEvent<HTMLInputElement>) {
    event.target.files![0].text().then((workbookString) => {
      setWorkbookString(workbookString);
    });
  }

  // adding a comment here to trigger a deploy
  return (
    <Fragment>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div">
            Lynx for Tableau
          </Typography>
          <Box>
            <input
              accept=".twb"
              hidden
              id="raised-button-file"
              multiple={false}
              type="file"
              onChange={handleWorkbookChange}
            />
            <label htmlFor="raised-button-file">
              <Button variant="contained" size="small" component="span">
                Upload
              </Button>
            </label>
          </Box>
        </Toolbar>
      </AppBar>
      <svg viewBox="0 0 4000 2000" width="4000px" height="2000px">
        {links.map((link, idx) => {
          return <NodeLink start={link[0]} end={link[1]} key={`link${idx}`} />;
        })}
        {nodes?.map((col, idx) => {
          return <ColumnNode {...col} key={col.name} />;
        })}
      </svg>
    </Fragment>
  );
}

export default App;
