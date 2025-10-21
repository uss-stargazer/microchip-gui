import {
  createContext,
  useContext,
  useEffect,
  useState,
  type Dispatch,
  type PropsWithChildren,
  type SetStateAction,
} from "react";
import type { MicrochipState } from "microchip-dsl";
import {
  createLocalStorageEntry,
  parseLocalStorageEntry,
} from "../modules/utils";

export interface Settings {
  state: MicrochipState | null;
  editor: string | null;
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
  const getFromLocalStorage = (key: string): any | null => {
    const valueString = localStorage.getItem(key);
    return valueString ? parseLocalStorageEntry(valueString) : null;
  };

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

  const setSettings: SettingsContextStructure["setSettings"] = (
    setting,
    newValue
  ) => {
    setSettingsFunctions.get(setting)!(newValue);
  };

  return (
    <SettingsContext value={{ settings: settings, setSettings: setSettings }}>
      {children}
    </SettingsContext>
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
