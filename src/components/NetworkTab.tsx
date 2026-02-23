import { useState, useEffect } from "react";
import { Search, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ContactCard } from "./ContactCard";
import { AddContactDialog } from "./AddContactDialog";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface Contact {
  id: string;
  name: string;
  headline: string | null;
  company: string | null;
  location: string | null;
  linkedin_url: string | null;
  created_at: string;
}

export function NetworkTab() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchContacts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("contacts")
      .select("id, name, headline, company, location, linkedin_url, created_at")
      .order("created_at", { ascending: false });
    if (!error && data) setContacts(data);
    setLoading(false);
  };

  useEffect(() => { fetchContacts(); }, []);

  const filtered = contacts.filter((c) =>
    [c.name, c.headline, c.company, c.location]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search contacts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-muted border-border"
          />
        </div>
        <AddContactDialog onContactAdded={fetchContacts} />
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Users className="h-12 w-12 text-muted-foreground/40 mb-3" />
          <p className="text-muted-foreground">
            {contacts.length === 0 ? "No contacts yet. Add your first one!" : "No matches found."}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((c) => (
            <ContactCard key={c.id} {...c} />
          ))}
        </div>
      )}
    </div>
  );
}
