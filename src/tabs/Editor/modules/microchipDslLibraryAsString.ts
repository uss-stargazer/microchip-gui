type LibrarySubsection =
  | {
      [key: "index" | string]: LibrarySubsection;
    }
  | string;

function fileImportsToNamespaceImports(s: string): string {
  return s.replaceAll(
    /(import|export) (.+) from (?:"|')\.\/(.+)\.js(?:"|');?/g,
    (all, portType: string, imports: string, moduleName: string) => {
      if (imports.includes("*")) {
        return `/* ${all} */`;
      }

      const portModifer = portType === "export" ? "export" : "";
      if (imports.includes("{")) {
        return imports
          .replace("{", "")
          .replace("}", "")
          .split(",")
          .map((aImport) => {
            aImport = aImport.trim();
            const typeMatches = aImport.match(/type (.+)/);
            if (!typeMatches || typeMatches.length < 2) {
              return `${portModifer} const ${aImport} = ${moduleName}.${aImport};`;
            } else {
              return `${portModifer} type ${typeMatches[1]} = ${moduleName}.${typeMatches[1]};`;
            }
          })
          .join("\n");
      } else {
        const typeMatches = imports.trim().match(/type (.+)/g);
        if (!typeMatches || typeMatches.length < 2) {
          return `${portModifer} const ${imports} = ${moduleName}.default`;
        } else {
          return `${portModifer} type ${typeMatches[1]} = ${moduleName}.default`;
        }
      }
    }
  );
}

async function readLibFile(path: string, pathPrefix?: string): Promise<string> {
  const response = await fetch(pathPrefix + path);
  if (!response.ok) {
    throw new Error(
      `Expected microchip-dsl file to exist at ${pathPrefix + path}`
    );
  }
  return await response.text();
}

async function librarySubsectionAsString(
  name: string,
  subsection: LibrarySubsection,
  filePrefix: string = "",
  isRoot: boolean = false
): Promise<string> {
  // Checks
  if (
    (name === "index" && typeof subsection !== "string") ||
    (typeof subsection === "object" &&
      typeof (subsection["index"] ?? "") !== "string")
  ) {
    throw new Error("Library subsection index must be string");
  }

  // Main thing

  const header = isRoot
    ? `declare module "${name}"`
    : `export namespace ${name}`;

  return name === "index"
    ? fileImportsToNamespaceImports(
        await readLibFile(subsection as string, filePrefix)
      )
    : `${header} {
        ${(
          await Promise.all(
            Object.entries(subsection).map(
              async ([subName, subSubsection]): Promise<string> =>
                await librarySubsectionAsString(
                  subName,
                  subSubsection,
                  filePrefix
                )
            )
          )
        ).join("\n")}
      }`;
}

const libraryName = "microchip-dsl";
const libraryStructure: LibrarySubsection = {
  index: "index.d.ts",
  microchip: { index: "microchip.d.ts" },
  signal: { index: "signal.d.ts" },
  component: { index: "component.d.ts" },
  utils: { index: "utils.d.ts" },
  json: { index: "json.d.ts" },
};
const libraryPathPrefix = "/node_modules/microchip-dsl/lib/";

async function microchipDslLibraryAsString() {
  const libraryString = await librarySubsectionAsString(
    libraryName,
    libraryStructure,
    libraryPathPrefix,
    true
  );
  return libraryString.replace(
    `export namespace ${libraryName}`,
    `declare module "${libraryName}"`
  );
}

export default microchipDslLibraryAsString;
