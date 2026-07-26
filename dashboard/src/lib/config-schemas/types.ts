export type FieldType =
  | "text"
  | "textarea"
  | "boolean"
  | "number"
  | "color"
  | "emoji"
  | "select"
  | "discordId"
  | "discordChannel"
  | "discordRole"
  | "discordCategory"
  | "secret"
  | "stringList"
  | "googleFont";

export interface ConfigField {
  path: string;
  label: string;
  type: FieldType;
  description?: string;
  options?: { value: string; label: string }[];
  placeholder?: string;
}

export interface ConfigSection {
  title: string;
  description?: string;
  fields: ConfigField[];
}

export type ConfigSchema = ConfigSection[];
