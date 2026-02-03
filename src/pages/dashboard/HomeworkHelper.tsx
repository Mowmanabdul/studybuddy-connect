import { useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  GraduationCap, 
  ArrowLeft, 
  Sparkles, 
  RotateCcw,
  MessageCircle
} from "lucide-react";
import { useHomeworkChat } from "@/hooks/useHomeworkChat";
import { ChatMessage } from "@/components/homework/ChatMessage";
import { ChatInput } from "@/components/homework/ChatInput";
import { ChatSettings } from "@/components/homework/ChatSettings";

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
                <span className="font-display font-bold text-lg">AI Homework Helper</span>
                <p className="text-xs text-muted-foreground">Maths & Physical Sciences</p>
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
        {/* Settings - show prominently when no messages */}
        {!hasMessages && (
          <div className="bg-card rounded-2xl shadow-card p-6 border mb-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-hero rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h2 className="font-display text-xl font-bold">How can I help you today?</h2>
                <p className="text-sm text-muted-foreground">
                  Select your subject, grade, and mode to get started
                </p>
              </div>
            </div>
            <ChatSettings
              subject={subject}
              grade={grade}
              mode={mode}
              onSubjectChange={setSubject}
              onGradeChange={setGrade}
              onModeChange={setMode}
            />
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
                {messages.map((msg, i) => (
                  <ChatMessage key={i} role={msg.role} content={msg.content} />
                ))}
                {isLoading && messages[messages.length - 1]?.role === "user" && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-secondary-foreground border-t-transparent rounded-full animate-spin" />
                    </div>
                    <div className="bg-muted rounded-2xl px-4 py-3">
                      <p className="text-sm text-muted-foreground">Thinking...</p>
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
              placeholder={`Ask about ${subject}...`}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomeworkHelper;
