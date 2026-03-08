import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  GraduationCap,
  ArrowLeft,
  Zap,
  BookOpen,
  Shuffle,
  Loader2,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  Trophy,
  Brain,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface QuizQuestion {
  question: string;
  options: { A: string; B: string; C: string; D: string };
  correct: string;
  explanation: string;
  topic: string;
}

type QuizPhase = "select" | "loading" | "playing" | "results";

const AdaptiveQuiz = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [phase, setPhase] = useState<QuizPhase>("select");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [answers, setAnswers] = useState<{ selected: string; correct: string; isCorrect: boolean }[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState("mixed");
  const [quizSubject, setQuizSubject] = useState("");
  const [quizHistory, setQuizHistory] = useState<any[]>([]);

  const grade = profile?.grade || "10";
  const subjects = ["Mathematics", "Physical Sciences"];

  useEffect(() => {
    if (user) fetchHistory();
  }, [user]);

  const fetchHistory = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("quiz_sessions" as any)
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "completed")
      .order("created_at", { ascending: false })
      .limit(10);
    if (data) setQuizHistory(data as any[]);
  };

  const startQuiz = async (subject: string | "surprise") => {
    if (!user) return;
    setPhase("loading");

    let chosenSubject = subject;
    if (subject === "surprise") {
      // Pick the subject with worse performance, or random
      const mathSessions = quizHistory.filter((s: any) => s.subject === "Mathematics");
      const sciSessions = quizHistory.filter((s: any) => s.subject === "Physical Sciences");
      const mathAvg = mathSessions.length > 0
        ? mathSessions.reduce((sum: number, s: any) => sum + ((s.score || 0) / (s.total_questions || 1)) * 100, 0) / mathSessions.length
        : 50;
      const sciAvg = sciSessions.length > 0
        ? sciSessions.reduce((sum: number, s: any) => sum + ((s.score || 0) / (s.total_questions || 1)) * 100, 0) / sciSessions.length
        : 50;
      chosenSubject = mathAvg <= sciAvg ? "Mathematics" : "Physical Sciences";
    }

    setQuizSubject(chosenSubject);

    try {
      const { data, error } = await supabase.functions.invoke("generate-quiz", {
        body: { subject: chosenSubject, grade, userId: user.id },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const quizQuestions = data.questions as QuizQuestion[];
      if (!quizQuestions || quizQuestions.length === 0) {
        throw new Error("No questions generated");
      }

      setQuestions(quizQuestions);
      setDifficulty(data.difficulty || "mixed");

      // Create session in DB
      const { data: session, error: sessionError } = await supabase
        .from("quiz_sessions" as any)
        .insert({
          user_id: user.id,
          subject: chosenSubject,
          grade,
          difficulty: data.difficulty || "mixed",
          total_questions: quizQuestions.length,
          questions: quizQuestions,
          status: "in_progress",
        } as any)
        .select("id")
        .single();

      if (sessionError) throw sessionError;
      setSessionId((session as any).id);

      setCurrentIndex(0);
      setAnswers([]);
      setSelected(null);
      setAnswered(false);
      setPhase("playing");
    } catch (err: any) {
      console.error("Quiz generation error:", err);
      toast.error(err.message || "Failed to generate quiz. Try again.");
      setPhase("select");
    }
  };

  const handleAnswer = async (option: string) => {
    if (answered || !sessionId) return;
    setSelected(option);
    setAnswered(true);

    const q = questions[currentIndex];
    const isCorrect = option === q.correct;
    const newAnswer = { selected: option, correct: q.correct, isCorrect };
    setAnswers((prev) => [...prev, newAnswer]);

    // Save answer
    await supabase.from("quiz_answers" as any).insert({
      session_id: sessionId,
      question_index: currentIndex,
      selected_option: option,
      correct_option: q.correct,
      is_correct: isCorrect,
    } as any);
  };

  const nextQuestion = async () => {
    if (currentIndex + 1 >= questions.length) {
      // Quiz complete
      const score = answers.filter((a) => a.isCorrect).length;
      await supabase
        .from("quiz_sessions" as any)
        .update({
          score,
          status: "completed",
          completed_at: new Date().toISOString(),
        } as any)
        .eq("id", sessionId);
      setPhase("results");
      fetchHistory();
    } else {
      setCurrentIndex((i) => i + 1);
      setSelected(null);
      setAnswered(false);
    }
  };

  const score = answers.filter((a) => a.isCorrect).length;
  const percentage = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;

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
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-lg">Quick Quiz</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {/* SELECT PHASE */}
        {phase === "select" && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h1 className="font-display text-2xl font-bold mb-2">Choose Your Quiz</h1>
              <p className="text-muted-foreground text-sm">
                10 questions adapted to your level · Grade {grade}
              </p>
            </div>

            <div className="grid gap-4">
              {subjects.map((subject) => (
                <button
                  key={subject}
                  onClick={() => startQuiz(subject)}
                  className="bg-card rounded-2xl p-6 text-left shadow-card hover:shadow-lg transition-all hover:-translate-y-0.5 border flex items-center gap-4"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    subject === "Mathematics" ? "bg-primary/10" : "bg-secondary/10"
                  }`}>
                    <BookOpen className={`w-6 h-6 ${
                      subject === "Mathematics" ? "text-primary" : "text-secondary"
                    }`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{subject}</h3>
                    <p className="text-sm text-muted-foreground">CAPS-aligned questions</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground" />
                </button>
              ))}

              <button
                onClick={() => startQuiz("surprise")}
                className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-2xl p-6 text-left shadow-card hover:shadow-lg transition-all hover:-translate-y-0.5 border border-dashed flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
                  <Shuffle className="w-6 h-6 text-accent-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">Surprise Me</h3>
                  <p className="text-sm text-muted-foreground">AI picks your weakest subject</p>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Recent quiz history */}
            {quizHistory.length > 0 && (
              <div className="mt-8">
                <h3 className="text-sm font-semibold text-muted-foreground mb-3">Recent Quizzes</h3>
                <div className="space-y-2">
                  {quizHistory.slice(0, 5).map((q: any) => {
                    const pct = Math.round(((q.score || 0) / (q.total_questions || 1)) * 100);
                    return (
                      <div key={q.id} className="flex items-center justify-between p-3 bg-card rounded-xl border text-sm">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-muted-foreground" />
                          <span>{q.subject}</span>
                          <Badge variant="outline" className="text-xs">{q.difficulty}</Badge>
                        </div>
                        <Badge variant={pct >= 70 ? "default" : "secondary"}
                          className={pct >= 70 ? "bg-secondary text-secondary-foreground" : ""}>
                          {pct}%
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* LOADING PHASE */}
        {phase === "loading" && (
          <div className="text-center py-20">
            <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-primary" />
            <h2 className="font-display text-xl font-bold mb-2">Generating Your Quiz...</h2>
            <p className="text-muted-foreground text-sm">
              AI is crafting questions matched to your level
            </p>
          </div>
        )}

        {/* PLAYING PHASE */}
        {phase === "playing" && questions.length > 0 && (
          <div className="space-y-6">
            {/* Progress bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Question {currentIndex + 1} of {questions.length}
                </span>
                <Badge variant="outline" className="text-xs">{quizSubject} · {difficulty}</Badge>
              </div>
              <Progress value={((currentIndex + 1) / questions.length) * 100} className="h-2" />
            </div>

            {/* Question */}
            <Card className="rounded-2xl shadow-card">
              <CardContent className="pt-6">
                <p className="text-xs text-muted-foreground mb-2">{questions[currentIndex].topic}</p>
                <h2 className="text-lg font-semibold mb-6 leading-relaxed">
                  {questions[currentIndex].question}
                </h2>

                <div className="space-y-3">
                  {(["A", "B", "C", "D"] as const).map((key) => {
                    const isSelected = selected === key;
                    const isCorrect = key === questions[currentIndex].correct;
                    let className =
                      "w-full text-left p-4 rounded-xl border transition-all text-sm flex items-start gap-3";

                    if (answered) {
                      if (isCorrect) {
                        className += " border-secondary bg-secondary/10 text-foreground";
                      } else if (isSelected && !isCorrect) {
                        className += " border-destructive bg-destructive/10 text-foreground";
                      } else {
                        className += " border-border bg-muted/30 text-muted-foreground";
                      }
                    } else {
                      className += isSelected
                        ? " border-primary bg-primary/5"
                        : " border-border hover:border-primary/50 hover:bg-muted/50";
                    }

                    return (
                      <button
                        key={key}
                        onClick={() => handleAnswer(key)}
                        disabled={answered}
                        className={className}
                      >
                        <span className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                          {key}
                        </span>
                        <span className="flex-1 pt-0.5">{questions[currentIndex].options[key]}</span>
                        {answered && isCorrect && (
                          <CheckCircle2 className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                        )}
                        {answered && isSelected && !isCorrect && (
                          <XCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Explanation */}
                {answered && (
                  <div className="mt-4 p-4 bg-muted/50 rounded-xl border">
                    <p className="text-sm">
                      <span className="font-semibold">Explanation: </span>
                      {questions[currentIndex].explanation}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Next button */}
            {answered && (
              <Button
                className="w-full"
                variant="hero"
                onClick={nextQuestion}
              >
                {currentIndex + 1 >= questions.length ? "View Results" : "Next Question"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        )}

        {/* RESULTS PHASE */}
        {phase === "results" && (
          <div className="space-y-6 text-center">
            <div className="py-8">
              <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${
                percentage >= 70 ? "bg-secondary/10" : percentage >= 40 ? "bg-accent/20" : "bg-destructive/10"
              }`}>
                <Trophy className={`w-10 h-10 ${
                  percentage >= 70 ? "text-secondary" : percentage >= 40 ? "text-accent-foreground" : "text-destructive"
                }`} />
              </div>
              <h1 className="font-display text-3xl font-bold mb-1">{percentage}%</h1>
              <p className="text-muted-foreground">
                {score} out of {questions.length} correct
              </p>
              <Badge className="mt-2" variant="outline">{quizSubject} · {difficulty}</Badge>
            </div>

            {/* Answer summary */}
            <Card className="rounded-2xl shadow-card text-left">
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-3 text-sm">Question Summary</h3>
                <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                  {answers.map((a, i) => (
                    <div
                      key={i}
                      className={`w-full aspect-square rounded-lg flex items-center justify-center text-xs font-bold ${
                        a.isCorrect
                          ? "bg-secondary/10 text-secondary"
                          : "bg-destructive/10 text-destructive"
                      }`}
                    >
                      {i + 1}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setPhase("select");
                  setQuestions([]);
                  setAnswers([]);
                  setSessionId(null);
                }}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                New Quiz
              </Button>
              <Button
                variant="hero"
                className="flex-1"
                onClick={() => navigate("/dashboard/progress")}
              >
                <Brain className="w-4 h-4 mr-2" />
                View Progress
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdaptiveQuiz;
