import { StrictMode } from "react";
import { RecoilRoot } from "recoil";

import dynamic from "next/dynamic";
const GraphCanvas = dynamic(() => import("src/components/GraphCanvas"), { ssr: false });
const TopDrawer = dynamic(() => import("src/components/TopDrawer"), { ssr: false });

function Main() {
  return (
    <RecoilRoot>
      <StrictMode>
        <GraphCanvas />
        <TopDrawer />
      </StrictMode>
    </RecoilRoot>
  );
}

export default Main;
