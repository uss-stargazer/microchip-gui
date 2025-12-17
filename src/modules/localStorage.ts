export function createLocalStorageEntry(data: any): string {
  const entryReducer = (key: string, value: any): any => {
    if (value === null) {
      return {
        dataType: "null",
        data: "null",
      };
    } else if (typeof value === "undefined") {
      return {
        dataType: "undefined",
        data: "undefined",
      };
    } else if (typeof value === "number") {
      return {
        dataType: "number",
        data: value.toString(),
      };
    } else if (typeof value === "boolean") {
      return {
        dataType: "boolean",
        data: String(value),
      };
    } else if (typeof value === "function") {
      return {
        dataType: "function",
        data: (value as Function).toString(),
      };
    } else if (value instanceof Map) {
      return {
        dataType: "Map",
        data: [...value.entries()],
      };
    } else if (value instanceof Set) {
      return {
        dataType: "Set",
        data: [...value.values()],
      };
    } else {
      return value; // Assumed to be a string or object
    }
  };

  return JSON.stringify(data, entryReducer);
}

export function parseLocalStorageEntry(
  data: string,
  expectedType?: string
): any {
  const entryReviver = (key: string, value: any) => {
    if (value.dataType) {
      if (typeof value.dataType !== "string") {
        throw new Error("Invalid localStorage entry during parsing");
      }

      switch (value.dataType) {
        case "null":
          return null;
        case "undefined":
          if (value.data !== "undefined" && value.data !== undefined)
            throw new Error(
              "Invalid undefined localStorage entry during parsing"
            );

          return undefined;
        case "object":
          return value.data;
        case "boolean":
          return Boolean(value.data);
        case "number":
          return Number(value.data);
        case "bigint":
          return BigInt(value.data);
        case "string":
          return String(value.data);
        case "symbol":
          return Symbol(value.data);
        case "function":
          return Function(value.data);
        case "Map":
          return new Map(value.data);
        case "Set":
          return new Set(value.data);
      }
    } else {
      return value;
    }
  };

  const parsedData = JSON.parse(data, entryReviver);

  if (expectedType && typeof parsedData !== expectedType) {
    throw new Error(
      `Invalid dataType of parsed localStorage entry: expected ${expectedType}`
    );
  }

  return parsedData;
}
