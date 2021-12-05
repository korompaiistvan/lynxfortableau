import {
  heightSelector,
  widthSelector,
  xPositionSelector,
  yPositionSelector,
  highlightedNodeIdState,
} from "../utils/state";
import { Column } from "../types";
import { useRecoilValue } from "recoil";

interface Props {
  start: Column["name"];
  end: Column["name"];
}
function NodeLink(props: Props) {
  const startNodeXPosition = useRecoilValue(xPositionSelector(props.start));
  const endNodeXPosition = useRecoilValue(xPositionSelector(props.end));
  const startNodeYPosition = useRecoilValue(yPositionSelector(props.start));
  const endNodeYPosition = useRecoilValue(yPositionSelector(props.end));
  const startNodeWidth = useRecoilValue(widthSelector(props.start));
  const startNodeHeight = useRecoilValue(heightSelector(props.start));
  const endNodeHeight = useRecoilValue(heightSelector(props.end));

  const highlightedNodeId = useRecoilValue(highlightedNodeIdState);

  const linkStartX = startNodeXPosition + startNodeWidth;
  const linkStartY = startNodeYPosition + startNodeHeight / 2;
  const linkEndX = endNodeXPosition;
  const linkEndY = endNodeYPosition + endNodeHeight / 2;

  const xGap = linkEndX - linkStartX;
  const ctrlPtXOffset = 0.66 * xGap;
  const ctrlPt1X = linkStartX + ctrlPtXOffset;
  const ctrlPt2X = linkEndX - ctrlPtXOffset;

  let pathStr = `M ${linkStartX} ${linkStartY}`;
  pathStr += " ";
  pathStr += `C ${ctrlPt1X} ${linkStartY}, ${ctrlPt2X} ${linkEndY}, ${linkEndX} ${linkEndY}`;

  const isHighlighted =
    highlightedNodeId && [props.start, props.end].includes(highlightedNodeId);
  const strokeColor = isHighlighted ? "black" : "#d1d1d1";
  const strokeWidth = isHighlighted ? "3" : "2";
  return (
    <path
      d={pathStr}
      stroke={strokeColor}
      fill="transparent"
      strokeWidth={strokeWidth}
    />
  );
}
export default NodeLink;
