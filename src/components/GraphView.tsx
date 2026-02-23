import { useMemo, useRef, useState, useEffect } from "react";
import ForceGraph2D from "react-force-graph-2d";
import { Lead } from "./LeadsTab";

interface GraphViewProps {
    leads: Lead[];
    userName?: string;
}

export function GraphView({ leads, userName }: GraphViewProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const fgRef = useRef<any>();
    const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
    const isDark = document.documentElement.className.includes("dark");

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
        const nodes = [
            { id: "user", name: userName || "You", group: 1, val: 25, color: "hsl(var(--primary))" },
            ...leads.map((lead, i) => ({
                id: `lead_${i}`,
                name: lead.name,
                company: lead.company,
                match_score: lead.match_score,
                group: 2,
                val: 15,
                color:
                    lead.match_score >= 90
                        ? "#10b981"
                        : lead.match_score >= 70
                            ? "#3b82f6"
                            : "#8b5cf6",
            })),
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

    return (
        <div
            ref={containerRef}
            className="w-full h-[500px] rounded-lg border border-border bg-card overflow-hidden"
        >
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
                nodeRelSize={1}
                nodeVal={(node: any) => node.val}
                linkColor={() => (isDark ? "#333" : "#ddd")}
                linkWidth={(link: any) => Math.max(1, (link.score / 100) * 8)}
                linkDirectionalParticles={2}
                linkDirectionalParticleSpeed={(d: any) => (d.score / 100) * 0.01}
                backgroundColor={isDark ? "hsl(var(--card))" : "#ffffff"}
            />
        </div>
    );
}
