import { SvgIcon } from "@material-ui/core";
import type { ColumnRole } from "../types";
interface Props {
  columnRole: ColumnRole;
}

const colorMapping = {
  measure: "green",
  dimension: "blue",
  parameter: "purple",
};

function ColumnRoleIndicator({ columnRole }: Props) {
  const color = colorMapping[columnRole];
  return (
    <SvgIcon fontSize="small">
      <circle cx="12" cy="12" r="5" fill={color} />
    </SvgIcon>
  );
}

export default ColumnRoleIndicator;
