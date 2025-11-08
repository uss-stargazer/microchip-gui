import * as d3 from "d3";
import { useEffect, useRef } from "react";
import type { MicrochipState } from "microchip-dsl";
import drawComponent from "./modules/drawComponent";

function MicrochipCicuit({
  width,
  height,
  state,
}: {
  width: string;
  height: string;
  state: MicrochipState;
}) {
  const circuitRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (circuitRef.current) {
      const circuitSelection = d3.select(circuitRef.current);

      // Implement pan zoom

      drawComponent(
        state.rootComponent,
        state.componentRegistry,
        circuitSelection
      );
    }
  }, [state]);

  return (
    <div>
      <svg
        ref={circuitRef}
        style={{
          width,
          height,
        }}
        width={width}
        height={height}
      />
    </div>
  );
}

export default MicrochipCicuit;
