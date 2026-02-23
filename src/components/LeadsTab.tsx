import { useState } from "react";
import { Sparkles, Loader2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LeadCard } from "./LeadCard";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Lead {
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
  const { toast } = useToast();

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await supabase.functions.invoke("ai-matchmaker", {
        body: { top_n: topN },
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

      {leads.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {leads.map((lead, i) => (
            <LeadCard key={i} {...lead} index={i} />
          ))}
        </div>
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
