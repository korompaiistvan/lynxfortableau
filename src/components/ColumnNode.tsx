import {
  Card,
  CardContent,
  Collapse,
  Typography,
  CardHeader,
  IconButton,
} from "@material-ui/core";
import { ExpandMore } from "@material-ui/icons";
import { useState } from "react";

import type { Column } from "../types";

function ColumnNode(props: Column) {
  const [expanded, setExpanded] = useState(false);

  function changeExpanded(event: any) {
    setExpanded((e) => !e);
  }

  return (
    <Card
      className="node-component"
      onClick={changeExpanded}
      style={{
        maxWidth: expanded ? "400px" : "260px",
        transition: "max-width 0.5s",
      }}
    >
      <CardHeader
        title={<Typography>{props.caption}</Typography>}
        action={
          <IconButton>
            <ExpandMore
              style={{
                transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.5s",
              }}
            />
          </IconButton>
        }
      />
      <Collapse in={expanded}>
        <CardContent>
          {/* {props.calculated ? props.syntax : props.sourceTable} */}
          {props.isCalculated && (
            <Typography style={{ fontFamily: "JetBrains Mono" }}>
              <b>Calculation</b> {props.calculation}
            </Typography>
          )}
          {!props.isCalculated && !props.isParameter && (
            <Typography paragraph>
              <b>Source table:</b> {props.sourceTable}
            </Typography>
          )}
          {props.isParameter && (
            <Typography paragraph>
              <b>Parameter</b>
            </Typography>
          )}
        </CardContent>
        <CardContent>
          <h4>Raw form</h4>
          <code>
            <pre>{JSON.stringify(props, null, "\t")}</pre>
          </code>
        </CardContent>
      </Collapse>
    </Card>
  );
}

export default ColumnNode;
