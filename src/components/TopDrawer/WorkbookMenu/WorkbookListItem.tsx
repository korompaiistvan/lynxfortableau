// external
import ArticleIcon from "@mui/icons-material/Article";
import { ListItem, ListItemButton, ListItemIcon, ListItemText, Theme } from "@mui/material";
import { useSetRecoilState } from "recoil";
import { currentWorkbookNameState, isTopDrawerCollapsedState } from "src/state";

interface Props {
  workbookName: string;
}
export default function WorkbookListItem(props: Props) {
  const { workbookName } = props;
  const setDrawerCollapsed = useSetRecoilState(isTopDrawerCollapsedState);
  const setWorkbookName = useSetRecoilState(currentWorkbookNameState);
  async function clickHandler() {
    setDrawerCollapsed(true);
    setWorkbookName(workbookName);
  }
  return (
    <ListItem
      disablePadding
      onClick={clickHandler}
      sx={{
        color: (theme: Theme) => theme.palette.secondary.light,
      }}
    >
      <ListItemButton>
        <ListItemIcon>
          <ArticleIcon />
        </ListItemIcon>
        <ListItemText primary={workbookName} />
      </ListItemButton>
    </ListItem>
  );
}
