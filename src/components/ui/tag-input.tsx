import * as React from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// --- Types ---
interface TagInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  colorScheme?: "emerald" | "violet" | "blue" | "default";
  hasError?: boolean;
}

interface TagListProps {
  tags: string[] | string | null | undefined;
  colorScheme?: "emerald" | "violet" | "blue" | "default";
  emptyText?: string;
}

// --- Helpers ---
const getColorClasses = (scheme: string = "default") => {
  switch (scheme) {
    case "emerald":
      return "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20";
    case "violet":
      return "bg-violet-500/10 text-violet-500 hover:bg-violet-500/20";
    case "blue":
      return "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20";
    default:
      return "bg-primary/10 text-primary hover:bg-primary/20";
  }
};

const parseTags = (tags: string[] | string | null | undefined): string[] => {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags;
  try {
    const parsed = JSON.parse(tags);
    if (Array.isArray(parsed)) return parsed.map(String);
  } catch (e) {
    // If it's a comma-separated string
    if (typeof tags === "string") return tags.split(",").map((s) => s.trim()).filter(Boolean);
  }
  return [];
};

// --- Components ---

export function TagInput({ value, onChange, placeholder, colorScheme, hasError }: TagInputProps) {
  const [inputValue, setInputValue] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);
  
  const tags = parseTags(value);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    } else if (e.key === "Backspace" && inputValue === "" && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  const addTag = () => {
    const trimmed = inputValue.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
      setInputValue("");
    }
  };

  const removeTag = (index: number) => {
    const newTags = [...tags];
    newTags.splice(index, 1);
    onChange(newTags);
  };

  const colorClasses = getColorClasses(colorScheme);

  return (
    <div className="w-full">
      <div 
        className={cn(
          "flex flex-wrap gap-2 p-2 border rounded-xl bg-background transition-all cursor-text min-h-[44px]",
          hasError 
            ? "border-red-500 ring-1 ring-red-500" 
            : "border-border focus-within:ring-1 focus-within:ring-primary focus-within:border-primary"
        )}
        onClick={() => inputRef.current?.focus()}
      >
        {tags.map((tag, i) => (
          <Badge 
            key={i} 
            variant="outline" 
            className={cn("gap-1 pr-1 border-none flex items-center h-7 font-semibold text-xs", colorClasses)}
          >
            {tag}
            <button
              type="button"
              className="w-4 h-4 ml-1 rounded-full flex items-center justify-center hover:bg-foreground/10 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                removeTag(i);
              }}
            >
              <X className="w-3 h-3" />
            </button>
          </Badge>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={addTag}
          className="flex-1 min-w-[120px] bg-transparent outline-none text-sm placeholder:text-muted-foreground/60 focus:ring-0 max-w-full"
          placeholder={tags.length === 0 ? placeholder : ""}
        />
      </div>
    </div>
  );
}

export function TagList({ tags, colorScheme, emptyText = "No tags added" }: TagListProps) {
  const parsedTags = parseTags(tags);
  const colorClasses = getColorClasses(colorScheme);

  if (parsedTags.length === 0) {
    return (
      <p className="text-xs font-medium text-muted-foreground/60 italic">
        {emptyText}
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {parsedTags.map((tag, i) => (
        <Badge 
          key={i} 
          variant="outline" 
          className={cn("border-none px-2.5 py-1 text-xs font-semibold shadow-sm", colorClasses)}
        >
          {tag}
        </Badge>
      ))}
    </div>
  );
}
