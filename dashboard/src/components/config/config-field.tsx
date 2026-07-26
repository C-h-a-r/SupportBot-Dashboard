import type { ConfigField } from "@/lib/config-schemas";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ColorPicker } from "@/components/ui/color-picker";
import { normalizeHex } from "@/lib/normalize-hex";
import { StringListEditor } from "./string-list-editor";
import { GoogleFontPicker } from "./google-font-picker";
import {
  DiscordResourcePicker,
  type DiscordResourceKind,
} from "./discord-resource-picker";
import { EmojiPicker } from "./emoji-picker";

const SECRET_PLACEHOLDER = "BOT_TOKEN";
const AI_KEY_PLACEHOLDER = "MODEL_API_KEY";

interface ConfigFieldInputProps {
  field: ConfigField;
  value: unknown;
  onChange: (value: unknown) => void;
  readOnly?: boolean;
}

export function ConfigFieldInput({
  field,
  value,
  onChange,
  readOnly,
}: ConfigFieldInputProps) {
  const id = field.path.replace(/\./g, "-");

  if (field.type === "googleFont") {
    return (
      <GoogleFontPicker
        field={field}
        value={value}
        onChange={onChange}
        readOnly={readOnly}
      />
    );
  }

  if (field.type === "boolean") {
    return (
      <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-secondary/20 px-3 py-2.5">
        <div>
          <Label htmlFor={id} className="font-medium">
            {field.label}
          </Label>
          {field.description ? (
            <p className="text-xs text-muted-foreground">{field.description}</p>
          ) : null}
        </div>
        <Switch
          id={id}
          checked={Boolean(value)}
          disabled={readOnly}
          onCheckedChange={onChange}
        />
      </div>
    );
  }

  if (field.type === "stringList") {
    return (
      <div className="space-y-2">
        <Label>{field.label}</Label>
        {field.description ? (
          <p className="text-xs text-muted-foreground">{field.description}</p>
        ) : null}
        <StringListEditor
          value={Array.isArray(value) ? (value as string[]) : []}
          onChange={onChange}
        />
      </div>
    );
  }

  if (field.type === "select" && field.options) {
    return (
      <div className="space-y-2">
        <Label htmlFor={id}>{field.label}</Label>
        <Select
          value={String(value ?? "")}
          disabled={readOnly}
          onValueChange={onChange}
        >
          <SelectTrigger id={id} className="border-border bg-secondary/30">
            <SelectValue placeholder="Select…" />
          </SelectTrigger>
          <SelectContent>
            {field.options.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  if (field.type === "color") {
    const hex = normalizeHex(String(value ?? "#000000"));
    return (
      <div className="space-y-2">
        <Label htmlFor={id}>{field.label}</Label>
        {field.description ? (
          <p className="text-xs text-muted-foreground">{field.description}</p>
        ) : null}
        <div className="flex gap-2">
          <ColorPicker value={hex} onChange={onChange} />
          <Input
            id={id}
            value={hex}
            disabled={readOnly}
            onChange={(e) => onChange(e.target.value)}
            onBlur={(e) => onChange(normalizeHex(e.target.value, hex))}
            className="border-border bg-secondary/30 font-mono uppercase"
            placeholder="#000000"
            maxLength={7}
          />
        </div>
      </div>
    );
  }

  if (field.type === "emoji") {
    return (
      <EmojiPicker
        id={id}
        label={field.label}
        description={field.description}
        value={value}
        onChange={onChange}
        readOnly={readOnly}
      />
    );
  }

  if (
    field.type === "discordChannel" ||
    field.type === "discordRole" ||
    field.type === "discordCategory"
  ) {
    const kind: DiscordResourceKind =
      field.type === "discordRole"
        ? "role"
        : field.type === "discordCategory"
          ? "category"
          : "channel";

    return (
      <DiscordResourcePicker
        id={id}
        label={field.label}
        description={field.description}
        kind={kind}
        value={value}
        onChange={onChange}
        readOnly={readOnly}
      />
    );
  }

  if (field.type === "secret") {
    const display =
      value === SECRET_PLACEHOLDER ||
      value === AI_KEY_PLACEHOLDER ||
      !value
        ? ""
        : "••••••••••••";
    return (
      <div className="space-y-2">
        <Label htmlFor={id}>{field.label}</Label>
        {field.description ? (
          <p className="text-xs text-muted-foreground">{field.description}</p>
        ) : null}
        <Input
          id={id}
          type="password"
          value={display}
          disabled={readOnly}
          placeholder={field.placeholder ?? "Unchanged if empty"}
          onChange={(e) => {
            const v = e.target.value;
            if (v) onChange(v);
            else onChange(field.placeholder ?? SECRET_PLACEHOLDER);
          }}
          className="border-border bg-secondary/30"
        />
      </div>
    );
  }

  const sharedClass = "border-border bg-secondary/30";

  if (field.type === "textarea") {
    return (
      <div className="space-y-2">
        <Label htmlFor={id}>{field.label}</Label>
        <Textarea
          id={id}
          value={String(value ?? "")}
          disabled={readOnly}
          onChange={(e) => onChange(e.target.value)}
          className={`min-h-[88px] ${sharedClass}`}
        />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{field.label}</Label>
      {field.description ? (
        <p className="text-xs text-muted-foreground">{field.description}</p>
      ) : null}
      <Input
        id={id}
        type={field.type === "number" ? "number" : "text"}
        value={value === undefined || value === null ? "" : String(value)}
        disabled={readOnly}
        onChange={(e) =>
          onChange(
            field.type === "number"
              ? Number(e.target.value)
              : e.target.value,
          )
        }
        placeholder={
          field.placeholder ??
          (field.type === "discordId" ? "Discord snowflake ID" : undefined)
        }
        className={sharedClass}
      />
    </div>
  );
}
