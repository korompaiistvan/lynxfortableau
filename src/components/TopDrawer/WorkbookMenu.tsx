// external
import { Box, Button, Collapse, Container, TextField } from "@mui/material";
import { Theme, ThemeProvider } from "@mui/material/styles";
import { Dispatch, SetStateAction } from "react";
import { readWorkbookFromTwbx } from "src/parser/utils";
import { storeWorkbook } from "src/storageClient";
import { darkTheme } from "src/theme";

// state
import { useRecoilState, useResetRecoilState } from "recoil";
import { selectedDatasourceIdxState, workbookNameState } from "src/state";

interface Props {
  drawerCollapsed: boolean;
  setDrawerCollapsed: Dispatch<SetStateAction<boolean>>;
}

export default function WorkbookMenu(props: Props) {
  const { drawerCollapsed, setDrawerCollapsed } = props;

  const [workbookName, setWorkbookName] = useRecoilState(workbookNameState);
  const resetDatasourceIdx = useResetRecoilState(selectedDatasourceIdxState);

  function handleWorkbookChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files![0];
    const workbookName = file.name;

    // TODO: this logic should probably moved to the state code
    const stringPromise =
      file.type === "application/twbx" ? readWorkbookFromTwbx(file) : file.text();
    stringPromise.then((workbookString) => {
      storeWorkbook(workbookName, workbookString);
      resetDatasourceIdx();
      setWorkbookName(file.name);
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
              value={workbookName ?? ""}
              sx={{
                flexGrow: 1,
                color: (theme: Theme) => theme.palette.secondary.light,
              }}
            />
            <input
              accept=".twb,.twbx"
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
