import { useState } from "react";
import { Building2, Sparkles, Loader2, Copy, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
  user_id?: string;
  profiles?: { name: string | null } | null;
  currentUserId?: string;
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
  userName, userLocation, userAffiliations, userTags, userBio, user_id, profiles, currentUserId
}: LeadCardProps) {
  const [intro, setIntro] = useState(suggested_intro || "");
  const [loadingIntro, setLoadingIntro] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(intro);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
    } catch (e: any) {
      console.error(e);
      setIntro(e.message || "Failed to generate greeting.");
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
            <div className="flex items-center gap-2">
              <h3 className="font-display font-semibold text-foreground">{name}</h3>
              {user_id && currentUserId && user_id !== currentUserId && (
                <Badge variant="secondary" className="bg-primary/20 text-primary hover:bg-primary/30 text-[10px] px-2 py-0 h-4 min-h-0 line-clamp-1">
                  Shared by {profiles?.name ? profiles.name : "Connection"}
                </Badge>
              )}
            </div>
            {headline && <p className="text-sm text-muted-foreground mt-0.5">{headline}</p>}
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
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5 text-xs font-medium text-primary">
            <Sparkles className="h-3 w-3" />
            Suggested Intro
          </div>
          {intro && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-foreground"
              onClick={handleCopy}
              title="Copy to clipboard"
            >
              {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
            </Button>
          )}
        </div>

        {intro ? (
          <div className="space-y-2">
            <p className="text-sm text-secondary-foreground leading-relaxed">{intro}</p>
            <p className="text-[10px] text-muted-foreground italic">
              * We highly recommend further tailoring this greeting before reaching out!
            </p>
          </div>
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
