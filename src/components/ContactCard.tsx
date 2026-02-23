import { Building2, MapPin, ExternalLink } from "lucide-react";

interface ContactCardProps {
  name: string;
  headline?: string | null;
  company?: string | null;
  location?: string | null;
  linkedin_url?: string | null;
  created_at: string;
}

export function ContactCard({ name, headline, company, location, linkedin_url }: ContactCardProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="group flex items-center gap-4 rounded-lg border border-border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-[var(--shadow-glow)]">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 font-display text-sm font-semibold text-primary">
        {initials}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="truncate font-display font-semibold text-foreground">{name}</h3>
          {linkedin_url && (
            <a href={linkedin_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
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
    </div>
  );
}
