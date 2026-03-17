import { useState } from "react";
import { Building2, MapPin, ExternalLink, Trash2, Loader2, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { EditContactDialog } from "./EditContactDialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ContactCardProps {
  id: string;
  name: string;
  headline?: string | null;
  company?: string | null;
  location?: string | null;
  linkedin_url?: string | null;
  skills?: string[] | null;
  created_at: string;
  onChanged?: () => void;
}

export function ContactCard({ id, name, headline, company, location, linkedin_url, skills, onChanged }: ContactCardProps) {
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const { error } = await supabase.from("contacts").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Contact deleted" });
      onChanged?.();
    } catch (e) {
      console.error(e);
      toast({ title: "Failed to delete contact", variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  };

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="group flex items-center gap-4 rounded-lg border border-white/40 bg-white/60 backdrop-blur-xl shadow-sm p-4 transition-all hover:border-primary/30 hover:shadow-[var(--shadow-glow)]">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 font-display text-sm font-semibold text-primary">
        {initials}
      </div>
      <div className="flex flex-1 items-start justify-between min-w-0">
        <div className="min-w-0 flex-1 pr-4">
          <div className="flex items-center gap-2">
            <h3 className="truncate font-display font-semibold text-foreground">{name}</h3>
            {linkedin_url && (
              <a href={linkedin_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
            {(!skills || skills.length === 0) && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <AlertTriangle className="h-4 w-4 text-amber-500 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>This user has missing information. Please add tags/interests to improve AI matching.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          {headline && <p className="truncate text-sm text-muted-foreground">{headline}</p>}
          <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
            {company && (
              <span className="flex items-center gap-1">
                <Building2 className="h-3 w-3" /> {company}
              </span>
            )}
            {location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" /> {location}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <EditContactDialog contactId={id} onContactUpdated={() => onChanged?.()} />
          <Button variant="ghost" size="icon" onClick={handleDelete} disabled={deleting} className="text-muted-foreground hover:text-destructive flex-shrink-0">
            {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
