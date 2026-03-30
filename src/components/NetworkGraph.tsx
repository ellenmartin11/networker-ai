import { useState, useEffect, useMemo, useRef } from "react";
import ForceGraph2D from "react-force-graph-2d";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";

interface Contact {
  id: string;
  name: string;
  headline: string | null;
  company: string | null;
  location: string | null;
  user_id?: string | null;
}

interface NetworkGraphProps {
  contacts: Contact[];
}

export function NetworkGraph({ contacts }: NetworkGraphProps) {
  const { user } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  const fgRef = useRef<any>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const isDark = document.documentElement.className.includes("dark");
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const { clientWidth } = containerRef.current;
    setDimensions({ width: clientWidth, height: 600 });

    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({ width: containerRef.current.clientWidth, height: 600 });
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const graphData = useMemo(() => {
    const userColor = isDark ? "#ffffff" : "#000000";
    const directContactColor = "#3b82f6"; // Blue
    const sharedContactColor = "#10b981"; // Green

    const nodes = [
      { id: "user", name: "You", group: 1, val: 25, color: userColor },
      ...contacts.map((c) => {
        const isShared = c.user_id && user && c.user_id !== user.id;
        return {
          id: c.id,
          name: c.name,
          company: c.company,
          group: 2,
          val: 15,
          color: isShared ? sharedContactColor : directContactColor,
          contactData: c,
        };
      }),
    ];

    const links = contacts.map((c) => ({
      source: "user",
      target: c.id,
    }));

    return { nodes, links };
  }, [contacts, isDark, user]);

  useEffect(() => {
    if (fgRef.current) {
      if ((fgRef.current.d3Force as (...args: unknown[]) => unknown)("charge")) {
        ((fgRef.current.d3Force as (...args: unknown[]) => unknown)("charge") as { strength: (v: number) => { distanceMax: (v: number) => void } }).strength(-300).distanceMax(500);
      }
    }
  }, [graphData]);

  const handleNodeClick = (node: { id: string, contactData: Contact, x: number, y: number }) => {
    if (node.id === "user") {
      setSelectedContact(null);
      return;
    }
    setSelectedContact(node.contactData);
    if (fgRef.current) {
      (fgRef.current.centerAt as (x: number, y: number, ms: number) => void)(node.x, node.y, 1000);
      (fgRef.current.zoom as (zoom: number, ms: number) => void)(1.5, 1000);
    }
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-[600px] rounded-lg border border-white/40 bg-white/60 backdrop-blur-xl shadow-sm overflow-hidden relative"
    >
      <div className="absolute top-4 left-4 bg-white/80 backdrop-blur-md border border-white/40 p-3 rounded-md shadow-sm z-10 flex flex-col gap-2">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Legend</h4>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#3b82f6]" />
          <span className="text-sm">My Contacts</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#10b981]" />
          <span className="text-sm">Shared by Connections</span>
        </div>
        <div className="flex items-center gap-2 border-t border-border pt-2 mt-1">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: isDark ? "#ffffff" : "#000000" }} />
          <span className="text-sm">You</span>
        </div>
      </div>

      <ForceGraph2D
        ref={fgRef}
        width={dimensions.width}
        height={dimensions.height}
        graphData={graphData}
        nodeCanvasObject={(node: { x?: number, y?: number, val?: number, color?: string, name?: string }, ctx: CanvasRenderingContext2D, globalScale: number) => {
          if (node.x === undefined || node.y === undefined || node.val === undefined || node.color === undefined) return;
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.val / 2, 0, 2 * Math.PI, false);
          ctx.fillStyle = node.color;
          ctx.fill();

          const label = node.name || "";
          const fontSize = 12 / globalScale;
          ctx.font = `${fontSize}px Sans-Serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)';
          ctx.fillText(label, node.x, node.y + (node.val / 2) + fontSize + 2);
        }}
        nodeColor={(node: { color?: string }) => node.color || ""}
        onNodeClick={handleNodeClick as (node: { id: string, contactData: Contact, x: number, y: number }) => void}
        nodeRelSize={1}
        nodeVal={(node: { val?: number }) => node.val || 1}
        linkColor={() => (isDark ? "#333" : "#ddd")}
        linkWidth={1}
        backgroundColor="transparent"
      />

      {selectedContact && (
        <div className="absolute top-4 right-4 w-72 bg-white/90 backdrop-blur-xl border border-white/50 rounded-xl shadow-lg z-10 p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-lg">{selectedContact.name}</h3>
            {selectedContact.user_id && user && selectedContact.user_id !== user.id && (
              <Badge variant="secondary" className="bg-green-100 text-green-800 text-[10px] px-2 py-0">Shared</Badge>
            )}
          </div>
          {selectedContact.headline && <p className="text-sm text-muted-foreground">{selectedContact.headline}</p>}
          {selectedContact.company && <p className="text-sm mt-1 flex items-center gap-1.5"><span className="text-muted-foreground inline-block w-4">🏢</span> {selectedContact.company}</p>}
          {selectedContact.location && <p className="text-sm mt-1 flex items-center gap-1.5"><span className="text-muted-foreground inline-block w-4">📍</span> {selectedContact.location}</p>}
          
          <button 
            onClick={() => setSelectedContact(null)}
            className="mt-4 w-full bg-secondary hover:bg-secondary/80 text-secondary-foreground py-1.5 rounded-md text-sm font-medium transition-colors"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}
