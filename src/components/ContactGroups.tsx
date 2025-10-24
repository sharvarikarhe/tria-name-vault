import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface ContactGroupsProps {
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
  allTags: string[];
}

export const ContactGroups = ({
  selectedTags,
  onTagToggle,
  allTags,
}: ContactGroupsProps) => {
  if (allTags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      <span className="text-sm text-muted-foreground self-center">Filter:</span>
      {allTags.map((tag) => {
        const isSelected = selectedTags.includes(tag);
        return (
          <Badge
            key={tag}
            variant={isSelected ? "default" : "outline"}
            className="cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => onTagToggle(tag)}
          >
            {tag}
            {isSelected && <X className="w-3 h-3 ml-1" />}
          </Badge>
        );
      })}
    </div>
  );
};
