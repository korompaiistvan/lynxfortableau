import { Button, Box, Collapse, Container, TextField } from "@mui/material";

import { ThemeProvider, Theme } from "@mui/material/styles";

import { darkTheme } from "src/theme";

import { workbookStringState, selectedDatasourceIdxState, workbookNameState } from "src/state";
import { useSetRecoilState, useResetRecoilState, useRecoilState } from "recoil";
import { Dispatch, SetStateAction } from "react";

interface Props {
  drawerCollapsed: boolean;
  setDrawerCollapsed: Dispatch<SetStateAction<boolean>>;
}

export function WorkbookMenu(props: Props) {
  const { drawerCollapsed, setDrawerCollapsed } = props;

  const [workbookName, setWorkbookName] = useRecoilState(workbookNameState);
  const resetDatasourceIdx = useResetRecoilState(selectedDatasourceIdxState);
  const setWorkbookString = useSetRecoilState(workbookStringState);

  function handleWorkbookChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files![0];
    setWorkbookName(file.name);
    resetDatasourceIdx();
    file.text().then((workbookString) => {
      setWorkbookString(workbookString);
      setDrawerCollapsed(true);
    });
  }
  return (
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
              sx={{
                flexGrow: 1,
                color: (theme: Theme) => theme.palette.secondary.light,
              }}
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
  );
}
