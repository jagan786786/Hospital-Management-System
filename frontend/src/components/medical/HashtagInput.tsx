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

export function HashtagInput({
  value,
  onChange,
  placeholder = "Type complaints and press space or enter...",
  className,
}: HashtagInputProps) {
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
      addComplaint();
    } else if (e.key === "Backspace" && inputValue === "" && value.length > 0) {
      removeComplaint(value.length - 1);
    }
  };

  const addComplaint = () => {
    if (inputValue.trim()) {
      const complaint = inputValue.trim().toLowerCase();
      if (!value.includes(complaint)) {
        onChange([...value, complaint]);
      }
      setInputValue("");
      setIsTyping(false);
    }
  };

  const removeComplaint = (index: number) => {
    const newComplaints = value.filter((_, i) => i !== index);
    onChange(newComplaints);
  };

  const handleComplaintClick = (index: number) => {
    removeComplaint(index);
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
        {value.map((complaint, index) => (
          <Badge
            key={index}
            variant="secondary"
            className="bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer transition-smooth px-3 py-1"
            onClick={() => handleComplaintClick(index)}
          >
            {complaint}
            <X className="w-3 h-3 ml-1" />
          </Badge>
        ))}
        {isTyping && inputValue && (
          <Badge
            variant="outline"
            className="bg-muted/50 text-muted-foreground"
          >
            {inputValue}
          </Badge>
        )}
      </div>

      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onBlur={addComplaint}
        placeholder={value.length === 0 ? placeholder : ""}
        className="w-full bg-transparent border-none outline-none text-sm placeholder:text-muted-foreground"
      />

      <div className="text-xs text-muted-foreground mt-2">
        Type complaints and press space or enter to add them. These will be used
        for medicine recommendations.
      </div>
    </div>
  );
}
