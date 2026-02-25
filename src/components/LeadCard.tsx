import { useState } from "react";
import { Building2, Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

interface LeadCardProps {
  name: string;
  headline?: string;
  company?: string;
  match_score: number;
  match_reason: string;
  match_reason_details: string;
  suggested_intro?: string;
  index: number;
  userName: string;
  userLocation: string;
  userAffiliations: string;
  userTags: string;
  userBio: string;
}

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 80 ? "text-score-high bg-score-high/10" : score >= 50 ? "text-score-medium bg-score-medium/10" : "text-score-low bg-score-low/10";
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${color}`}>
      {score}% match
    </span>
  );
}

export function LeadCard({
  name, headline, company, match_score, match_reason, match_reason_details, suggested_intro, index,
  userName, userLocation, userAffiliations, userTags, userBio
}: LeadCardProps) {
  const [intro, setIntro] = useState(suggested_intro || "");
  const [loadingIntro, setLoadingIntro] = useState(false);

  const generateIntro = async () => {
    setLoadingIntro(true);
    try {
      const res = await supabase.functions.invoke("generate-greeting", {
        body: {
          user_name: userName,
          user_location: userLocation,
          user_affiliations: userAffiliations,
          user_tags: userTags,
          user_bio: userBio,
          lead_name: name,
          lead_headline: headline || "",
          lead_company: company || "",
          match_reason,
          match_reason_details
        }
      });
      if (res.error) throw res.error;
      if (res.data?.error) throw new Error(res.data.error);

      setIntro(res.data?.greeting || "Could not generate greeting.");
    } catch (e) {
      console.error(e);
      setIntro("Failed to generate greeting.");
    } finally {
      setLoadingIntro(false);
    }
  };

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

        {intro ? (
          <p className="text-sm text-secondary-foreground leading-relaxed">{intro}</p>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={generateIntro}
            disabled={loadingIntro}
            className="w-full mt-2 gap-2 text-xs h-8"
          >
            {loadingIntro ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
            {loadingIntro ? "Generating..." : "Generate Greeting"}
          </Button>
        )}
      </div>
    </div>
  );
}
