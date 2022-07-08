// external
import { useEffect, useMemo, useRef, useState } from "react";
import { useRecoilValue } from "recoil";

// local
import ColumnNode from "./ColumnNode";
import { endPan, handlePan, handleZoom, startPan } from "./navigationEventHandlers";
import NodeLink from "./NodeLink";

// state
import { filteredLinksState, filteredNodesState, workbookNameState } from "src/state";

// types
import type { ViewBox } from "src/types";

function GraphCanvas() {
  const links = useRecoilValue(filteredLinksState);
  const nodes = useRecoilValue(filteredNodesState);

  const SVGRef = useRef<SVGSVGElement>(null);
  const [SVGBoundingBox, setSVGBoundingBox] = useState<DOMRect>();
  const [viewBox, setViewBox] = useState<ViewBox>([0, 0, 4000, 2000]);
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [pointerOrigin, setPointerOrigin] = useState<DOMPoint>();
  const workbookName = useRecoilValue(workbookNameState);

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
      return <ColumnNode {...col} key={`${workbookName}.${col.qualifiedName}`} />;
    });
  }, [workbookName, nodes]);

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
