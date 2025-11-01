import * as d3 from "d3";
import type { MicrochipState } from "microchip-dsl";

export interface NodeStyle {
  name: string;
  color: string;
}

export interface Node extends d3.SimulationNodeDatum {
  id: string;
  groupId: string;
  style: Partial<NodeStyle>;
}

export interface Link extends d3.SimulationLinkDatum<Node> {
  sourceId: string;
  targetId: string;
}

export interface Group {
  id: string;
  style: Partial<NodeStyle>;
}

export type Data = {
  nodes: Node[];
  links: Link[];
  groups: Group[];
};

function drawCircuitNetwork(svg: SVGSVGElement, data: MicrochipState) {
  // /* Every time state updates, call this function, use seperate function to make some of the svgs clickable (which would just change the state and call this function) */

  const svgHandle = d3.select(svg);

  svgHandle
    .selectAll("line")
    .data(Array.from(data.componentRegistry))
    .join("line")
    .attr("fill", "green")
    .attr("cx", (circ) => Math.random() * 100)
    .attr("cy", (circ) => Math.random() * 100)
    .attr("r", function (circ) {
      return Math.random() * 100;
    });
}

export default drawCircuitNetwork;
