import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar, BookOpen, Clock, ChevronRight } from "lucide-react";
import { format } from "date-fns";

interface Session {
  id: string;
  subject: string;
  tutor_name: string;
  scheduled_at: string;
}

interface UpcomingSessionsCardProps {
  sessions: Session[];
  loading: boolean;
}

export function UpcomingSessionsCard({ sessions, loading }: UpcomingSessionsCardProps) {
  const navigate = useNavigate();

  return (
    <div className="bg-card rounded-2xl shadow-soft p-6 border">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-teal/15 flex items-center justify-center">
            <Calendar className="w-4 h-4 text-teal" />
          </div>
          <h2 className="font-display text-lg font-bold">Upcoming Sessions</h2>
        </div>
        <Button variant="ghost" size="sm" className="text-xs" onClick={() => navigate("/dashboard/book-session")}>
          View All <ChevronRight className="w-3.5 h-3.5 ml-1" />
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map(i => (
            <div key={i} className="h-[72px] bg-muted/50 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : sessions.length > 0 ? (
        <div className="space-y-3">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="flex items-center gap-4 p-4 bg-muted/40 rounded-xl hover:bg-muted/60 transition-colors"
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                session.subject === "Mathematics" ? "bg-coral/15" : "bg-teal/15"
              }`}>
                <BookOpen className={`w-5 h-5 ${
                  session.subject === "Mathematics" ? "text-coral" : "text-teal"
                }`} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm">{session.subject}</h4>
                <p className="text-xs text-muted-foreground truncate">with {session.tutor_name}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-semibold text-sm">{format(new Date(session.scheduled_at), "EEE, dd MMM")}</p>
                <p className="text-xs text-muted-foreground flex items-center justify-end gap-1">
                  <Clock className="w-3 h-3" /> {format(new Date(session.scheduled_at), "HH:mm")}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <Calendar className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm font-medium">No upcoming sessions</p>
          <p className="text-xs mt-1 mb-3">Book a session with an expert tutor</p>
          <Button variant="outline" size="sm" onClick={() => navigate("/dashboard/book-session")}>
            Book a Session
          </Button>
        </div>
      )}
    </div>
  );
}
