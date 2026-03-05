import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Calendar,
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
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

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
  const [topicData, setTopicData] = useState<TopicPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [subjectFilter, setSubjectFilter] = useState<string>("all");

  useEffect(() => {
    if (!user) return;
    fetchProgressData();
  }, [user]);

  const fetchProgressData = async () => {
    if (!user) return;
    setLoading(true);

    const [attemptsRes, answersRes] = await Promise.all([
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
    ]);

    if (attemptsRes.data) {
      setAttempts(attemptsRes.data as AttemptWithTest[]);
    }

    // Build topic performance
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

  const subjects = [...new Set(attempts.map((a) => a.diagnostic_tests?.subject).filter(Boolean))];

  // Chart data: score trend over time
  const trendData = filteredAttempts.map((a) => ({
    date: format(new Date(a.completed_at), "dd MMM"),
    score: Math.round(((a.score || 0) / (a.total_questions || 1)) * 100),
    test: a.diagnostic_tests?.title || "",
  }));

  // Subject comparison
  const subjectAvg = subjects.map((subject) => {
    const subjectAttempts = attempts.filter((a) => a.diagnostic_tests?.subject === subject);
    const avg =
      subjectAttempts.reduce(
        (sum, a) => sum + ((a.score || 0) / (a.total_questions || 1)) * 100,
        0
      ) / (subjectAttempts.length || 1);
    return { subject: subject!, average: Math.round(avg), tests: subjectAttempts.length };
  });

  // Radar data (top 8 topics)
  const radarData = topicData.slice(0, 8).map((t) => ({
    topic: t.topic.length > 15 ? t.topic.substring(0, 15) + "…" : t.topic,
    score: t.percentage,
    fullMark: 100,
  }));

  // Stats
  const totalTests = attempts.length;
  const overallAvg =
    totalTests > 0
      ? Math.round(
          attempts.reduce(
            (sum, a) => sum + ((a.score || 0) / (a.total_questions || 1)) * 100,
            0
          ) / totalTests
        )
      : 0;

  const recentAvg =
    attempts.length >= 3
      ? Math.round(
          attempts
            .slice(-3)
            .reduce(
              (sum, a) => sum + ((a.score || 0) / (a.total_questions || 1)) * 100,
              0
            ) / 3
        )
      : overallAvg;

  const trend = recentAvg - overallAvg;
  const bestTopic = topicData.length > 0 ? topicData.reduce((a, b) => (a.percentage > b.percentage ? a : b)) : null;
  const weakestTopic = topicData.length > 0 ? topicData.reduce((a, b) => (a.percentage < b.percentage ? a : b)) : null;

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
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
            <span className="font-display font-bold text-lg">Progress Tracker</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {loading ? (
          <div className="space-y-6">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-28 rounded-2xl" />
              ))}
            </div>
            <Skeleton className="h-80 rounded-2xl" />
          </div>
        ) : totalTests === 0 ? (
          <div className="text-center py-20">
            <BarChart3 className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
            <h2 className="font-display text-2xl font-bold mb-2">No Progress Data Yet</h2>
            <p className="text-muted-foreground mb-6">
              Complete diagnostic tests to start tracking your learning journey.
            </p>
            <Button variant="hero" onClick={() => navigate("/dashboard/diagnostic")}>
              <Brain className="w-4 h-4 mr-2" />
              Take Your First Test
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Stats Row */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="rounded-2xl shadow-card">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-coral/20 rounded-xl flex items-center justify-center">
                      <Brain className="w-6 h-6 text-coral" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{totalTests}</p>
                      <p className="text-sm text-muted-foreground">Tests Taken</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl shadow-card">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-teal/20 rounded-xl flex items-center justify-center">
                      <Target className="w-6 h-6 text-teal" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{overallAvg}%</p>
                      <p className="text-sm text-muted-foreground">Overall Average</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl shadow-card">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-sunshine/20 rounded-xl flex items-center justify-center">
                      {trend >= 0 ? (
                        <TrendingUp className="w-6 h-6 text-sunshine" />
                      ) : (
                        <TrendingDown className="w-6 h-6 text-destructive" />
                      )}
                    </div>
                    <div>
                      <p className="text-2xl font-bold">
                        {trend >= 0 ? "+" : ""}
                        {trend}%
                      </p>
                      <p className="text-sm text-muted-foreground">Recent Trend</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl shadow-card">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-lavender/20 rounded-xl flex items-center justify-center">
                      <Trophy className="w-6 h-6 text-lavender" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold truncate max-w-[120px]">
                        {bestTopic?.topic || "—"}
                      </p>
                      <p className="text-sm text-muted-foreground">Strongest Topic</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Score Trend Chart */}
            <Card className="rounded-2xl shadow-card">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Score Trend
                  </CardTitle>
                  <div className="flex gap-2 flex-wrap">
                    <Badge
                      variant={subjectFilter === "all" ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => setSubjectFilter("all")}
                    >
                      All Subjects
                    </Badge>
                    {subjects.map((s) => (
                      <Badge
                        key={s}
                        variant={subjectFilter === s ? "default" : "outline"}
                        className="cursor-pointer"
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
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis domain={[0, 100]} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "0.75rem",
                          fontSize: 13,
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
                        strokeWidth={3}
                        dot={{ r: 5, fill: "hsl(var(--primary))", strokeWidth: 2, stroke: "hsl(var(--card))" }}
                        activeDot={{ r: 7 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <BarChart3 className="w-10 h-10 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Complete more tests to see your trend line</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Subject Comparison */}
              <Card className="rounded-2xl shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-primary" />
                    Subject Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {subjectAvg.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={subjectAvg} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis type="number" domain={[0, 100]} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <YAxis
                          type="category"
                          dataKey="subject"
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={12}
                          width={120}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "0.75rem",
                            fontSize: 13,
                          }}
                          formatter={(value: number) => [`${value}%`, "Average"]}
                        />
                        <Bar dataKey="average" fill="hsl(var(--secondary))" radius={[0, 8, 8, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">No data yet</p>
                  )}
                </CardContent>
              </Card>

              {/* Topic Radar */}
              <Card className="rounded-2xl shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    Topic Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {radarData.length >= 3 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <RadarChart data={radarData}>
                        <PolarGrid stroke="hsl(var(--border))" />
                        <PolarAngleAxis dataKey="topic" fontSize={10} stroke="hsl(var(--muted-foreground))" />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} fontSize={10} />
                        <Radar
                          dataKey="score"
                          stroke="hsl(var(--primary))"
                          fill="hsl(var(--primary))"
                          fillOpacity={0.2}
                          strokeWidth={2}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-center text-muted-foreground py-8 text-sm">
                      Complete more tests to see topic analysis
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Topic Breakdown Table */}
            <Card className="rounded-2xl shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Topic Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topicData.map((topic) => (
                    <div key={topic.topic} className="flex items-center gap-4">
                      <div className="w-40 truncate text-sm font-medium">{topic.topic}</div>
                      <div className="flex-1">
                        <Progress value={topic.percentage} className="h-3" />
                      </div>
                      <div className="w-16 text-right">
                        <span
                          className={`text-sm font-bold ${
                            topic.percentage >= 70 ? "text-teal" : topic.percentage >= 40 ? "text-sunshine" : "text-coral"
                          }`}
                        >
                          {topic.percentage}%
                        </span>
                      </div>
                      <div className="w-20 text-right text-xs text-muted-foreground">
                        {topic.correct}/{topic.total}
                      </div>
                    </div>
                  ))}
                  {topicData.length === 0 && (
                    <p className="text-center text-muted-foreground py-4 text-sm">No topic data yet</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Test History */}
            <Card className="rounded-2xl shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Test History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[...attempts].reverse().map((attempt) => {
                    const pct = Math.round(
                      ((attempt.score || 0) / (attempt.total_questions || 1)) * 100
                    );
                    return (
                      <div
                        key={attempt.id}
                        className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl"
                      >
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            attempt.diagnostic_tests?.subject === "Mathematics"
                              ? "bg-coral/20"
                              : "bg-teal/20"
                          }`}
                        >
                          <BookOpen
                            className={`w-5 h-5 ${
                              attempt.diagnostic_tests?.subject === "Mathematics"
                                ? "text-coral"
                                : "text-teal"
                            }`}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate">
                            {attempt.diagnostic_tests?.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(attempt.completed_at), "dd MMM yyyy, HH:mm")}
                            {attempt.time_spent_seconds &&
                              ` • ${Math.round(attempt.time_spent_seconds / 60)} min`}
                          </p>
                        </div>
                        <Badge
                          variant={pct >= 70 ? "default" : "secondary"}
                          className={
                            pct >= 70
                              ? "bg-teal text-primary-foreground"
                              : ""
                          }
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
