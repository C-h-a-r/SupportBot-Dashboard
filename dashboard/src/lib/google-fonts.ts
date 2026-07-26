/** Curated Google Fonts (keep in sync with Structures/googleFonts.js). */

export const SYSTEM_FONT_ID = "system";

export const GOOGLE_FONTS = [
  { id: "Inter", label: "Inter" },
  { id: "Roboto", label: "Roboto" },
  { id: "Open Sans", label: "Open Sans" },
  { id: "Lato", label: "Lato" },
  { id: "Montserrat", label: "Montserrat" },
  { id: "Poppins", label: "Poppins" },
  { id: "Nunito", label: "Nunito" },
  { id: "Raleway", label: "Raleway" },
  { id: "Work Sans", label: "Work Sans" },
  { id: "Source Sans 3", label: "Source Sans 3" },
  { id: "DM Sans", label: "DM Sans" },
  { id: "Manrope", label: "Manrope" },
  { id: "Outfit", label: "Outfit" },
  { id: "Rubik", label: "Rubik" },
  { id: "Ubuntu", label: "Ubuntu" },
  { id: "Fira Sans", label: "Fira Sans" },
  { id: "PT Sans", label: "PT Sans" },
  { id: "Noto Sans", label: "Noto Sans" },
  { id: "Oswald", label: "Oswald" },
  { id: "Merriweather", label: "Merriweather" },
  { id: "Playfair Display", label: "Playfair Display" },
  { id: "Libre Baskerville", label: "Libre Baskerville" },
  { id: "JetBrains Mono", label: "JetBrains Mono" },
  { id: "Fira Code", label: "Fira Code" },
] as const;

export const GOOGLE_FONT_IDS = new Set<string>(
  GOOGLE_FONTS.map((f) => f.id),
);

export function googleFontsCssUrl(familyIds: string[]) {
  const families = familyIds
    .map((id) => {
      const encoded = encodeURIComponent(id).replace(/%20/g, "+");
      return `family=${encoded}:wght@400;600;700;800`;
    })
    .join("&");
  return `https://fonts.googleapis.com/css2?${families}&display=swap`;
}

/** Load all curated fonts in the dashboard (dropdown + preview labels). */
export function injectGoogleFontsStylesheet() {
  const id = "supportbot-google-fonts";
  if (document.getElementById(id)) return;
  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = googleFontsCssUrl(GOOGLE_FONTS.map((f) => f.id));
  document.head.appendChild(link);
}

export function normalizeGoogleFontValue(fontFamily: unknown): string {
  if (!fontFamily || typeof fontFamily !== "string") return "Inter";
  const trimmed = fontFamily.trim();
  if (trimmed === SYSTEM_FONT_ID) return SYSTEM_FONT_ID;
  if (!trimmed.includes(",")) {
    return GOOGLE_FONT_IDS.has(trimmed) ? trimmed : "Inter";
  }
  const match = trimmed.match(/^["']?([^"',]+)["']?/);
  const first = match?.[1]?.trim();
  if (first && GOOGLE_FONT_IDS.has(first)) {
    return first;
  }
  return "Inter";
}

export function fontFamilyCss(fontId: string): string {
  if (fontId === SYSTEM_FONT_ID) {
    return 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  }
  return `"${fontId}", ui-sans-serif, system-ui, sans-serif`;
}
