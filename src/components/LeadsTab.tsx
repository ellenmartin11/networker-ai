import { useState, useEffect } from "react";
import { Sparkles, Loader2, Zap, Search } from "lucide-react";
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
}

export function LeadsTab() {
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
    sessionStorage.setItem("saved_view", view);
  }, [view]);

  useEffect(() => {
    sessionStorage.setItem("saved_match_preference", matchPreference);
  }, [matchPreference]);

  useEffect(() => {
    // Load profile on mount
    const loadProfile = async () => {
      try {
        const { data, error } = await supabase
          .from("contacts")
          .select("id, name, bio, location, headline, skills")
          .eq("priority", -1)
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
  }, []);

  const saveProfile = async () => {
    setSavingProfile(true);
    try {
      const skillsArray = userTags ? userTags.split(',').map(s => s.trim()).filter(Boolean) : [];

      if (profileId) {
        const { error } = await supabase
          .from("contacts")
          .update({ name: userName, bio: userBio, location: userLocation, headline: userAffiliations, skills: skillsArray })
          .eq("id", profileId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("contacts")
          .insert({ name: userName, bio: userBio, location: userLocation, headline: userAffiliations, priority: -1, skills: skillsArray })
          .select("id")
          .single();
        if (error) throw error;
        if (data) setProfileId(data.id);
      }
      toast({ title: "Profile saved successfully!" });
    } catch (e) {
      console.error(e);
      toast({ title: "Failed to save profile", variant: "destructive" });
    } finally {
      setSavingProfile(false);
    }
  };

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await supabase.functions.invoke("ai-matchmaker", {
        body: {
          top_n: topN,
          user_bio: userBio,
          user_location: userLocation,
          user_affiliations: userAffiliations,
          user_tags: userTags,
          match_preference: matchPreference
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
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium">Your Name</Label>
            <Input
              placeholder="e.g. Jane Doe"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="mt-1.5 bg-muted border-border"
            />
          </div>
          <div>
            <Label className="text-sm font-medium">Your Location</Label>
            <Input
              placeholder="e.g. San Francisco, CA"
              value={userLocation}
              onChange={(e) => setUserLocation(e.target.value)}
              className="mt-1.5 bg-muted border-border"
            />
          </div>
        </div>
        <div>
          <Label className="text-sm font-medium">Your Affiliations (Schools, Companies)</Label>
          <Input
            placeholder="e.g. Yale, OpenAI, Boston Children's Hospital"
            value={userAffiliations}
            onChange={(e) => setUserAffiliations(e.target.value)}
            className="mt-1.5 bg-muted border-border"
          />
        </div>
        <div>
          <Label className="text-sm font-medium">Your Interests / Tags (Comma separated)</Label>
          <Input
            placeholder="e.g. neuroscience, research, psychology, startups"
            value={userTags}
            onChange={(e) => setUserTags(e.target.value)}
            className="mt-1.5 bg-muted border-border"
          />
        </div>
        <div>
          <Label className="text-sm font-medium">Your Profile / Bio</Label>
          <Textarea
            placeholder="Paste your LinkedIn bio, current role, or interests here to help AI find the best matches..."
            value={userBio}
            onChange={(e) => setUserBio(e.target.value)}
            className="mt-1.5 min-h-[100px] resize-y bg-muted/50"
          />
        </div>
        <div className="flex justify-end">
          <Button variant="secondary" onClick={saveProfile} disabled={savingProfile} className="gap-2">
            {savingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Save Profile
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Label className="text-sm text-muted-foreground whitespace-nowrap">Top</Label>
            <Input
              type="number"
              min={1}
              max={20}
              value={topN}
              onChange={(e) => setTopN(Number(e.target.value))}
              className="w-16 bg-muted border-border"
            />
          </div>
          <Select value={matchPreference} onValueChange={setMatchPreference}>
            <SelectTrigger className="w-[180px] bg-muted border-border">
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
          <div className="flex items-center gap-1 bg-muted p-1 rounded-md border border-border">
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
