import * as d3 from "d3";
import { useEffect, useRef } from "react";
import type { Node, Link, Data } from "./modules/drawCircuitNetwork";
import drawCircuitNetwork from "./modules/drawCircuitNetwork";
import type { MicrochipState } from "microchip-dsl";

function CircuitNetwork({
  width,
  height,
  data,
}: {
  width: string;
  height: string;
  data: MicrochipState;
}) {
  const circuitRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (circuitRef.current) {
      drawCircuitNetwork(circuitRef.current, data);
    }
  }, [data]);

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

export default CircuitNetwork;
