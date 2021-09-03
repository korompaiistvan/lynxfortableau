import "./App.css";
import FieldNode from "./FieldNode";

function App() {
  return (
    <div>
      <FieldNode
        fieldRole="measure"
        fieldName="Sales per Customer"
        usedIn={["not much"]}
        calculated={true}
        syntax={"ugly calculation syntax"}
      />
      <FieldNode
        fieldRole="dimension"
        fieldName="Order ID"
        usedIn={[
          "almost",
          "every single",
          "chart",
          "there is",
          "even those with very long names",
        ]}
        calculated={false}
        sourceTable={"Orders"}
      />
    </div>
  );
}

export default App;
