import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen, HelpCircle } from "lucide-react";

interface DiagnosticTest {
  id: string;
  title: string;
  subject: string;
  grade: string;
  total_questions: number;
  duration_minutes: number;
  created_at: string;
}

interface DiagnosticQuestion {
  id: string;
  test_id: string;
  question_text: string;
  topic: string;
  difficulty: string;
  order_index: number;
}

export default function AdminContent() {
  const [tests, setTests] = useState<DiagnosticTest[]>([]);
  const [questions, setQuestions] = useState<Record<string, DiagnosticQuestion[]>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    setIsLoading(true);
    try {
      const { data: testsData, error: tErr } = await supabase
        .from("diagnostic_tests")
        .select("*")
        .order("created_at", { ascending: false });

      if (tErr) throw tErr;
      setTests(testsData || []);

      const { data: questionsData, error: qErr } = await supabase
        .from("diagnostic_questions")
        .select("id, test_id, question_text, topic, difficulty, order_index")
        .order("order_index", { ascending: true });

      if (qErr) throw qErr;

      const grouped: Record<string, DiagnosticQuestion[]> = {};
      (questionsData || []).forEach((q) => {
        if (!grouped[q.test_id]) grouped[q.test_id] = [];
        grouped[q.test_id].push(q);
      });
      setQuestions(grouped);
    } catch (err) {
      console.error("Error fetching content:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const difficultyColor = (d: string) => {
    switch (d) {
      case "easy": return "secondary" as const;
      case "hard": return "destructive" as const;
      default: return "outline" as const;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="font-display text-2xl font-bold">Content Management</h1>
        <div className="py-8 text-center text-muted-foreground">Loading content...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">Content Management</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BookOpen className="h-5 w-5 text-primary" />
            Diagnostic Tests ({tests.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {tests.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">
              No diagnostic tests created yet
            </p>
          ) : (
            <Accordion type="single" collapsible className="w-full">
              {tests.map((test) => (
                <AccordionItem key={test.id} value={test.id}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3 text-left">
                      <div>
                        <p className="font-medium">{test.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">{test.subject}</Badge>
                          <Badge variant="outline" className="text-xs">{test.grade}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {test.total_questions} questions · {test.duration_minutes} min
                          </span>
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    {questions[test.id]?.length ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-12">#</TableHead>
                            <TableHead>Question</TableHead>
                            <TableHead>Topic</TableHead>
                            <TableHead>Difficulty</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {questions[test.id].map((q) => (
                            <TableRow key={q.id}>
                              <TableCell className="text-muted-foreground">
                                {q.order_index + 1}
                              </TableCell>
                              <TableCell className="max-w-md truncate text-sm">
                                {q.question_text}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="text-xs">{q.topic}</Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant={difficultyColor(q.difficulty)} className="text-xs">
                                  {q.difficulty}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <p className="text-sm text-muted-foreground flex items-center gap-1 py-2">
                        <HelpCircle className="h-4 w-4" />
                        No questions added to this test yet
                      </p>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
