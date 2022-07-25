// external
import { Box } from "@mui/material";
import { useRecoilValue } from "recoil";
import { isTopDrawerCollapsedState } from "src/state";

// local
import CommandBar from "./CommandBar";
import WorkbookMenu from "./WorkbookMenu";

export default function TopDrawer() {
  const drawerCollapsed = useRecoilValue(isTopDrawerCollapsedState);
  const appBarHeight = drawerCollapsed ? "auto" : "100vh";

  return (
    <Box
      className="appbar-drawer"
      sx={{
        position: "fixed",
        width: "100vw",
        top: 0,
        left: 0,
        height: appBarHeight,
        backgroundColor: "primary.main",
      }}
    >
      <WorkbookMenu />
      <CommandBar />
    </Box>
  );
}
