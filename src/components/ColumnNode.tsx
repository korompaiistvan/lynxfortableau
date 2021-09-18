import {
  Card,
  CardContent,
  Collapse,
  Typography,
  CardHeader,
  IconButton,
  Chip,
} from "@material-ui/core";
import { ExpandMore } from "@material-ui/icons";
import { useState } from "react";
import ColumnRoleIndicator from "./ColumnRoleIndicator";

import type { CalculatedColumn, SourceColumn } from "../types";

function ColumnNode<T extends CalculatedColumn | SourceColumn>(props: T) {
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
        avatar={<ColumnRoleIndicator columnRole={props.role} />}
        title={<Typography>{props.name}</Typography>}
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
              {props.calculation}
            </Typography>
          )}
          {!props.isCalculated && (
            <Typography paragraph>
              <b>Source table:</b> {props.sourceTable}
            </Typography>
          )}
        </CardContent>

        <CardContent>
          {props.usedIn?.map((dep) => {
            return <Chip label={dep.worksheet} size="small" />;
          })}
        </CardContent>
      </Collapse>
    </Card>
  );
}

export default ColumnNode;
