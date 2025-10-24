import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  tags?: string[];
  company?: string;
  location?: string;
}

interface AIEnrichmentProps {
  contact: Contact;
  onEnrich: (enrichedData: Partial<Contact>) => void;
}

export const AIEnrichment = ({ contact, onEnrich }: AIEnrichmentProps) => {
  const mockEnrich = () => {
    // Mock AI enrichment - in real app this would call an AI API
    const companies = ["TechCorp", "InnovateLab", "DataSync", "CloudFlow", "NextGen Solutions"];
    const locations = ["San Francisco, CA", "New York, NY", "Austin, TX", "Seattle, WA", "Boston, MA"];
    const suggestedTags = ["Professional", "VIP", "Networking"];

    const enrichedData: Partial<Contact> = {
      company: companies[Math.floor(Math.random() * companies.length)],
      location: locations[Math.floor(Math.random() * locations.length)],
      tags: [...(contact.tags || []), suggestedTags[Math.floor(Math.random() * suggestedTags.length)]],
    };

    onEnrich(enrichedData);

    toast({
      title: "AI Enrichment Complete",
      description: "Added company and location information",
    });
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={mockEnrich}
      className="gap-2"
    >
      <Sparkles className="w-4 h-4" />
      AI Enrich
    </Button>
  );
};
