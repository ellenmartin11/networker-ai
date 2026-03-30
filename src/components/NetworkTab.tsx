import { useState, useEffect } from "react";
import { Search, Users, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ContactCard } from "./ContactCard";
import { AddContactDialog } from "./AddContactDialog";
import { ImportContactsDialog } from "./ImportContactsDialog";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Contact {
  id: string;
  name: string;
  headline: string | null;
  company: string | null;
  location: string | null;
  linkedin_url: string | null;
  created_at: string;
  schools?: string[] | null;
  skills?: string[] | null;
  user_id?: string | null;
  profiles?: { name: string | null } | null;
}

export function NetworkTab() {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<string>("date");
  const [filter, setFilter] = useState<"all" | "mine" | "shared">("all");

  const fetchContacts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("contacts")
      .select("id, name, headline, company, location, linkedin_url, created_at, schools, skills, user_id, profiles(name)")
      .neq("priority", -1)
      .order("created_at", { ascending: false });
    if (!error && data) setContacts(data as any);
    setLoading(false);
  };

  useEffect(() => { fetchContacts(); }, []);

  const sortedAndFiltered = contacts.filter((c) => {
    const isShared = c.user_id && user && c.user_id !== user.id;
    if (filter === "mine" && isShared) return false;
    if (filter === "shared" && !isShared) return false;

    return [c.name, c.headline, c.company, c.location, ...(c.schools || [])]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase());
  }).sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.name.localeCompare(b.name);
      case "company":
        return (a.company || "").localeCompare(b.company || "");
      case "location":
        return (a.location || "").localeCompare(b.location || "");
      case "school": {
        const schoolA = (a.schools && a.schools.length > 0) ? a.schools[0] : "";
        const schoolB = (b.schools && b.schools.length > 0) ? b.schools[0] : "";
        return schoolA.localeCompare(schoolB);
      }
      case "date":
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  return (
    <div className="space-y-5">
      <div className="bg-white/60 backdrop-blur-xl border border-white/40 shadow-sm rounded-lg p-4 text-sm text-foreground/90 space-y-2">
        <h3 className="font-semibold text-primary flex items-center gap-1.5">
          <Sparkles className="h-4 w-4" />
          How to use networker-ai
        </h3>
        <p className="leading-relaxed">
          You can retrieve all your connections from LinkedIn as a CSV using the data archive tool in LinkedIn, and upload them using the "Import CSV" button below. Alternatively, you can begin manually inserting contacts.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search contacts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white/60 backdrop-blur-md border border-white/40 shadow-sm transition-all focus:bg-white"
          />
        </div>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[160px] bg-white/60 backdrop-blur-md border border-white/40 shadow-sm transition-all focus:bg-white">
            <SelectValue placeholder="Sort by..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">Date Added</SelectItem>
            <SelectItem value="name">Name (A-Z)</SelectItem>
            <SelectItem value="company">Industry / Company</SelectItem>
            <SelectItem value="location">Location</SelectItem>
            <SelectItem value="school">School</SelectItem>
          </SelectContent>
        </Select>
        {/* Replaced View Toggle with Network Filter Segmented Control */}
        <div className="flex items-center gap-1 bg-white/40 backdrop-blur-md p-1 rounded-md border border-white/40 shadow-sm ml-auto mr-2">
          <Button
            variant={filter === "all" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setFilter("all")}
            className="h-8 px-3 text-xs"
          >
            All
          </Button>
          <Button
            variant={filter === "mine" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setFilter("mine")}
            className="h-8 px-3 text-xs"
          >
            My Connections
          </Button>
          <Button
            variant={filter === "shared" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setFilter("shared")}
            className="h-8 px-3 text-xs"
          >
            Shared By Others
          </Button>
        </div>
        <ImportContactsDialog onContactsImported={fetchContacts} />
        <AddContactDialog onContactAdded={fetchContacts} />
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
      ) : sortedAndFiltered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Users className="h-12 w-12 text-muted-foreground/40 mb-3" />
          <p className="text-muted-foreground">
            {contacts.length === 0 ? "No contacts yet. Add your first one!" : "No matches found."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedAndFiltered.map((c) => {
            const isShared = c.user_id && user && c.user_id !== user.id;
            return (
              <div key={c.id} className="relative">
                {isShared && (
                  <div className="absolute -top-2 -right-2 z-10">
                    <Badge variant="secondary" className="bg-primary/20 text-primary hover:bg-primary/30 text-[10px] px-2 py-0">
                      Shared by {c.profiles?.name ? c.profiles.name : "Connection"}
                    </Badge>
                  </div>
                )}
                <ContactCard {...c} onChanged={fetchContacts} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
