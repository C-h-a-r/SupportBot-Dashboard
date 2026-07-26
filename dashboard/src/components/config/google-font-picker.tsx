import { useEffect } from "react";
import type { ConfigField } from "@/lib/config-schemas";
import {
  GOOGLE_FONTS,
  SYSTEM_FONT_ID,
  fontFamilyCss,
  injectGoogleFontsStylesheet,
  normalizeGoogleFontValue,
} from "@/lib/google-fonts";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface GoogleFontPickerProps {
  field: ConfigField;
  value: unknown;
  onChange: (value: unknown) => void;
  readOnly?: boolean;
}

export function GoogleFontPicker({
  field,
  value,
  onChange,
  readOnly,
}: GoogleFontPickerProps) {
  const id = field.path.replace(/\./g, "-");
  const selected = normalizeGoogleFontValue(value);

  useEffect(() => {
    injectGoogleFontsStylesheet();
  }, []);

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{field.label}</Label>
      {field.description ? (
        <p className="text-xs text-muted-foreground">{field.description}</p>
      ) : null}
      <Select
        value={selected}
        disabled={readOnly}
        onValueChange={onChange}
      >
        <SelectTrigger
          id={id}
          className="border-border bg-secondary/30"
          style={{ fontFamily: fontFamilyCss(selected) }}
        >
          <SelectValue placeholder="Choose a font…" />
        </SelectTrigger>
        <SelectContent className="max-h-[min(320px,50vh)]">
          <SelectItem value={SYSTEM_FONT_ID} style={{ fontFamily: fontFamilyCss(SYSTEM_FONT_ID) }}>
            System default
          </SelectItem>
          {GOOGLE_FONTS.map((font) => (
            <SelectItem
              key={font.id}
              value={font.id}
              style={{ fontFamily: fontFamilyCss(font.id) }}
            >
              {font.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
