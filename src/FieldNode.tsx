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
import FieldRoleIndicator from "./FieldRoleIndicator";

import type { FieldRole } from "./types";

interface FieldInfo {
  fieldRole: FieldRole;
  fieldName: string;
  usedIn: string[];
  calculated: boolean;
}

interface CalcProps extends FieldInfo {
  calculated: true;
  syntax: string;
}

interface SourceFieldProps extends FieldInfo {
  calculated: false;
  sourceTable: string;
}

function FieldNode<T extends CalcProps | SourceFieldProps>(props: T) {
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
        avatar={<FieldRoleIndicator fieldRole={props.fieldRole} />}
        title={<Typography>{props.fieldName}</Typography>}
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
          {props.calculated && (
            <Typography style={{ fontFamily: "JetBrains Mono" }}>
              {props.syntax}
            </Typography>
          )}
          {!props.calculated && (
            <Typography paragraph>
              <b>Source table:</b> {props.sourceTable}
            </Typography>
          )}
        </CardContent>

        <CardContent>
          {props.usedIn.map((chartName) => {
            return <Chip label={chartName} size="small" />;
          })}
        </CardContent>
      </Collapse>
    </Card>
  );
}

export default FieldNode;
