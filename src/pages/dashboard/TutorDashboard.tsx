import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Users, ChevronRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { LearnerDiagnostics } from "@/components/tutor/LearnerDiagnostics";
import { TutorStatsGrid } from "@/components/tutor/TutorStatsGrid";
import { TutorSessionCard } from "@/components/tutor/TutorSessionCard";
import { WeekAtGlance } from "@/components/tutor/WeekAtGlance";
import { useTutorDashboard } from "@/hooks/useTutorDashboard";
import { format, isToday } from "date-fns";

const TutorDashboard = () => {
  const { profile, user, signOut } = useAuth();
  const navigate = useNavigate();

  const {
    upcomingSessions,
    recentSessions,
    stats,
    loading,
    confirmSession,
    declineSession,
    addMeetingLink,
    completeSession,
    saveTutorNotes,
  } = useTutorDashboard(user?.id);

  const displayName = profile ? `${profile.first_name} ${profile.last_name}` : "Tutor";
  const shortName = profile?.first_name || "Tutor";
  const initials = profile ? `${profile.first_name[0]}${profile.last_name[0]}` : "??";
  const pendingCount = upcomingSessions.filter((s) => s.status === "pending").length;
  const todaySessions = upcomingSessions.filter((s) => isToday(new Date(s.scheduled_at)));

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const allSessions = [...upcomingSessions, ...recentSessions];

  return (
    <div className="min-h-screen bg-muted/30">
      <DashboardHeader
        displayName={displayName}
        subtitle="Tutor"
        avatarUrl={profile?.avatar_url}
        initials={initials}
        roleBadge={{ label: "Tutor", color: "bg-teal/20 text-teal" }}
        pendingBadge={pendingCount > 0 ? `${pendingCount} pending` : undefined}
        onLogout={signOut}
      />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold mb-2">{greeting}, {shortName}! 👋</h1>
          <p className="text-muted-foreground">
            {loading
              ? "Loading your schedule..."
              : todaySessions.length > 0
                ? `You have ${todaySessions.length} session${todaySessions.length > 1 ? "s" : ""} today`
                : "No sessions scheduled for today"}
          </p>
        </div>

        <TutorStatsGrid stats={stats} loading={loading} />

        <div className="grid lg:grid-cols-3 gap-8">
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
                    <TutorSessionCard
                      key={session.id}
                      session={session}
                      variant="upcoming"
                      onConfirm={confirmSession}
                      onDecline={declineSession}
                      onAddMeetingLink={addMeetingLink}
                      onComplete={completeSession}
                    />
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

            <div className="bg-card rounded-2xl shadow-card p-6 border">
              <h2 className="font-display text-xl font-bold mb-6">Recent Sessions</h2>

              {loading ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
                </div>
              ) : recentSessions.length > 0 ? (
                <div className="space-y-4">
                  {recentSessions.map((session) => (
                    <TutorSessionCard
                      key={session.id}
                      session={session}
                      variant="recent"
                      onSaveNotes={saveTutorNotes}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-center py-4 text-muted-foreground text-sm">No completed sessions yet</p>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <WeekAtGlance sessions={allSessions} loading={loading} />
            <LearnerDiagnostics />

            <div className="bg-card rounded-2xl shadow-card p-6 border">
              <h2 className="font-display text-lg font-bold mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/dashboard/availability")}>
                  <Calendar className="w-4 h-4 mr-2" />
                  Manage Availability
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/dashboard/my-learners")}>
                  <Users className="w-4 h-4 mr-2" />
                  View My Learners
                </Button>
              </div>
            </div>

            <div className="bg-gradient-to-br from-coral/10 to-teal/10 rounded-2xl p-6 border">
              <h2 className="font-display text-lg font-bold mb-4">Today's Schedule</h2>
              {loading ? (
                <Skeleton className="h-12 rounded-lg" />
              ) : (
                <div className="space-y-3">
                  {todaySessions.length > 0 ? todaySessions.map((session) => (
                    <div key={session.id} className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${session.status === "pending" ? "bg-sunshine" : "bg-teal"}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">
                          <span className="font-medium">{format(new Date(session.scheduled_at), "HH:mm")}</span>
                          {" – "}
                          <span className="truncate">{session.learner_name}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">{session.subject}</p>
                      </div>
                      {session.status === "pending" && (
                        <Badge variant="outline" className="text-xs">Pending</Badge>
                      )}
                    </div>
                  )) : (
                    <p className="text-sm text-muted-foreground">No sessions today. Enjoy your free time! 😎</p>
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
