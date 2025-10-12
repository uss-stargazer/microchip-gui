function RainbowText({
  startHue,
  saturation,
  lightness,
  nRainbowDivisions,
  children,
}: {
  startHue?: number | "random";
  saturation?: number;
  lightness?: number;
  nRainbowDivisions?: number;
  children: string;
}) {
  if (typeof startHue === "string") {
    startHue = Math.random() * 255;
  }

  return (
    <span>
      {children.split("").map((c: string, idx: number) => {
        const hue =
          ((startHue ?? 0) +
            ((idx % children.length) * 255) /
              (nRainbowDivisions ?? children.length)) %
          255;
        return (
          <span
            style={{
              color:
                "hsl(" +
                hue +
                "," +
                (saturation ?? 100) +
                "%," +
                (lightness ?? 50) +
                "%)",
            }}
          >
            {c}
          </span>
        );
      })}
    </span>
  );
}

export default RainbowText;
