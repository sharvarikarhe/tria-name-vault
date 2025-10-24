import { useState, useEffect, useMemo } from "react";
import { ContactCard } from "@/components/ContactCard";
import { SearchBar } from "@/components/SearchBar";
import { AddContactDialog } from "@/components/AddContactDialog";
import { ImportExport } from "@/components/ImportExport";
import { ContactGroups } from "@/components/ContactGroups";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AIEnrichment } from "@/components/AIEnrichment";
import { Users } from "lucide-react";
import Fuse from "fuse.js";
import { toast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  tags?: string[];
  company?: string;
  location?: string;
}

const initialContacts: Contact[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    email: "sarah.johnson@example.com",
    phone: "+1 (555) 123-4567",
    tags: ["Work", "Professional"],
    company: "TechCorp",
    location: "San Francisco, CA",
  },
  {
    id: "2",
    name: "Michael Chen",
    email: "michael.chen@example.com",
    phone: "+1 (555) 234-5678",
    tags: ["Family"],
    company: "InnovateLab",
    location: "New York, NY",
  },
  {
    id: "3",
    name: "Emily Rodriguez",
    email: "emily.rodriguez@example.com",
    phone: "+1 (555) 345-6789",
    tags: ["Friends", "Networking"],
    location: "Austin, TX",
  },
  {
    id: "4",
    name: "David Kim",
    email: "david.kim@example.com",
    phone: "+1 (555) 456-7890",
    tags: ["Work"],
    company: "DataSync",
    location: "Seattle, WA",
  },
  {
    id: "5",
    name: "Jessica Williams",
    email: "jessica.williams@example.com",
    phone: "+1 (555) 567-8901",
    tags: ["Friends", "VIP"],
    location: "Boston, MA",
  },
];

const STORAGE_KEY = "contact-manager-contacts";

const Index = () => {
  const [contacts, setContacts] = useState<Contact[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : initialContacts;
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<string | null>(null);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);

  // Save to localStorage whenever contacts change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
  }, [contacts]);

  // Fuzzy search with Fuse.js
  const fuse = useMemo(
    () =>
      new Fuse(contacts, {
        keys: ["name", "email", "phone", "company", "location"],
        threshold: 0.3,
      }),
    [contacts]
  );

  const filteredContacts = useMemo(() => {
    let result = contacts;

    // Apply fuzzy search
    if (searchQuery.trim()) {
      result = fuse.search(searchQuery).map((r) => r.item);
    }

    // Apply tag filters
    if (selectedTags.length > 0) {
      result = result.filter((contact) =>
        selectedTags.some((tag) => contact.tags?.includes(tag))
      );
    }

    return result;
  }, [contacts, searchQuery, selectedTags, fuse]);

  // Get all unique tags
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    contacts.forEach((contact) => {
      contact.tags?.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [contacts]);

  const handleAddContact = (newContact: Omit<Contact, "id">) => {
    if (editingContact) {
      // Edit mode
      setContacts(
        contacts.map((c) =>
          c.id === editingContact.id ? { ...newContact, id: c.id } : c
        )
      );
      setEditingContact(null);
    } else {
      // Add mode
      const contact: Contact = {
        ...newContact,
        id: Date.now().toString(),
      };
      setContacts([contact, ...contacts]);
    }
  };

  const handleImport = (importedContacts: Contact[]) => {
    const newContacts = importedContacts.map((c) => ({
      ...c,
      id: c.id || Date.now().toString() + Math.random(),
    }));
    setContacts([...newContacts, ...contacts]);
  };

  const handleDeleteClick = (id: string) => {
    setContactToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (contactToDelete) {
      const contact = contacts.find((c) => c.id === contactToDelete);
      setContacts(contacts.filter((c) => c.id !== contactToDelete));
      toast({
        title: "Contact Deleted",
        description: `${contact?.name} has been removed from your contacts`,
      });
      setContactToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  const handleEditClick = (id: string) => {
    const contact = contacts.find((c) => c.id === id);
    if (contact) {
      setEditingContact(contact);
    }
  };

  const handleEnrich = (id: string, enrichedData: Partial<Contact>) => {
    setContacts(
      contacts.map((c) => (c.id === id ? { ...c, ...enrichedData } : c))
    );
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Users className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  My Contacts
                </h1>
                <p className="text-muted-foreground">
                  {contacts.length}{" "}
                  {contacts.length === 1 ? "contact" : "contacts"} in your list
                </p>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>

        {/* Search and Actions */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <SearchBar value={searchQuery} onChange={setSearchQuery} />
            </div>
            <div className="flex gap-2">
              <ImportExport contacts={contacts} onImport={handleImport} />
              <AddContactDialog
                onAddContact={handleAddContact}
                initialData={editingContact || undefined}
                mode={editingContact ? "edit" : "add"}
              />
            </div>
          </div>

          {/* Tag Filters */}
          <ContactGroups
            selectedTags={selectedTags}
            onTagToggle={handleTagToggle}
            allTags={allTags}
          />
        </div>

        {/* Contact List */}
        {filteredContacts.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <Users className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {searchQuery || selectedTags.length > 0
                ? "No contacts found"
                : "No contacts yet"}
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery || selectedTags.length > 0
                ? "Try adjusting your search or filters"
                : "Get started by adding your first contact"}
            </p>
            {!searchQuery && selectedTags.length === 0 && (
              <AddContactDialog onAddContact={handleAddContact} />
            )}
          </div>
        ) : (
          <div className="grid gap-4 animate-in fade-in duration-500">
            {filteredContacts.map((contact, index) => (
              <div
                key={contact.id}
                className="animate-in slide-in-from-bottom-4"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex flex-col sm:flex-row gap-2 items-start">
                  <div className="flex-1 w-full">
                    <ContactCard
                      name={contact.name}
                      email={contact.email}
                      phone={contact.phone}
                      tags={contact.tags}
                      company={contact.company}
                      location={contact.location}
                      onEdit={() => handleEditClick(contact.id)}
                      onDelete={() => handleDeleteClick(contact.id)}
                    />
                  </div>
                  <AIEnrichment
                    contact={contact}
                    onEnrich={(data) => handleEnrich(contact.id, data)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Contact</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this contact? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Index;
