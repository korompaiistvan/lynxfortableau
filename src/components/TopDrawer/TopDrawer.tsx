// external
import { Box } from "@mui/material";
import { useState } from "react";

// local
import CommandBar from "./CommandBar";
import WorkbookMenu from "./WorkbookMenu";

export default function TopDrawer() {
  const [drawerCollapsed, setDrawerCollapsed] = useState(true);
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
      <WorkbookMenu drawerCollapsed={drawerCollapsed} setDrawerCollapsed={setDrawerCollapsed} />
      <CommandBar drawerCollapsed={drawerCollapsed} setDrawerCollapsed={setDrawerCollapsed} />
    </Box>
  );
}
