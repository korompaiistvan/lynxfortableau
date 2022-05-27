import { Card, CardContent, Collapse, Typography, CardHeader, IconButton } from "@mui/material";
import { ExpandMore } from "@mui/icons-material";
import { useState, useEffect, useRef } from "react";
import { useRecoilValue, useSetRecoilState, useRecoilState } from "recoil";

import {
  Column,
  isCalculatedColumn,
  isParameterColumn,
  isSourceColumn,
  MappedColumn,
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
  widthSelector,
  highlightedNodeIdState,
} from "../utils/state";

function ColumnNode(props: MappedColumn) {
  const nodeId = props.name;
  const setOpenHeight = useSetRecoilState(openHeightSelector(nodeId));
  const closedHeight = useRecoilValue(closedHeightState);
  const width = useRecoilValue(widthSelector(nodeId));
  const xPosition = useRecoilValue(xPositionSelector(nodeId));
  const yPosition = useRecoilValue(yPositionSelector(nodeId));
  const [highlightedNodeId, setHighlightedNodeId] = useRecoilState(highlightedNodeIdState);
  const [isClosed, setIsClosed] = useRecoilState(isClosedSelector(nodeId));
  const selfRef = useRef<HTMLDivElement>(null);

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
          width,
          transition: "width 0.5s",
          minHeight: `${closedHeight}px`,
        }}
        ref={selfRef}
        onMouseEnter={() => setHighlightedNodeId(props.name)}
        onMouseLeave={() => setHighlightedNodeId(undefined)}
      >
        <CardHeader
          title={<Typography>{props.caption}</Typography>}
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
            {isCalculatedColumn(props) && (
              <pre style={{ fontSize: "9pt" }}>
                <Typography style={{ fontFamily: "JetBrains Mono" }}>
                  <b>Calculation</b>
                </Typography>
                <code>{props.calculation}</code>
              </pre>
            )}
            {isSourceColumn(props) && (
              <Typography paragraph>
                <b>Source table:</b> {props.sourceTable}
              </Typography>
            )}
            {isParameterColumn(props) && (
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
