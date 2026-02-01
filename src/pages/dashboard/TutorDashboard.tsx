import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  GraduationCap, 
  Calendar,
  Clock,
  Video,
  Users,
  FileText,
  DollarSign,
  ChevronRight,
  BookOpen,
  LogOut,
  User,
  Settings,
  Bell,
  CheckCircle2,
  Star,
  Edit
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

const TutorDashboard = () => {
  const { profile, signOut } = useAuth();
  const [showFeedbackModal, setShowFeedbackModal] = useState<number | null>(null);
  
  // Mock data - replace with real data from database
  const upcomingSessions = [
    { id: 1, learner: "Thabo M.", grade: 10, subject: "Mathematics", date: "Today", time: "15:00", topic: "Quadratic Equations" },
    { id: 2, learner: "Naledi K.", grade: 11, subject: "Physical Sciences", date: "Today", time: "17:00", topic: "Electromagnetic Induction" },
    { id: 3, learner: "Sipho D.", grade: 12, subject: "Mathematics", date: "Tomorrow", time: "10:00", topic: "Calculus - Derivatives" },
  ];
  
  const completedSessions = [
    { id: 101, learner: "Anele N.", subject: "Mathematics", date: "Yesterday", feedbackSubmitted: true },
    { id: 102, learner: "Bongani T.", subject: "Physical Sciences", date: "2 days ago", feedbackSubmitted: false },
  ];
  
  const stats = {
    totalSessions: 48,
    thisMonth: 12,
    rating: 4.8,
    earnings: "R4,800",
  };
  
  const handleLogout = async () => {
    await signOut();
  };
  
  const displayName = profile ? `${profile.first_name} ${profile.last_name}` : "Tutor";
  const shortName = profile?.last_name ? `Ms. ${profile.last_name}` : "Tutor";
  
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
            <Button variant="ghost" size="icon">
              <Settings className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-hero rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold">{displayName}</p>
                <p className="text-xs text-muted-foreground">Tutor</p>
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
          <h1 className="font-display text-3xl font-bold mb-2">Good afternoon, {shortName}! 👋</h1>
          <p className="text-muted-foreground">You have {upcomingSessions.filter(s => s.date === "Today").length} sessions today</p>
        </div>
        
        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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
                <Users className="w-6 h-6 text-teal" />
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
                <Star className="w-6 h-6 text-sunshine" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.rating}</p>
                <p className="text-sm text-muted-foreground">Rating</p>
              </div>
            </div>
          </div>
          
          <div className="bg-card rounded-2xl p-6 shadow-card border">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-lavender/20 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-lavender" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.earnings}</p>
                <p className="text-sm text-muted-foreground">This Month</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Upcoming Sessions */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-2xl shadow-card p-6 border">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-xl font-bold">Upcoming Sessions</h2>
                <Button variant="ghost" size="sm">
                  View Calendar <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
              
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
                      <h4 className="font-semibold">{session.learner}</h4>
                      <p className="text-sm text-muted-foreground">
                        Grade {session.grade} • {session.topic}
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-semibold">{session.date}</p>
                      <p className="text-sm text-muted-foreground flex items-center justify-end gap-1">
                        <Clock className="w-3 h-3" /> {session.time}
                      </p>
                    </div>
                    
                    <Button variant="secondary" size="sm">
                      <Video className="w-4 h-4 mr-1" /> Start
                    </Button>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Pending Feedback */}
            <div className="bg-card rounded-2xl shadow-card p-6 border mt-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-xl font-bold">Session Feedback</h2>
              </div>
              
              <div className="space-y-4">
                {completedSessions.map((session) => (
                  <div 
                    key={session.id}
                    className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl"
                  >
                    <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-muted-foreground" />
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="font-semibold">{session.learner}</h4>
                      <p className="text-sm text-muted-foreground">
                        {session.subject} • {session.date}
                      </p>
                    </div>
                    
                    {session.feedbackSubmitted ? (
                      <span className="flex items-center gap-1 text-sm text-teal font-medium">
                        <CheckCircle2 className="w-4 h-4" /> Submitted
                      </span>
                    ) : (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setShowFeedbackModal(session.id)}
                      >
                        <Edit className="w-4 h-4 mr-1" /> Submit Feedback
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-card rounded-2xl shadow-card p-6 border">
              <h2 className="font-display text-lg font-bold mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="w-4 h-4 mr-2" />
                  Manage Availability
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Users className="w-4 h-4 mr-2" />
                  View Learners
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  Session History
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Payment History
                </Button>
              </div>
            </div>
            
            {/* Today's Schedule */}
            <div className="bg-gradient-to-br from-coral/10 to-teal/10 rounded-2xl p-6 border">
              <h2 className="font-display text-lg font-bold mb-4">Today's Schedule</h2>
              <div className="space-y-3">
                {upcomingSessions
                  .filter(s => s.date === "Today")
                  .map((session, index) => (
                    <div key={session.id} className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-coral rounded-full" />
                      <p className="text-sm">
                        <span className="font-medium">{session.time}</span>
                        {" – "}
                        {session.learner}
                      </p>
                    </div>
                  ))
                }
                {upcomingSessions.filter(s => s.date === "Today").length === 0 && (
                  <p className="text-sm text-muted-foreground">No sessions today</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 backdrop-blur-sm">
          <div className="bg-card rounded-2xl p-6 w-full max-w-lg mx-4 shadow-xl">
            <h3 className="font-display text-xl font-bold mb-4">Submit Session Feedback</h3>
            <p className="text-muted-foreground text-sm mb-4">
              This feedback will be used to generate an AI summary for the learner.
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Topics Covered</label>
                <Textarea placeholder="What did you cover in this session?" />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Learner Progress</label>
                <Textarea placeholder="How did the learner perform? Any areas of strength or concern?" />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Recommended Next Steps</label>
                <Textarea placeholder="What should the learner focus on before the next session?" />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <Button 
                variant="ghost" 
                className="flex-1"
                onClick={() => setShowFeedbackModal(null)}
              >
                Cancel
              </Button>
              <Button 
                className="flex-1"
                onClick={() => setShowFeedbackModal(null)}
              >
                Submit Feedback
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TutorDashboard;
