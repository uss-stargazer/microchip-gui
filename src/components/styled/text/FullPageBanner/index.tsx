import { Box } from "@mui/material";
import type { PropsWithChildren } from "react";
import useAppBarHeight from "../../../../hooks/useAppBarHeight";

function FullPageBanner({
  children,
  backgroundColor,
  backgroundImage,
  childrenAlignment,
}: PropsWithChildren<{
  backgroundColor?: string;
  backgroundImage?: { url: string; static?: boolean; fade?: number };
  childrenAlignment?: "left" | "right" | "center";
}>) {
  const appBarHeight = useAppBarHeight();

  return (
    <Box
      sx={{
        width: "100%",
        height: `calc(100vh - ${appBarHeight}px)`,
        bgcolor: backgroundColor,
        ...(backgroundImage
          ? {
              backgroundImage: `linear-gradient(rgba(0,0,0,${backgroundImage.fade}), rgba(0,0,0,${backgroundImage.fade})),
                                url('${backgroundImage.url}')`,
              backgroundSize: "cover",
              backgroundPosition: "center center",
              backgroundRepeat: "no-repeat",
              backgroundAttachment: backgroundImage.static ? "fixed" : "scroll",
            }
          : null),
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems:
          childrenAlignment === "right"
            ? "flex-end"
            : childrenAlignment === "left"
            ? "flex-start"
            : "center",
      }}
    >
      {children}
    </Box>
  );
}

export default FullPageBanner;
