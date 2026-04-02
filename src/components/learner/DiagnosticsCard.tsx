import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Brain, ChevronRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Diagnostic {
  id: string;
  subject: string;
  score: number;
  total_questions: number;
  completed_at: string;
}

interface DiagnosticsCardProps {
  diagnostics: Diagnostic[];
  loading: boolean;
}

export function DiagnosticsCard({ diagnostics, loading }: DiagnosticsCardProps) {
  const navigate = useNavigate();

  return (
    <div className="bg-card rounded-2xl shadow-soft p-6 border">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-coral/15 flex items-center justify-center">
            <Brain className="w-4 h-4 text-coral" />
          </div>
          <h2 className="font-display text-lg font-bold">Diagnostics</h2>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate("/dashboard/diagnostic")}>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-3">
        {loading ? (
          [1, 2].map(i => (
            <div key={i} className="h-20 bg-muted/50 rounded-xl animate-pulse" />
          ))
        ) : diagnostics.length > 0 ? (
          diagnostics.map((diagnostic) => {
            const percentage = diagnostic.total_questions > 0
              ? Math.round((diagnostic.score / diagnostic.total_questions) * 100)
              : 0;
            const isGood = percentage >= 70;
            return (
              <div key={diagnostic.id} className="p-4 bg-muted/40 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-sm">{diagnostic.subject}</h4>
                  <span className={`text-sm font-bold px-2 py-0.5 rounded-full ${
                    isGood ? "text-teal bg-teal/10" : "text-coral bg-coral/10"
                  }`}>
                    {percentage}%
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-1.5 mb-2">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-700 ${
                      isGood ? "bg-teal" : "bg-coral"
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {diagnostic.completed_at
                    ? formatDistanceToNow(new Date(diagnostic.completed_at), { addSuffix: true })
                    : "Recently"}
                </p>
              </div>
            );
          })
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            <Brain className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No diagnostics completed yet</p>
          </div>
        )}

        <Button
          variant="outline"
          className="w-full text-sm"
          onClick={() => navigate("/dashboard/diagnostic")}
        >
          <Brain className="w-4 h-4 mr-2" />
          Take Diagnostic
        </Button>
      </div>
    </div>
  );
}
