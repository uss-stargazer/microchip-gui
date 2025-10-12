import { Box, Typography } from "@mui/material";
import { MdAdb } from "react-icons/md";

function Logo({ fontSizeRem }: { fontSizeRem?: number }) {
  return (
    <Box sx={{ display: "flex" }}>
      <Typography
        variant="h6"
        noWrap
        component="a"
        href="/"
        fontSize={fontSizeRem + "rem"}
        sx={{
          mr: 2,
          display: "flex",
          fontFamily: "monospace",
          fontWeight: 700,
          letterSpacing: (fontSizeRem || 1) * 0.1 + "rem",
          color: "inherit",
          textDecoration: "none",
        }}
      >
        <MdAdb style={{ margin: "0.24em" }} />
        <span>LOGO</span>
      </Typography>
    </Box>
  );
}
//
export default Logo;
