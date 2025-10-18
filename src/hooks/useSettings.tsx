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

export interface Settings {
  state: MicrochipState | null;
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
  const getFromLocalStorage = (key: string): Object | null => {
    const valueString = localStorage.getItem(key);
    return valueString ? JSON.stringify(valueString) : null;
  };

  const settings: Settings = defaultSettingsStruct.settings;
  const setSettingsFunctions: Map<
    keyof Settings,
    Dispatch<SetStateAction<any>>
  > = new Map();

  const processSetting = <T extends keyof Settings>(setting: T): void => {
    const [value, setValue] = useState<Settings[T]>(
      (getFromLocalStorage(setting) ||
        defaultSettingsStruct.settings[setting]) as Settings[T]
    );

    useEffect(() => {
      const valueString = JSON.stringify(value);
      if (valueString !== localStorage.getItem(setting)) {
        localStorage.setItem(setting, valueString);
      }
    }, [value]);

    setSettingsFunctions.set(setting, setValue);
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
  return [settings, setSettings];
}

export default useSettings;
