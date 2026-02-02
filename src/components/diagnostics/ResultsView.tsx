import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useDiagnostics, DiagnosticTest, DiagnosticRecommendation } from "@/hooks/useDiagnostics";
import { 
  Trophy, 
  Target, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Calendar, 
  ArrowLeft,
  Sparkles,
  BookOpen
} from "lucide-react";

interface ResultsViewProps {
  attemptId: string;
  test: DiagnosticTest;
  score: number;
  totalQuestions: number;
  onBack: () => void;
}

export function ResultsView({ attemptId, test, score, totalQuestions, onBack }: ResultsViewProps) {
  const [recommendation, setRecommendation] = useState<DiagnosticRecommendation | null>(null);
  const [loading, setLoading] = useState(true);
  const { generateRecommendations, fetchRecommendation } = useDiagnostics();

  const percentage = Math.round((score / totalQuestions) * 100);

  useEffect(() => {
    const loadOrGenerateRecommendations = async () => {
      setLoading(true);
      
      // First, check if recommendations already exist
      let rec = await fetchRecommendation(attemptId);
      
      if (!rec) {
        // Generate new recommendations
        rec = await generateRecommendations(attemptId);
      }
      
      setRecommendation(rec);
      setLoading(false);
    };
    
    loadOrGenerateRecommendations();
  }, [attemptId]);

  const getScoreLevel = () => {
    if (percentage >= 80) return { label: "Excellent!", color: "text-green-600", bg: "bg-green-100" };
    if (percentage >= 60) return { label: "Good Progress", color: "text-teal", bg: "bg-teal/10" };
    if (percentage >= 40) return { label: "Keep Practicing", color: "text-yellow-600", bg: "bg-yellow-100" };
    return { label: "Needs Improvement", color: "text-coral", bg: "bg-coral/10" };
  };

  const scoreLevel = getScoreLevel();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300";
      case "medium":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300";
      case "low":
        return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Tests
        </Button>
      </div>

      {/* Score Card */}
      <Card className="overflow-hidden">
        <div className={`${scoreLevel.bg} p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium mb-1">{test.title}</p>
              <h2 className={`font-display text-3xl font-bold ${scoreLevel.color}`}>
                {scoreLevel.label}
              </h2>
            </div>
            <div className="text-center">
              <div className="relative w-24 h-24">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-muted/30"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={251.2}
                    strokeDashoffset={251.2 - (251.2 * percentage) / 100}
                    className={scoreLevel.color}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-2xl font-bold ${scoreLevel.color}`}>{percentage}%</span>
                </div>
              </div>
              <p className="text-sm mt-2">
                {score}/{totalQuestions} correct
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* AI Analysis Loading */}
      {loading && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary animate-pulse" />
              <CardTitle className="text-lg">Generating Personalized Recommendations...</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <div className="grid gap-4 sm:grid-cols-2">
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
            </div>
            <Skeleton className="h-48 w-full" />
          </CardContent>
        </Card>
      )}

      {/* AI Recommendations */}
      {!loading && recommendation && (
        <>
          {/* Overall Analysis */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg">AI Analysis</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {recommendation.overall_analysis}
              </p>
            </CardContent>
          </Card>

          {/* Strengths & Weaknesses */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <CardTitle className="text-lg">Strengths</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {recommendation.strengths.map((strength, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <TrendingUp className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{strength}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  <CardTitle className="text-lg">Areas to Improve</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {recommendation.weaknesses.map((weakness, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Target className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{weakness}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg">Study Recommendations</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recommendation.recommendations.map((rec, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="flex-shrink-0 mt-0.5">
                      <Badge className={getPriorityColor(rec.priority)}>
                        {rec.priority}
                      </Badge>
                    </div>
                    <div>
                      <p className="font-medium">{rec.topic}</p>
                      <p className="text-sm text-muted-foreground">{rec.suggestion}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Study Plan */}
          {recommendation.study_plan && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  <CardTitle className="text-lg">Your 1-Week Study Plan</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {recommendation.study_plan}
                </p>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* No Recommendations */}
      {!loading && !recommendation && (
        <Card>
          <CardContent className="py-8 text-center">
            <AlertTriangle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">Unable to generate recommendations</h3>
            <p className="text-muted-foreground">
              Please try again later or contact support if the issue persists.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button onClick={onBack} variant="outline" className="flex-1">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Take Another Test
        </Button>
        <Button className="flex-1">
          <Calendar className="w-4 h-4 mr-2" />
          Book a Tutoring Session
        </Button>
      </div>
    </div>
  );
}
