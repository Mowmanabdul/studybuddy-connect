import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { DiagnosticQuestion } from "@/hooks/useDiagnostics";
import { ChevronRight, Clock } from "lucide-react";

interface QuestionCardProps {
  question: DiagnosticQuestion;
  questionNumber: number;
  totalQuestions: number;
  onAnswer: (optionId: string, isCorrect: boolean) => void;
  timeElapsed: number;
}

export function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  onAnswer,
  timeElapsed,
}: QuestionCardProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const progress = (questionNumber / totalQuestions) * 100;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300";
      case "medium":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300";
      case "hard":
        return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300";
      default:
        return "";
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSubmit = () => {
    if (!selectedOption) return;
    
    const isCorrect = question.options.find((o) => o.id === selectedOption)?.isCorrect || false;
    setHasSubmitted(true);
    
    // Small delay to show feedback before moving to next question
    setTimeout(() => {
      onAnswer(selectedOption, isCorrect);
      setSelectedOption(null);
      setHasSubmitted(false);
    }, 800);
  };

  return (
    <div className="space-y-4">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">
            Question {questionNumber} of {totalQuestions}
          </span>
          <span className="flex items-center gap-1 text-muted-foreground">
            <Clock className="w-4 h-4" />
            {formatTime(timeElapsed)}
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Question Card */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-muted/50 pb-4">
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="secondary">{question.topic}</Badge>
            <Badge className={cn("capitalize", getDifficultyColor(question.difficulty))}>
              {question.difficulty}
            </Badge>
          </div>
          <h3 className="text-xl font-semibold leading-relaxed">{question.question_text}</h3>
        </CardHeader>

        <CardContent className="pt-6">
          <RadioGroup
            value={selectedOption || ""}
            onValueChange={setSelectedOption}
            disabled={hasSubmitted}
            className="space-y-3"
          >
            {question.options.map((option) => {
              const isSelected = selectedOption === option.id;
              const showResult = hasSubmitted && isSelected;
              const isCorrect = option.isCorrect;

              return (
                <div key={option.id}>
                  <Label
                    htmlFor={option.id}
                    className={cn(
                      "flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all",
                      isSelected && !hasSubmitted && "border-primary bg-primary/5",
                      !isSelected && !hasSubmitted && "border-border hover:border-primary/50 hover:bg-muted/50",
                      showResult && isCorrect && "border-green-500 bg-green-50 dark:bg-green-900/20",
                      showResult && !isCorrect && "border-red-500 bg-red-50 dark:bg-red-900/20",
                      hasSubmitted && "cursor-default"
                    )}
                  >
                    <RadioGroupItem value={option.id} id={option.id} />
                    <span className="text-base">{option.text}</span>
                    {showResult && (
                      <span className="ml-auto">
                        {isCorrect ? "✓" : "✗"}
                      </span>
                    )}
                  </Label>
                </div>
              );
            })}
          </RadioGroup>

          <Button
            onClick={handleSubmit}
            disabled={!selectedOption || hasSubmitted}
            className="w-full mt-6"
            size="lg"
          >
            {questionNumber === totalQuestions ? "Complete Test" : "Next Question"}
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
