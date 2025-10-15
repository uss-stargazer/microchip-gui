import { Box, IconButton, Typography } from "@mui/material";
import React, { useState } from "react";
import { MdSettingsApplications } from "react-icons/md";

function WorkspaceSettings() {
  return (
    <Box
      bgcolor="grey.900"
      sx={{
        borderLeftWidth: "5px",
        borderLeftStyle: "solid",
        borderLeftColor: "grey.800",
        display: "flex",
        flexDirection: "column",
        p: "1.5rem",
      }}
    >
      <Typography>Workspace Settings</Typography>
    </Box>
  );
}

function Sidebar() {
  const [isOpen, setIsOpen] = useState<boolean>(true);

  return (
    <Box display="flex">
      {isOpen && <WorkspaceSettings />}
      <Box bgcolor="grey.800">
        <IconButton onClick={() => setIsOpen(!isOpen)}>
          <MdSettingsApplications />
        </IconButton>
      </Box>
    </Box>
  );
}

export default Sidebar;
