import { useState, useRef, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface HashtagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function HashtagInput({ value, onChange, placeholder = "Type complaints and press space...", className }: HashtagInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    setIsTyping(val.length > 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      addTag();
    } else if (e.key === "Backspace" && inputValue === "" && value.length > 0) {
      removeTag(value.length - 1);
    }
  };

  const addTag = () => {
    if (inputValue.trim()) {
      let tag = inputValue.trim();
      if (!tag.startsWith("#")) {
        tag = "#" + tag;
      }
      if (!value.includes(tag)) {
        onChange([...value, tag]);
      }
      setInputValue("");
      setIsTyping(false);
    }
  };

  const removeTag = (index: number) => {
    const newTags = value.filter((_, i) => i !== index);
    onChange(newTags);
  };

  const handleTagClick = (index: number) => {
    removeTag(index);
  };

  return (
    <div
      className={cn(
        "min-h-[120px] p-4 border rounded-lg bg-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 transition-medical",
        className
      )}
      onClick={() => inputRef.current?.focus()}
    >
      <div className="flex flex-wrap gap-2 mb-2">
        {value.map((tag, index) => (
          <Badge
            key={index}
            variant="secondary"
            className="bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer transition-smooth px-3 py-1"
            onClick={() => handleTagClick(index)}
          >
            {tag}
            <X className="w-3 h-3 ml-1" />
          </Badge>
        ))}
        {isTyping && inputValue && (
          <Badge variant="outline" className="bg-muted/50 text-muted-foreground">
            {inputValue.startsWith("#") ? inputValue : "#" + inputValue}
          </Badge>
        )}
      </div>
      
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onBlur={addTag}
        placeholder={value.length === 0 ? placeholder : ""}
        className="w-full bg-transparent border-none outline-none text-sm placeholder:text-muted-foreground"
      />
      
      <div className="text-xs text-muted-foreground mt-2">
        Type complaints and press space to create hashtags. These will be linked to medicine recommendations.
      </div>
    </div>
  );
}