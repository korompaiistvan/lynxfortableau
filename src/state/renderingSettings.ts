// local / state
import { atom, constSelector } from "recoil";

export const marginState = constSelector(40);
export const hGutterState = constSelector(260);
export const vGutterState = constSelector(40);

export const columnWidthState = constSelector(400);

export const closedHeightState = constSelector(50);

export const viewPortState = atom({
  key: "viewPort",
  default: [0, 0, 1500, 2000],
});
