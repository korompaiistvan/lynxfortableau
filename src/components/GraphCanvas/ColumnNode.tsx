// external
import { ExpandMore } from "@mui/icons-material";
import { Card, CardContent, CardHeader, Collapse, IconButton, Typography } from "@mui/material";
import { Fragment, useRef } from "react";

// state
import { useRecoilState, useRecoilValue, useResetRecoilState, useSetRecoilState } from "recoil";
import {
  closedHeightState,
  highlightedNodeIdState,
  isClosedSelector,
  nodeWidthSelector,
  openHeightSelector,
  xPositionSelector,
  yPositionSelector
} from "src/state";

// types
import { MappedColumn } from "src/types";

function ColumnNode(props: MappedColumn) {
  const nodeId = props.qualifiedName;
  const closedHeight = useRecoilValue(closedHeightState);
  const width = useRecoilValue(nodeWidthSelector(nodeId));
  const xPosition = useRecoilValue(xPositionSelector(nodeId));
  const yPosition = useRecoilValue(yPositionSelector(nodeId));

  const [isClosed, setIsClosed] = useRecoilState(isClosedSelector(nodeId));

  const setOpenHeight = useSetRecoilState(openHeightSelector(nodeId));
  const setHighlightedNodeId = useSetRecoilState(highlightedNodeIdState);
  const resetHighlightedNodeId = useResetRecoilState(highlightedNodeIdState);

  const selfRef = useRef<HTMLDivElement>(null);

  function changeExpanded(event: any) {
    setIsClosed(!isClosed);
  }

  function updateOpenHeight() {
    if (!selfRef.current) return;
    if (isClosed) return;
    setOpenHeight(selfRef.current.offsetHeight);
  }

  const cardDetails = () => {
    switch (props.type) {
      case "calculated":
        return (
          <Fragment>
            <Typography style={{ fontFamily: "JetBrains Mono" }}>
              <b>Calculation</b>
            </Typography>
            <pre style={{ fontSize: "9pt", overflowX: "auto" }}>
              <code>{props.readableFormula}</code>
            </pre>
          </Fragment>
        );
      case "source":
        return (
          <Typography paragraph>
            <b>Source table:</b> {props.sourceTable}
          </Typography>
        );
      case "parameter":
        <Typography paragraph>
          <b>Parameter</b>
        </Typography>;
    }
  };

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
        onMouseEnter={() => setHighlightedNodeId(nodeId)}
        onMouseLeave={() => resetHighlightedNodeId()}
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
          <CardContent>{cardDetails()}</CardContent>
        </Collapse>
      </Card>
    </foreignObject>
  );
}

export default ColumnNode;
