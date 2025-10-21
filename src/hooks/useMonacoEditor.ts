import React, { useEffect, useRef, useState } from "react";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";

function useMonacoEditor(defaultValue: string): {
  editorRef: React.RefObject<HTMLDivElement | null>;
  editor: monaco.editor.IStandaloneCodeEditor | null;
} {
  const [editor, setEditor] =
    useState<monaco.editor.IStandaloneCodeEditor | null>(null);
  const editorRef = useRef(null);

  useEffect(() => {
    console.log("use effect called");
    if (editorRef.current) {
      setEditor((editor) => {
        if (editor !== null) return editor;
        console.log("setting editor");
        return monaco.editor.create(editorRef.current!, {
          value: defaultValue,
          language: "typescript",
          theme: "microchip-gui",
          readOnly: false,
        });
      });
    }
    return () => {
      if (editor !== null) {
        console.log("disposing of editor");
        editor.dispose();
      }
    };
  }, [editorRef.current]);

  return {
    editorRef: editorRef,
    editor: editor,
  };
}

export default useMonacoEditor;
