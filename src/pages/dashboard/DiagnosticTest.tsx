import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GraduationCap, ArrowLeft, Brain } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { DiagnosticTest as DiagnosticTestType } from "@/hooks/useDiagnostics";
import { TestSelection } from "@/components/diagnostics/TestSelection";
import { TestRunner } from "@/components/diagnostics/TestRunner";
import { ResultsView } from "@/components/diagnostics/ResultsView";

type ViewState = 
  | { type: "selection" }
  | { type: "running"; test: DiagnosticTestType }
  | { type: "results"; test: DiagnosticTestType; attemptId: string; score: number; totalQuestions: number };

const DiagnosticTest = () => {
  const { profile } = useAuth();
  const [view, setView] = useState<ViewState>({ type: "selection" });

  const handleSelectTest = (test: DiagnosticTestType) => {
    setView({ type: "running", test });
  };

  const handleComplete = (attemptId: string, score: number) => {
    if (view.type === "running") {
      setView({
        type: "results",
        test: view.test,
        attemptId,
        score,
        totalQuestions: view.test.total_questions,
      });
    }
  };

  const handleBack = () => {
    setView({ type: "selection" });
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/dashboard/learner">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            <div className="h-6 w-px bg-border" />
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-hero rounded-lg flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-lg hidden sm:block">Thuto AI</span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            <span className="font-semibold">Diagnostic Tests</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {view.type === "selection" && (
          <TestSelection 
            userGrade={profile?.grade || undefined} 
            onSelectTest={handleSelectTest} 
          />
        )}

        {view.type === "running" && (
          <TestRunner 
            test={view.test} 
            onComplete={handleComplete}
            onCancel={handleBack}
          />
        )}

        {view.type === "results" && (
          <ResultsView
            attemptId={view.attemptId}
            test={view.test}
            score={view.score}
            totalQuestions={view.totalQuestions}
            onBack={handleBack}
          />
        )}
      </main>
    </div>
  );
};

export default DiagnosticTest;
