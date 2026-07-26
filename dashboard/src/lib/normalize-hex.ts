/** Normalize user/config colour strings to #rrggbb (lowercase). */
export function normalizeHex(value: string, fallback = "#000000"): string {
  let s = String(value ?? "").trim();
  if (!s) return fallback;
  if (!s.startsWith("#")) s = `#${s}`;
  const hex = s.slice(1);
  if (/^[0-9a-fA-F]{3}$/.test(hex)) {
    return `#${hex
      .split("")
      .map((c) => c + c)
      .join("")
      .toLowerCase()}`;
  }
  if (/^[0-9a-fA-F]{6}$/.test(hex)) {
    return `#${hex.toLowerCase()}`;
  }
  return fallback;
}

export function isValidHex(value: string): boolean {
  const s = String(value ?? "").trim();
  return /^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/.test(s) || /^[0-9a-fA-F]{6}$/.test(s);
}
