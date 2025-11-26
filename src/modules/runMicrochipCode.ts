import * as ts from "typescript";

// Until I find a better way to run user inputted Javascript in the browser,
// these need to be here to provide the imports for the editor.
import { type MicrochipState, Microchip } from "microchip-dsl";
import { type Signal, nullSignal, copySignal } from "microchip-dsl/signal";

// Firefox and maybe other browser don't show update function names in
// error stack trace, which breaks the way microchip-dsl runs. (THIS NEEDS TO BE FIXED!!)
function runMicrochipCode(code: string): {
  state: MicrochipState | null;
  errorMessage: string | null;
} {
  let microchipState: MicrochipState | null = null;
  let errorMessage: string | null = null;
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
    errorMessage = null;
  } catch (error) {
    errorMessage = String(error);
    microchipState = null;
  }

  return { state: microchipState, errorMessage: errorMessage };
}

export default runMicrochipCode;
