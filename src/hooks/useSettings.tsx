import {
  createContext,
  useContext,
  useEffect,
  useState,
  type Dispatch,
  type PropsWithChildren,
  type SetStateAction,
} from "react";
import defaultSettingStruct from "../modules/defaultSettings";
import {
  createLocalStorageEntry,
  parseLocalStorageEntry,
} from "../modules/localStorage";
import type { MicrochipState } from "microchip-dsl";
import runMicrochipCode from "../modules/runMicrochipCode";

export interface Settings {
  state: MicrochipState;
  editor: string;
  errorMessage: string | null;
  preferences: {
    defaultComponentColor: string;
  };
  graphics: {
    groupWiresIntoCables: boolean;
    reoptimizeLayoutOnChipOpen: boolean;
    chipPadding: number;
  };
  openSubcomponentIds: string[];
}

export interface SettingsContextStructure {
  settings: Settings;
  setSettings: <T extends keyof Settings>(
    setting: T,
    newValue: Settings[T] | undefined
  ) => void;
}

export const SettingsContext =
  createContext<SettingsContextStructure>(defaultSettingStruct);

export function SettingsProvider({ children }: PropsWithChildren) {
  // --- Helper functions

  const getFromLocalStorage = (key: string): any | undefined => {
    const valueString = localStorage.getItem(key);
    return valueString ? parseLocalStorageEntry(valueString) : undefined;
  };

  // --- For each setting in settings: Create state and read from / create localStorage entry (Not the most typesafe implementation but it'll do)

  const settings: Settings = { ...defaultSettingStruct.settings }; // have to copy entries
  const setSettingsFunctions: Map<
    keyof Settings,
    Dispatch<SetStateAction<any>>
  > = new Map();

  const processSetting = <T extends keyof Settings>(setting: T): void => {
    const storedValue = getFromLocalStorage(setting);
    const [value, setValue] = useState<Settings[T]>(
      storedValue !== undefined
        ? (storedValue as Settings[T])
        : defaultSettingStruct.settings[setting]
    );

    useEffect(() => {
      const valueString = createLocalStorageEntry(value);
      if (valueString !== localStorage.getItem(setting)) {
        localStorage.setItem(setting, valueString);
      }
    }, [value]);

    setSettingsFunctions.set(setting, setValue);

    settings[setting] = value;
  };

  Object.keys(settings).forEach((key) => processSetting(key as keyof Settings));

  // --- Resulting values

  const setSettings: SettingsContextStructure["setSettings"] = (
    setting,
    newValue
  ) => {
    setSettingsFunctions.get(setting)!(
      typeof newValue === "undefined"
        ? defaultSettingStruct.settings[setting]
        : newValue
    );
  };
  const settingsContextStruct: SettingsContextStructure = {
    settings: settings,
    setSettings: setSettings,
  };

  // --- Extra useEffects on setting changes

  // On editor content change
  useEffect(() => {
    if (!settings.editor) {
      setSettings("errorMessage", null);
      setSettings("state", undefined);
      return;
    }
    const { state: microchipState, errorMessage: errorMessage } =
      runMicrochipCode(settings.editor);
    setSettings("errorMessage", errorMessage);
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
  return [settings, setSettings];
}

export default useSettings;
