// local / state
import { atom } from "recoil";

export const isTopDrawerCollapsedState = atom<boolean>({
  key: "isTopDrawerCollapsed",
  default: true,
});
