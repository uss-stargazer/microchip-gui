import {
  createContext,
  useContext,
  useEffect,
  useState,
  type Dispatch,
  type PropsWithChildren,
  type SetStateAction,
} from "react";
import {
  createLocalStorageEntry,
  parseLocalStorageEntry,
} from "../modules/utils";
import { type MicrochipState, Microchip } from "microchip-dsl";
import { type Signal, nullSignal, copySignal } from "microchip-dsl/signal";
import * as ts from "typescript";

export interface Settings {
  state: MicrochipState | null;
  editor: string | null;
  errorMessage: string | null;
  style: {};
}

export interface SettingsContextStructure {
  settings: Settings;
  setSettings: <T extends keyof Settings>(
    setting: T,
    newValue: Settings[T]
  ) => void;
}

const defaultSettingsStruct: SettingsContextStructure = {
  settings: {
    state: null,
    editor: null,
    errorMessage: null,
    style: {},
  },
  setSettings: () => {
    throw new Error(
      "Settings has not been initialized yet (needs to be child of SettingsProvider)"
    );
  },
};

export const SettingsContext = createContext<SettingsContextStructure>(
  defaultSettingsStruct
);

export function SettingsProvider({ children }: PropsWithChildren) {
  // --- Helper functions

  const getFromLocalStorage = (key: string): any | null => {
    const valueString = localStorage.getItem(key);
    return valueString ? parseLocalStorageEntry(valueString) : null;
  };

  // --- For each setting in settings: Create state and read from / create localStorage entrie

  const settings: Settings = defaultSettingsStruct.settings;
  const setSettingsFunctions: Map<
    keyof Settings,
    Dispatch<SetStateAction<any>>
  > = new Map();

  const processSetting = <T extends keyof Settings>(setting: T): void => {
    const storedValue = getFromLocalStorage(setting);
    const [value, setValue] = useState<Settings[T]>(
      storedValue
        ? (storedValue as Settings[T])
        : defaultSettingsStruct.settings[setting]
    );

    useEffect(() => {
      const valueString = createLocalStorageEntry(value);
      if (valueString !== localStorage.getItem(setting)) {
        localStorage.setItem(setting, valueString);
      }
    }, [value]);

    setSettingsFunctions.set(setting, (vaule) => {
      setValue(vaule);
    });
    settings[setting] = value;
  };

  Object.keys(settings).forEach((key) => processSetting(key as keyof Settings));

  // --- Resulting values

  const setSettings: SettingsContextStructure["setSettings"] = (
    setting,
    newValue
  ) => {
    setSettingsFunctions.get(setting)!(newValue);
  };
  const settingsContextStruct: SettingsContextStructure = {
    settings: settings,
    setSettings: setSettings,
  };

  // --- Extra useEffects on setting changes

  // On editor content change
  useEffect(() => {
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
                
                ${settings.editor}
          
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
          setSettings("errorMessage", null);
        } catch (error) {
          setSettings("errorMessage", String(error));
          microchipState = null;
        }
        return microchipState;
      })();

    setSettings("state", microchipState);
  }, [settings.editor]);

  return (
    <SettingsContext value={settingsContextStruct}>{children}</SettingsContext>
  );
}

function useSettings(): [
  SettingsContextStructure["settings"],
  SettingsContextStructure["setSettings"]
] {
  const { settings, setSettings } = useContext(SettingsContext);
  console.log("got settings from context:", settings.editor);
  return [settings, setSettings];
}

export default useSettings;
