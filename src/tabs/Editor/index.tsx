import useSettings from "../../hooks/useSettings";
import TabLayout from "../../components/TabLayout";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";

import { useEffect, useReducer, useRef } from "react";

import MonacoEditor from "@monaco-editor/react";
import { Box, Button } from "@mui/material";
import StatusDropdown from "./components/StatusDropdown";
import { setReadOnlyLines, setupMonaco } from "./modules/monacoUtils";

function wrapEditorContents(editorContents: string): string {
  return `import { Microchip, type Signal, nullSignal, copySignal } from "microchip-dsl";

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
  const [, forceRerender] = useReducer((x) => x + 1, 0);

  const [settings, setSettings] = useSettings();
  const { editor: editorContents, errorMessage } = settings;

  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor>(null);

  const handleEditorMount = (editor: monaco.editor.IStandaloneCodeEditor) => {
    editorRef.current = editor;
    editorRef.current.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS,
      saveEditor
    );
    setReadOnlyLines(editorRef.current, editorContentWrapperLines);
  };

  const saveEditor = () => {
    if (editorRef.current) {
      const code = unwrapEditorContents(editorRef.current.getValue());
      setSettings("editor", code);
    }
  };

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.setValue(wrapEditorContents(editorContents));
    }
  });

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
        <Button
          onClick={() => {
            setSettings("editor", undefined);
            forceRerender();
          }}
        >
          Reset
        </Button>
      </Box>
      <MonacoEditor
        height="100%"
        width="100%"
        defaultLanguage="typescript"
        defaultValue={wrapEditorContents(editorContents)}
        beforeMount={setupMonaco}
        onMount={handleEditorMount}
        theme="microchip-gui"
      />
    </TabLayout>
  );
}

export default Editor;
