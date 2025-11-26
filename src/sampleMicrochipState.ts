import type { MicrochipState } from "microchip-dsl";

// A *DEVELOPMENT ONLY* reference to what a microchip state looks like
const defaultStateSetting: MicrochipState = {
  rootComponent: 3,
  componentRegistry: new Map([
    [0, { nInputs: 2, nOutputs: 1, state: "and", style: {} }],
    [1, { nInputs: 2, nOutputs: 1, state: "nand", style: {} }],
    [2, { nInputs: 2, nOutputs: 1, state: "or", style: {} }],
    [
      3,
      {
        nInputs: 2,
        nOutputs: 1,
        state: {
          components: [1, 2, 0],
          connections: [
            {
              source: { component: "input", pin: 0 },
              destination: { component: 0, pin: 0 },
            },
            {
              source: { component: "input", pin: 1 },
              destination: { component: 0, pin: 1 },
            },
            {
              source: { component: "input", pin: 0 },
              destination: { component: 1, pin: 0 },
            },
            {
              source: { component: "input", pin: 1 },
              destination: { component: 1, pin: 1 },
            },
            {
              source: { component: 0, pin: 0 },
              destination: { component: 2, pin: 0 },
            },
            {
              source: { component: 1, pin: 0 },
              destination: { component: 2, pin: 1 },
            },
            {
              source: { component: 2, pin: 0 },
              destination: { component: "output", pin: 0 },
            },
          ],
        },
        style: {},
      },
    ],
  ]),
};
