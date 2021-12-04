import {
  Card,
  CardContent,
  Collapse,
  Typography,
  CardHeader,
  IconButton,
} from "@material-ui/core";
import { ExpandMore } from "@material-ui/icons";
import { useState, useEffect, useRef } from "react";
import { useRecoilValue, useSetRecoilState, useRecoilState } from "recoil";

import {
  Column,
  isCalculatedColumn,
  isParameterColumn,
  isSourceColumn,
} from "../types";
import {
  closedHeightState,
  closedWidthState,
  isClosedSelector,
  nodesStateFamily,
  openHeightSelector,
  openWidthState,
  xPositionSelector,
  yPositionSelector,
} from "../utils/state";

interface Props {
  nodeId: Column["name"];
}
function ColumnNode(props: Props) {
  const nodeState = useRecoilValue(nodesStateFamily(props.nodeId));
  const setOpenHeight = useSetRecoilState(openHeightSelector(props.nodeId));
  const openWidth = useRecoilValue(openWidthState);
  const closedWidth = useRecoilValue(closedWidthState);
  const closedHeight = useRecoilValue(closedHeightState);
  const xPosition = useRecoilValue(xPositionSelector(props.nodeId));
  const yPosition = useRecoilValue(yPositionSelector(props.nodeId));
  const [isClosed, setIsClosed] = useRecoilState(
    isClosedSelector(props.nodeId)
  );
  const selfRef = useRef<HTMLElement>(null);

  function changeExpanded(event: any) {
    setIsClosed(!isClosed);
  }

  function updateOpenHeight() {
    if (!selfRef.current) return;
    if (isClosed) return;
    setOpenHeight(selfRef.current.offsetHeight);
  }

  return (
    <foreignObject
      x={xPosition}
      y={yPosition}
      width="1"
      height="1"
      style={{ overflow: "visible", transition: "y 0.5s, x 0.5s" }}
    >
      <Card
        className="node-component"
        onClick={changeExpanded}
        style={{
          width: isClosed ? `${closedWidth}px` : `${openWidth}px`,
          transition: "max-width 0.5s",
          minHeight: `${closedHeight}px`,
        }}
        ref={selfRef}
      >
        <CardHeader
          title={<Typography>{nodeState.data!.caption}</Typography>}
          action={
            <IconButton>
              <ExpandMore
                style={{
                  transform: !isClosed ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.5s",
                }}
              />
            </IconButton>
          }
        />
        <Collapse in={!isClosed} onEntered={updateOpenHeight}>
          <CardContent>
            {/* {props.calculated ? props.syntax : props.sourceTable} */}
            {isCalculatedColumn(nodeState.data!) && (
              <Typography style={{ fontFamily: "JetBrains Mono" }}>
                <b>Calculation</b> {nodeState.data.calculation}
              </Typography>
            )}
            {isSourceColumn(nodeState.data!) && (
              <Typography paragraph>
                <b>Source table:</b> {nodeState.data.sourceTable}
              </Typography>
            )}
            {isParameterColumn(nodeState.data!) && (
              <Typography paragraph>
                <b>Parameter</b>
              </Typography>
            )}
          </CardContent>
        </Collapse>
      </Card>
    </foreignObject>
  );
}

export default ColumnNode;
