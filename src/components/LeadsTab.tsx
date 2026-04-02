import { useState, useEffect } from "react";
import { Sparkles, Loader2, Zap, Search, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { LeadCard } from "./LeadCard";
import { GraphView } from "./GraphView";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const LOADING_PHRASES = [
  "Generating leads...",
  "Searching your network...",
  "Finding best matches...",
  "Implementing search algorithms...",
  "Building your network..."
];

export interface Lead {
  name: string;
  headline?: string;
  company?: string;
  match_score: number;
  match_reason: "Education" | "Industry" | "Role" | "Skills" | "Other";
  match_reason_details: string;
  suggested_intro?: string;
  user_id?: string;
  profiles?: { name: string | null } | null;
}

export function LeadsTab() {
  const { user, isPro } = useAuth();
  const [leads, setLeads] = useState<Lead[]>(() => {
    const cached = sessionStorage.getItem("saved_leads");
    return cached ? JSON.parse(cached) : [];
  });
  const [loading, setLoading] = useState(false);
  const [topN, setTopN] = useState(() => {
    const cached = sessionStorage.getItem("saved_top_n");
    return cached ? parseInt(cached, 10) : 5;
  });
  const [userName, setUserName] = useState("");
  const [userLocation, setUserLocation] = useState("");
  const [userAffiliations, setUserAffiliations] = useState("");
  const [userTags, setUserTags] = useState("");
  const [userBio, setUserBio] = useState("");
  const [profileId, setProfileId] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [view, setView] = useState<"list" | "graph">(() => {
    const cached = sessionStorage.getItem("saved_view");
    return (cached as "list" | "graph") || "list";
  });
  const [matchPreference, setMatchPreference] = useState<string>(() => {
    return sessionStorage.getItem("saved_match_preference") || "all";
  });
  const [loadingPhraseIndex, setLoadingPhraseIndex] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    let interval: number;
    if (loading) {
      setLoadingPhraseIndex(0);
      interval = window.setInterval(() => {
        setLoadingPhraseIndex((prev) => (prev + 1) % LOADING_PHRASES.length);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [loading]);

  useEffect(() => {
    sessionStorage.setItem("saved_leads", JSON.stringify(leads));
  }, [leads]);

  useEffect(() => {
    sessionStorage.setItem("saved_top_n", topN.toString());
  }, [topN]);

  useEffect(() => {
    if (!isPro && topN > 5) {
      setTopN(5);
    }
  }, [isPro, topN]);

  useEffect(() => {
    sessionStorage.setItem("saved_view", view);
  }, [view]);

  useEffect(() => {
    sessionStorage.setItem("saved_match_preference", matchPreference);
  }, [matchPreference]);

  useEffect(() => {
    // Load profile once user is available
    const loadProfile = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from("contacts")
          .select("id, name, bio, location, headline, skills")
          .eq("priority", -1)
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (data && !error) {
          setProfileId(data.id);
          setUserName(data.name || "");
          setUserLocation(data.location || "");
          setUserAffiliations(data.headline || "");
          setUserTags(data.skills?.join(", ") || "");
          setUserBio(data.bio || "");
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
      }
    };
    loadProfile();
  }, [user]);

  // We no longer need saveProfile here since it moved to AccountTab.

  const fetchLeads = async () => {
    setLoading(true);
    try {
      // Get excluded sources right before calling
      let excluded_sources: string[] = [];
      try {
        excluded_sources = JSON.parse(localStorage.getItem('excluded_sources') || '[]');
      } catch (e) {
        // ignore JSON parse error
      }

      const res = await supabase.functions.invoke("ai-matchmaker", {
        body: {
          top_n: topN,
          user_bio: userBio,
          user_location: userLocation,
          user_affiliations: userAffiliations,
          user_tags: userTags,
          match_preference: matchPreference,
          excluded_sources
        },
      });
      if (res.error) throw res.error;
      if (res.data?.error) throw new Error(res.data.error);

      setLeads(res.data?.leads || []);
      if (!res.data?.leads?.length) {
        toast({ title: "No leads found", description: "Add more contacts or check your Neo4j data." });
      }
    } catch (e) {
      console.error(e);
      toast({ title: "Failed to fetch leads", description: e instanceof Error ? e.message : "Check edge function logs.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="bg-white/40 backdrop-blur-xl border border-white/40 p-5 rounded-xl shadow-sm mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-display font-medium text-slate-800 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" /> NetGraph Matchmaker
          </h2>
          <p className="text-sm text-muted-foreground max-w-lg">
            Our AI continuously scans the connections across your network to find the absolute best people you should talk to based on your <strong className="text-primary font-medium">Account Profile</strong> settings.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Label className="text-sm text-muted-foreground whitespace-nowrap">Top</Label>
            <Select value={topN.toString()} onValueChange={(val) => setTopN(Number(val))}>
              <SelectTrigger className="w-[120px] bg-white/60 backdrop-blur-md border border-white/40 shadow-sm transition-all focus:bg-white">
                <SelectValue placeholder="Top..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">Top 5</SelectItem>
                <SelectItem value="10" disabled={!isPro}>
                  <span className="flex items-center gap-1.5">Top 10 {!isPro && <Lock className="w-3 h-3 opacity-50" />}</span>
                </SelectItem>
                <SelectItem value="20" disabled={!isPro}>
                  <span className="flex items-center gap-1.5">Top 20 {!isPro && <Lock className="w-3 h-3 opacity-50" />}</span>
                </SelectItem>
                <SelectItem value="10000" disabled={!isPro}>
                  <span className="flex items-center gap-1.5">All Contacts {!isPro && <Lock className="w-3 h-3 opacity-50" />}</span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Select value={matchPreference} onValueChange={setMatchPreference}>
            <SelectTrigger className="w-[180px] bg-white/60 backdrop-blur-md border border-white/40 shadow-sm transition-all focus:bg-white">
              <SelectValue placeholder="Prioritize..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Overall Best (Default)</SelectItem>
              <SelectItem value="industry">Prioritize Industry & Skills</SelectItem>
              <SelectItem value="location">Prioritize Location</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={fetchLeads} disabled={loading} className="gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
            Find Leads
          </Button>
        </div>

        {leads.length > 0 && (
          <div className="flex items-center gap-1 bg-white/40 backdrop-blur-md p-1 rounded-md border border-white/40 shadow-sm">
            <Button
              variant={view === "list" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setView("list")}
              className="h-8 px-3 text-xs"
            >
              List
            </Button>
            <Button
              variant={view === "graph" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setView("graph")}
              className="h-8 px-3 text-xs"
            >
              Graph
            </Button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-center animate-in fade-in duration-500">
          <div className="relative flex items-center justify-center w-16 h-16 mb-6">
            <div className="absolute inset-0 rounded-full border-t-2 border-primary animate-spin opacity-20"></div>
            <div className="absolute inset-1 rounded-full border-r-2 border-primary animate-spin opacity-40" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
            <div className="absolute inset-2 rounded-full border-b-2 border-primary animate-spin opacity-60" style={{ animationDuration: '2s' }}></div>
            <Search className="h-6 w-6 text-primary animate-pulse" />
          </div>
          <h3 className="text-xl font-display font-semibold text-foreground transition-all duration-500 ease-in-out">
            {LOADING_PHRASES[loadingPhraseIndex]}
          </h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-[250px]">
            This usually takes a few moments as our AI analyzes your graph.
          </p>
        </div>
      ) : leads.length > 0 ? (
        view === "list" ? (
          <div className="grid gap-4 md:grid-cols-2">
            {leads.map((lead, i) => (
              <LeadCard
                key={i}
                {...lead}
                index={i}
                userName={userName}
                userLocation={userLocation}
                userAffiliations={userAffiliations}
                userTags={userTags}
                userBio={userBio}
                currentUserId={user?.id}
              />
            ))}
          </div>
        ) : (
          <GraphView
            leads={leads}
            userName={userName}
            userLocation={userLocation}
            userAffiliations={userAffiliations}
            userTags={userTags}
            userBio={userBio}
            currentUserId={user?.id}
          />
        )
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Sparkles className="h-12 w-12 text-primary/30 mb-3" />
          <p className="text-muted-foreground">Click "Find Leads" to discover your top matches.</p>
          <p className="text-xs text-muted-foreground mt-1">Uses AI to rank contacts from your Neo4j graph.</p>
        </div>
      )}
    </div>
  );
}
