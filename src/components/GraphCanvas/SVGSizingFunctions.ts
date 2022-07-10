import { Dispatch, RefObject, SetStateAction } from "react";
import { ViewBox } from "src/types";

export const fitToWidth =
  (
    SVGRef: RefObject<SVGSVGElement>,
    setViewBox: Dispatch<SetStateAction<ViewBox>>,
    margin: number,
    nodeWidth: number
  ) =>
  () => {
    if (!SVGRef.current) return;
    const SVGBoundingBox = SVGRef.current.getBoundingClientRect();
    const bbox = SVGRef.current.getBBox();
    const SVGAspectRatio = SVGBoundingBox.width / SVGBoundingBox.height;
    const viewBoxWidth = bbox.width + nodeWidth / 2;
    const viewBoxHeight = (viewBoxWidth + 2 * margin) / SVGAspectRatio;

    setViewBox([
      bbox.x - margin,
      bbox.y - margin,
      bbox.x + viewBoxWidth + margin,
      bbox.y + viewBoxHeight + margin,
    ]);
  };

export const fitToSize =
  (
    SVGRef: RefObject<SVGSVGElement>,
    setViewBox: Dispatch<SetStateAction<ViewBox>>,
    margin: number,
    nodeWidth: number,
    nodeHeight: number
  ) =>
  () => {
    if (!SVGRef.current) return;
    const bbox = SVGRef.current.getBBox();
    setViewBox([
      bbox.x - margin,
      bbox.y - margin,
      bbox.x + bbox.width + margin + nodeWidth / 2,
      bbox.y + bbox.height + margin + nodeHeight / 2,
    ]);
  };
