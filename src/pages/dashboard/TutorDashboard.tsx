import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  GraduationCap, 
  Calendar,
  Clock,
  Video,
  Users,
  FileText,
  ChevronRight,
  BookOpen,
  LogOut,
  User,
  Bell,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { ProfileEditor } from "@/components/profile/ProfileEditor";
import { LearnerDiagnostics } from "@/components/tutor/LearnerDiagnostics";
import { useTutorDashboard } from "@/hooks/useTutorDashboard";
import { format, formatDistanceToNow, isToday, isTomorrow } from "date-fns";

const TutorDashboard = () => {
  const { profile, user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const { upcomingSessions, recentSessions, stats, loading } = useTutorDashboard(user?.id);
  
  const handleLogout = async () => {
    await signOut();
  };
  
  const displayName = profile ? `${profile.first_name} ${profile.last_name}` : "Tutor";
  const shortName = profile?.first_name || "Tutor";

  const formatSessionDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    return format(date, "EEE, dd MMM");
  };

  const todaySessions = upcomingSessions.filter((s) => isToday(new Date(s.scheduled_at)));
  
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
            <span className="text-xs bg-teal/20 text-teal px-2 py-0.5 rounded-full font-medium">Tutor</span>
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
                    <AvatarFallback className="bg-gradient-hero text-primary-foreground">
                      {profile ? `${profile.first_name[0]}${profile.last_name[0]}` : "??"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-semibold">{displayName}</p>
                    <p className="text-xs text-muted-foreground">Tutor</p>
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
          <h1 className="font-display text-3xl font-bold mb-2">Welcome back, {shortName}! 👋</h1>
          <p className="text-muted-foreground">
            {loading
              ? "Loading your schedule..."
              : todaySessions.length > 0
                ? `You have ${todaySessions.length} session${todaySessions.length > 1 ? "s" : ""} today`
                : "No sessions scheduled for today"}
          </p>
        </div>
        
        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {loading ? (
            [1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24 rounded-2xl" />)
          ) : (
            <>
              <div className="bg-card rounded-2xl p-6 shadow-card border">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-coral/20 rounded-xl flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-coral" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.totalSessions}</p>
                    <p className="text-sm text-muted-foreground">Total Sessions</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-card rounded-2xl p-6 shadow-card border">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-teal/20 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-teal" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.thisMonth}</p>
                    <p className="text-sm text-muted-foreground">This Month</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-card rounded-2xl p-6 shadow-card border">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-sunshine/20 rounded-xl flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-sunshine" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.completedThisMonth}</p>
                    <p className="text-sm text-muted-foreground">Completed</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-card rounded-2xl p-6 shadow-card border">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-lavender/20 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-lavender" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.upcomingCount}</p>
                    <p className="text-sm text-muted-foreground">Upcoming</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
        
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Upcoming Sessions */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-card rounded-2xl shadow-card p-6 border">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-xl font-bold">Upcoming Sessions</h2>
                <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard/availability")}>
                  Manage <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
              
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
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
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold truncate">{session.learner_name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {session.grade ? `Grade ${session.grade} · ` : ""}{session.subject}
                        </p>
                      </div>
                      
                      <div className="text-right shrink-0">
                        <p className="font-semibold text-sm">{formatSessionDate(session.scheduled_at)}</p>
                        <p className="text-sm text-muted-foreground flex items-center justify-end gap-1">
                          <Clock className="w-3 h-3" /> {format(new Date(session.scheduled_at), "HH:mm")}
                        </p>
                      </div>
                      
                      {session.meeting_link && (
                        <Button variant="secondary" size="sm" asChild>
                          <a href={session.meeting_link} target="_blank" rel="noopener noreferrer">
                            <Video className="w-4 h-4 mr-1" /> Join
                          </a>
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No upcoming sessions</p>
                  <p className="text-sm mt-1">Learners will book when you set availability</p>
                  <Button variant="outline" size="sm" className="mt-4" onClick={() => navigate("/dashboard/availability")}>
                    Set Availability
                  </Button>
                </div>
              )}
            </div>

            {/* Recent Completed Sessions */}
            <div className="bg-card rounded-2xl shadow-card p-6 border">
              <h2 className="font-display text-xl font-bold mb-6">Recent Sessions</h2>
              
              {loading ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
                </div>
              ) : recentSessions.length > 0 ? (
                <div className="space-y-4">
                  {recentSessions.map((session) => (
                    <div 
                      key={session.id}
                      className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl"
                    >
                      <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-muted-foreground" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold truncate">{session.learner_name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {session.subject}
                        </p>
                      </div>
                      
                      <div className="text-right shrink-0">
                        <span className="flex items-center gap-1 text-sm text-teal font-medium">
                          <CheckCircle2 className="w-4 h-4" /> Completed
                        </span>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(session.scheduled_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-4 text-muted-foreground text-sm">No completed sessions yet</p>
              )}
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Learner Diagnostic Results */}
            <LearnerDiagnostics />

            {/* Quick Actions */}
            <div className="bg-card rounded-2xl shadow-card p-6 border">
              <h2 className="font-display text-lg font-bold mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/dashboard/availability")}>
                  <Calendar className="w-4 h-4 mr-2" />
                  Manage Availability
                </Button>
                <Button variant="outline" className="w-full justify-start" disabled>
                  <Users className="w-4 h-4 mr-2" />
                  View Learners
                </Button>
                <Button variant="outline" className="w-full justify-start" disabled>
                  <FileText className="w-4 h-4 mr-2" />
                  Session History
                </Button>
              </div>
            </div>
            
            {/* Today's Schedule */}
            <div className="bg-gradient-to-br from-coral/10 to-teal/10 rounded-2xl p-6 border">
              <h2 className="font-display text-lg font-bold mb-4">Today's Schedule</h2>
              {loading ? (
                <Skeleton className="h-12 rounded-lg" />
              ) : (
                <div className="space-y-3">
                  {todaySessions.length > 0 ? todaySessions.map((session) => (
                    <div key={session.id} className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-coral rounded-full" />
                      <p className="text-sm">
                        <span className="font-medium">{format(new Date(session.scheduled_at), "HH:mm")}</span>
                        {" – "}
                        {session.learner_name}
                      </p>
                    </div>
                  )) : (
                    <p className="text-sm text-muted-foreground">No sessions today</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TutorDashboard;
