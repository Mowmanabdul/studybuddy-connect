import { cn } from "@/lib/utils";
import { User, Sparkles, Lightbulb, HelpCircle, Calculator } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  onFollowUp?: (prompt: string) => void;
  showActions?: boolean;
}

const quickActions = [
  { label: "Explain simpler", prompt: "Can you explain that in simpler terms?", icon: Lightbulb },
  { label: "Show example", prompt: "Can you show me a worked example?", icon: Calculator },
  { label: "Why does this work?", prompt: "Why does this work? Can you explain the reasoning?", icon: HelpCircle },
];

export const ChatMessage = ({ role, content, onFollowUp, showActions = false }: ChatMessageProps) => {
  const isUser = role === "user";

  return (
    <div className={cn("flex gap-3", isUser && "flex-row-reverse")}>
      <div
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1",
          isUser ? "bg-gradient-hero" : "bg-gradient-to-br from-secondary to-secondary/80"
        )}
      >
        {isUser ? (
          <User className="w-4 h-4 text-primary-foreground" />
        ) : (
          <Sparkles className="w-4 h-4 text-secondary-foreground" />
        )}
      </div>
      <div className="flex flex-col gap-2 max-w-[85%]">
        <div
          className={cn(
            "rounded-2xl px-4 py-3",
            isUser
              ? "bg-primary text-primary-foreground"
              : "bg-muted"
          )}
        >
          {isUser ? (
            <p className="text-sm whitespace-pre-wrap leading-relaxed">{content}</p>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none
              prose-headings:font-bold prose-headings:text-foreground
              prose-h2:text-base prose-h2:mt-6 prose-h2:mb-3 prose-h2:pb-1.5 prose-h2:border-b prose-h2:border-border/50
              prose-h3:text-[13px] prose-h3:mt-5 prose-h3:mb-2 prose-h3:uppercase prose-h3:tracking-wide prose-h3:text-primary/80
              prose-p:text-sm prose-p:leading-relaxed prose-p:text-foreground prose-p:my-3
              prose-strong:text-primary prose-strong:font-semibold
              prose-ul:my-3 prose-ul:pl-5 prose-ul:space-y-1.5 prose-li:text-sm prose-li:text-foreground prose-li:leading-relaxed prose-li:marker:text-primary/60
              prose-ol:my-3 prose-ol:pl-5 prose-ol:space-y-1.5
              prose-code:bg-primary/10 prose-code:text-primary prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:text-xs prose-code:font-mono prose-code:font-medium
              prose-pre:bg-secondary prose-pre:rounded-xl prose-pre:p-4 prose-pre:my-4 prose-pre:overflow-x-auto prose-pre:border prose-pre:border-border/50
              prose-blockquote:border-l-[3px] prose-blockquote:border-primary/40 prose-blockquote:bg-primary/5 prose-blockquote:rounded-r-lg prose-blockquote:pl-4 prose-blockquote:pr-3 prose-blockquote:py-2.5 prose-blockquote:my-4 prose-blockquote:italic prose-blockquote:text-muted-foreground prose-blockquote:text-sm
              prose-a:text-primary prose-a:underline prose-a:underline-offset-2
              prose-hr:my-5 prose-hr:border-border/50
              [&>*:first-child]:mt-0 [&>*:last-child]:mb-0
              [&>*+*]:mt-3">
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          )}
        </div>
        
        {/* Quick action buttons for assistant messages */}
        {!isUser && showActions && onFollowUp && (
          <div className="flex flex-wrap gap-2 ml-1">
            {quickActions.map((action) => (
              <Button
                key={action.label}
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/80"
                onClick={() => onFollowUp(action.prompt)}
              >
                <action.icon className="w-3 h-3 mr-1.5" />
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
