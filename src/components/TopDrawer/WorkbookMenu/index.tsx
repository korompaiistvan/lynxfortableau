// external
import { Collapse } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { Dispatch, SetStateAction } from "react";
import { darkTheme } from "src/theme";

//local
import { WorkbookList } from "./WorkbookList";
import { WorkbookUploadInput } from "./WorkbookUploadInput";

// state

interface Props {
  drawerCollapsed: boolean;
  setDrawerCollapsed: Dispatch<SetStateAction<boolean>>;
}

export default function WorkbookMenu(props: Props) {
  const { drawerCollapsed, setDrawerCollapsed } = props;

  return (
    <Collapse in={!drawerCollapsed}>
      <ThemeProvider theme={darkTheme}>
        <WorkbookUploadInput setDrawerCollapsed={setDrawerCollapsed} />
        <WorkbookList setDrawerCollapsed={setDrawerCollapsed} />
      </ThemeProvider>
    </Collapse>
  );
}
