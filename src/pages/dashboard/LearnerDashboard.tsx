import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  GraduationCap, 
  Calendar,
  Brain,
  MessageCircle,
  BarChart3,
  Clock,
  ChevronRight,
  Sparkles,
  BookOpen,
  LogOut,
  Zap,
  Flame,
  FileText,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { ProfileEditor } from "@/components/profile/ProfileEditor";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { useLearnerDashboard } from "@/hooks/useLearnerDashboard";
import { format, formatDistanceToNow } from "date-fns";
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
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const { upcomingSessions, completedSessions, recentDiagnostics, streak, loading } = useLearnerDashboard(user?.id);
  
  const handleLogout = async () => {
    await signOut();
  };
  
  const displayName = profile ? `${profile.first_name}` : "Learner";
  const gradeDisplay = profile?.grade ? `Grade ${profile.grade}` : "";
  const quote = getDailyQuote();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  
  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-hero rounded-xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl">Thuto AI</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <NotificationBell />
            <Dialog open={profileDialogOpen} onOpenChange={setProfileDialogOpen}>
              <DialogTrigger asChild>
                <button className="flex items-center gap-3 hover:bg-muted rounded-lg px-2 py-1 transition-colors">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={profile?.avatar_url || undefined} />
                    <AvatarFallback className="bg-gradient-cool text-primary-foreground">
                      {profile ? `${profile.first_name[0]}${profile.last_name[0]}` : "??"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-semibold">{displayName}</p>
                    <p className="text-xs text-muted-foreground">{gradeDisplay}</p>
                  </div>
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl p-0 overflow-hidden">
                <ProfileEditor onClose={() => setProfileDialogOpen(false)} />
              </DialogContent>
            </Dialog>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        {/* Welcome + Streak Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display text-3xl font-bold mb-1">{greeting}, {displayName}! 👋</h1>
            <p className="text-muted-foreground">Ready to continue your learning journey?</p>
          </div>
          
          {/* Streak Badge */}
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
          <p className="text-sm italic text-foreground/80">
            "{quote.text}"
          </p>
          <p className="text-xs text-muted-foreground mt-1">— {quote.author}</p>
        </motion.div>
        
        {/* Quick Actions */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {[
            { icon: Brain, label: "Take Diagnostic", desc: "Test your knowledge", route: "/dashboard/diagnostic", gradient: true },
            { icon: Zap, label: "Quick Quiz", desc: "Adaptive practice", route: "/dashboard/quiz", color: "text-primary" },
            { icon: Calendar, label: "Book Session", desc: "Schedule tutoring", route: "/dashboard/book-session", color: "text-teal" },
            { icon: MessageCircle, label: "AI Homework Help", desc: "Get instant guidance", route: "/dashboard/homework", color: "text-coral" },
            { icon: BarChart3, label: "View Progress", desc: "Track your growth", route: "/dashboard/progress", color: "text-sunshine" },
          ].map((action, i) => (
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
          {/* LEFT COLUMN — Primary content (2/3 width) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upcoming Sessions */}
            <div className="bg-card rounded-2xl shadow-card p-6 border">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-teal/15 flex items-center justify-center">
                    <Calendar className="w-4.5 h-4.5 text-teal" />
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
              ) : upcomingSessions.length > 0 ? (
                <div className="space-y-3">
                  {upcomingSessions.map((session) => (
                    <div 
                      key={session.id}
                      className="flex items-center gap-4 p-4 bg-muted/40 rounded-xl hover:bg-muted/70 transition-colors"
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
                        <p className="text-xs text-muted-foreground truncate">
                          with {session.tutor_name}
                        </p>
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
                  <Calendar className="w-10 h-10 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No upcoming sessions</p>
                  <Button variant="outline" size="sm" className="mt-3" onClick={() => navigate("/dashboard/book-session")}>
                    Book a Session
                  </Button>
                </div>
              )}
            </div>

            {/* Session Notes from Tutor */}
            <div className="bg-card rounded-2xl shadow-card p-6 border">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-9 h-9 rounded-xl bg-lavender/20 flex items-center justify-center">
                  <FileText className="w-4.5 h-4.5 text-lavender" />
                </div>
                <h2 className="font-display text-lg font-bold">Session Notes from Tutor</h2>
              </div>
              
              {loading ? (
                <div className="space-y-3">
                  {[1, 2].map(i => (
                    <div key={i} className="h-24 bg-muted/50 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : completedSessions.filter(s => s.tutor_notes).length > 0 ? (
                <div className="space-y-3">
                  {completedSessions.filter(s => s.tutor_notes).map((session) => (
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
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{session.tutor_notes}</p>
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
          </div>

          {/* RIGHT COLUMN — Sidebar content (1/3 width) */}
          <div className="space-y-6">
            {/* Recent Diagnostics */}
            <div className="bg-card rounded-2xl shadow-card p-6 border">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-coral/15 flex items-center justify-center">
                    <Brain className="w-4.5 h-4.5 text-coral" />
                  </div>
                  <h2 className="font-display text-lg font-bold">Diagnostics</h2>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate("/dashboard/diagnostic")}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-3">
                {loading ? (
                  [1, 2].map(i => (
                    <div key={i} className="h-20 bg-muted/50 rounded-xl animate-pulse" />
                  ))
                ) : recentDiagnostics.length > 0 ? (
                  recentDiagnostics.map((diagnostic) => {
                    const percentage = diagnostic.total_questions > 0 
                      ? Math.round((diagnostic.score / diagnostic.total_questions) * 100) 
                      : 0;
                    return (
                      <div key={diagnostic.id} className="p-4 bg-muted/40 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-sm">{diagnostic.subject}</h4>
                          <span className={`text-sm font-bold ${
                            percentage >= 70 ? "text-teal" : "text-coral"
                          }`}>
                            {percentage}%
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-1.5 mb-2">
                          <div 
                            className={`h-1.5 rounded-full transition-all duration-700 ${
                              percentage >= 70 ? "bg-teal" : "bg-coral"
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {diagnostic.completed_at 
                            ? formatDistanceToNow(new Date(diagnostic.completed_at), { addSuffix: true }) 
                            : "Recently"}
                        </p>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-4 text-muted-foreground text-sm">
                    <p>No diagnostics completed yet</p>
                  </div>
                )}
                
                <Button 
                  variant="outline" 
                  className="w-full text-sm"
                  onClick={() => navigate("/dashboard/diagnostic")}
                >
                  <Brain className="w-4 h-4 mr-2" />
                  Take Diagnostic
                </Button>
              </div>
            </div>

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

            {/* Progress Snapshot */}
            <div className="bg-card rounded-2xl shadow-card p-6 border">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-xl bg-sunshine/15 flex items-center justify-center">
                  <BarChart3 className="w-4.5 h-4.5 text-sunshine" />
                </div>
                <h2 className="font-display text-lg font-bold">Progress</h2>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-muted/40 rounded-xl p-3 text-center">
                  <p className="font-display text-2xl font-bold text-primary">{recentDiagnostics.length}</p>
                  <p className="text-xs text-muted-foreground">Tests Taken</p>
                </div>
                <div className="bg-muted/40 rounded-xl p-3 text-center">
                  <p className="font-display text-2xl font-bold text-teal">{upcomingSessions.length + completedSessions.length}</p>
                  <p className="text-xs text-muted-foreground">Sessions</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                className="w-full text-sm"
                onClick={() => navigate("/dashboard/progress")}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                View Full Progress
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LearnerDashboard;
