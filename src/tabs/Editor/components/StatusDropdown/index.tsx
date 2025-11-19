import { Button, Menu, Typography } from "@mui/material";
import React, { useState } from "react";

function StatusDropdown({ errorMessage }: { errorMessage: string }) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const isOpen = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <React.Fragment>
      <Button
        onClick={handleClick}
        variant="contained"
        sx={{ bgcolor: "error.main", borderRadius: 0 }}
      >
        error
      </Button>
      <Menu anchorEl={anchorEl} open={isOpen} onClose={handleClose}>
        <Typography m="1rem">{errorMessage}</Typography>
      </Menu>
    </React.Fragment>
  );
}

export default StatusDropdown;
