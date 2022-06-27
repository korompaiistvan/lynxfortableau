import { Fragment, useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Collapse,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { ExpandMore } from "@mui/icons-material";
import { Theme } from "@mui/material/styles";

import { useRecoilValue, useSetRecoilState, useRecoilState, useResetRecoilState } from "recoil";
import {
  workbookStringState,
  datasourceCaptionsState,
  selectedDatasourceIdxState,
  workbookNameState,
} from "src/state";

import { ThemeProvider, createTheme } from "@mui/material/styles";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

function TopDrawer() {
  const [drawerCollapsed, setDrawerCollapsed] = useState(true);

  const setWorkbookString = useSetRecoilState(workbookStringState);
  const [datasourceIdx, setDatasourceIdx] = useRecoilState(selectedDatasourceIdxState);
  const resetDatasourceIdx = useResetRecoilState(selectedDatasourceIdxState);
  const [workbookName, setWorkbookName] = useRecoilState(workbookNameState);

  function handleWorkbookChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files![0];
    setWorkbookName(file.name);
    resetDatasourceIdx();
    file.text().then((workbookString) => {
      setWorkbookString(workbookString);
    });
  }

  function handleCollapseChange() {
    setDrawerCollapsed((prev) => !prev);
  }

  function handleDatasourceChange(event: any) {
    setDatasourceIdx(event.target.value);
  }

  const datasourceCaptions = useRecoilValue(datasourceCaptionsState);

  const appBarHeight = drawerCollapsed ? "auto" : "100vh";
  const appBarElevation = drawerCollapsed ? 16 : 0;
  return (
    <Fragment>
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
        <Collapse in={!drawerCollapsed}>
          <ThemeProvider theme={darkTheme}>
            <Container
              sx={{
                height: "calc(100vh - 64px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                gap: "20px",
              }}
              maxWidth="sm"
            >
              <Box
                sx={{
                  display: "flex",
                  width: "100%",
                  alignItems: "baseline",
                  justifyContent: "space-between",
                  gap: "20px",
                }}
              >
                <TextField
                  id="workbook-name"
                  label="Workbook"
                  variant="outlined"
                  disabled
                  value={workbookName}
                  sx={{ flexGrow: 1, color: (theme: Theme) => theme.palette.secondary.light }}
                />
                <input
                  accept=".twb"
                  hidden
                  id="raised-button-file"
                  multiple={false}
                  type="file"
                  onChange={handleWorkbookChange}
                />
                <label htmlFor="raised-button-file">
                  <Button variant="contained" size="large" component="span">
                    Change workbook
                  </Button>
                </label>
              </Box>
            </Container>
          </ThemeProvider>
        </Collapse>
        <AppBar position="static" elevation={appBarElevation}>
          <Toolbar>
            <Typography variant="h6" component="div" style={{ flex: 1 }}>
              Lynx for Tableau
            </Typography>

            <ThemeProvider theme={darkTheme}>
              <Box sx={{ width: "100%", display: "flex", flex: 1 }}>
                <FormControl sx={{ flexGrow: 1 }}>
                  <InputLabel id="demo-simple-select-helper-label">Datasource</InputLabel>
                  <Select
                    labelId="datasource-select-label"
                    id="datasource-select"
                    value={datasourceIdx}
                    label="Datasource"
                    onChange={handleDatasourceChange}
                    color="success"
                    size="small"
                  >
                    {datasourceCaptions.map((dsn, idx) => {
                      return (
                        <MenuItem value={idx} key={`ds${idx}`}>
                          {dsn}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              </Box>
            </ThemeProvider>
            <Box sx={{ flex: 2 }} />
            <Button
              onClick={handleCollapseChange}
              endIcon={<ExpandMore />}
              color="inherit"
              // variant="outlined"
            >
              {drawerCollapsed ? "Show" : "Hide"} Workbook Menu
            </Button>
          </Toolbar>
        </AppBar>
      </Box>
    </Fragment>
  );
}

export default TopDrawer;
