import { Dispatch, SetStateAction } from "react";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";

import { ExpandMore } from "@mui/icons-material";
import { DatasourceSelector } from "./DatasourceSelector";
interface Props {
  drawerCollapsed: boolean;
  setDrawerCollapsed: Dispatch<SetStateAction<boolean>>;
}
export function CommandBar(props: Props) {
  const { drawerCollapsed, setDrawerCollapsed } = props;
  const appBarElevation = drawerCollapsed ? 16 : 0;
  function handleCollapseChange() {
    setDrawerCollapsed((prev) => !prev);
  }
  return (
    <AppBar position="static" elevation={appBarElevation}>
      <Toolbar>
        <Typography
          variant="h6"
          component="div"
          style={{
            flex: 1,
          }}
        >
          Lynx for Tableau
        </Typography>

        <DatasourceSelector />
        <Box
          sx={{
            flex: 2,
          }}
        />
        <Button
          onClick={handleCollapseChange}
          endIcon={<ExpandMore />}
          color="inherit" // variant="outlined"
        >
          {drawerCollapsed ? "Show" : "Hide"} Workbook Menu
        </Button>
      </Toolbar>
    </AppBar>
  );
}
