import { linkDisplayState } from "../state";
import { useRecoilValue } from "recoil";
import { memo } from "react";

interface Props {
  id: string;
}
function NodeLink(props: Props) {
  const {
    startNodeXPosition,
    endNodeXPosition,
    startNodeYPosition,
    endNodeYPosition,
    startNodeWidth,
    startNodeHeight,
    endNodeHeight,
    isHighlighted,
  } = useRecoilValue(linkDisplayState(props.id));

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

  const strokeColor = isHighlighted ? "black" : "#d1d1d1";
  const strokeWidth = isHighlighted ? "3" : "2";
  return (
    <path
      d={pathStr}
      stroke={strokeColor}
      fill="transparent"
      strokeWidth={strokeWidth}
      style={{ transition: "stroke 0.1s ease-in-out" }}
    />
  );
}
export default memo(NodeLink);
