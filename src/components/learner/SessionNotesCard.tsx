import { BookOpen, FileText } from "lucide-react";
import { format } from "date-fns";

interface CompletedSession {
  id: string;
  subject: string;
  tutor_name: string;
  scheduled_at: string;
  tutor_notes: string | null;
}

interface SessionNotesCardProps {
  sessions: CompletedSession[];
  loading: boolean;
}

export function SessionNotesCard({ sessions, loading }: SessionNotesCardProps) {
  const sessionsWithNotes = sessions.filter(s => s.tutor_notes);

  return (
    <div className="bg-card rounded-2xl shadow-card p-6 border">
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-9 h-9 rounded-xl bg-lavender/20 flex items-center justify-center">
          <FileText className="w-4 h-4 text-lavender" />
        </div>
        <h2 className="font-display text-lg font-bold">Session Notes from Tutor</h2>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map(i => (
            <div key={i} className="h-24 bg-muted/50 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : sessionsWithNotes.length > 0 ? (
        <div className="space-y-3">
          {sessionsWithNotes.map((session) => (
            <div key={session.id} className="p-4 bg-muted/40 rounded-xl space-y-2.5">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                  session.subject === "Mathematics" ? "bg-coral/15" : "bg-teal/15"
                }`}>
                  <BookOpen className={`w-4 h-4 ${
                    session.subject === "Mathematics" ? "text-coral" : "text-teal"
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm">{session.subject}</h4>
                  <p className="text-xs text-muted-foreground">
                    with {session.tutor_name} · {format(new Date(session.scheduled_at), "dd MMM yyyy")}
                  </p>
                </div>
              </div>
              <div className="bg-card rounded-lg p-3 border border-border/50 ml-12">
                <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {session.tutor_notes}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 text-muted-foreground">
          <FileText className="w-10 h-10 mx-auto mb-2 opacity-40" />
          <p className="text-sm">No session notes yet</p>
        </div>
      )}
    </div>
  );
}
