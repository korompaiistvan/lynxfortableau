// external
import { Collapse, Container } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { useRecoilValue } from "recoil";
import { isTopDrawerCollapsedState } from "src/state";
import { darkTheme } from "src/theme";

//local
import { WorkbookList } from "./WorkbookList";
import { WorkbookUploadInput } from "./WorkbookUploadInput";

// state

export default function WorkbookMenu() {
  const drawerCollapsed = useRecoilValue(isTopDrawerCollapsedState);

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
          <WorkbookUploadInput />
          <WorkbookList />
        </Container>
      </ThemeProvider>
    </Collapse>
  );
}
