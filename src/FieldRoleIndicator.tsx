import { SvgIcon } from "@material-ui/core";
import type { FieldRole } from "./types";
interface Props {
  fieldRole: FieldRole;
}

const colorMapping = {
  measure: "green",
  dimension: "blue",
  parameter: "purple",
};

function FieldRoleIndicator({ fieldRole }: Props) {
  const color = colorMapping[fieldRole];
  return (
    <SvgIcon fontSize="small">
      <circle cx="12" cy="12" r="5" fill={color} />
    </SvgIcon>
  );
}

export default FieldRoleIndicator;
