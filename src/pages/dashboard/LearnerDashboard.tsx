import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Brain,
  Calendar,
  MessageCircle,
  BarChart3,
  Zap,
  Flame,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { UpcomingSessionsCard } from "@/components/learner/UpcomingSessionsCard";
import { SessionNotesCard } from "@/components/learner/SessionNotesCard";
import { DiagnosticsCard } from "@/components/learner/DiagnosticsCard";
import { ProgressSnapshotCard } from "@/components/learner/ProgressSnapshotCard";
import { useLearnerDashboard } from "@/hooks/useLearnerDashboard";
import { motion } from "framer-motion";

const motivationalQuotes = [
  { text: "Education is the most powerful weapon which you can use to change the world.", author: "Nelson Mandela" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { text: "The beautiful thing about learning is that no one can take it away from you.", author: "B.B. King" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  { text: "Don't let what you cannot do interfere with what you can do.", author: "John Wooden" },
  { text: "Sharp sharp! Every problem you solve makes you stronger for the next one.", author: "Thuto AI" },
];

const getDailyQuote = () => {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  return motivationalQuotes[dayOfYear % motivationalQuotes.length];
};

const LearnerDashboard = () => {
  const { profile, user, signOut } = useAuth();
  const navigate = useNavigate();
  const { upcomingSessions, completedSessions, recentDiagnostics, streak, loading } = useLearnerDashboard(user?.id);

  const displayName = profile?.first_name || "Learner";
  const gradeDisplay = profile?.grade ? (profile.grade.toLowerCase().startsWith("grade") ? profile.grade : `Grade ${profile.grade}`) : "";
  const initials = profile ? `${profile.first_name[0]}${profile.last_name[0]}` : "??";
  const quote = getDailyQuote();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const quickActions = [
    { icon: Brain, label: "Take Diagnostic", desc: "Test your knowledge", route: "/dashboard/diagnostic", gradient: true },
    { icon: Zap, label: "Quick Quiz", desc: "Adaptive practice", route: "/dashboard/quiz", color: "text-primary" },
    { icon: Calendar, label: "Book Session", desc: "Schedule tutoring", route: "/dashboard/book-session", color: "text-teal" },
    { icon: MessageCircle, label: "AI Homework Help", desc: "Get instant guidance", route: "/dashboard/homework", color: "text-coral" },
    { icon: BarChart3, label: "View Progress", desc: "Track your growth", route: "/dashboard/progress", color: "text-sunshine" },
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      <DashboardHeader
        displayName={displayName}
        subtitle={gradeDisplay}
        avatarUrl={profile?.avatar_url}
        initials={initials}
        onLogout={signOut}
      />

      <main className="container mx-auto px-4 py-8">
        {/* Welcome + Streak Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display text-3xl font-bold mb-1">{greeting}, {displayName}! 👋</h1>
            <p className="text-muted-foreground">Ready to continue your learning journey?</p>
          </div>

          <motion.div
            className="flex items-center gap-3 bg-card rounded-2xl px-5 py-3 shadow-card border"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${streak > 0 ? "bg-coral/20" : "bg-muted"}`}>
              <Flame className={`w-5 h-5 ${streak > 0 ? "text-coral" : "text-muted-foreground"}`} />
            </div>
            <div>
              <p className="font-display font-bold text-lg leading-tight">
                {streak > 0 ? `${streak} day${streak > 1 ? "s" : ""}` : "No streak"}
              </p>
              <p className="text-xs text-muted-foreground">
                {streak > 0 ? "Study streak 🔥" : "Complete a quiz to start!"}
              </p>
            </div>
          </motion.div>
        </div>

        {/* Daily Motivation */}
        <motion.div
          className="mb-8 bg-gradient-to-r from-teal/10 via-secondary/5 to-lavender/10 rounded-2xl p-4 border border-secondary/20"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-sm italic text-foreground/80">"{quote.text}"</p>
          <p className="text-xs text-muted-foreground mt-1">— {quote.author}</p>
        </motion.div>

        {/* Quick Actions */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {quickActions.map((action, i) => (
            <motion.button
              key={action.label}
              onClick={() => navigate(action.route)}
              className={`rounded-2xl p-6 text-left transition-all hover:-translate-y-1 ${
                action.gradient
                  ? "bg-gradient-hero text-primary-foreground hover:shadow-glow-coral"
                  : "bg-card shadow-card hover:shadow-lg border"
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
            >
              <action.icon className={`w-8 h-8 mb-3 ${action.gradient ? "" : action.color}`} />
              <h3 className="font-semibold mb-1">{action.label}</h3>
              <p className={`text-sm ${action.gradient ? "text-primary-foreground/80" : "text-muted-foreground"}`}>{action.desc}</p>
            </motion.button>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <UpcomingSessionsCard sessions={upcomingSessions} loading={loading} />
            <SessionNotesCard sessions={completedSessions} loading={loading} />
          </div>

          <div className="space-y-6">
            <DiagnosticsCard diagnostics={recentDiagnostics} loading={loading} />

            {/* AI Homework Helper CTA */}
            <div className="bg-gradient-to-br from-coral/10 via-sunshine/5 to-teal/10 rounded-2xl p-6 border border-primary/10">
              <div className="w-12 h-12 bg-gradient-hero rounded-xl flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="font-display text-lg font-bold mb-1">AI Homework Helper</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Stuck on a problem? Get step-by-step guidance from your AI tutor.
              </p>
              <Button variant="hero" className="w-full" onClick={() => navigate("/dashboard/homework")}>
                <MessageCircle className="w-4 h-4 mr-2" />
                Ask a Question
              </Button>
            </div>

            <ProgressSnapshotCard
              diagnosticCount={recentDiagnostics.length}
              sessionCount={upcomingSessions.length + completedSessions.length}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default LearnerDashboard;
