import type { SettingsContextStructure } from "../hooks/useSettings";
import { XOR as xorEditorContents } from "../assets/sampleEditorContents";
import runMicrochipCode from "./runMicrochipCode";

const { state: xorMicrochipState, errorMessage } =
  runMicrochipCode(xorEditorContents);

if (xorMicrochipState === undefined || errorMessage) {
  throw new Error(
    `Could not compile default XOR editor contents so default settings are not valid! (${errorMessage})`
  );
}

const editorContentsHeader = `
// Edit the code between the two //------- marks to create your own or select
// another sample from the above dropdown. 
 
// Docs: https://github.com/uss-stargazer/microchip-dsl/docs (DOESN'T WORK!)
`;

const defaultSettingStruct: Readonly<SettingsContextStructure> = {
  settings: {
    state: xorMicrochipState,
    editor: editorContentsHeader + xorEditorContents,
    errorMessage: undefined,
    preferences: {
      defaultComponentColor: "orange",
    },
    graphics: {
      groupWiresIntoCables: true,
      reoptimizeLayoutOnChipOpen: true,
      chipPadding: 10,
    },
    openSubcomponentIds: [],
  },
  setSettings: () => {
    throw new Error(
      "Settings has not been initialized yet (needs to be child of SettingsProvider)"
    );
  },
};

export default defaultSettingStruct;
