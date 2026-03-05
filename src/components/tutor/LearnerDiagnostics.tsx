import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { useTutorLearners } from "@/hooks/useTutorLearners";
import { useDiagnostics, DiagnosticRecommendation } from "@/hooks/useDiagnostics";
import {
  Users,
  ChevronRight,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Target,
  BookOpen,
  Calendar,
  FileText,
} from "lucide-react";

export function LearnerDiagnostics() {
  const { learners, loading } = useTutorLearners();
  const { fetchRecommendation } = useDiagnostics();
  const [selectedAttemptId, setSelectedAttemptId] = useState<string | null>(null);
  const [recommendation, setRecommendation] = useState<DiagnosticRecommendation | null>(null);
  const [recLoading, setRecLoading] = useState(false);

  const handleViewRecommendation = async (attemptId: string) => {
    setSelectedAttemptId(attemptId);
    setRecLoading(true);
    const rec = await fetchRecommendation(attemptId);
    setRecommendation(rec);
    setRecLoading(false);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300";
      case "medium": return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300";
      case "low": return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300";
      default: return "";
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" /> Learner Diagnostic Results
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  // Show recommendation detail view
  if (selectedAttemptId) {
    // Find the attempt info
    let attemptInfo: { learnerName: string; testTitle: string; score: number; total: number } | null = null;
    for (const l of learners) {
      const attempt = l.attempts.find((a) => a.id === selectedAttemptId);
      if (attempt) {
        attemptInfo = {
          learnerName: `${l.profile.first_name} ${l.profile.last_name}`,
          testTitle: attempt.diagnostic_tests?.title || "Unknown Test",
          score: attempt.score || 0,
          total: attempt.total_questions || 0,
        };
        break;
      }
    }

    const percentage = attemptInfo ? Math.round((attemptInfo.score / (attemptInfo.total || 1)) * 100) : 0;

    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => { setSelectedAttemptId(null); setRecommendation(null); }}>
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
            <div>
              <CardTitle className="text-lg">{attemptInfo?.learnerName}</CardTitle>
              <p className="text-sm text-muted-foreground">{attemptInfo?.testTitle} — {percentage}% ({attemptInfo?.score}/{attemptInfo?.total})</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {recLoading && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Sparkles className="w-4 h-4 animate-pulse" />
                <span className="text-sm">Loading recommendations...</span>
              </div>
              <Skeleton className="h-20 w-full" />
              <div className="grid gap-4 sm:grid-cols-2">
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
              </div>
            </div>
          )}

          {!recLoading && !recommendation && (
            <div className="text-center py-8 text-muted-foreground">
              <AlertTriangle className="w-10 h-10 mx-auto mb-3" />
              <p className="font-medium">No AI recommendations available yet</p>
              <p className="text-sm">Recommendations are generated when the learner completes their test.</p>
            </div>
          )}

          {!recLoading && recommendation && (
            <div className="space-y-6">
              {/* Overall Analysis */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <h4 className="font-semibold">AI Analysis</h4>
                </div>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {recommendation.overall_analysis}
                </p>
              </div>

              {/* Strengths & Weaknesses */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="bg-green-50 dark:bg-green-950/30 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <h4 className="font-semibold text-sm">Strengths</h4>
                  </div>
                  <ul className="space-y-2">
                    {recommendation.strengths.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <TrendingUp className="w-3 h-3 text-green-600 mt-1 flex-shrink-0" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-amber-50 dark:bg-amber-950/30 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    <h4 className="font-semibold text-sm">Areas to Improve</h4>
                  </div>
                  <ul className="space-y-2">
                    {recommendation.weaknesses.map((w, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <Target className="w-3 h-3 text-amber-500 mt-1 flex-shrink-0" />
                        <span>{w}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Recommendations */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen className="w-4 h-4 text-primary" />
                  <h4 className="font-semibold">Study Recommendations</h4>
                </div>
                <div className="space-y-3">
                  {recommendation.recommendations.map((rec, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <Badge className={getPriorityColor(rec.priority)}>{rec.priority}</Badge>
                      <div>
                        <p className="font-medium text-sm">{rec.topic}</p>
                        <p className="text-xs text-muted-foreground">{rec.suggestion}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Study Plan */}
              {recommendation.study_plan && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    <h4 className="font-semibold">1-Week Study Plan</h4>
                  </div>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {recommendation.study_plan}
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Main list view
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" /> Learner Diagnostic Results
          </CardTitle>
          <Badge variant="secondary">{learners.length} learner{learners.length !== 1 ? "s" : ""}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {learners.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="w-10 h-10 mx-auto mb-3" />
            <p className="font-medium">No learner results yet</p>
            <p className="text-sm">Results will appear here once your learners complete diagnostic tests.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {learners.map((learner) => (
              <div key={learner.profile.user_id} className="space-y-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={learner.profile.avatar_url || undefined} />
                    <AvatarFallback className="bg-gradient-hero text-primary-foreground text-xs">
                      {learner.profile.first_name[0]}{learner.profile.last_name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-sm">{learner.profile.first_name} {learner.profile.last_name}</p>
                    {learner.profile.grade && (
                      <p className="text-xs text-muted-foreground">Grade {learner.profile.grade}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2 pl-12">
                  {learner.attempts.slice(0, 5).map((attempt) => {
                    const pct = attempt.total_questions
                      ? Math.round(((attempt.score || 0) / attempt.total_questions) * 100)
                      : 0;
                    return (
                      <div
                        key={attempt.id}
                        className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                        onClick={() => handleViewRecommendation(attempt.id)}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {attempt.diagnostic_tests?.title || "Test"}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Progress value={pct} className="h-2 flex-1" />
                            <span className="text-xs font-medium text-muted-foreground w-10 text-right">{pct}%</span>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
