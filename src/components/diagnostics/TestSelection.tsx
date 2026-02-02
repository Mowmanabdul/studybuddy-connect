import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, BookOpen, ChevronRight, GraduationCap } from "lucide-react";
import { useDiagnostics, DiagnosticTest } from "@/hooks/useDiagnostics";
import { Skeleton } from "@/components/ui/skeleton";

interface TestSelectionProps {
  userGrade?: string;
  onSelectTest: (test: DiagnosticTest) => void;
}

export function TestSelection({ userGrade, onSelectTest }: TestSelectionProps) {
  const [tests, setTests] = useState<DiagnosticTest[]>([]);
  const { loading, fetchTests } = useDiagnostics();

  useEffect(() => {
    const loadTests = async () => {
      const data = await fetchTests();
      setTests(data);
    };
    loadTests();
  }, []);

  const groupedTests = tests.reduce((acc, test) => {
    if (!acc[test.subject]) {
      acc[test.subject] = [];
    }
    acc[test.subject].push(test);
    return acc;
  }, {} as Record<string, DiagnosticTest[]>);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-2xl font-bold mb-2">Choose a Diagnostic Test</h2>
        <p className="text-muted-foreground">
          Select a subject to assess your current understanding and get personalized recommendations.
        </p>
      </div>

      {Object.entries(groupedTests).map(([subject, subjectTests]) => (
        <div key={subject} className="space-y-4">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            {subject}
          </h3>
          
          <div className="grid gap-4 sm:grid-cols-2">
            {subjectTests.map((test) => {
              const isRecommended = userGrade === test.grade;
              
              return (
                <Card 
                  key={test.id} 
                  className={`relative overflow-hidden hover:shadow-lg transition-all cursor-pointer group ${
                    isRecommended ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => onSelectTest(test)}
                >
                  {isRecommended && (
                    <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-bl-lg font-medium">
                      Recommended
                    </div>
                  )}
                  
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{test.title}</CardTitle>
                        <CardDescription className="mt-1">{test.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <GraduationCap className="w-3 h-3" />
                        Grade {test.grade}
                      </Badge>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {test.duration_minutes} min
                      </Badge>
                      <Badge variant="outline">
                        {test.total_questions} questions
                      </Badge>
                    </div>
                    
                    <Button 
                      variant="ghost" 
                      className="w-full justify-between group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                    >
                      Start Assessment
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
