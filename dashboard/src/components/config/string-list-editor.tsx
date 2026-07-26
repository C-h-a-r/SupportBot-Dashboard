import { Delete02Icon, PlusSignIcon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface StringListEditorProps {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
}

export function StringListEditor({
  value,
  onChange,
  placeholder = "Add item…",
}: StringListEditorProps) {
  const items = Array.isArray(value) ? value : [];

  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div key={index} className="flex gap-2">
          <Input
            value={item}
            onChange={(e) => {
              const next = [...items];
              next[index] = e.target.value;
              onChange(next);
            }}
            placeholder={placeholder}
            className="border-border bg-secondary/30"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0 text-destructive hover:bg-destructive/10"
            onClick={() => onChange(items.filter((_, i) => i !== index))}
          >
            <Icon icon={Delete02Icon} size={16} />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full border-dashed border-border"
        onClick={() => onChange([...items, ""])}
      >
        <Icon icon={PlusSignIcon} size={16} className="mr-2" />
        Add line
      </Button>
    </div>
  );
}
