import { format, startOfWeek, addDays, isSameDay } from "date-fns";
import { motion } from "framer-motion";

interface Session {
  id: string;
  scheduled_at: string;
  status: string;
  learner_name: string;
  subject: string;
}

interface WeekAtGlanceProps {
  sessions: Session[];
  loading?: boolean;
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function WeekAtGlance({ sessions, loading }: WeekAtGlanceProps) {
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });

  const dayData = DAYS.map((label, i) => {
    const date = addDays(weekStart, i);
    const daySessions = sessions.filter(
      (s) => isSameDay(new Date(s.scheduled_at), date) && s.status !== "cancelled"
    );
    const isToday = isSameDay(date, today);
    return { label, date, sessions: daySessions, isToday };
  });

  const maxSessions = Math.max(1, ...dayData.map((d) => d.sessions.length));

  if (loading) {
    return (
      <div className="bg-card rounded-2xl shadow-card p-6 border">
        <div className="h-4 w-32 bg-muted rounded animate-pulse mb-4" />
        <div className="flex gap-2">
          {DAYS.map((d) => (
            <div key={d} className="flex-1 h-20 bg-muted/50 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl shadow-card p-6 border">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-lg font-bold">This Week</h2>
        <span className="text-xs text-muted-foreground">
          {format(weekStart, "MMM d")} – {format(addDays(weekStart, 6), "MMM d")}
        </span>
      </div>

      <div className="flex gap-1.5">
        {dayData.map((day, i) => (
          <motion.div
            key={day.label}
            className="flex-1 flex flex-col items-center gap-1.5"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <span
              className={`text-[11px] font-medium ${
                day.isToday ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {day.label}
            </span>

            {/* Bar */}
            <div className="w-full h-16 bg-muted/40 rounded-lg flex flex-col-reverse overflow-hidden relative">
              {day.sessions.length > 0 && (
                <motion.div
                  className={`w-full rounded-lg ${
                    day.isToday
                      ? "bg-gradient-to-t from-primary/80 to-primary/40"
                      : "bg-gradient-to-t from-teal/60 to-teal/20"
                  }`}
                  initial={{ height: 0 }}
                  animate={{
                    height: `${(day.sessions.length / maxSessions) * 100}%`,
                  }}
                  transition={{ delay: 0.3 + i * 0.05, duration: 0.4, ease: "easeOut" }}
                />
              )}
            </div>

            {/* Count */}
            <span
              className={`text-xs font-bold ${
                day.sessions.length > 0
                  ? day.isToday
                    ? "text-primary"
                    : "text-foreground"
                  : "text-muted-foreground/50"
              }`}
            >
              {day.sessions.length || "–"}
            </span>

            {/* Date number */}
            <span
              className={`text-[10px] w-6 h-6 flex items-center justify-center rounded-full ${
                day.isToday
                  ? "bg-primary text-primary-foreground font-bold"
                  : "text-muted-foreground"
              }`}
            >
              {format(day.date, "d")}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
