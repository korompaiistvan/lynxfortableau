import { darkTheme } from "src/theme";
import { Box, FormControl, InputLabel, MenuItem, Select } from "@mui/material";

import { ThemeProvider } from "@mui/material/styles";

import { datasourceCaptionsState, selectedDatasourceIdxState } from "src/state";
import { useRecoilValue, useRecoilState } from "recoil";

export function DatasourceSelector() {
  const datasourceCaptions = useRecoilValue(datasourceCaptionsState);
  function handleDatasourceChange(event: any) {
    setDatasourceIdx(event.target.value);
  }
  const [datasourceIdx, setDatasourceIdx] = useRecoilState(selectedDatasourceIdxState);
  return (
    <ThemeProvider theme={darkTheme}>
      <Box
        sx={{
          width: "100%",
          display: "flex",
          flex: 1,
        }}
      >
        <FormControl
          sx={{
            flexGrow: 1,
          }}
        >
          <InputLabel id="demo-simple-select-helper-label">Datasource</InputLabel>
          <Select
            labelId="datasource-select-label"
            id="datasource-select"
            value={datasourceIdx}
            label="Datasource"
            onChange={handleDatasourceChange}
            color="success"
            size="small"
          >
            {datasourceCaptions.map((dsn, idx) => {
              return (
                <MenuItem value={idx} key={`ds${idx}`}>
                  {dsn}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
      </Box>
    </ThemeProvider>
  );
}
