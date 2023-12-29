import * as fs from "fs";

const getLocalVariableValue = (variableName: string): string | undefined => {
  const fileContent = fs.readFileSync("./.env.local", "utf-8");
  const lines = fileContent.split("\n");

  for (const line of lines) {
    const [name, value] = line.split("=");
    if (name.trim() === variableName) {
      return value.trim().replace(/["']/g, ""); // Remove quotes from the value
    }
  }

  return undefined; // Variable not found
};

export { getLocalVariableValue };
