import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Brain,
  Flame,
  CheckCircle2,
  XCircle,
  Clock,
  Target,
  TrendingUp,
  BookOpen,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface ActivityItem {
  id: string;
  type: "diagnostic" | "quiz";
  title: string;
  date: Date;
  score: number;
  total: number;
  time?: number | null;
  difficulty?: string;
}

interface DiagnosticAnswer {
  id: string;
  is_correct: boolean;
  time_spent_seconds: number | null;
  diagnostic_questions: {
    question_text: string;
    topic: string;
    difficulty: string;
    explanation: string | null;
  } | null;
}

interface QuizAnswer {
  id: string;
  question_index: number;
  is_correct: boolean;
  selected_option: string;
  correct_option: string;
}

interface QuizQuestion {
  question: string;
  options: { id: string; text: string }[];
  correctOptionId: string;
  topic?: string;
  difficulty?: string;
  explanation?: string;
}

interface Props {
  activity: ActivityItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ActivityDetailDialog({ activity, open, onOpenChange }: Props) {
  const [loading, setLoading] = useState(false);
  const [diagnosticAnswers, setDiagnosticAnswers] = useState<DiagnosticAnswer[]>([]);
  const [quizAnswers, setQuizAnswers] = useState<QuizAnswer[]>([]);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [topicBreakdown, setTopicBreakdown] = useState<{ topic: string; correct: number; total: number }[]>([]);

  useEffect(() => {
    if (!activity || !open) return;
    
    if (activity.type === "diagnostic") {
      fetchDiagnosticDetails(activity.id);
    } else {
      fetchQuizDetails(activity.id);
    }
  }, [activity, open]);

  const fetchDiagnosticDetails = async (attemptId: string) => {
    setLoading(true);
    const { data } = await supabase
      .from("diagnostic_answers")
      .select(`
        id,
        is_correct,
        time_spent_seconds,
        diagnostic_questions (
          question_text,
          topic,
          difficulty,
          explanation
        )
      `)
      .eq("attempt_id", attemptId)
      .order("answered_at", { ascending: true });

    if (data) {
      setDiagnosticAnswers(data as DiagnosticAnswer[]);
      
      // Calculate topic breakdown
      const topicMap = new Map<string, { correct: number; total: number }>();
      for (const answer of data) {
        const topic = answer.diagnostic_questions?.topic || "Unknown";
        const existing = topicMap.get(topic) || { correct: 0, total: 0 };
        existing.total++;
        if (answer.is_correct) existing.correct++;
        topicMap.set(topic, existing);
      }
      setTopicBreakdown(
        Array.from(topicMap.entries())
          .map(([topic, stats]) => ({ topic, ...stats }))
          .sort((a, b) => b.total - a.total)
      );
    }
    setLoading(false);
  };

  const fetchQuizDetails = async (sessionId: string) => {
    setLoading(true);
    const [answersRes, sessionRes] = await Promise.all([
      supabase
        .from("quiz_answers")
        .select("id, question_index, is_correct, selected_option, correct_option")
        .eq("session_id", sessionId)
        .order("question_index", { ascending: true }),
      supabase
        .from("quiz_sessions")
        .select("questions")
        .eq("id", sessionId)
        .single(),
    ]);

    if (answersRes.data) {
      setQuizAnswers(answersRes.data as QuizAnswer[]);
    }
    if (sessionRes.data?.questions) {
      setQuizQuestions(sessionRes.data.questions as QuizQuestion[]);
    }
    setLoading(false);
  };

  if (!activity) return null;

  const pct = Math.round((activity.score / activity.total) * 100);
  const isGood = pct >= 70;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
              activity.type === "diagnostic" ? "bg-primary/10" : "bg-accent/10"
            }`}>
              {activity.type === "diagnostic" ? (
                <Brain className="w-6 h-6 text-primary" />
              ) : (
                <Flame className="w-6 h-6 text-accent-foreground" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-xl font-bold">{activity.title}</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {format(activity.date, "EEEE, dd MMMM yyyy 'at' HH:mm")}
                {activity.time && ` · ${Math.round(activity.time / 60)} minutes`}
              </p>
            </div>
            <Badge
              variant={isGood ? "default" : "secondary"}
              className={`text-lg px-3 py-1 ${isGood ? "bg-secondary text-secondary-foreground" : ""}`}
            >
              {pct}%
            </Badge>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="p-6 space-y-6">
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-20 rounded-xl" />
                <Skeleton className="h-32 rounded-xl" />
                <Skeleton className="h-32 rounded-xl" />
              </div>
            ) : (
              <>
                {/* Summary Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-muted/50 rounded-xl">
                    <div className="flex items-center justify-center gap-1 text-secondary mb-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-xl font-bold">{activity.score}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Correct</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-xl">
                    <div className="flex items-center justify-center gap-1 text-destructive mb-1">
                      <XCircle className="w-4 h-4" />
                      <span className="text-xl font-bold">{activity.total - activity.score}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Incorrect</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-xl">
                    <div className="flex items-center justify-center gap-1 text-primary mb-1">
                      <Target className="w-4 h-4" />
                      <span className="text-xl font-bold">{activity.total}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Questions</p>
                  </div>
                </div>

                {/* Topic Breakdown for Diagnostics */}
                {activity.type === "diagnostic" && topicBreakdown.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-semibold flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-primary" />
                      Topic Performance
                    </h3>
                    <div className="space-y-2">
                      {topicBreakdown.map((topic) => {
                        const topicPct = Math.round((topic.correct / topic.total) * 100);
                        return (
                          <div key={topic.topic} className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <span className="font-medium">{topic.topic}</span>
                              <span className={topicPct >= 70 ? "text-secondary" : "text-destructive"}>
                                {topic.correct}/{topic.total} ({topicPct}%)
                              </span>
                            </div>
                            <Progress value={topicPct} className="h-2" />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Question-by-Question Breakdown */}
                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    Question Breakdown
                  </h3>
                  <div className="space-y-3">
                    {activity.type === "diagnostic" ? (
                      diagnosticAnswers.map((answer, idx) => (
                        <div
                          key={answer.id}
                          className={`p-4 rounded-xl border ${
                            answer.is_correct
                              ? "bg-secondary/5 border-secondary/20"
                              : "bg-destructive/5 border-destructive/20"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                              answer.is_correct ? "bg-secondary/20 text-secondary" : "bg-destructive/20 text-destructive"
                            }`}>
                              {answer.is_correct ? (
                                <CheckCircle2 className="w-4 h-4" />
                              ) : (
                                <XCircle className="w-4 h-4" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium">Q{idx + 1}: {answer.diagnostic_questions?.question_text}</p>
                              <div className="flex flex-wrap gap-2 mt-2">
                                <Badge variant="outline" className="text-xs">
                                  {answer.diagnostic_questions?.topic}
                                </Badge>
                                <Badge variant="outline" className="text-xs capitalize">
                                  {answer.diagnostic_questions?.difficulty}
                                </Badge>
                                {answer.time_spent_seconds && (
                                  <Badge variant="outline" className="text-xs">
                                    <Clock className="w-3 h-3 mr-1" />
                                    {answer.time_spent_seconds}s
                                  </Badge>
                                )}
                              </div>
                              {!answer.is_correct && answer.diagnostic_questions?.explanation && (
                                <p className="text-xs text-muted-foreground mt-2 p-2 bg-muted/50 rounded">
                                  💡 {answer.diagnostic_questions.explanation}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      quizAnswers.map((answer) => {
                        const question = quizQuestions[answer.question_index];
                        return (
                          <div
                            key={answer.id}
                            className={`p-4 rounded-xl border ${
                              answer.is_correct
                                ? "bg-secondary/5 border-secondary/20"
                                : "bg-destructive/5 border-destructive/20"
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                                answer.is_correct ? "bg-secondary/20 text-secondary" : "bg-destructive/20 text-destructive"
                              }`}>
                                {answer.is_correct ? (
                                  <CheckCircle2 className="w-4 h-4" />
                                ) : (
                                  <XCircle className="w-4 h-4" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium">Q{answer.question_index + 1}: {question?.question || "Question"}</p>
                                {!answer.is_correct && (
                                  <div className="mt-2 text-xs space-y-1">
                                    <p className="text-destructive">
                                      Your answer: {question?.options.find(o => o.id === answer.selected_option)?.text || answer.selected_option}
                                    </p>
                                    <p className="text-secondary">
                                      Correct: {question?.options.find(o => o.id === answer.correct_option)?.text || answer.correct_option}
                                    </p>
                                  </div>
                                )}
                                {question?.topic && (
                                  <div className="flex flex-wrap gap-2 mt-2">
                                    <Badge variant="outline" className="text-xs">
                                      {question.topic}
                                    </Badge>
                                    {question.difficulty && (
                                      <Badge variant="outline" className="text-xs capitalize">
                                        {question.difficulty}
                                      </Badge>
                                    )}
                                  </div>
                                )}
                                {!answer.is_correct && question?.explanation && (
                                  <p className="text-xs text-muted-foreground mt-2 p-2 bg-muted/50 rounded">
                                    💡 {question.explanation}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
