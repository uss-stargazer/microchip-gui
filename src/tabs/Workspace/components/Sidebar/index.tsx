import { Box, IconButton, Typography } from "@mui/material";
import { useState } from "react";
import { MdSettingsApplications } from "react-icons/md";

function WorkspaceSettings() {
  return (
    <Box
      bgcolor="grey.900"
      sx={(theme) => ({
        borderColor: "secondary.main",
        borderStyle: "solid",
        borderWidth: 0,
        [theme.breakpoints.up("sm")]: {
          borderLeftWidth: "1px",
        },
        [theme.breakpoints.down("sm")]: {
          borderTopWidth: "1px",
        },
        display: "flex",
        flexDirection: "column",
        p: "1.5rem",
      })}
    >
      <Typography>Workspace Settings</Typography>
    </Box>
  );
}

function Sidebar() {
  const [isOpen, setIsOpen] = useState<boolean>(true);

  return (
    <Box
      sx={{
        position: "relative",
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
      }}
    >
      <IconButton
        onClick={() => setIsOpen(!isOpen)}
        sx={(theme) => ({
          bgcolor: "grey.900",
          width: "2.75rem",
          height: "2.75rem",
          position: "absolute",
          zIndex: 10,
          borderRadius: 0,
          borderColor: "secondary.main",
          borderStyle: "solid",
          borderWidth: "1px",
          borderTopLeftRadius: "5px",
          [theme.breakpoints.up("sm")]: {
            left: `calc(-2.75rem + ${isOpen ? "1" : "0"}px)`, // + 1px so borders overlap
            bottom: 0,
            borderBottomWidth: 0,
            borderRightColor: "grey.900",
          },
          [theme.breakpoints.down("sm")]: {
            top: `calc(-2.75rem + ${isOpen ? "1" : "0"}px)`, // + 1px so borders overlap
            right: 0,
            borderRightWidth: 0,
            borderBottomColor: "grey.900",
          },
        })}
      >
        <MdSettingsApplications />
      </IconButton>
      {isOpen && <WorkspaceSettings />}
    </Box>
  );
}

export default Sidebar;
