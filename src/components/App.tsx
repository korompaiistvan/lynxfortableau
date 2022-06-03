import { Fragment, StrictMode } from "react";
import GraphCanvas from "./GraphCanvas";
import AppBarDrawer from "./AppBarDrawer";

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
