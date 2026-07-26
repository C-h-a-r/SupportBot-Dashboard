import { forwardRef, useMemo, useState } from "react";
import { HexColorPicker } from "react-colorful";
import { cn } from "@/lib/utils";
import { isValidHex, normalizeHex } from "@/lib/normalize-hex";
import { useForwardedRef } from "@/hooks/use-forwarded-ref";
import type { ButtonProps } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

interface ColorPickerProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
}

const ColorPicker = forwardRef<
  HTMLInputElement,
  Omit<ButtonProps, "value" | "onChange" | "onBlur"> & ColorPickerProps
>(
  (
    { disabled, value, onChange, onBlur, name, className, size, ...props },
    forwardedRef,
  ) => {
    const ref = useForwardedRef(forwardedRef);
    const [open, setOpen] = useState(false);
    const [draft, setDraft] = useState("");

    const parsedValue = useMemo(
      () => normalizeHex(value, "#ffffff"),
      [value],
    );

    const displayHex = open && draft ? draft : parsedValue;

    function commitHex(raw: string) {
      if (isValidHex(raw)) {
        onChange(normalizeHex(raw));
      }
      setDraft("");
    }

    return (
      <Popover
        open={open}
        onOpenChange={(next) => {
          if (!next) commitHex(draft || parsedValue);
          setOpen(next);
        }}
      >
        <PopoverTrigger asChild disabled={disabled} onBlur={onBlur}>
          <Button
            {...props}
            type="button"
            className={cn(
              "size-10 shrink-0 overflow-hidden rounded-md border border-border p-0 shadow-sm",
              className,
            )}
            name={name}
            onClick={() => setOpen(true)}
            size={size ?? "icon"}
            style={{ backgroundColor: parsedValue }}
            variant="outline"
            aria-label="Pick colour"
          >
            <span className="sr-only">{parsedValue}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto border-border bg-card p-3"
          align="start"
        >
          <HexColorPicker
            className="color-picker-swatch"
            color={parsedValue}
            onChange={(hex) => {
              setDraft("");
              onChange(normalizeHex(hex));
            }}
          />
          <Input
            ref={ref}
            maxLength={7}
            value={displayHex}
            onChange={(e) => {
              const v = e.currentTarget.value;
              setDraft(v);
              if (isValidHex(v)) {
                onChange(normalizeHex(v));
              }
            }}
            onBlur={() => commitHex(draft || parsedValue)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                commitHex(draft || parsedValue);
                setOpen(false);
              }
            }}
            className="mt-3 border-border bg-secondary/30 font-mono text-sm uppercase"
            placeholder="#000000"
          />
        </PopoverContent>
      </Popover>
    );
  },
);
ColorPicker.displayName = "ColorPicker";

export { ColorPicker };
