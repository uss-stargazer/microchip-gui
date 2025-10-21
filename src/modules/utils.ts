export function inBrowser(): Boolean {
  return typeof window !== "undefined";
}

export function createLocalStorageEntry(data: any): string {
  return JSON.stringify({
    dataType: data === null ? "null" : typeof data,
    data: typeof data === "function" ? (data as Function).toString() : data,
  });
}

export function parseLocalStorageEntry(
  data: string,
  expectedType?: string
): any {
  const parsedDataStruct = JSON.parse(data);

  if (
    typeof parsedDataStruct.dataType !== "string" ||
    (parsedDataStruct.dataType !== "undefined" &&
      parsedDataStruct.data === undefined)
  ) {
    throw new Error("Invalid localStorage entry during parsing");
  }

  if (expectedType && parsedDataStruct.dataType !== expectedType) {
    throw new Error(
      `Invalid dataType of parsed localStorage entry: expected ${expectedType}`
    );
  }

  switch (parsedDataStruct.dataType) {
    case "null":
      return null;
    case "undefined":
      return undefined;
    case "object":
      return parsedDataStruct.data;
    case "boolean":
      return Boolean(parsedDataStruct.data);
    case "number":
      return Number(parsedDataStruct.data);
    case "bigint":
      return BigInt(parsedDataStruct.data);
    case "string":
      return String(parsedDataStruct.data);
    case "symbol":
      return Symbol(parsedDataStruct.data);
    case "function":
      return Function(parsedDataStruct);
  }
}
