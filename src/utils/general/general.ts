const wait = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const removeTrailingComma = (str: string): string => {
  if (str.trim().endsWith(",")) {
    return str.slice(0, -1);
  }
  return str;
};

export { wait, removeTrailingComma };
