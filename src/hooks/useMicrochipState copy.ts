import type { MicrochipState } from "microchip-dsl";
import {
  microchipStateFromJsonStr,
  microchipStateToJsonStr,
} from "microchip-dsl/json";
import { useEffect, useState } from "react";

async function fetchStateJson(): Promise<string> {
  try {
    console.log("fetchStateJson: fetching state.json");
    const response = await fetch("/config/state.json");
    const contentType = response.headers.get("content-type");
    if (!response.ok || !contentType) {
      throw new Error("Trouable finding/getting the state file");
    }
    return await response.text();
  } catch (error) {
    console.log("fetchStateJson:", error);
    return ""; // Don't care if I can't find it, its optional
  }
}

/**
 * @returns Microchip state (null if doesn't exist yet), function for setting state, and jsonIsInvalid which is true if state.json exists but is invalid
 */
function useMicrochipState(): {
  microchipState: MicrochipState | null;
  setMicrochipState: (newMicrochipState: MicrochipState) => void;
  status: "loading" | "invalid json" | "done";
} {
  const [rawState, setRawState] = useState<string | null>(null);
  const [status, setStatus] = useState<"loading" | "invalid json" | "done">(
    "loading"
  );

  useEffect(() => {
    // Need to make safer with aborting, cleanups, and a timeout

    console.log("starting useEffect");

    const getMicrochipState = async () => {
      let currentRawState: string | null =
        localStorage.getItem("microchipState");

      if (!currentRawState || status === "invalid json") {
        currentRawState = await fetchStateJson();
        console.log("got it from json:", currentRawState);
        if (currentRawState !== rawState) {
          localStorage.setItem("microchipState", currentRawState);
          setRawState(currentRawState);
        } else {
          return;
        }
      } else if (currentRawState !== rawState) {
        console.log(
          "got updated microchip state from browser storage:",
          currentRawState
        );
        setRawState(currentRawState);
      }
      setStatus("done");
      console.log("getMicrochipState done");
    };

    getMicrochipState();
    console.log("useEffect done");
  }, [rawState]);

  console.log("raw state:", rawState);

  let microchipState: MicrochipState | null = null;
  if (rawState) {
    try {
      microchipState = microchipStateFromJsonStr(rawState);
    } catch (error) {
      console.log("parsing error:", error);
      if (status !== "invalid json") setStatus("invalid json");
      microchipState = null;
    }
  }

  console.log(status);

  return {
    microchipState: microchipState,
    setMicrochipState: (newMicrochipState: MicrochipState): void => {
      const newRawState = microchipStateToJsonStr(newMicrochipState);
      if (newRawState !== rawState) {
        localStorage.setItem("microchipState", newRawState);
        setRawState(newRawState);
      }
    },
    status: status,
  };
}

export default useMicrochipState;
