import type { MicrochipState } from "microchip-dsl";
import type { VisNetworkConfig } from "../../../hooks/useVisNetwork";
import type { Edge, Node, Options } from "vis-network";

const nodes: Node[] = [
  {
    id: 1,
    label: "test",
    title: "ПАО Т Плюс",
    // level: 1,
    group: "struct",
  },
  {
    id: 2,
    label: "Филиал",
    title: "Пермский филиал",
    // level: 2,
    group: "struct",
  },
  {
    id: 3,
    label: "Станция",
    title: "Пермская ТЭЦ-6",
    // level: 3,
    group: "object",
  },
  {
    id: 4,
    label: "РГЕ",
    title: "Пермская ТЭЦ-6",
    // level: 4,
    group: "market",
  },
  {
    id: 5,
    label: "Турбина",
    title: "ГТУ-7",
    // level: 5,
    group: "object",
  },
  {
    id: 6,
    label: "ГТПГ",
    // level: 4,
    group: "market",
  },
  {
    id: 7,
    label: "test",
    // level: 3,
    group: "object",
  },
];

const edges: Edge[] = [
  { from: 1, to: 2, id: 1 },
  { from: 1, to: 3, id: 6 },
  { from: 2, to: 3, id: 2 },
  { from: 3, to: 5, id: 3 },
  { from: 3, to: 4, id: 4 },
  { from: 4, to: 5, id: 5 },
  { from: 3, to: 6, id: 7 },
  { from: 1, to: 7, id: 8 },
  { from: 1, to: 7, id: 10 },
  { from: 2, to: 7, id: 9 },
];

const options: Options = {
  layout: {
    hierarchical: {
      direction: "UD",
      sortMethod: "directed",
    },
  },
  interaction: { dragNodes: false },
  physics: {
    enabled: false,
  },
  configure: {
    filter: function (option: any, path: any) {
      if (path.indexOf("hierarchical") !== -1) {
        return true;
      }
      return false;
    },
    showButton: false,
  },
};

function parseMicrochipState(state: MicrochipState): VisNetworkConfig {
  return { nodes: nodes, edges: edges, options: options };
}

export default parseMicrochipState;
