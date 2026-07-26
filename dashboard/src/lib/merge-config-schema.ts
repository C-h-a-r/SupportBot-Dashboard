import type { ConfigField, ConfigSchema } from "@/lib/config-schemas";
import { collectConfigFields } from "@/lib/generic-config-schema";

function labelFromTopKey(key: string): string {
  return key
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Adds any leaf paths from `data` that are not already in `schema`. */
export function mergeSchemaWithData(
  schema: ConfigSchema,
  data: Record<string, unknown>,
): ConfigSchema {
  const known = new Set(schema.flatMap((s) => s.fields.map((f) => f.path)));
  const discovered = collectConfigFields(data).filter((f) => !known.has(f.path));

  if (discovered.length === 0) return schema;

  const byTop = new Map<string, ConfigField[]>();
  for (const field of discovered) {
    const top = field.path.split(".")[0] ?? "Other";
    const list = byTop.get(top) ?? [];
    list.push(field);
    byTop.set(top, list);
  }

  const extraSections = [...byTop.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([top, fields]) => ({
      title: labelFromTopKey(top),
      description:
        "These options exist in your config file but are not in the main editor sections.",
      fields: fields.sort((a, b) => a.path.localeCompare(b.path)),
    }));

  return [...schema, ...extraSections];
}
