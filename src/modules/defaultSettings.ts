import type { MicrochipState } from "microchip-dsl";
import type { SettingsContextStructure } from "../hooks/useSettings";

const defaultEditorSetting = `
// This is an sample circuit (a simle XOR gate). 
// Edit the code between the two //------- marks to create your own. 
 
// Docs: https://github.com/uss-stargazer/microchip-dsl/docs (DOESN'T WORK!)

const and = microchip.registerGate('and', 2, 1);
const nand = microchip.registerGate('nand', 2, 1);
const or = microchip.registerGate('or', 2, 1);

const xor = microchip.registerChipSingleOut((a: Signal, b: Signal): Signal => {
  return and(nand(a, b), or(a, b));
});

const main = xor;
`;

// TODO: Should this really be hard coded?
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
          connections: new Set([
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
          ]),
        },
        style: {},
      },
    ],
  ]),
};

const defaultSettingStruct: Readonly<SettingsContextStructure> = {
  settings: {
    state: defaultStateSetting,
    editor: defaultEditorSetting,
    errorMessage: null,
    style: {},
  },
  setSettings: () => {
    throw new Error(
      "Settings has not been initialized yet (needs to be child of SettingsProvider)"
    );
  },
};

export default defaultSettingStruct;
