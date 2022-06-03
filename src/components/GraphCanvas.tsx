import { WheelEvent, useState, useRef, useEffect, MouseEventHandler, useMemo } from "react";
import ColumnNode from "./ColumnNode";
import { useRecoilValue } from "recoil";

import { linksState, nodesStaticState } from "../state";
import NodeLink from "./NodeLink";

type ViewBox = [number, number, number, number];

function GraphCanvas() {
  const links = useRecoilValue(linksState);
  const nodes = useRecoilValue(nodesStaticState);

  const SVGRef = useRef<SVGSVGElement>(null);
  const [SVGBoundingBox, setSVGBoundingBox] = useState<DOMRect>();
  const [viewBox, setViewBox] = useState<ViewBox>([0, 0, 4000, 2000]);
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [pointerOrigin, setPointerOrigin] = useState<DOMPoint>();

  // holds the timer for setTimeout and clearInterval
  let movement_timer: NodeJS.Timeout | undefined = undefined;

  // the number of ms the window size must stay the same size before the
  // dimension state variable is reset
  const RESET_TIMEOUT = 100;

  function handleZoom(event: WheelEvent) {
    if (!SVGBoundingBox) return;
    const { clientX, clientY, deltaY } = event;

    const zoomFactor = 0.1; // the percentage by which the viewBox will change every tick of the wheel
    const zoomAmount = (deltaY / 100) * zoomFactor; // positive is zoom out, negative is zoom in

    const xRel = (clientX - SVGBoundingBox.left) / SVGBoundingBox.width;
    const vbXChange = zoomAmount * viewBox[2];
    const newLeft = viewBox[0] - vbXChange * xRel;
    const newWidth = viewBox[2] * (1 + zoomAmount);

    const yRel = (clientY - SVGBoundingBox.top) / SVGBoundingBox.height;
    const vbYChange = zoomAmount * viewBox[3];
    const newTop = viewBox[1] - vbYChange * yRel;
    const newHeight = viewBox[3] * (1 + zoomAmount);

    const newViewBox: ViewBox = [newLeft, newTop, newWidth, newHeight];
    setViewBox(newViewBox);
  }

  function storeDimensions() {
    if (!SVGRef.current) return;
    setSVGBoundingBox(SVGRef.current.getBoundingClientRect());
  }

  function getPointFromEvent(event: MouseEvent) {
    const point = DOMPoint.fromPoint({ x: event.clientX, y: event.clientY });
    const invertedSVGMatrix = SVGRef.current?.getScreenCTM()?.inverse();
    return point.matrixTransform(invertedSVGMatrix);
  }

  const startPan: MouseEventHandler<SVGSVGElement> = (event) => {
    if (!SVGBoundingBox) return;
    setIsPanning(true);
    setPointerOrigin(getPointFromEvent(event as unknown as MouseEvent));
  };

  const handlePan: MouseEventHandler<SVGSVGElement> = (event) => {
    if (!isPanning) return;
    event.preventDefault();
    const pointerPosition = getPointFromEvent(event as unknown as MouseEvent);
    const deltaX = pointerPosition.x - pointerOrigin!.x;
    const deltaY = pointerPosition.y - pointerOrigin!.y;
    setViewBox([viewBox[0] - deltaX, viewBox[1] - deltaY, viewBox[2], viewBox[3]]);
  };

  const endPan: MouseEventHandler<SVGSVGElement> = (event) => {
    setIsPanning(false);
  };

  useEffect(() => {
    storeDimensions();
  }, []);

  window.addEventListener("resize", () => {
    clearInterval(movement_timer);
    movement_timer = setTimeout(storeDimensions, RESET_TIMEOUT);
  });

  const nodeChildren = useMemo(() => {
    return nodes?.map((col, idx) => {
      return <ColumnNode {...col} key={col.name} />;
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
      onWheel={handleZoom}
      onMouseDown={startPan}
      onMouseUp={endPan}
      onMouseMove={handlePan}
      overflow="hidden"
      ref={SVGRef}
    >
      {linkChildren}
      {nodeChildren}
    </svg>
  );
}

export default GraphCanvas;
