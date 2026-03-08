import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  GraduationCap,
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Target,
  Trophy,
  Brain,
  BookOpen,
  BarChart3,
  Flame,
  AlertTriangle,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import GoalTracker from "@/components/progress/GoalTracker";

interface AttemptWithTest {
  id: string;
  score: number;
  total_questions: number;
  completed_at: string;
  time_spent_seconds: number | null;
  test_id: string;
  diagnostic_tests: {
    title: string;
    subject: string;
    grade: string;
  } | null;
}

interface QuizSession {
  id: string;
  score: number | null;
  total_questions: number;
  completed_at: string | null;
  subject: string;
  difficulty: string;
}

interface TopicPerformance {
  topic: string;
  correct: number;
  total: number;
  percentage: number;
}

const LearnerProgress = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState<AttemptWithTest[]>([]);
  const [quizSessions, setQuizSessions] = useState<QuizSession[]>([]);
  const [topicData, setTopicData] = useState<TopicPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [subjectFilter, setSubjectFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"all" | "diagnostics" | "quizzes">("all");

  useEffect(() => {
    if (!user) return;
    fetchProgressData();
  }, [user]);

  const fetchProgressData = async () => {
    if (!user) return;
    setLoading(true);

    const [attemptsRes, answersRes, quizzesRes] = await Promise.all([
      supabase
        .from("diagnostic_attempts")
        .select(`*, diagnostic_tests (title, subject, grade)`)
        .eq("user_id", user.id)
        .eq("status", "completed")
        .order("completed_at", { ascending: true }),
      supabase
        .from("diagnostic_answers")
        .select(`
          is_correct,
          diagnostic_questions (topic),
          diagnostic_attempts!inner (user_id, status)
        `)
        .eq("diagnostic_attempts.user_id", user.id)
        .eq("diagnostic_attempts.status", "completed"),
      supabase
        .from("quiz_sessions")
        .select("id, score, total_questions, completed_at, subject, difficulty")
        .eq("user_id", user.id)
        .eq("status", "completed")
        .order("completed_at", { ascending: true }),
    ]);

    if (attemptsRes.data) {
      setAttempts(attemptsRes.data as AttemptWithTest[]);
    }

    if (quizzesRes.data) {
      setQuizSessions(quizzesRes.data as QuizSession[]);
    }

    if (answersRes.data) {
      const topicMap = new Map<string, { correct: number; total: number }>();
      for (const answer of answersRes.data as any[]) {
        const topic = answer.diagnostic_questions?.topic || "Unknown";
        const existing = topicMap.get(topic) || { correct: 0, total: 0 };
        existing.total++;
        if (answer.is_correct) existing.correct++;
        topicMap.set(topic, existing);
      }
      setTopicData(
        Array.from(topicMap.entries())
          .map(([topic, data]) => ({
            topic,
            correct: data.correct,
            total: data.total,
            percentage: Math.round((data.correct / data.total) * 100),
          }))
          .sort((a, b) => b.total - a.total)
      );
    }

    setLoading(false);
  };

  const filteredAttempts =
    subjectFilter === "all"
      ? attempts
      : attempts.filter((a) => a.diagnostic_tests?.subject === subjectFilter);

  const filteredQuizzes =
    subjectFilter === "all"
      ? quizSessions
      : quizSessions.filter((q) => q.subject === subjectFilter);

  const allSubjects = [
    ...new Set([
      ...attempts.map((a) => a.diagnostic_tests?.subject).filter(Boolean),
      ...quizSessions.map((q) => q.subject).filter(Boolean),
    ]),
  ] as string[];

  // Combined trend data from both diagnostics and quizzes
  const diagnosticTrendData = viewMode !== "quizzes" ? filteredAttempts.map((a) => ({
    date: format(new Date(a.completed_at), "dd MMM"),
    score: Math.round(((a.score || 0) / (a.total_questions || 1)) * 100),
    label: a.diagnostic_tests?.title || "Diagnostic",
    type: "diagnostic" as const,
    timestamp: new Date(a.completed_at).getTime(),
  })) : [];

  const quizTrendData = viewMode !== "diagnostics" ? filteredQuizzes.filter(q => q.completed_at).map((q) => ({
    date: format(new Date(q.completed_at!), "dd MMM"),
    score: Math.round(((q.score || 0) / (q.total_questions || 1)) * 100),
    label: `${q.subject} Quiz`,
    type: "quiz" as const,
    timestamp: new Date(q.completed_at!).getTime(),
  })) : [];

  const trendData = [...diagnosticTrendData, ...quizTrendData]
    .sort((a, b) => a.timestamp - b.timestamp)
    .map(({ date, score, label, type }) => ({ date, score, test: label, type }));

  // Subject averages including both diagnostics and quizzes
  const subjectAvg = allSubjects.map((subject) => {
    const subjectAttempts = attempts.filter((a) => a.diagnostic_tests?.subject === subject);
    const subjectQuizzes = quizSessions.filter((q) => q.subject === subject);
    
    const diagAvg = subjectAttempts.length > 0
      ? subjectAttempts.reduce((sum, a) => sum + ((a.score || 0) / (a.total_questions || 1)) * 100, 0) / subjectAttempts.length
      : 0;
    
    const quizAvg = subjectQuizzes.length > 0
      ? subjectQuizzes.reduce((sum, q) => sum + ((q.score || 0) / (q.total_questions || 1)) * 100, 0) / subjectQuizzes.length
      : 0;
    
    const totalCount = subjectAttempts.length + subjectQuizzes.length;
    const combinedAvg = totalCount > 0
      ? (diagAvg * subjectAttempts.length + quizAvg * subjectQuizzes.length) / totalCount
      : 0;
    
    return {
      subject: subject!,
      average: Math.round(combinedAvg),
      tests: subjectAttempts.length,
      quizzes: subjectQuizzes.length,
    };
  });

  const totalTests = attempts.length;
  const totalQuizzes = quizSessions.length;
  const totalActivities = totalTests + totalQuizzes;

  const allScores = [
    ...attempts.map(a => ((a.score || 0) / (a.total_questions || 1)) * 100),
    ...quizSessions.map(q => ((q.score || 0) / (q.total_questions || 1)) * 100),
  ];
  
  const overallAvg = allScores.length > 0
    ? Math.round(allScores.reduce((sum, s) => sum + s, 0) / allScores.length)
    : 0;

  const recentScores = allScores.slice(-5);
  const recentAvg = recentScores.length > 0
    ? Math.round(recentScores.reduce((sum, s) => sum + s, 0) / recentScores.length)
    : overallAvg;

  const trend = recentAvg - overallAvg;

  // Quiz-specific stats
  const quizAvg = totalQuizzes > 0
    ? Math.round(quizSessions.reduce((sum, q) => sum + ((q.score || 0) / (q.total_questions || 1)) * 100, 0) / totalQuizzes)
    : 0;

  // Split topics into strengths (≥70%) and weaknesses (<70%), top 3 each
  const strengths = [...topicData].sort((a, b) => b.percentage - a.percentage).filter(t => t.percentage >= 50).slice(0, 3);
  const weaknesses = [...topicData].sort((a, b) => a.percentage - b.percentage).filter(t => t.percentage < 70).slice(0, 3);

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-card border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard/learner")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Dashboard
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-hero rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-lg">Progress</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {loading ? (
          <div className="space-y-6">
            <div className="grid sm:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 rounded-2xl" />
              ))}
            </div>
            <Skeleton className="h-72 rounded-2xl" />
          </div>
        ) : totalActivities === 0 ? (
          <div className="text-center py-20">
            <BarChart3 className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
            <h2 className="font-display text-2xl font-bold mb-2">No Progress Data Yet</h2>
            <p className="text-muted-foreground mb-6">
              Complete diagnostic tests or quizzes to start tracking your learning journey.
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="hero" onClick={() => navigate("/dashboard/diagnostic")}>
                <Brain className="w-4 h-4 mr-2" />
                Take a Diagnostic
              </Button>
              <Button variant="outline" onClick={() => navigate("/dashboard/quiz")}>
                <Flame className="w-4 h-4 mr-2" />
                Quick Quiz
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Compact Stats */}
            <div className="grid sm:grid-cols-4 gap-4">
              <Card className="rounded-2xl shadow-card">
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                      <Brain className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold leading-tight">{totalTests}</p>
                      <p className="text-xs text-muted-foreground">Diagnostics</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl shadow-card">
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center shrink-0">
                      <Flame className="w-5 h-5 text-accent-foreground" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold leading-tight">{totalQuizzes}</p>
                      <p className="text-xs text-muted-foreground">Quizzes · {quizAvg}% avg</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl shadow-card">
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center shrink-0">
                      <Target className="w-5 h-5 text-secondary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold leading-tight">{overallAvg}%</p>
                      <p className="text-xs text-muted-foreground">Overall Average</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl shadow-card">
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${trend >= 0 ? "bg-secondary/10" : "bg-destructive/10"}`}>
                      {trend >= 0 ? (
                        <TrendingUp className="w-5 h-5 text-secondary" />
                      ) : (
                        <TrendingDown className="w-5 h-5 text-destructive" />
                      )}
                    </div>
                    <div>
                      <p className="text-2xl font-bold leading-tight">
                        {trend >= 0 ? "+" : ""}{trend}%
                      </p>
                      <p className="text-xs text-muted-foreground">Recent Trend</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Strengths & Weaknesses — compact highlight */}
            {(strengths.length > 0 || weaknesses.length > 0) && (
              <div className="grid sm:grid-cols-2 gap-4">
                {strengths.length > 0 && (
                  <Card className="rounded-2xl shadow-card border-secondary/20">
                    <CardContent className="pt-5 pb-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Flame className="w-4 h-4 text-secondary" />
                        <span className="text-sm font-semibold text-secondary">Strengths</span>
                      </div>
                      <div className="space-y-2">
                        {strengths.map((t) => (
                          <div key={t.topic} className="flex items-center justify-between gap-2">
                            <span className="text-sm truncate">{t.topic}</span>
                            <Badge variant="secondary" className="shrink-0 text-xs bg-secondary/10 text-secondary border-0">
                              {t.percentage}%
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {weaknesses.length > 0 && (
                  <Card className="rounded-2xl shadow-card border-destructive/20">
                    <CardContent className="pt-5 pb-4">
                      <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle className="w-4 h-4 text-destructive" />
                        <span className="text-sm font-semibold text-destructive">Needs Work</span>
                      </div>
                      <div className="space-y-2">
                        {weaknesses.map((t) => (
                          <div key={t.topic} className="flex items-center justify-between gap-2">
                            <span className="text-sm truncate">{t.topic}</span>
                            <Badge variant="outline" className="shrink-0 text-xs text-destructive border-destructive/30">
                              {t.percentage}%
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Score Trend */}
            <Card className="rounded-2xl shadow-card">
              <CardHeader className="pb-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    Score Trend
                  </CardTitle>
                  <div className="flex gap-1.5 flex-wrap">
                    <Badge
                      variant={subjectFilter === "all" ? "default" : "outline"}
                      className="cursor-pointer text-xs"
                      onClick={() => setSubjectFilter("all")}
                    >
                      All
                    </Badge>
                    {subjects.map((s) => (
                      <Badge
                        key={s}
                        variant={subjectFilter === s ? "default" : "outline"}
                        className="cursor-pointer text-xs"
                        onClick={() => setSubjectFilter(s!)}
                      >
                        {s}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {trendData.length > 1 ? (
                  <ResponsiveContainer width="100%" height={240}>
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                      <YAxis domain={[0, 100]} stroke="hsl(var(--muted-foreground))" fontSize={11} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "0.75rem",
                          fontSize: 12,
                        }}
                        formatter={(value: number, _name: string, props: any) => [
                          `${value}%`,
                          props.payload.test,
                        ]}
                      />
                      <Line
                        type="monotone"
                        dataKey="score"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2.5}
                        dot={{ r: 4, fill: "hsl(var(--primary))", strokeWidth: 2, stroke: "hsl(var(--card))" }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Complete more tests to see your trend</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Subject Performance */}
            {subjectAvg.length > 0 && (
              <Card className="rounded-2xl shadow-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-primary" />
                    By Subject
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {subjectAvg.map((s) => (
                      <div key={s.subject} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{s.subject}</span>
                          <span className="text-muted-foreground">{s.average}% · {s.tests} tests</span>
                        </div>
                        <Progress value={s.average} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Learning Goals */}
            {user && (
              <GoalTracker
                userId={user.id}
                subjectAverages={subjectAvg}
                availableSubjects={subjects as string[]}
              />
            )}

            {/* Recent Tests — compact list, last 5 */}
            <Card className="rounded-2xl shadow-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-primary" />
                  Recent Tests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[...attempts].reverse().slice(0, 5).map((attempt) => {
                    const pct = Math.round(
                      ((attempt.score || 0) / (attempt.total_questions || 1)) * 100
                    );
                    return (
                      <div
                        key={attempt.id}
                        className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {attempt.diagnostic_tests?.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(attempt.completed_at), "dd MMM yyyy")}
                            {attempt.time_spent_seconds &&
                              ` · ${Math.round(attempt.time_spent_seconds / 60)}min`}
                          </p>
                        </div>
                        <Badge
                          variant={pct >= 70 ? "default" : "secondary"}
                          className={pct >= 70 ? "bg-secondary text-secondary-foreground" : ""}
                        >
                          {pct}%
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default LearnerProgress;
