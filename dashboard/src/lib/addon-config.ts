export const ADDON_CONFIG_PREFIX = "addon:";

export function addonConfigFileParam(filename: string): string {
  return `${ADDON_CONFIG_PREFIX}${filename}`;
}

export function parseConfigFileParam(
  file: string | null,
): { type: "main" | "addon"; file: string } | null {
  if (!file) return null;
  if (file.startsWith(ADDON_CONFIG_PREFIX)) {
    return {
      type: "addon",
      file: file.slice(ADDON_CONFIG_PREFIX.length),
    };
  }
  return { type: "main", file };
}

export function addonConfigLabel(filename: string): string {
  return filename
    .replace(/\.(yml|yaml|json)$/i, "")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
