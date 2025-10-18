import { Box, Input } from "@mui/material";
import { useRef } from "react";
import useSettings from "../../hooks/useSettings";

function Editor() {
  const [settings, setSettings] = useSettings();

  const editorRef = useRef(null);
  const saveEditor = () => {
    if (editorRef.current) {
      // TODO: save the editors content in the browser storage
      // TODO: compile and set microchip state
    }
  };

  // Maybe use a code library instead of input
  // On document ctrl-s or save button click -> call saveEditor
  return (
    <Box>
      <Input ref={editorRef}></Input>
    </Box>
  );
}

export default Editor;
