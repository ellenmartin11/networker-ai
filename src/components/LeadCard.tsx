import { Building2, Sparkles } from "lucide-react";

interface LeadCardProps {
  name: string;
  headline?: string;
  company?: string;
  match_score: number;
  suggested_intro: string;
  index: number;
}

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 80 ? "text-score-high bg-score-high/10" : score >= 50 ? "text-score-medium bg-score-medium/10" : "text-score-low bg-score-low/10";
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${color}`}>
      {score}% match
    </span>
  );
}

export function LeadCard({ name, headline, company, match_score, suggested_intro, index }: LeadCardProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className="animate-fade-in rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-[var(--shadow-glow)]"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 font-display text-sm font-bold text-primary">
            {initials}
          </div>
          <div>
            <h3 className="font-display font-semibold text-foreground">{name}</h3>
            {headline && <p className="text-sm text-muted-foreground">{headline}</p>}
            {company && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                <Building2 className="h-3 w-3" /> {company}
              </span>
            )}
          </div>
        </div>
        <ScoreBadge score={match_score} />
      </div>
      <div className="mt-4 rounded-lg bg-muted/50 p-3">
        <div className="flex items-center gap-1.5 text-xs font-medium text-primary mb-1.5">
          <Sparkles className="h-3 w-3" />
          Suggested Intro
        </div>
        <p className="text-sm text-secondary-foreground leading-relaxed">{suggested_intro}</p>
      </div>
    </div>
  );
}
