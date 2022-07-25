// external
import { Box, Button, TextField, Theme } from "@mui/material";

// state
import { useRecoilCallback, useRecoilState, useSetRecoilState } from "recoil";
import {
  currentWorkbookNameState,
  isTopDrawerCollapsedState,
  workbookUploadCallback,
} from "src/state";

export function WorkbookUploadInput() {
  const [workbookName, setWorkbookName] = useRecoilState(currentWorkbookNameState);
  const uploadNewWorkbook = useRecoilCallback(workbookUploadCallback, []);
  const setDrawerCollapsed = useSetRecoilState(isTopDrawerCollapsedState);

  function handleWorkbookChange(event: React.ChangeEvent<HTMLInputElement>) {
    uploadNewWorkbook(event.target.files![0]);
    setDrawerCollapsed(true);
  }

  return (
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
  );
}
