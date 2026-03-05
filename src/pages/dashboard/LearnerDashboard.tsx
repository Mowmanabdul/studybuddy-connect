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
  Bell
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { ProfileEditor } from "@/components/profile/ProfileEditor";
import { useLearnerDashboard } from "@/hooks/useLearnerDashboard";
import { format, formatDistanceToNow } from "date-fns";

const LearnerDashboard = () => {
  const { profile, user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const { upcomingSessions, recentDiagnostics, loading } = useLearnerDashboard(user?.id);
  
  const handleLogout = async () => {
    await signOut();
  };
  
  const displayName = profile ? `${profile.first_name}` : "Learner";
  const gradeDisplay = profile?.grade ? `Grade ${profile.grade}` : "";
  
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
            <Button variant="ghost" size="icon">
              <Bell className="w-5 h-5" />
            </Button>
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
                    <p className="text-sm font-semibold">Welcome, {displayName}</p>
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
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold mb-2">Welcome back, {displayName}! 👋</h1>
          <p className="text-muted-foreground">Ready to continue your learning journey?</p>
        </div>
        
        {/* Quick Actions */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <button 
            onClick={() => navigate("/dashboard/diagnostic")}
            className="bg-gradient-hero text-primary-foreground rounded-2xl p-6 text-left hover:shadow-glow-coral transition-all hover:-translate-y-1"
          >
            <Brain className="w-8 h-8 mb-3" />
            <h3 className="font-semibold mb-1">Take Diagnostic</h3>
            <p className="text-sm text-primary-foreground/80">Test your knowledge</p>
          </button>
          
          <button 
            onClick={() => navigate("/dashboard/book-session")}
            className="bg-card rounded-2xl p-6 text-left shadow-card hover:shadow-lg transition-all hover:-translate-y-1 border"
          >
            <Calendar className="w-8 h-8 mb-3 text-teal" />
            <h3 className="font-semibold mb-1">Book Session</h3>
            <p className="text-sm text-muted-foreground">Schedule tutoring</p>
          </button>
          
          <button 
            onClick={() => navigate("/dashboard/homework")}
            className="bg-card rounded-2xl p-6 text-left shadow-card hover:shadow-lg transition-all hover:-translate-y-1 border"
          >
            <MessageCircle className="w-8 h-8 mb-3 text-coral" />
            <h3 className="font-semibold mb-1">AI Homework Help</h3>
            <p className="text-sm text-muted-foreground">Get instant guidance</p>
          </button>
          
          <button 
            onClick={() => navigate("/dashboard/progress")}
            className="bg-card rounded-2xl p-6 text-left shadow-card hover:shadow-lg transition-all hover:-translate-y-1 border"
          >
            <BarChart3 className="w-8 h-8 mb-3 text-sunshine" />
            <h3 className="font-semibold mb-1">View Progress</h3>
            <p className="text-sm text-muted-foreground">Track your growth</p>
          </button>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Upcoming Sessions */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-2xl shadow-card p-6 border">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-xl font-bold">Upcoming Sessions</h2>
                <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard/book-session")}>
                  View All <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
              
              {loading ? (
                <div className="space-y-4">
                  {[1, 2].map(i => (
                    <div key={i} className="h-20 bg-muted/50 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : upcomingSessions.length > 0 ? (
                <div className="space-y-4">
                  {upcomingSessions.map((session) => (
                    <div 
                      key={session.id}
                      className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl hover:bg-muted transition-colors"
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        session.subject === "Mathematics" ? "bg-coral/20" : "bg-teal/20"
                      }`}>
                        <BookOpen className={`w-6 h-6 ${
                          session.subject === "Mathematics" ? "text-coral" : "text-teal"
                        }`} />
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="font-semibold">{session.subject}</h4>
                        <p className="text-sm text-muted-foreground">
                          with {session.tutor_name}
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-semibold">{format(new Date(session.scheduled_at), "EEE, dd MMM")}</p>
                        <p className="text-sm text-muted-foreground flex items-center justify-end gap-1">
                          <Clock className="w-3 h-3" /> {format(new Date(session.scheduled_at), "HH:mm")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No upcoming sessions</p>
                  <Button variant="outline" size="sm" className="mt-4" onClick={() => navigate("/dashboard/book-session")}>
                    Book a Session
                  </Button>
                </div>
              )}
            </div>
          </div>
          
          {/* Recent Diagnostics */}
          <div>
            <div className="bg-card rounded-2xl shadow-card p-6 border">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-xl font-bold">Diagnostics</h2>
                <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard/diagnostic")}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-4">
                {loading ? (
                  [1, 2].map(i => (
                    <div key={i} className="h-24 bg-muted/50 rounded-xl animate-pulse" />
                  ))
                ) : recentDiagnostics.length > 0 ? (
                  recentDiagnostics.map((diagnostic) => {
                    const percentage = diagnostic.total_questions > 0 
                      ? Math.round((diagnostic.score / diagnostic.total_questions) * 100) 
                      : 0;
                    return (
                      <div key={diagnostic.id} className="p-4 bg-muted/50 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-sm">{diagnostic.subject}</h4>
                          <span className={`text-sm font-bold ${
                            percentage >= 70 ? "text-teal" : "text-coral"
                          }`}>
                            {percentage}%
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2 mb-2">
                          <div 
                            className={`h-2 rounded-full ${
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
                  className="w-full"
                  onClick={() => navigate("/dashboard/diagnostic")}
                >
                  <Brain className="w-4 h-4 mr-2" />
                  Take New Diagnostic
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* AI Homework Helper Teaser */}
        <div className="mt-8">
          <div className="bg-gradient-to-r from-coral/10 via-sunshine/10 to-teal/10 rounded-2xl p-6 border">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-16 h-16 bg-gradient-hero rounded-2xl flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-8 h-8 text-primary-foreground" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="font-display text-xl font-bold mb-1">AI Homework Helper</h3>
                <p className="text-muted-foreground">
                  Stuck on a problem? Get step-by-step guidance without the answer being revealed.
                </p>
              </div>
              <Button variant="hero" onClick={() => navigate("/dashboard/homework")}>
                <MessageCircle className="w-4 h-4 mr-2" />
                Ask a Question
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LearnerDashboard;
