import { useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  GraduationCap, 
  ArrowLeft, 
  Sparkles, 
  RotateCcw,
  MessageCircle,
  Lightbulb,
  Target,
  BookOpen
} from "lucide-react";
import { useHomeworkChat } from "@/hooks/useHomeworkChat";
import { ChatMessage } from "@/components/homework/ChatMessage";
import { ChatInput } from "@/components/homework/ChatInput";
import { ChatSettings } from "@/components/homework/ChatSettings";

const starterPrompts = {
  Mathematics: [
    "How do I solve quadratic equations?",
    "Explain the difference between permutations and combinations",
    "Help me understand trigonometric identities",
    "What's the best way to approach word problems?",
  ],
  "Physical Sciences": [
    "Explain Newton's laws of motion with examples",
    "How do I balance chemical equations?",
    "What's the difference between speed and velocity?",
    "Help me understand electric circuits",
  ],
};

const HomeworkHelper = () => {
  const {
    messages,
    isLoading,
    subject,
    grade,
    mode,
    setSubject,
    setGrade,
    setMode,
    sendMessage,
    clearMessages,
  } = useHomeworkChat();

  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const hasMessages = messages.length > 0;
  const tutorName = subject === "Mathematics" ? "Thabo" : "Lerato";

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/dashboard/learner">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-hero rounded-xl flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-display font-bold text-lg">
                    {hasMessages ? `Chat with ${tutorName}` : "AI Homework Helper"}
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {mode === "guidance" ? "Guidance" : "Exam Prep"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {subject} · Grade {grade}
                </p>
              </div>
            </div>
          </div>
          
          {hasMessages && (
            <Button variant="ghost" size="sm" onClick={clearMessages}>
              <RotateCcw className="w-4 h-4 mr-2" />
              New Chat
            </Button>
          )}
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-4 flex flex-col max-w-3xl">
        {/* Welcome screen when no messages */}
        {!hasMessages && (
          <div className="space-y-4 mb-4">
            {/* Hero section */}
            <div className="bg-card rounded-2xl shadow-card p-6 border">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-gradient-hero rounded-2xl flex items-center justify-center">
                  <Sparkles className="w-7 h-7 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-bold">
                    Hey there! I'm {tutorName} 👋
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Your personal {subject} tutor. Ask me anything!
                  </p>
                </div>
              </div>
              
              <ChatSettings
                subject={subject}
                grade={grade}
                mode={mode}
                onSubjectChange={(s) => {
                  setSubject(s);
                  clearMessages();
                }}
                onGradeChange={setGrade}
                onModeChange={setMode}
              />
            </div>

            {/* Mode explanation cards */}
            <div className="grid sm:grid-cols-2 gap-3">
              <div 
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  mode === "guidance" 
                    ? "bg-primary/5 border-primary/30" 
                    : "bg-card hover:bg-muted/50"
                }`}
                onClick={() => setMode("guidance")}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className={`w-5 h-5 ${mode === "guidance" ? "text-primary" : "text-muted-foreground"}`} />
                  <span className="font-semibold text-sm">Guidance Mode</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  I'll guide you to discover answers yourself through hints and questions
                </p>
              </div>
              <div 
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  mode === "exam" 
                    ? "bg-primary/5 border-primary/30" 
                    : "bg-card hover:bg-muted/50"
                }`}
                onClick={() => setMode("exam")}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Target className={`w-5 h-5 ${mode === "exam" ? "text-primary" : "text-muted-foreground"}`} />
                  <span className="font-semibold text-sm">Exam Mode</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Direct explanations with model answers and exam tips
                </p>
              </div>
            </div>

            {/* Starter prompts */}
            <div className="bg-card rounded-xl p-4 border">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Try asking about...</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {starterPrompts[subject].map((prompt) => (
                  <Button
                    key={prompt}
                    variant="outline"
                    size="sm"
                    className="text-xs h-8"
                    onClick={() => sendMessage(prompt)}
                  >
                    {prompt}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Compact settings when chatting */}
        {hasMessages && (
          <div className="bg-card rounded-xl p-3 border mb-4">
            <ChatSettings
              subject={subject}
              grade={grade}
              mode={mode}
              onSubjectChange={setSubject}
              onGradeChange={setGrade}
              onModeChange={setMode}
              disabled={isLoading}
            />
          </div>
        )}

        {/* Chat Messages */}
        <div className="flex-1 bg-card rounded-2xl shadow-card border overflow-hidden flex flex-col">
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <MessageCircle className="w-16 h-16 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">
                  Ask me anything about {subject}!
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  I'm here to help you understand, not just give answers.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg, i) => {
                  const isLastAssistant = 
                    msg.role === "assistant" && 
                    i === messages.length - 1 && 
                    !isLoading;
                  
                  return (
                    <ChatMessage 
                      key={i} 
                      role={msg.role} 
                      content={msg.content}
                      showActions={isLastAssistant}
                      onFollowUp={sendMessage}
                    />
                  );
                })}
                {isLoading && messages[messages.length - 1]?.role === "user" && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-secondary to-secondary/80 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-secondary-foreground animate-pulse" />
                    </div>
                    <div className="bg-muted rounded-2xl px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                          <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                          <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                        <span className="text-sm text-muted-foreground">{tutorName} is thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          {/* Input Area */}
          <div className="border-t p-4">
            <ChatInput
              onSend={sendMessage}
              isLoading={isLoading}
              placeholder={`Ask ${tutorName} about ${subject}...`}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomeworkHelper;
