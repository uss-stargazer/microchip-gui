import { Box } from "@mui/material";
import { useEffect, useState } from "react";

function LoadingAnimation() {
  const [nDots, setNDots] = useState<number>(0);

  useEffect(() => {
    setTimeout(() => {
      setNDots(nDots < 3 ? nDots + 1 : 0);
    }, 750);
  });

  return <Box>Loading{".".repeat(nDots)}</Box>;
}

export default LoadingAnimation;
