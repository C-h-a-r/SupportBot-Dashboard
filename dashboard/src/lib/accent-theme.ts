import { isValidHex, normalizeHex } from "@/lib/normalize-hex";

export const ACCENT_STORAGE_KEY = "supportbot-dashboard-accent";
export const DEFAULT_ACCENT_HEX = "#45b46c";

const CSS_VARS = [
  "--primary",
  "--ring",
  "--chart-1",
  "--sidebar-primary",
  "--sidebar-ring",
  "--accent",
  "--accent-foreground",
  "--sidebar-accent",
  "--sidebar-accent-foreground",
] as const;

export function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const normalized = normalizeHex(hex, DEFAULT_ACCENT_HEX);
  const r = parseInt(normalized.slice(1, 3), 16) / 255;
  const g = parseInt(normalized.slice(3, 5), 16) / 255;
  const b = parseInt(normalized.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      default:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

function hsl(h: number, s: number, l: number): string {
  return `${h} ${s}% ${l}%`;
}

/** Apply accent colour to dashboard CSS variables (replaces default purple). */
export function applyAccentTheme(hex: string): string {
  const normalized = normalizeHex(hex, DEFAULT_ACCENT_HEX);
  const { h, s, l } = hexToHsl(normalized);
  const root = document.documentElement;

  const primaryS = Math.min(Math.max(s, 45), 85);
  const primaryL = Math.min(Math.max(l, 42), 62);

  root.style.setProperty("--primary", hsl(h, primaryS, primaryL));
  root.style.setProperty("--ring", hsl(h, primaryS, primaryL));
  root.style.setProperty("--chart-1", hsl(h, primaryS, primaryL));
  root.style.setProperty("--sidebar-primary", hsl(h, primaryS, primaryL));
  root.style.setProperty("--sidebar-ring", hsl(h, primaryS, primaryL));
  root.style.setProperty("--primary-foreground", "0 0% 100%");
  root.style.setProperty("--sidebar-primary-foreground", "0 0% 100%");

  root.style.setProperty("--accent", hsl(h, Math.round(primaryS * 0.64), 18));
  root.style.setProperty(
    "--accent-foreground",
    hsl(h, Math.min(Math.round(primaryS * 1.15), 90), 78),
  );
  root.style.setProperty("--sidebar-accent", hsl(h, Math.round(primaryS * 0.57), 14));
  root.style.setProperty(
    "--sidebar-accent-foreground",
    hsl(h, Math.min(Math.round(primaryS * 1.07), 88), 82),
  );

  return normalized;
}

export function clearAccentTheme(): void {
  for (const name of CSS_VARS) {
    document.documentElement.style.removeProperty(name);
  }
  document.documentElement.style.removeProperty("--primary-foreground");
  document.documentElement.style.removeProperty("--sidebar-primary-foreground");
}

export function getStoredAccentHex(): string | null {
  try {
    const raw = localStorage.getItem(ACCENT_STORAGE_KEY);
    if (!raw || !isValidHex(raw)) return null;
    return normalizeHex(raw);
  } catch {
    return null;
  }
}

export function saveAccentTheme(hex: string): string {
  const normalized = applyAccentTheme(hex);
  try {
    localStorage.setItem(ACCENT_STORAGE_KEY, normalized);
  } catch {
    /* ignore quota */
  }
  return normalized;
}

export function resetAccentTheme(): void {
  try {
    localStorage.removeItem(ACCENT_STORAGE_KEY);
  } catch {
    /* ignore */
  }
  clearAccentTheme();
}

export function initAccentTheme(): void {
  const stored = getStoredAccentHex();
  if (stored) applyAccentTheme(stored);
}
