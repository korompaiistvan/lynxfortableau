// external
import { Box, List } from "@mui/material";
import { useRecoilValue } from "recoil";

// local
import WorkbookListItem from "./WorkbookListItem";

// state
import { workbookListState } from "src/state";

export function WorkbookList() {
  const workbookList = useRecoilValue(workbookListState);
  return (
    <Box sx={{ width: "100%", maxWidth: 360 }}>
      <List>
        {workbookList.map((wb) => (
          <WorkbookListItem key={wb} workbookName={wb} />
        ))}
      </List>
    </Box>
  );
}
