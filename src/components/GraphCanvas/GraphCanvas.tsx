import { WheelEvent, useState, useRef, useEffect, MouseEventHandler, useMemo } from "react";
import ColumnNode from "./ColumnNode";
import { useRecoilValue } from "recoil";

import { filteredLinksState, filteredNodesState, linksState, nodesStaticState } from "src/state";
import NodeLink from "./NodeLink";
import { handleZoom, startPan, endPan, handlePan } from "./navigationEventHandlers";

import type { ViewBox } from "src/types";

function GraphCanvas() {
  const links = useRecoilValue(filteredLinksState);
  const nodes = useRecoilValue(filteredNodesState);

  const SVGRef = useRef<SVGSVGElement>(null);
  const [SVGBoundingBox, setSVGBoundingBox] = useState<DOMRect>();
  const [viewBox, setViewBox] = useState<ViewBox>([0, 0, 4000, 2000]);
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [pointerOrigin, setPointerOrigin] = useState<DOMPoint>();

  // holds the timer for setTimeout and clearInterval
  let movement_timer: NodeJS.Timeout | undefined = undefined;
  const RESET_TIMEOUT = 100;
  function storeDimensions() {
    if (!SVGRef.current) return;
    setSVGBoundingBox(SVGRef.current.getBoundingClientRect());
  }

  useEffect(() => {
    storeDimensions();
  }, []);

  window.addEventListener("resize", () => {
    clearInterval(movement_timer);
    movement_timer = setTimeout(storeDimensions, RESET_TIMEOUT);
  });

  const nodeChildren = useMemo(() => {
    return nodes?.map((col, idx) => {
      return <ColumnNode {...col} key={col.qualifiedName} />;
    });
  }, [nodes]);

  const linkChildren = useMemo(() => {
    return links.map((link, idx) => {
      return <NodeLink id={link.id} key={link.id} />;
    });
  }, [links]);

  return (
    <svg
      viewBox={viewBox.join(" ")}
      width="100%"
      height="calc(100vh - 64px)"
      style={{ position: "relative", top: "56px" }}
      onWheel={handleZoom(viewBox, setViewBox, SVGBoundingBox)}
      onMouseDown={startPan(SVGRef, SVGBoundingBox, setIsPanning, setPointerOrigin)}
      onMouseUp={endPan(setIsPanning)}
      onMouseMove={handlePan(SVGRef, isPanning, pointerOrigin, setViewBox, viewBox)}
      overflow="hidden"
      ref={SVGRef}
    >
      {linkChildren}
      {nodeChildren}
    </svg>
  );
}

export default GraphCanvas;
