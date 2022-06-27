import type {
  Dispatch,
  SetStateAction,
  MouseEventHandler,
  RefObject,
  WheelEventHandler,
} from "react";
import type { ViewBox } from "src/types";

export const handleZoom = (
  viewBox: ViewBox,
  setViewBox: Dispatch<SetStateAction<ViewBox>>,
  SVGBoundingBox: DOMRect | undefined
) =>
  ((event) => {
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
  }) as WheelEventHandler<SVGSVGElement>;

const getPointFromEvent = (SVGRef: RefObject<SVGSVGElement>) => (event: MouseEvent) => {
  const point = DOMPoint.fromPoint({ x: event.clientX, y: event.clientY });
  const invertedSVGMatrix = SVGRef.current?.getScreenCTM()?.inverse();
  return point.matrixTransform(invertedSVGMatrix);
};

export const startPan = (
  SVGRef: RefObject<SVGSVGElement>,
  SVGBoundingBox: DOMRect | undefined,
  setIsPanning: Dispatch<SetStateAction<boolean>>,
  setPointerOrigin: Dispatch<SetStateAction<DOMPoint | undefined>>
) =>
  ((event) => {
    if (!SVGBoundingBox) return;
    setIsPanning(true);
    setPointerOrigin(getPointFromEvent(SVGRef)(event as unknown as MouseEvent));
  }) as MouseEventHandler<SVGSVGElement>;

export const handlePan = (
  SVGRef: RefObject<SVGSVGElement>,
  isPanning: boolean,
  pointerOrigin: DOMPoint | undefined,
  setViewBox: Dispatch<SetStateAction<ViewBox>>,
  viewBox: ViewBox
) =>
  ((event) => {
    if (!isPanning) return;
    event.preventDefault();
    const pointerPosition = getPointFromEvent(SVGRef)(event as unknown as MouseEvent);
    const deltaX = pointerPosition.x - pointerOrigin!.x;
    const deltaY = pointerPosition.y - pointerOrigin!.y;
    setViewBox([viewBox[0] - deltaX, viewBox[1] - deltaY, viewBox[2], viewBox[3]]);
  }) as MouseEventHandler<SVGSVGElement>;

export const endPan = (setIsPanning: Dispatch<SetStateAction<boolean>>) =>
  ((event) => {
    setIsPanning(false);
  }) as MouseEventHandler<SVGSVGElement>;
