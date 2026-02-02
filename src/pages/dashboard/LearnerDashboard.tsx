import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  GraduationCap, 
  Calendar,
  Brain,
  MessageCircle,
  FileText,
  BarChart3,
  Clock,
  ChevronRight,
  Video,
  Sparkles,
  BookOpen,
  LogOut,
  User,
  Settings,
  Bell
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const LearnerDashboard = () => {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  
  // Mock data - replace with real data from database
  const upcomingSessions = [
    { id: 1, subject: "Mathematics", tutor: "Ms. Nkosi", date: "Today", time: "15:00", topic: "Quadratic Equations" },
    { id: 2, subject: "Physical Sciences", tutor: "Mr. Dlamini", date: "Tomorrow", time: "14:00", topic: "Newton's Laws" },
  ];
  
  const recentDiagnostics = [
    { id: 1, subject: "Mathematics", score: 72, date: "2 days ago", topics: ["Algebra", "Geometry"] },
    { id: 2, subject: "Physical Sciences", score: 65, date: "1 week ago", topics: ["Mechanics", "Electricity"] },
  ];
  
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
            <Button variant="ghost" size="icon">
              <Settings className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-cool rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold">Welcome, {displayName}</p>
                <p className="text-xs text-muted-foreground">{gradeDisplay}</p>
              </div>
            </div>
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
          
          <button className="bg-card rounded-2xl p-6 text-left shadow-card hover:shadow-lg transition-all hover:-translate-y-1 border">
            <Calendar className="w-8 h-8 mb-3 text-teal" />
            <h3 className="font-semibold mb-1">Book Session</h3>
            <p className="text-sm text-muted-foreground">Schedule tutoring</p>
          </button>
          
          <button className="bg-card rounded-2xl p-6 text-left shadow-card hover:shadow-lg transition-all hover:-translate-y-1 border">
            <MessageCircle className="w-8 h-8 mb-3 text-coral" />
            <h3 className="font-semibold mb-1">AI Homework Help</h3>
            <p className="text-sm text-muted-foreground">Get instant guidance</p>
          </button>
          
          <button className="bg-card rounded-2xl p-6 text-left shadow-card hover:shadow-lg transition-all hover:-translate-y-1 border">
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
                <Button variant="ghost" size="sm">
                  View All <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
              
              {upcomingSessions.length > 0 ? (
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
                        <h4 className="font-semibold">{session.topic}</h4>
                        <p className="text-sm text-muted-foreground">
                          {session.subject} • {session.tutor}
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-semibold">{session.date}</p>
                        <p className="text-sm text-muted-foreground flex items-center justify-end gap-1">
                          <Clock className="w-3 h-3" /> {session.time}
                        </p>
                      </div>
                      
                      <Button variant="secondary" size="sm">
                        <Video className="w-4 h-4 mr-1" /> Join
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No upcoming sessions</p>
                  <Button variant="outline" size="sm" className="mt-4">
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
                <Button variant="ghost" size="sm">
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-4">
                {recentDiagnostics.map((diagnostic) => (
                  <div 
                    key={diagnostic.id}
                    className="p-4 bg-muted/50 rounded-xl"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-sm">{diagnostic.subject}</h4>
                      <span className={`text-sm font-bold ${
                        diagnostic.score >= 70 ? "text-teal" : "text-coral"
                      }`}>
                        {diagnostic.score}%
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 mb-2">
                      <div 
                        className={`h-2 rounded-full ${
                          diagnostic.score >= 70 ? "bg-teal" : "bg-coral"
                        }`}
                        style={{ width: `${diagnostic.score}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">{diagnostic.date}</p>
                  </div>
                ))}
                
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
              <Button variant="hero">
                <MessageCircle className="w-4 h-4 mr-2" />
                Ask a Question
              </Button>
            </div>
          </div>
        </div>
        
        {/* Session Summaries */}
        <div className="mt-8">
          <div className="bg-card rounded-2xl shadow-card p-6 border">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-bold">Recent Session Summaries</h2>
              <Button variant="ghost" size="sm">
                View All <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-muted/50 rounded-xl">
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-teal mt-1" />
                  <div>
                    <h4 className="font-semibold">Quadratic Functions</h4>
                    <p className="text-sm text-muted-foreground mb-2">Mathematics • Yesterday</p>
                    <p className="text-sm">
                      Covered graphing parabolas, finding vertex and intercepts. Practice more on completing the square.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-muted/50 rounded-xl">
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-coral mt-1" />
                  <div>
                    <h4 className="font-semibold">Electric Circuits</h4>
                    <p className="text-sm text-muted-foreground mb-2">Physical Sciences • 3 days ago</p>
                    <p className="text-sm">
                      Ohm's Law and series/parallel circuits. Strong understanding of concepts.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LearnerDashboard;
