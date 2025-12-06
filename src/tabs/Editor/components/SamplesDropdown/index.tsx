import { useEffect, useState } from "react";
import * as samples from "../../../../assets/sampleEditorContents";
import useSettings from "../../../../hooks/useSettings";
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  type SelectChangeEvent,
} from "@mui/material";

const sampleKeys = Object.keys(samples).reverse(); // We want it to display in reverse order

function SamplesDropdown() {
  const [settings, setSettings] = useSettings();
  const [sample, setSample] = useState<string>("XOR");

  const handleChange = (event: SelectChangeEvent) => {
    const newSample = event.target.value as string;
    console.log(newSample);
    // @ts-ignore
    if (newSample.length > 0) setSettings("editor", samples[newSample]);
    setSample(newSample);
  };

  useEffect(() => setSample(""), [settings.editor]);

  return (
    <FormControl sx={{ height: "2rem", fontSize: "1rem", paddingTop: "2px" }}>
      <InputLabel>Sample</InputLabel>
      <Select
        label="Sample"
        value={sample}
        onChange={handleChange}
        sx={{ height: "2em", fontSize: "1em" }}
      >
        {sampleKeys.map((sample, idx) => (
          <MenuItem key={idx} value={sample}>
            <Typography variant="caption">{sample}</Typography>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

export default SamplesDropdown;
