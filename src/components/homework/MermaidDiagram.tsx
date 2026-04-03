import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";
import { Button } from "@/components/ui/button";
import { Maximize2, Minimize2 } from "lucide-react";

mermaid.initialize({
  startOnLoad: false,
  theme: "default",
  securityLevel: "loose",
  fontFamily: "inherit",
});

let diagramCounter = 0;

interface MermaidDiagramProps {
  chart: string;
}

export const MermaidDiagram = ({ chart }: MermaidDiagramProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const render = async () => {
      try {
        const id = `mermaid-${Date.now()}-${diagramCounter++}`;
        const { svg: rendered } = await mermaid.render(id, chart.trim());
        setSvg(rendered);
        setError(null);
      } catch (e) {
        console.error("Mermaid render error:", e);
        setError("Could not render diagram");
      }
    };
    render();
  }, [chart]);

  if (error) {
    return (
      <div className="my-3 p-3 bg-destructive/10 text-destructive rounded-xl text-sm">
        ⚠️ {error}
        <pre className="mt-2 text-xs opacity-70 whitespace-pre-wrap">{chart}</pre>
      </div>
    );
  }

  return (
    <div className="my-4 relative group">
      <div
        className={`bg-card border border-border/50 rounded-xl p-4 overflow-auto transition-all ${
          expanded ? "max-h-none" : "max-h-[400px]"
        }`}
      >
        <div
          ref={containerRef}
          className="flex justify-center [&>svg]:max-w-full"
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
      </Button>
    </div>
  );
};
