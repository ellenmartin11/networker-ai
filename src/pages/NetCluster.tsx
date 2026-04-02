import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import ForceGraph2D from "react-force-graph-2d";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ManageTagsDialog, type ContactTag } from "@/components/ManageTagsDialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { X, ArrowLeft, Layers, Tag, Users, Info } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface Contact {
  id: string;
  name: string;
  headline: string | null;
  company: string | null;
  location: string | null;
  linkedin_url: string | null;
  netcluster_tags: string[] | null;
}

interface GraphNode {
  id: string;
  name: string;
  type: "tag" | "contact";
  color: string;
  val: number;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
  contactData?: Contact;
  tagData?: ContactTag;
}

interface GraphLink {
  source: string;
  target: string;
}

const UNGROUPED_COLOR = "#cbd5e1";

// Logo icon reused from Index
const NetClusterIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="20" cy="50" r="8" fill="currentColor" />
    <circle cx="50" cy="20" r="8" fill="currentColor" />
    <circle cx="80" cy="50" r="8" fill="currentColor" />
    <circle cx="50" cy="80" r="8" fill="currentColor" />
    <circle cx="50" cy="50" r="6" fill="currentColor" />
    <line x1="20" y1="50" x2="50" y2="50" />
    <line x1="50" y1="20" x2="50" y2="50" />
    <line x1="80" y1="50" x2="50" y2="50" />
    <line x1="50" y1="80" x2="50" y2="50" />
    <line x1="20" y1="50" x2="50" y2="20" />
    <line x1="80" y1="50" x2="50" y2="20" />
    <line x1="20" y1="50" x2="50" y2="80" />
    <line x1="80" y1="50" x2="50" y2="80" />
  </svg>
);

export default function NetCluster() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const fgRef = useRef<any>(null);

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [tags, setTags] = useState<ContactTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [activeTagFilter, setActiveTagFilter] = useState<string>("all");
  const [highlightedTagId, setHighlightedTagId] = useState<string | null>(null);
  const [savingTags, setSavingTags] = useState(false);

  // Fetch own contacts only (no shared)
  const fetchContacts = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("contacts")
      .select("id, name, headline, company, location, linkedin_url, netcluster_tags")
      .eq("user_id", user.id)
      .neq("priority", -1);
    if (!error && data) setContacts(data as any as Contact[]);
  }, [user]);

  const fetchTags = useCallback(async () => {
    if (!user) return;
    const { data, error } = await (supabase as any)
      .from("contact_tags")
      .select("id, name, color")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });
    if (!error && data) setTags(data as ContactTag[]);
  }, [user]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([fetchContacts(), fetchTags()]);
      setLoading(false);
    };
    load();
  }, [fetchContacts, fetchTags]);

  useEffect(() => {
    if (!containerRef.current) return;
    const update = () => {
      if (containerRef.current) {
        setDimensions({ width: containerRef.current.clientWidth, height: 560 });
      }
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Build graph data
  const graphData = useMemo(() => {
    const tagNames = new Set(tags.map((t) => t.name));
    const tagMap = new Map(tags.map((t) => [t.name, t]));

    // Filter by active tag filter
    const filteredContacts =
      activeTagFilter === "all"
        ? contacts
        : contacts.filter((c) => c.netcluster_tags?.includes(activeTagFilter));

    // Determine which tags are used
    const usedTagNames = new Set<string>();
    filteredContacts.forEach((c) =>
      (c.netcluster_tags || []).forEach((s) => { if (tagNames.has(s)) usedTagNames.add(s); })
    );

    const nodes: GraphNode[] = [];
    const links: GraphLink[] = [];

    // Tag nodes
    tags.forEach((tag) => {
      if (activeTagFilter !== "all" && tag.name !== activeTagFilter) return;
      nodes.push({
        id: `tag_${tag.name}`,
        name: tag.name,
        type: "tag",
        color: tag.color,
        val: 30,
        tagData: tag,
      });
    });

    // Contact nodes + links
    filteredContacts.forEach((c) => {
    const contactTags = (c.netcluster_tags || []).filter((s) => tagNames.has(s));
      const hasTag = contactTags.length > 0;
      nodes.push({
        id: `contact_${c.id}`,
        name: c.name,
        type: "contact",
        color: hasTag ? "#f8fafc" : UNGROUPED_COLOR,
        val: 12,
        contactData: c,
      });
      contactTags.forEach((tagName) => {
        links.push({ source: `contact_${c.id}`, target: `tag_${tagName}` });
      });
    });

    return { nodes, links };
  }, [contacts, tags, activeTagFilter]);

  // Apply force customizations
  useEffect(() => {
    if (!fgRef.current) return;
    const fg = fgRef.current;
    try {
      fg.d3Force("link").distance(80);
      const charge = fg.d3Force("charge");
      if (charge) charge.strength(-300).distanceMax(350);
    } catch (_) {}
  }, [graphData]);

  const handleNodeClick = (node: GraphNode) => {
    if (node.type === "tag") {
      setHighlightedTagId((prev) => (prev === node.id ? null : node.id));
      setSelectedContact(null);
      if (fgRef.current && node.x !== undefined && node.y !== undefined) {
        fgRef.current.centerAt(node.x, node.y, 800);
        fgRef.current.zoom(1.8, 800);
      }
    } else if (node.type === "contact" && node.contactData) {
      setSelectedContact(node.contactData);
      setHighlightedTagId(null);
      if (fgRef.current && node.x !== undefined && node.y !== undefined) {
        fgRef.current.centerAt(node.x, node.y, 800);
        fgRef.current.zoom(1.5, 800);
      }
    }
  };

  // Toggle a tag on/off for a contact
  const toggleContactTag = async (contact: Contact, tagName: string, checked: boolean) => {
    setSavingTags(true);
    const currentTags = contact.netcluster_tags || [];
    const newTags = checked
      ? [...new Set([...currentTags, tagName])]
      : currentTags.filter((s) => s !== tagName);

    const { error } = await (supabase as any)
      .from("contacts")
      .update({ netcluster_tags: newTags })
      .eq("id", contact.id);

    if (error) {
      toast.error("Failed to update tags.");
    } else {
      setContacts((prev) =>
        prev.map((c) => (c.id === contact.id ? { ...c, netcluster_tags: newTags } : c))
      );
      setSelectedContact((prev) => (prev?.id === contact.id ? { ...prev, netcluster_tags: newTags } : prev));
    }
    setSavingTags(false);
  };

  // Node painting
  const paintNode = (node: GraphNode, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const { x, y, val = 12, color, type, name, id } = node;
    if (x === undefined || y === undefined) return;
    const r = (val as number) / 2;

    const isHighlighted = highlightedTagId
      ? id === highlightedTagId ||
        graphData.links.some(
          (l) =>
            ((l as any).source?.id || l.source) === id &&
            ((l as any).target?.id || l.target) === highlightedTagId ||
            ((l as any).target?.id || l.target) === id &&
            ((l as any).source?.id || l.source) === highlightedTagId
        )
      : true;

    const alpha = isHighlighted ? 1 : 0.15;

    ctx.save();
    ctx.globalAlpha = alpha;

    if (type === "tag") {
      // Glowing tag ring
      const gradient = ctx.createRadialGradient(x, y, r * 0.3, x, y, r + 4);
      gradient.addColorStop(0, color + "ff");
      gradient.addColorStop(1, color + "00");
      ctx.beginPath();
      ctx.arc(x, y, r + 4, 0, 2 * Math.PI);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Solid fill
      ctx.beginPath();
      ctx.arc(x, y, r, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();

      // Label inside
      const fontSize = Math.max(10, 14 / globalScale);
      ctx.font = `bold ${fontSize}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#000000";
      ctx.fillText(name.length > 14 ? name.slice(0, 13) + "…" : name, x, y);
    } else {
      // Contact: white circle with subtle stroke
      ctx.beginPath();
      ctx.arc(x, y, r, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = "rgba(100,116,139,0.3)";
      ctx.lineWidth = 1 / globalScale;
      ctx.stroke();

      // Name below
      const fontSize = Math.max(8, 11 / globalScale);
      ctx.font = `${fontSize}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillStyle = "rgba(30,41,59,0.9)";
      ctx.fillText(name.split(" ")[0], x, y + r + 2);
    }

    ctx.restore();
  };

  const tagNames = new Set(tags.map((t) => t.name));

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e8f0fe] via-[#f0ebfa] to-[#e0f2f1]">
      {/* Header */}
      <header className="border-b border-white/20 bg-white/40 backdrop-blur-xl sticky top-0 z-20">
        <div className="container max-w-5xl py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center text-violet-600">
                <NetClusterIcon className="h-9 w-9" />
              </div>
              <div>
                <h1 className="font-display text-2xl tracking-tight text-violet-700 font-semibold">
                  Net<span className="text-indigo-500">Cluster</span>
                </h1>
                <p className="text-xs text-foreground/60 mt-0.5">See the patterns in your network</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/product")}
              className="gap-1.5 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to NetGraph
            </Button>
          </div>
        </div>
      </header>

      <main className="container max-w-5xl py-6 space-y-4">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-white/60 backdrop-blur-xl border border-white/40 shadow-sm rounded-lg px-3 py-2">
            <Tag className="h-4 w-4 text-violet-500 shrink-0" />
            <Select value={activeTagFilter} onValueChange={(v) => { setActiveTagFilter(v); setHighlightedTagId(null); setSelectedContact(null); }}>
              <SelectTrigger className="border-0 bg-transparent p-0 h-auto shadow-none focus:ring-0 text-sm font-medium w-44">
                <SelectValue placeholder="Filter by tag..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tags</SelectItem>
                {tags.map((t) => (
                  <SelectItem key={t.id} value={t.name}>
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: t.color }} />
                      {t.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <ManageTagsDialog onTagsChanged={async () => { await fetchTags(); await fetchContacts(); }} />

          <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground bg-white/40 border border-white/30 rounded-md px-3 py-1.5">
            <Users className="h-3.5 w-3.5" />
            {contacts.length} contacts · {tags.length} tags
          </div>
        </div>

        {/* Graph */}
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-[560px] rounded-xl" />
          </div>
        ) : tags.length === 0 ? (
          /* Empty state — no tags yet */
          <div className="flex flex-col items-center justify-center h-[560px] rounded-xl border-2 border-dashed border-violet-200 bg-white/40 backdrop-blur-xl text-center space-y-4 px-8">
            <div className="w-16 h-16 rounded-full bg-violet-50 flex items-center justify-center">
              <Layers className="h-8 w-8 text-violet-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-violet-700 mb-2">Welcome to NetCluster</h2>
              <p className="text-muted-foreground max-w-sm leading-relaxed">
                Start by creating tags to define your network clusters — like "Yale Contacts", "Family", or "Tech Founders".
              </p>
            </div>
            <ManageTagsDialog onTagsChanged={fetchTags} />
          </div>
        ) : (
          <div className="relative rounded-xl border border-white/40 bg-white/50 backdrop-blur-xl shadow-sm overflow-hidden" ref={containerRef}>
            {/* Legend */}
            <div className="absolute top-4 left-4 z-10 bg-white/80 backdrop-blur-md border border-white/40 rounded-lg p-3 shadow-sm max-w-[180px]">
              <h4 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Tag Clusters</h4>
              <div className="space-y-1.5">
                {tags.map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => { setHighlightedTagId((p) => p === `tag_${tag.name}` ? null : `tag_${tag.name}`); setSelectedContact(null); }}
                    className={`flex items-center gap-2 w-full text-left rounded px-1 py-0.5 transition-colors hover:bg-white/60 ${highlightedTagId === `tag_${tag.name}` ? "bg-white/80" : ""}`}
                  >
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: tag.color }} />
                    <span className="text-xs truncate">{tag.name}</span>
                  </button>
                ))}
                <div className="flex items-center gap-2 pt-1 mt-1 border-t border-border/30">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0 bg-slate-200" />
                  <span className="text-xs text-muted-foreground">Untagged</span>
                </div>
              </div>
              {highlightedTagId && (
                <button
                  onClick={() => setHighlightedTagId(null)}
                  className="mt-2 w-full text-[10px] text-muted-foreground hover:text-foreground text-center underline underline-offset-2"
                >
                  Clear highlight
                </button>
              )}
            </div>

            {/* Hint */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 bg-white/70 backdrop-blur-md border border-white/40 rounded-full px-3 py-1.5 text-[11px] text-muted-foreground shadow-sm pointer-events-none">
              <Info className="h-3 w-3 shrink-0" />
              Click a tag node to highlight its cluster · Click a contact to assign tags
            </div>

            <ForceGraph2D
              ref={fgRef}
              width={dimensions.width}
              height={dimensions.height}
              graphData={graphData as any}
              nodeCanvasObject={paintNode as any}
              nodeVal={(node: any) => node.val}
              onNodeClick={handleNodeClick as any}
              linkColor={() => "rgba(148,163,184,0.4)"}
              linkWidth={1.5}
              linkDirectionalParticles={1}
              linkDirectionalParticleSpeed={0.004}
              linkDirectionalParticleWidth={2}
              backgroundColor="transparent"
              nodeRelSize={1}
              cooldownTicks={120}
            />

            {/* Contact side panel */}
            {selectedContact && (
              <div className="absolute top-4 right-4 w-72 bg-white/95 backdrop-blur-xl border border-white/50 rounded-xl shadow-lg z-10 animate-fade-in flex flex-col max-h-[calc(100%-2rem)] overflow-y-auto">
                <div className="p-4 border-b border-white/30 flex justify-between items-start sticky top-0 bg-white/95 backdrop-blur-xl z-20">
                  <div>
                    <h3 className="font-semibold text-base leading-tight">{selectedContact.name}</h3>
                    {selectedContact.headline && (
                      <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{selectedContact.headline}</p>
                    )}
                    {selectedContact.company && (
                      <p className="text-xs text-muted-foreground">{selectedContact.company}</p>
                    )}
                  </div>
                  <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0 -mr-2 -mt-2 text-muted-foreground" onClick={() => setSelectedContact(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="p-4 space-y-3">
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2.5">
                      Assign Tags
                    </h4>
                    <div className="space-y-2">
                      {tags.map((tag) => {
                        const checked = selectedContact.netcluster_tags?.includes(tag.name) ?? false;
                        return (
                          <div key={tag.id} className="flex items-center gap-2.5">
                            <Checkbox
                              id={`tag-${tag.id}-${selectedContact.id}`}
                              checked={checked}
                              onCheckedChange={(v) => toggleContactTag(selectedContact, tag.name, v === true)}
                              disabled={savingTags}
                              className="border-slate-300"
                            />
                            <Label
                              htmlFor={`tag-${tag.id}-${selectedContact.id}`}
                              className="flex items-center gap-2 cursor-pointer text-sm font-normal"
                            >
                              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: tag.color }} />
                              {tag.name}
                            </Label>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Current tags as badges */}
                  {(selectedContact.netcluster_tags || []).filter((s) => tagNames.has(s)).length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                        Current Tags
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {(selectedContact.netcluster_tags || [])
                          .filter((s) => tagNames.has(s))
                          .map((s) => {
                            const tag = tags.find((t) => t.name === s);
                            return (
                              <Badge
                                key={s}
                                variant="secondary"
                                className="text-[10px] font-medium px-2 py-0.5"
                                style={{ backgroundColor: `${tag?.color}22`, color: tag?.color, borderColor: `${tag?.color}44` }}
                              >
                                {s}
                              </Badge>
                            );
                          })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
