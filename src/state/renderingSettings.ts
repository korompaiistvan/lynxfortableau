import { constSelector, atom } from "recoil";

import { SortMode } from "../types";

export const hGutterState = constSelector(260);
export const marginState = constSelector(40);
export const vGutterState = constSelector(40);

export const openWidthState = constSelector(400);
export const closedWidthState = constSelector(260);
export const closedHeightState = constSelector(50);

export const sortModeState = atom({
  key: "sortMode",
  default: "shortestLinks" as SortMode,
});
