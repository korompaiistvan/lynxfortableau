// external
import { useEffect, useMemo, useRef, useState } from "react";
import { useRecoilValue } from "recoil";

// local
import ColumnNode from "./ColumnNode";
import { endPan, handlePan, handleZoom, startPan } from "./navigationEventHandlers";
import NodeLink from "./NodeLink";
import { fitToWidth } from "./SVGSizingFunctions";

// state
import {
  columnWidthState,
  currentWorkbookNameState,
  filteredLinksState,
  filteredNodesState,
  marginState,
} from "src/state";

// types
import type { ViewBox } from "src/types";

function GraphCanvas() {
  const links = useRecoilValue(filteredLinksState);
  const nodes = useRecoilValue(filteredNodesState);
  const margin = useRecoilValue(marginState);
  const nodeWidth = useRecoilValue(columnWidthState);

  const SVGRef = useRef<SVGSVGElement>(null);
  const [SVGBoundingBox, setSVGBoundingBox] = useState<DOMRect>();
  const [viewBox, setViewBox] = useState<ViewBox>([0, 0, 4000, 2000]);
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [pointerOrigin, setPointerOrigin] = useState<DOMPoint>();
  const workbookName = useRecoilValue(currentWorkbookNameState);

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
    return nodes?.map((col) => {
      return <ColumnNode {...col} key={`${workbookName}.${col.qualifiedName}`} />;
    });
  }, [workbookName, nodes]);

  const linkChildren = useMemo(() => {
    return links.map((link) => {
      return <NodeLink id={link.id} key={link.id} />;
    });
  }, [links]);

  useEffect(
    () => fitToWidth(SVGRef, setViewBox, margin, nodeWidth)(),
    [workbookName, margin, nodeWidth]
  );

  return (
    <svg
      viewBox={viewBox.join(" ")}
      // preserveAspectRatio="xMidYMin slice"
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
