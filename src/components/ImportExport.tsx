import { Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Papa from "papaparse";
import { useRef } from "react";
import { toast } from "@/hooks/use-toast";

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  tags?: string[];
  company?: string;
  location?: string;
}

interface ImportExportProps {
  contacts: Contact[];
  onImport: (contacts: Contact[]) => void;
}

export const ImportExport = ({ contacts, onImport }: ImportExportProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const exportToJSON = () => {
    const dataStr = JSON.stringify(contacts, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    const exportFileDefaultName = `contacts-${new Date().toISOString().split("T")[0]}.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();

    toast({
      title: "Export successful",
      description: `Exported ${contacts.length} contacts to JSON`,
    });
  };

  const exportToCSV = () => {
    const csv = Papa.unparse(contacts);
    const dataUri = `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`;
    const exportFileDefaultName = `contacts-${new Date().toISOString().split("T")[0]}.csv`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();

    toast({
      title: "Export successful",
      description: `Exported ${contacts.length} contacts to CSV`,
    });
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;

        if (file.name.endsWith(".json")) {
          const imported = JSON.parse(content);
          const contactsArray = Array.isArray(imported) ? imported : [imported];
          onImport(contactsArray as Contact[]);
          toast({
            title: "Import successful",
            description: `Imported ${contactsArray.length} contacts from JSON`,
          });
        } else if (file.name.endsWith(".csv")) {
          Papa.parse(content, {
            header: true,
            complete: (results) => {
              const contactsArray = results.data.filter(
                (row: any) => row.name && row.email
              ) as Contact[];
              onImport(contactsArray);
              toast({
                title: "Import successful",
                description: `Imported ${contactsArray.length} contacts from CSV`,
              });
            },
          });
        }
      } catch (error) {
        toast({
          title: "Import failed",
          description: "Invalid file format",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,.csv"
        onChange={handleImport}
        className="hidden"
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Import/Export
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={exportToJSON}>
            <Download className="w-4 h-4 mr-2" />
            Export to JSON
          </DropdownMenuItem>
          <DropdownMenuItem onClick={exportToCSV}>
            <Download className="w-4 h-4 mr-2" />
            Export to CSV
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
            <Upload className="w-4 h-4 mr-2" />
            Import Contacts
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
