import { useRef, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  GraduationCap,
  ArrowLeft,
  Sparkles,
  MessageCircle,
  BookOpen,
  PanelLeftClose,
  PanelLeft,
  Lightbulb,
  FileText,
} from "lucide-react";
import { useHomeworkChat } from "@/hooks/useHomeworkChat";
import { ChatMessage } from "@/components/homework/ChatMessage";
import { ChatInput } from "@/components/homework/ChatInput";
import { ChatSidebar } from "@/components/homework/ChatSidebar";
import { useIsMobile } from "@/hooks/use-mobile";

const starterPrompts = {
  Mathematics: [
    "How do I solve quadratic equations?",
    "Explain permutations vs combinations",
    "Help me with trigonometric identities",
    "Best approach for word problems?",
  ],
  "Physical Sciences": [
    "Explain Newton's laws of motion",
    "How do I balance chemical equations?",
    "Speed vs velocity — what's the difference?",
    "Help me understand electric circuits",
  ],
};

type Subject = "Mathematics" | "Physical Sciences";
type Mode = "guidance" | "exam";

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
    newChat,
    conversations,
    folders,
    activeConversationId,
    loadConversation,
    deleteConversation,
    renameConversation,
    createFolder,
    deleteFolder,
    moveToFolder,
  } = useHomeworkChat();

  const scrollRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const hasMessages = messages.length > 0;
  const tutorName = subject === "Mathematics" ? "Thabo" : "Lerato";

  return (
    <div className="h-screen flex bg-background">
      {/* Sidebar */}
      {sidebarOpen && (
        <div className={`${isMobile ? "absolute inset-0 z-50 w-72" : "w-72 shrink-0"}`}>
          <ChatSidebar
            conversations={conversations}
            folders={folders}
            activeConversationId={activeConversationId}
            onSelectConversation={(id) => {
              loadConversation(id);
              if (isMobile) setSidebarOpen(false);
            }}
            onNewChat={() => {
              newChat();
              if (isMobile) setSidebarOpen(false);
            }}
            onDeleteConversation={deleteConversation}
            onRenameConversation={renameConversation}
            onCreateFolder={createFolder}
            onDeleteFolder={deleteFolder}
            onMoveToFolder={moveToFolder}
          />
        </div>
      )}
      {/* Overlay for mobile sidebar */}
      {sidebarOpen && isMobile && (
        <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-card border-b h-14 flex items-center px-4 gap-3 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeft className="w-5 h-5" />}
          </Button>

          <Link to="/dashboard/learner" className="shrink-0">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>

          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 bg-gradient-hero rounded-lg flex items-center justify-center shrink-0">
              <GraduationCap className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold truncate">
              {hasMessages ? `Chat with ${tutorName}` : "AI Homework Helper"}
            </span>
          </div>

          {/* Inline settings */}
          <div className="ml-auto flex items-center gap-2">
            <Select value={subject} onValueChange={(v) => setSubject(v as Subject)} disabled={isLoading}>
              <SelectTrigger className="h-8 w-auto gap-1 text-xs">
                <BookOpen className="w-3.5 h-3.5" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Mathematics">Maths</SelectItem>
                <SelectItem value="Physical Sciences">Sciences</SelectItem>
              </SelectContent>
            </Select>

            <Select value={grade} onValueChange={setGrade} disabled={isLoading}>
              <SelectTrigger className="h-8 w-[80px] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["8", "9", "10", "11", "12"].map(g => (
                  <SelectItem key={g} value={g}>Grade {g}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center bg-muted rounded-lg p-0.5">
              <Button
                variant={mode === "guidance" ? "default" : "ghost"}
                size="sm"
                className="h-7 px-2.5 text-xs gap-1.5"
                onClick={() => setMode("guidance")}
                disabled={isLoading}
              >
                <Lightbulb className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Guidance</span>
              </Button>
              <Button
                variant={mode === "exam" ? "default" : "ghost"}
                size="sm"
                className="h-7 px-2.5 text-xs gap-1.5"
                onClick={() => setMode("exam")}
                disabled={isLoading}
              >
                <FileText className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Exam</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Chat content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <ScrollArea className="flex-1" ref={scrollRef}>
            <div className="max-w-3xl mx-auto w-full px-4 py-6">
              {!hasMessages ? (
                /* Welcome screen */
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                  <div className="w-16 h-16 bg-gradient-hero rounded-2xl flex items-center justify-center mb-6">
                    <Sparkles className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <h2 className="font-display text-2xl font-bold mb-2">
                    Hey there! I'm {tutorName} 👋
                  </h2>
                  <p className="text-muted-foreground mb-1">
                    Your personal {subject} tutor for Grade {grade}
                  </p>
                  <Badge variant="secondary" className="mb-8 text-xs">
                    {mode === "guidance"
                      ? "🧭 Guidance Mode — I'll help you discover answers"
                      : "📝 Exam Mode — Direct explanations & exam tips"}
                  </Badge>

                  <div className="grid sm:grid-cols-2 gap-3 w-full max-w-lg">
                    {starterPrompts[subject].map((prompt) => (
                      <Button
                        key={prompt}
                        variant="outline"
                        className="h-auto py-3 px-4 text-sm text-left justify-start whitespace-normal"
                        onClick={() => sendMessage(prompt)}
                      >
                        <MessageCircle className="w-4 h-4 mr-2 shrink-0 text-primary" />
                        {prompt}
                      </Button>
                    ))}
                  </div>
                </div>
              ) : (
                /* Messages */
                <div className="space-y-6">
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
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="border-t bg-card p-4">
            <div className="max-w-3xl mx-auto">
              <ChatInput
                onSend={sendMessage}
                isLoading={isLoading}
                placeholder={`Ask ${tutorName} about ${subject}...`}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeworkHelper;
