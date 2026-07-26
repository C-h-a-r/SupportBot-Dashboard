/** Discord custom emoji mention: <:name:id> or <a:name:id> */
const CUSTOM_EMOJI_RE = /^<(a?):([^:>]+):(\d{17,20})>$/;

export interface GuildEmojiOption {
  id: string;
  name: string;
  animated: boolean;
  url: string | null;
}

export interface ParsedEmoji {
  kind: "unicode" | "custom" | "empty";
  /** Value stored in YAML */
  value: string;
  name?: string;
  id?: string;
  animated?: boolean;
}

export function formatCustomEmoji(
  name: string,
  id: string,
  animated = false,
): string {
  const prefix = animated ? "<a" : "<";
  return `${prefix}:${name}:${id}>`;
}

export function parseEmojiValue(raw: unknown): ParsedEmoji {
  const value = String(raw ?? "").trim();
  if (!value) {
    return { kind: "empty", value: "" };
  }

  const match = value.match(CUSTOM_EMOJI_RE);
  if (match) {
    return {
      kind: "custom",
      value,
      animated: match[1] === "a",
      name: match[2],
      id: match[3],
    };
  }

  return { kind: "unicode", value };
}

export function emojiCdnUrl(id: string, animated = false): string {
  return `https://cdn.discordapp.com/emojis/${id}.${animated ? "gif" : "png"}?size=64`;
}

export function resolveEmojiPreview(
  value: unknown,
  guildEmojis: GuildEmojiOption[] = [],
): ParsedEmoji {
  const parsed = parseEmojiValue(value);
  if (parsed.kind === "custom" && parsed.id && !parsed.name) {
    const found = guildEmojis.find((e) => e.id === parsed.id);
    if (found) {
      return {
        kind: "custom",
        value: formatCustomEmoji(found.name, found.id, found.animated),
        name: found.name,
        id: found.id,
        animated: found.animated,
      };
    }
  }
  if (parsed.kind === "custom" && parsed.id) {
    const found = guildEmojis.find((e) => e.id === parsed.id);
    if (found && parsed.value !== formatCustomEmoji(found.name, found.id, found.animated)) {
      return {
        kind: "custom",
        value: formatCustomEmoji(found.name, found.id, found.animated),
        name: found.name,
        id: found.id,
        animated: found.animated,
      };
    }
  }
  return parsed;
}

export function isEmojiFieldKey(key: string): boolean {
  return /emoji/i.test(key);
}
