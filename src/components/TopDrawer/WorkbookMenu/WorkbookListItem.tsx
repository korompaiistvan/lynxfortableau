// external
import ArticleIcon from "@mui/icons-material/Article";
import { ListItem, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import { Dispatch, SetStateAction } from "react";
import { useSetRecoilState } from "recoil";
import { workbookNameState } from "src/state";

interface Props {
  workbookName: string;
  setDrawerCollapsed: Dispatch<SetStateAction<boolean>>;
}
export default function WorkbookListItem(props: Props) {
  const { workbookName, setDrawerCollapsed } = props;
  const setWorkbookName = useSetRecoilState(workbookNameState);
  function clickHandler() {
    setWorkbookName(workbookName);
    setDrawerCollapsed(true);
  }
  return (
    <ListItem disablePadding onClick={clickHandler}>
      <ListItemButton>
        <ListItemIcon>
          <ArticleIcon />
        </ListItemIcon>
        <ListItemText primary={workbookName} />
      </ListItemButton>
    </ListItem>
  );
}
