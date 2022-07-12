// external
import { Box, List } from "@mui/material";
import { Dispatch, SetStateAction } from "react";
import { useRecoilValue } from "recoil";

// local
import WorkbookListItem from "./WorkbookListItem";

// state
import { workbookListState } from "src/state";

interface Props {
  setDrawerCollapsed: Dispatch<SetStateAction<boolean>>;
}

export function WorkbookList(props: Props) {
  const workbookList = useRecoilValue(workbookListState);
  return (
    <Box sx={{ width: "100%", maxWidth: 360, bgcolor: "background.paper" }}>
      <List>
        {workbookList.map((wb) => (
          <WorkbookListItem
            key={wb}
            workbookName={wb}
            setDrawerCollapsed={props.setDrawerCollapsed}
          />
        ))}
      </List>
    </Box>
  );
}
