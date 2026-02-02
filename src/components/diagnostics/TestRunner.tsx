import { useEffect, useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { QuestionCard } from "./QuestionCard";
import { useDiagnostics, DiagnosticTest, DiagnosticQuestion, DiagnosticAttempt } from "@/hooks/useDiagnostics";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft, AlertCircle } from "lucide-react";

interface TestRunnerProps {
  test: DiagnosticTest;
  onComplete: (attemptId: string, score: number) => void;
  onCancel: () => void;
}

export function TestRunner({ test, onComplete, onCancel }: TestRunnerProps) {
  const [questions, setQuestions] = useState<DiagnosticQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [attempt, setAttempt] = useState<DiagnosticAttempt | null>(null);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState(0);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { fetchQuestions, startAttempt, submitAnswer, completeAttempt } = useDiagnostics();
  const { user } = useAuth();

  useEffect(() => {
    const initTest = async () => {
      if (!user) return;
      
      setLoading(true);
      
      // Fetch questions
      const fetchedQuestions = await fetchQuestions(test.id);
      setQuestions(fetchedQuestions);
      
      // Start attempt
      const newAttempt = await startAttempt(test.id, user.id);
      setAttempt(newAttempt);
      
      setLoading(false);
      setQuestionStartTime(Date.now());
    };
    
    initTest();
  }, [test.id, user]);

  useEffect(() => {
    // Start timer
    timerRef.current = setInterval(() => {
      setTimeElapsed((prev) => prev + 1);
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const handleAnswer = useCallback(async (optionId: string, isCorrect: boolean) => {
    if (!attempt) return;
    
    const currentQuestion = questions[currentIndex];
    const questionTime = Math.floor((Date.now() - questionStartTime) / 1000);
    
    // Submit answer
    await submitAnswer(
      attempt.id,
      currentQuestion.id,
      optionId,
      isCorrect,
      questionTime
    );
    
    if (isCorrect) {
      setScore((prev) => prev + 1);
    }
    
    if (currentIndex < questions.length - 1) {
      // Move to next question
      setCurrentIndex((prev) => prev + 1);
      setQuestionStartTime(Date.now());
    } else {
      // Complete the test
      const finalScore = isCorrect ? score + 1 : score;
      await completeAttempt(attempt.id, finalScore, timeElapsed);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      onComplete(attempt.id, finalScore);
    }
  }, [attempt, questions, currentIndex, questionStartTime, score, timeElapsed, submitAnswer, completeAttempt, onComplete]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-6 flex-1" />
        </div>
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="font-semibold text-lg mb-2">No Questions Available</h3>
        <p className="text-muted-foreground mb-4">
          This diagnostic test doesn't have any questions yet.
        </p>
        <Button variant="outline" onClick={onCancel}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Exit Test
        </Button>
        <div className="text-right">
          <p className="font-semibold">{test.title}</p>
          <p className="text-sm text-muted-foreground">{test.subject} • Grade {test.grade}</p>
        </div>
      </div>

      {/* Question */}
      <QuestionCard
        question={currentQuestion}
        questionNumber={currentIndex + 1}
        totalQuestions={questions.length}
        onAnswer={handleAnswer}
        timeElapsed={timeElapsed}
      />
    </div>
  );
}
