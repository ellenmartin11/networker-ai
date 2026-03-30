import { useState, useEffect, useMemo, useRef } from "react";
import ForceGraph2D from "react-force-graph-2d";
import { Lead } from "./LeadsTab";
import { Sparkles, X, Building2, Loader2, Copy, Check } from "lucide-react";
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
    currentUserId?: string;
}

export function GraphView({ leads, userName, userLocation, userAffiliations, userTags, userBio, currentUserId }: GraphViewProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const fgRef = useRef<any>(null);
    const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
    const isDark = document.documentElement.className.includes("dark");
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [intro, setIntro] = useState("");
    const [loadingIntro, setLoadingIntro] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(intro);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

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
                const isShared = lead.user_id && currentUserId && lead.user_id !== currentUserId;
                const sharedText = isShared ? `(Shared by ${lead.profiles?.name || "Connection"})` : null;

                return {
                    id: `lead_${i}`,
                    name: lead.name,
                    company: lead.company,
                    match_score: lead.match_score,
                    group: 2,
                    val: 15,
                    color: color,
                    sharedText: sharedText,
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
    }, [leads, isDark, userName, currentUserId]);

    useEffect(() => {
        if (fgRef.current) {
            // Drastically exaggerate the distance based on score differences
            (fgRef.current.d3Force as (...args: unknown[]) => unknown)("link").distance((link: { score: number }) => {
                const score = link.score;

                // If the score is very high (95+), keep them extremely close
                if (score >= 95) return 40;

                // For everything else, apply a steep exponential curve.
                // A 90 score will be relatively close, but an 80 will be pushed way out,
                // and a 60 will be pushed to the edges of the screen.
                const penalty = Math.pow((100 - score) / 10, 2.5);
                return 40 + (penalty * 30);
            });

            // Increase baseline repulsion so nodes push away from each other
            if ((fgRef.current.d3Force as (...args: unknown[]) => unknown)("charge")) {
                ((fgRef.current.d3Force as (...args: unknown[]) => unknown)("charge") as { strength: (v: number) => { distanceMax: (v: number) => void } }).strength(-500).distanceMax(400);
            }

            // Add a collision force to prevent nodes from ever overlapping, 
            // even if they have the exact same match score
            if (!(fgRef.current.d3Force as (...args: unknown[]) => unknown)("collide")) {
                import('d3-force').then(d3 => {
                    (fgRef.current.d3Force as (...args: unknown[]) => unknown)("collide", d3.forceCollide().radius(30).iterations(2));
                }).catch(() => {
                    // Fallback if d3-force isn't directly importable in this environment
                    console.log("Could not load d3-force collision");
                });
            }
        }
    }, [graphData]);

    const handleNodeClick = (node: { id: string, leadData: Lead, x: number, y: number }) => {
        if (node.id === "user") {
            setSelectedLead(null);
            setIntro("");
            setCopied(false);
            return;
        }
        setSelectedLead(node.leadData);
        setIntro(node.leadData.suggested_intro || "");
        setCopied(false);

        // Center camera on clicked node
        if (fgRef.current) {
            (fgRef.current.centerAt as (x: number, y: number, ms: number) => void)(node.x, node.y, 1000);
            (fgRef.current.zoom as (zoom: number, ms: number) => void)(1.5, 1000);
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
        } catch (e: any) {
            console.error(e);
            setIntro(e.message || "Failed to generate greeting.");
        } finally {
            setLoadingIntro(false);
        }
    };

    return (
        <div
            ref={containerRef}
            className="w-full h-[600px] rounded-lg border border-white/40 bg-white/60 backdrop-blur-xl shadow-sm overflow-hidden relative"
        >
            {/* Legend */}
            <div className="absolute top-4 left-4 bg-white/80 backdrop-blur-md border border-white/40 p-3 rounded-md shadow-sm z-10">
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
                nodeCanvasObject={(node: { x?: number, y?: number, val?: number, color?: string, name?: string, sharedText?: string | null }, ctx: CanvasRenderingContext2D, globalScale: number) => {
                    if (node.x === undefined || node.y === undefined || node.val === undefined || node.color === undefined) return;
                    // Draw Node Circle
                    ctx.beginPath();
                    ctx.arc(node.x, node.y, node.val / 2, 0, 2 * Math.PI, false);
                    ctx.fillStyle = node.color;
                    ctx.fill();

                    // Draw Text Label
                    const label = node.name || "";
                    const fontSize = 12 / globalScale;
                    ctx.font = `${fontSize}px Sans-Serif`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)';
                    // Position text slightly below the node
                    ctx.fillText(label, node.x, node.y + (node.val / 2) + fontSize + 2);

                    if (node.sharedText) {
                        ctx.font = `italic ${fontSize * 0.8}px Sans-Serif`;
                        ctx.fillStyle = isDark ? 'rgba(200, 200, 255, 0.7)' : 'rgba(100, 100, 150, 0.8)';
                        ctx.fillText(node.sharedText, node.x, node.y + (node.val / 2) + fontSize + 2 + fontSize);
                    }
                }}
                nodeColor={(node: { color?: string }) => node.color || ""}
                onNodeClick={handleNodeClick as (node: { id: string, leadData: Lead, x: number, y: number }) => void}
                nodeRelSize={1}
                nodeVal={(node: { val?: number }) => node.val || 1}
                linkColor={() => (isDark ? "#333" : "#ddd")}
                linkWidth={(link: { score?: number }) => Math.max(1, ((link.score || 0) / 100) * 8)}
                linkDirectionalParticles={2}
                linkDirectionalParticleSpeed={(d: { score?: number }) => ((d.score || 0) / 100) * 0.01}
                backgroundColor="transparent"
            />

            {/* Floating Selection Card */}
            {selectedLead && (
                <div className="absolute top-4 right-4 w-80 bg-white/90 backdrop-blur-xl border border-white/50 rounded-xl shadow-lg z-10 animate-fade-in flex flex-col max-h-[calc(100%-2rem)] overflow-y-auto">
                    <div className="p-4 border-b border-white/30 flex justify-between items-start sticky top-0 bg-white/90 backdrop-blur-xl z-20">
                        <div>
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                <h3 className="font-semibold text-lg leading-tight">{selectedLead.name}</h3>
                                {selectedLead.user_id && currentUserId && selectedLead.user_id !== currentUserId && (
                                    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] bg-primary/20 text-primary font-semibold">
                                        Shared by {selectedLead.profiles?.name || "Connection"}
                                    </span>
                                )}
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
                            <p className="text-sm text-foreground/90 leading-relaxed bg-white/50 p-2.5 rounded-md border border-white/40">
                                {selectedLead.match_reason_details || "No details provided."}
                            </p>
                        </div>

                        {!intro && !loadingIntro ? (
                            <Button onClick={() => generateIntro(selectedLead)} className="w-full gap-2 text-sm h-9" variant="outline">
                                <Sparkles className="w-4 h-4 text-primary" />
                                Generate Personalized Greeting
                            </Button>
                        ) : loadingIntro ? (
                            <Button disabled className="w-full gap-2 text-sm h-9 border-white/40 bg-white/50" variant="outline">
                                <Loader2 className="w-4 h-4 text-primary animate-spin" />
                                Generating...
                            </Button>
                        ) : (
                            <div className="bg-primary/5 text-primary-foreground border border-primary/20 p-3 rounded-lg animate-fade-in relative space-y-2">
                                <div className="flex justify-between items-start">
                                    <h4 className="text-xs font-bold text-primary mb-1.5 flex items-center gap-1.5 mt-1">
                                        <Sparkles className="w-3.5 h-3.5" /> AI Suggestion
                                    </h4>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 -mr-1 -mt-1 hover:bg-primary/10 text-primary/70 hover:text-primary"
                                        onClick={handleCopy}
                                        title="Copy to clipboard"
                                    >
                                        {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                                    </Button>
                                </div>
                                <p className="text-sm leading-relaxed text-foreground/90">{intro}</p>
                                <p className="text-[10px] text-muted-foreground italic">
                                    * We highly recommend further tailoring this greeting before reaching out!
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
