import { RecoilRoot } from "recoil";
// disable SSR on the top level
import dynamic from "next/dynamic";
const App = dynamic(() => import("../components/App"), { ssr: false });

function Main() {
  return (
    <RecoilRoot>
      <App />
    </RecoilRoot>
  );
}

export default Main;
