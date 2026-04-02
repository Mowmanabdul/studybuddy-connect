import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp } from "lucide-react";

interface ProgressSnapshotCardProps {
  diagnosticCount: number;
  sessionCount: number;
}

export function ProgressSnapshotCard({ diagnosticCount, sessionCount }: ProgressSnapshotCardProps) {
  const navigate = useNavigate();

  return (
    <div className="bg-card rounded-2xl shadow-soft p-6 border">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-9 h-9 rounded-xl bg-sunshine/15 flex items-center justify-center">
          <BarChart3 className="w-4 h-4 text-sunshine" />
        </div>
        <h2 className="font-display text-lg font-bold">Progress</h2>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-muted/40 rounded-xl p-4 text-center">
          <p className="font-display text-2xl font-bold text-primary">{diagnosticCount}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Tests Taken</p>
        </div>
        <div className="bg-muted/40 rounded-xl p-4 text-center">
          <p className="font-display text-2xl font-bold text-teal">{sessionCount}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Sessions</p>
        </div>
      </div>
      <Button
        variant="outline"
        className="w-full text-sm"
        onClick={() => navigate("/dashboard/progress")}
      >
        <TrendingUp className="w-4 h-4 mr-2" />
        View Full Progress
      </Button>
    </div>
  );
}
