import { cn } from "@/lib/utils";
import { User, Bot } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
}

export const ChatMessage = ({ role, content }: ChatMessageProps) => {
  const isUser = role === "user";

  return (
    <div className={cn("flex gap-3", isUser && "flex-row-reverse")}>
      <div
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
          isUser ? "bg-gradient-hero" : "bg-secondary"
        )}
      >
        {isUser ? (
          <User className="w-4 h-4 text-primary-foreground" />
        ) : (
          <Bot className="w-4 h-4 text-secondary-foreground" />
        )}
      </div>
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-3",
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
            prose-h2:text-[15px] prose-h2:mt-5 prose-h2:mb-2 prose-h2:pb-1 prose-h2:border-b prose-h2:border-border/50
            prose-h3:text-[13px] prose-h3:mt-4 prose-h3:mb-1.5 prose-h3:uppercase prose-h3:tracking-wide prose-h3:text-primary/80
            prose-p:text-sm prose-p:leading-relaxed prose-p:text-foreground prose-p:my-2
            prose-strong:text-primary prose-strong:font-semibold
            prose-ul:my-2 prose-ul:pl-4 prose-ul:space-y-1 prose-li:text-sm prose-li:text-foreground prose-li:marker:text-primary/60
            prose-ol:my-2 prose-ol:pl-4 prose-ol:space-y-1
            prose-code:bg-primary/10 prose-code:text-primary prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:text-xs prose-code:font-mono prose-code:font-medium
            prose-pre:bg-secondary prose-pre:rounded-xl prose-pre:p-4 prose-pre:my-3 prose-pre:overflow-x-auto prose-pre:border prose-pre:border-border/50
            prose-blockquote:border-l-[3px] prose-blockquote:border-primary/40 prose-blockquote:bg-primary/5 prose-blockquote:rounded-r-lg prose-blockquote:pl-4 prose-blockquote:pr-3 prose-blockquote:py-2 prose-blockquote:my-3 prose-blockquote:italic prose-blockquote:text-muted-foreground prose-blockquote:text-sm
            prose-a:text-primary prose-a:underline prose-a:underline-offset-2
            prose-hr:my-4 prose-hr:border-border/50
            [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
};
