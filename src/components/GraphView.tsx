import { useState, useEffect, useMemo, useRef } from "react";
import ForceGraph2D from "react-force-graph-2d";
import { Lead } from "./LeadsTab";
import { Sparkles, X, Building2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const REASON_COLORS: Record<string, string> = {
    "Education": "#3b82f6", // Blue
    "Industry": "#10b981",  // Green
    "Role": "#f59e0b",      // Amber
    "Skills": "#8b5cf6",    // Purple
    "Company": "#ec4899",   // Pink
    "Location": "#06b6d4",  // Cyan
    "Other": "#64748b",     // Slate
};

interface GraphViewProps {
    leads: Lead[];
    userName?: string;
    userLocation?: string;
    userAffiliations?: string;
    userTags?: string;
    userBio?: string;
}

export function GraphView({ leads, userName, userLocation, userAffiliations, userTags, userBio }: GraphViewProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const fgRef = useRef<any>();
    const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
    const isDark = document.documentElement.className.includes("dark");
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [intro, setIntro] = useState("");
    const [loadingIntro, setLoadingIntro] = useState(false);

    useEffect(() => {
        if (!containerRef.current) return;
        const { clientWidth } = containerRef.current;
        setDimensions({ width: clientWidth, height: 500 });

        const handleResize = () => {
            if (containerRef.current) {
                setDimensions({ width: containerRef.current.clientWidth, height: 500 });
            }
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const graphData = useMemo(() => {
        const userColor = isDark ? "#ffffff" : "#000000"; // Fixed hex color for canvas
        const nodes = [
            { id: "user", name: userName || "You", group: 1, val: 25, color: userColor },
            ...leads.map((lead, i) => {
                // Normalize the string to properly match the dictionary keys
                const reasonKey = Object.keys(REASON_COLORS).find(
                    k => k.toLowerCase() === (lead.match_reason || "").toLowerCase()
                ) || "Other";

                const color = REASON_COLORS[reasonKey];
                return {
                    id: `lead_${i}`,
                    name: lead.name,
                    company: lead.company,
                    match_score: lead.match_score,
                    group: 2,
                    val: 15,
                    color: color,
                    leadData: lead, // Attach the full lead object for click handlers
                };
            }),
        ];

        const links = leads.map((lead, i) => ({
            source: "user",
            target: `lead_${i}`,
            score: lead.match_score,
        }));

        return { nodes, links };
    }, [leads]);

    useEffect(() => {
        if (fgRef.current) {
            fgRef.current.d3Force("link").distance((link: any) => {
                return 300 - (link.score / 100) * 200;
            });
        }
    }, [graphData]);

    const handleNodeClick = (node: any) => {
        if (node.id === "user") {
            setSelectedLead(null);
            setIntro("");
            return;
        }
        setSelectedLead(node.leadData);
        setIntro(node.leadData.suggested_intro || "");

        // Center camera on clicked node
        if (fgRef.current) {
            fgRef.current.centerAt(node.x, node.y, 1000);
            fgRef.current.zoom(1.5, 1000);
        }
    };

    const generateIntro = async (lead: Lead) => {
        setLoadingIntro(true);
        try {
            const res = await supabase.functions.invoke("generate-greeting", {
                body: {
                    user_name: userName || "",
                    user_location: userLocation || "",
                    user_affiliations: userAffiliations || "",
                    user_tags: userTags || "",
                    user_bio: userBio || "",
                    lead_name: lead.name,
                    lead_headline: lead.headline || "",
                    lead_company: lead.company || "",
                    match_reason: lead.match_reason,
                    match_reason_details: lead.match_reason_details
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

    return (
        <div
            ref={containerRef}
            className="w-full h-[600px] rounded-lg border border-border bg-card overflow-hidden relative"
        >
            {/* Legend */}
            <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm border border-border p-3 rounded-md shadow-sm z-10">
                <h4 className="text-xs font-semibold mb-2 text-muted-foreground uppercase tracking-wider">Match Reason</h4>
                <div className="space-y-1.5 shrink-0">
                    {Object.entries(REASON_COLORS).map(([reason, color]) => (
                        <div key={reason} className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                            <span className="text-sm">{reason}</span>
                        </div>
                    ))}
                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: isDark ? "#ffffff" : "#000000" }} />
                        <span className="text-sm font-medium">You</span>
                    </div>
                </div>
            </div>
            <ForceGraph2D
                ref={fgRef}
                width={dimensions.width}
                height={dimensions.height}
                graphData={graphData}
                nodeCanvasObject={(node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
                    // Draw Node Circle
                    ctx.beginPath();
                    ctx.arc(node.x, node.y, node.val / 2, 0, 2 * Math.PI, false);
                    ctx.fillStyle = node.color;
                    ctx.fill();

                    // Draw Text Label
                    const label = node.name;
                    const fontSize = 12 / globalScale;
                    ctx.font = `${fontSize}px Sans-Serif`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)';
                    // Position text slightly below the node
                    ctx.fillText(label, node.x, node.y + (node.val / 2) + fontSize + 2);
                }}
                nodeColor={(node: any) => node.color}
                onNodeClick={handleNodeClick}
                nodeRelSize={1}
                nodeVal={(node: any) => node.val}
                linkColor={() => (isDark ? "#333" : "#ddd")}
                linkWidth={(link: any) => Math.max(1, (link.score / 100) * 8)}
                linkDirectionalParticles={2}
                linkDirectionalParticleSpeed={(d: any) => (d.score / 100) * 0.01}
                backgroundColor={isDark ? "hsl(var(--card))" : "#ffffff"}
            />

            {/* Floating Selection Card */}
            {selectedLead && (
                <div className="absolute top-4 right-4 w-80 bg-background/95 backdrop-blur-md border border-border rounded-xl shadow-lg z-10 animate-fade-in flex flex-col max-h-[calc(100%-2rem)] overflow-y-auto">
                    <div className="p-4 border-b border-border flex justify-between items-start sticky top-0 bg-background/95 z-20">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-lg leading-tight">{selectedLead.name}</h3>
                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${selectedLead.match_score >= 80 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                                    {selectedLead.match_score}% Match
                                </span>
                            </div>
                            {selectedLead.headline && <p className="text-sm text-muted-foreground leading-snug">{selectedLead.headline}</p>}
                            {selectedLead.company && (
                                <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
                                    <Building2 className="w-3.5 h-3.5" />
                                    <span>{selectedLead.company}</span>
                                </div>
                            )}
                        </div>
                        <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0 -mr-2 -mt-2 text-muted-foreground" onClick={() => setSelectedLead(null)}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="p-4 space-y-4">
                        <div>
                            <div className="flex items-center gap-1.5 mb-1.5">
                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: REASON_COLORS[selectedLead.match_reason] || REASON_COLORS["Other"] }} />
                                <h4 className="text-xs font-semibold uppercase text-muted-foreground">Match: {selectedLead.match_reason}</h4>
                            </div>
                            <p className="text-sm text-foreground/90 leading-relaxed bg-muted/40 p-2.5 rounded-md border border-border/50">
                                {selectedLead.match_reason_details || "No details provided."}
                            </p>
                        </div>

                        {!intro && !loadingIntro ? (
                            <Button onClick={() => generateIntro(selectedLead)} className="w-full gap-2 text-sm h-9" variant="outline">
                                <Sparkles className="w-4 h-4 text-primary" />
                                Generate Personalized Greeting
                            </Button>
                        ) : loadingIntro ? (
                            <Button disabled className="w-full gap-2 text-sm h-9" variant="outline">
                                <Loader2 className="w-4 h-4 text-primary animate-spin" />
                                Generating...
                            </Button>
                        ) : (
                            <div className="bg-primary/5 text-primary-foreground border border-primary/20 p-3 rounded-lg animate-fade-in relative">
                                <h4 className="text-xs font-bold text-primary mb-1.5 flex items-center gap-1.5">
                                    <Sparkles className="w-3.5 h-3.5" /> AI Suggestion
                                </h4>
                                <p className="text-sm leading-relaxed text-foreground/90">{intro}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
