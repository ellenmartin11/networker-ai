import { useState, useEffect } from "react";
import { Sparkles, Loader2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LeadCard } from "./LeadCard";
import { GraphView } from "./GraphView";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Lead {
  name: string;
  headline?: string;
  company?: string;
  match_score: number;
  suggested_intro: string;
}

export function LeadsTab() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [topN, setTopN] = useState(5);
  const [userName, setUserName] = useState("");
  const [userBio, setUserBio] = useState("");
  const [profileId, setProfileId] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [view, setView] = useState<"list" | "graph">("list");
  const { toast } = useToast();

  useEffect(() => {
    // Load profile on mount
    const loadProfile = async () => {
      try {
        const { data, error } = await supabase
          .from("contacts")
          .select("id, name, bio")
          .eq("priority", -1)
          .limit(1)
          .single();

        if (data && !error) {
          setProfileId(data.id);
          setUserName(data.name || "");
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
      if (profileId) {
        const { error } = await supabase
          .from("contacts")
          .update({ name: userName, bio: userBio })
          .eq("id", profileId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("contacts")
          .insert({ name: userName, bio: userBio, priority: -1 })
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
    setLoading(true);
    try {
      const res = await supabase.functions.invoke("ai-matchmaker", {
        body: { top_n: topN, user_bio: userBio },
      });
      if (res.error) throw res.error;
      setLeads(res.data?.leads || []);
      if (!res.data?.leads?.length) {
        toast({ title: "No leads found", description: "Add more contacts or check your Neo4j data." });
      }
    } catch (e) {
      console.error(e);
      toast({ title: "Failed to fetch leads", description: "Check edge function logs.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="space-y-4">
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

      {leads.length > 0 ? (
        view === "list" ? (
          <div className="grid gap-4 md:grid-cols-2">
            {leads.map((lead, i) => (
              <LeadCard key={i} {...lead} index={i} />
            ))}
          </div>
        ) : (
          <GraphView leads={leads} userName={userName} />
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
