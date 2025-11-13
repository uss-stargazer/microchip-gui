import * as d3 from "d3";
import React, { useEffect, useRef } from "react";
import type { MicrochipState } from "microchip-dsl";
import { makePanZoomable } from "./modules/utils";
import toPX from "to-px";
import type { ComponentId } from "microchip-dsl/component";
import buildComponentSymbol, {
  getComponentSymbolId,
} from "./modules/buildComponentSymbol";

function MicrochipCicuit({
  width,
  height,
  state,
}: {
  width: string;
  height: string;
  state: MicrochipState;
}) {
  const componentsRef = useRef<SVGSVGElement>(null),
    circuitRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (circuitRef.current && componentsRef.current) {
      const circuitSelection = d3.select(circuitRef.current);
      const componentsSelection = d3.select(componentsRef.current);

      const componentEntries = [...state.componentRegistry.entries()].sort(
        (a, b) => a[0] - b[0] // Make sure its in the order it was created (although it shouldn't matter too much...)
      );
      if (componentEntries.length === 0) {
        throw new Error("Expected at least one component in microchip state");
      }

      componentsSelection
        .selectAll("symbol")
        .data(componentEntries)
        .enter()
        .append("symbol")
        .each(function (entry) {
          buildComponentSymbol(entry[0], entry[1], d3.select(this));
        });

      const rootComponent = circuitSelection
        .append("use")
        .attr("id", "root-component")
        .attr("href", `#${getComponentSymbolId(state.rootComponent)}`)
        .attr("x", 0)
        .attr("y", 0);

      return () => {
        console.log("removing root");
        rootComponent.remove();
        componentsSelection.selectAll("symbol").remove();
      };
    }
  }, [state]);

  return (
    <React.Fragment>
      <svg ref={componentsRef} width={0} height={0} />
      <svg
        ref={circuitRef}
        width="100%"
        height="100%"
        style={{
          backgroundColor: "red",
        }}
      />
    </React.Fragment>
  );
}

export default MicrochipCicuit;
