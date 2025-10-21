import useSettings from "../../hooks/useSettings";
import { type MicrochipState, Microchip } from "microchip-dsl";
import { type Signal, nullSignal, copySignal } from "microchip-dsl/signal";
import TabLayout from "../../components/TabLayout";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";

import { useEffect, useRef, useState } from "react";
import * as ts from "typescript";

import MonacoEditor, { type Monaco } from "@monaco-editor/react";
import { convert } from "colorizr";
import { theme } from "../../App";
import { Box, Button, Typography } from "@mui/material";
import microchipDslLibraryAsString from "./modules/microchipDslLibraryAsString";
import StatusDropdown from "./components/StatusDropdown";

const sampleEditorContents = `
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

async function setupMonaco(monaco: Monaco) {
  monaco.editor.defineTheme("microchip-gui", {
    base: "vs-dark",
    inherit: true,
    rules: [],
    colors: {
      "editor.background": convert(theme.palette.background.default, "hex"),
    },
  });

  monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
    allowNonTsExtensions: true,
    noEmit: true,
    strict: true,

    // This really needs to be ES2022 (which I hope provides better type inference for e.g. gates)
    // but react-monaco-editor needs to be updated to use latest version of monaco-editor
    target: monaco.languages.typescript.ScriptTarget.ES2020,
    module: monaco.languages.typescript.ModuleKind.ESNext,
    lib: ["ES2022", "DOM"],
    moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
    allowSyntheticDefaultImports: true,
    importHelpers: true,
    alwaysStrict: true,
    sourceMap: true,
    forceConsistentCasingInFileNames: true,
    noFallthroughCasesInSwitch: true,
    noImplicitReturns: true,
    noUnusedLocals: true,
    noUnusedParameters: true,
    noImplicitAny: false,
    noImplicitThis: false,
    strictNullChecks: false,
    // declaration: true, // For some reason, this prevents loading....
  });

  monaco.languages.typescript.typescriptDefaults.addExtraLib(
    await microchipDslLibraryAsString()
  );

  monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: false,
    noSyntaxValidation: false,
    noSuggestionDiagnostics: false,
  });
}

function setReadOnlyLines(
  editor: monaco.editor.IStandaloneCodeEditor,
  lineSections: [number, number][]
) {
  editor.onDidChangeCursorPosition((e) => {
    const nLines = editor.getModel()!.getLineCount()!;
    const correctedLineSections = lineSections.map((arr) =>
      arr.map((el) => (el < 0 ? nLines + el + 1 : el))
    );
    const inReadonlySection = correctedLineSections.some(
      (lineSection) =>
        lineSection[0] <= e.position.lineNumber &&
        lineSection[1] >= e.position.lineNumber
    );

    editor.updateOptions({
      readOnly: inReadonlySection,
      readOnlyMessage: { value: "These lines are read-only." },
    });
  });
}

function wrapEditorContents(editorContents: string): string {
  return `import { Microchip, Signal, nullSignal, copySignal } from "microchip-dsl";

const microchip = new Microchip();

//-------
${editorContents}
//-------

microchip.setRootComponent(main);
export default microchip;`;
}

// See above wrapper for reason why
const editorContentWrapperLines: [number, number][] = [
  [0, 5],
  [-4, -1],
];

function unwrapEditorContents(editorContents: string): string {
  const editorLines = editorContents.split("\n");
  return editorLines
    .slice(editorContentWrapperLines[0][1], editorContentWrapperLines[1][0])
    .join("\n");
}

function Editor() {
  const [settings, setSettings] = useSettings();
  const { editor: editorContents } = settings;

  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor>(null);

  const handleEditorMount = (editor: monaco.editor.IStandaloneCodeEditor) => {
    editorRef.current = editor;
    editorRef.current.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS,
      saveEditor
    );
    setReadOnlyLines(editorRef.current, editorContentWrapperLines);
  };

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const saveEditor = () => {
    if (editorRef.current) {
      const code = unwrapEditorContents(editorRef.current.getValue());

      setSettings("editor", code);

      // Firefox and maybe other browser don't show update function names in
      // error stack trace, which breaks the way microchip-dsl runs. (THIS NEEDS TO BE FIXED!!)
      const microchipState: MicrochipState | null =
        ((): MicrochipState | null => {
          let microchipState: MicrochipState | null = null;
          try {
            eval(
              // Maybe do main.toString() to check main
              ts.transpile(`
                const microchip = new Microchip();
                
                ${code}
          
                if (
                  !microchip ||
                  !(microchip instanceof Microchip)
                )
                  throw new Error("'microchip' must be defined and an instance of 'Microchip'")
                if (
                  !main ||
                  !(typeof main === "function")
                )
                  throw new Error("'main' is the entry component; it must be defined and a function")

                microchip.setRootComponent(main);
                microchipState = microchip._getState();
              `)
            );
            setErrorMessage(null);
          } catch (error) {
            setErrorMessage(String(error));
            microchipState = null;
          }
          return microchipState; // this should only be reached if it doesn't return state
        })();

      setSettings("state", microchipState);
    }
  };

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.setValue(
        wrapEditorContents(editorContents ?? sampleEditorContents)
      );
    }
  }, [editorContents]);

  // On document ctrl-s or save button click -> call saveEditor
  return (
    <TabLayout flex="column">
      <Box
        display="flex"
        justifyContent="right"
        bgcolor="background.paper"
        sx={{
          borderBottomColor: "secondary.main",
          borderBottomWidth: "1px",
          borderBottomStyle: "solid",
        }}
      >
        <StatusDropdown errorMessage={errorMessage} />
        <Box flexGrow={1} />
        <Button onClick={saveEditor}>Save</Button>
        <Button onClick={() => setSettings("editor", null)}>Reset</Button>
      </Box>
      <MonacoEditor
        height="100%"
        width="100%"
        defaultLanguage="typescript"
        defaultValue={wrapEditorContents(
          editorContents ?? sampleEditorContents
        )}
        beforeMount={setupMonaco}
        onMount={handleEditorMount}
        theme="microchip-gui"
      />
    </TabLayout>
  );
}

export default Editor;
