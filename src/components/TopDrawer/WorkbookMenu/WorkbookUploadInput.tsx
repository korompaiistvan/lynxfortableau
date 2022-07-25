// external
import { Box, Button, TextField, Theme } from "@mui/material";
import { Dispatch, SetStateAction } from "react";

// state
import { useRecoilCallback, useRecoilState } from "recoil";
import { currentWorkbookNameState, workbookUploadCallback } from "src/state";

interface Props {
  setDrawerCollapsed: Dispatch<SetStateAction<boolean>>;
}

export function WorkbookUploadInput(props: Props) {
  const [workbookName, setWorkbookName] = useRecoilState(currentWorkbookNameState);
  const uploadNewWorkbook = useRecoilCallback(workbookUploadCallback, []);
  const { setDrawerCollapsed } = props;

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
