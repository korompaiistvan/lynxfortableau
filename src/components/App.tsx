import { Fragment, StrictMode } from "react";
import GraphCanvas from "../GraphCanvas/GraphCanvas";
import AppBarDrawer from "./TopDrawer";

function App() {
  return (
    <StrictMode>
      <Fragment>
        <GraphCanvas />
        <AppBarDrawer />
      </Fragment>
    </StrictMode>
  );
}

export default App;
