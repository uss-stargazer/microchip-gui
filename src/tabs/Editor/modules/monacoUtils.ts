import { convert } from "colorizr";
import { theme } from "../../../App";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import type { Monaco } from "@monaco-editor/react";
import microchipDslLibraryAsString from "./microchipDslLibraryAsString";

export async function setupMonaco(monaco: Monaco) {
  monaco.editor.defineTheme("microchip-gui", {
    base: "vs-dark",
    inherit: true,
    rules: [],
    colors: {
      "editor.background": convert(theme.palette.background.paper, "hex"),
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

export function setReadOnlyLines(
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
