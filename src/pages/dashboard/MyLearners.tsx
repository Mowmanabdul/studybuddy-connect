import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import {
  GraduationCap,
  ArrowLeft,
  Users,
  Brain,
  BookOpen,
  Calendar,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useTutorLearners } from "@/hooks/useTutorLearners";
import { format, formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";

interface LearnerSessionSummary {
  learner_id: string;
  total: number;
  completed: number;
  upcoming: number;
  lastSession: string | null;
}

const MyLearners = () => {
  const { user } = useAuth();
  const { learners, loading: learnersLoading } = useTutorLearners();
  const [sessionSummaries, setSessionSummaries] = useState<Record<string, LearnerSessionSummary>>({});
  const [expandedLearner, setExpandedLearner] = useState<string | null>(null);
  const [sessionsLoading, setSessionsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchSessionSummaries();
  }, [user]);

  const fetchSessionSummaries = async () => {
    if (!user) return;
    setSessionsLoading(true);

    const { data: bookings } = await supabase
      .from("session_bookings")
      .select("learner_id, status, scheduled_at")
      .eq("tutor_id", user.id);

    if (bookings) {
      const summaryMap: Record<string, LearnerSessionSummary> = {};
      const now = new Date();

      for (const b of bookings) {
        if (!summaryMap[b.learner_id]) {
          summaryMap[b.learner_id] = { learner_id: b.learner_id, total: 0, completed: 0, upcoming: 0, lastSession: null };
        }
        const s = summaryMap[b.learner_id];
        s.total++;
        if (b.status === "completed") {
          s.completed++;
          if (!s.lastSession || b.scheduled_at > s.lastSession) s.lastSession = b.scheduled_at;
        }
        if (new Date(b.scheduled_at) > now && b.status !== "cancelled") s.upcoming++;
      }
      setSessionSummaries(summaryMap);
    }
    setSessionsLoading(false);
  };

  // Get all unique learner profiles (from both diagnostics and sessions)
  const allLearnerProfiles = new Map<string, { user_id: string; first_name: string; last_name: string; grade: string | null; avatar_url: string | null }>();
  
  for (const l of learners) {
    allLearnerProfiles.set(l.profile.user_id, l.profile);
  }

  // Also include learners who have sessions but no diagnostics
  for (const learnerId of Object.keys(sessionSummaries)) {
    if (!allLearnerProfiles.has(learnerId)) {
      // We'll need to fetch these profiles separately; for now they'll show from diagnostics data
    }
  }

  const allProfiles = Array.from(allLearnerProfiles.values());
  const loading = learnersLoading || sessionsLoading;

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-card border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/dashboard/tutor">
              <ArrowLeft className="w-4 h-4 mr-2" /> Dashboard
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-hero rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-lg">My Learners</span>
          </div>
          <Badge variant="secondary" className="ml-auto">{allProfiles.length} learner{allProfiles.length !== 1 ? "s" : ""}</Badge>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-28 rounded-2xl" />)}
          </div>
        ) : allProfiles.length === 0 ? (
          <div className="text-center py-20">
            <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
            <h2 className="font-display text-2xl font-bold mb-2">No Learners Yet</h2>
            <p className="text-muted-foreground mb-6">
              Learners will appear here once they book sessions with you.
            </p>
            <Button variant="outline" asChild>
              <Link to="/dashboard/availability">Set Your Availability</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {allProfiles.map((profile) => {
              const summary = sessionSummaries[profile.user_id];
              const learnerDiag = learners.find(l => l.profile.user_id === profile.user_id);
              const isExpanded = expandedLearner === profile.user_id;

              return (
                <Card key={profile.user_id} className="rounded-2xl shadow-card overflow-hidden">
                  <CardContent className="p-0">
                    {/* Main row */}
                    <button
                      className="w-full flex items-center gap-4 p-5 text-left hover:bg-muted/30 transition-colors"
                      onClick={() => setExpandedLearner(isExpanded ? null : profile.user_id)}
                    >
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={profile.avatar_url || undefined} />
                        <AvatarFallback className="bg-gradient-hero text-primary-foreground font-semibold">
                          {profile.first_name[0]}{profile.last_name[0]}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold">{profile.first_name} {profile.last_name}</h3>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          {profile.grade && <span>Grade {profile.grade}</span>}
                          {summary && (
                            <>
                              <span>·</span>
                              <span>{summary.total} session{summary.total !== 1 ? "s" : ""}</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        {summary?.upcoming ? (
                          <Badge className="bg-teal/10 text-teal border-0">{summary.upcoming} upcoming</Badge>
                        ) : null}
                        {learnerDiag && learnerDiag.attempts.length > 0 && (
                          <Badge variant="outline" className="text-xs">
                            <Brain className="w-3 h-3 mr-1" />
                            {learnerDiag.attempts.length} test{learnerDiag.attempts.length > 1 ? "s" : ""}
                          </Badge>
                        )}
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </button>

                    {/* Expanded details */}
                    {isExpanded && (
                      <div className="border-t px-5 py-4 bg-muted/20 space-y-4">
                        {/* Session summary */}
                        {summary && (
                          <div className="grid grid-cols-3 gap-4">
                            <div className="text-center p-3 bg-card rounded-xl">
                              <p className="text-xl font-bold">{summary.completed}</p>
                              <p className="text-xs text-muted-foreground">Completed</p>
                            </div>
                            <div className="text-center p-3 bg-card rounded-xl">
                              <p className="text-xl font-bold">{summary.upcoming}</p>
                              <p className="text-xs text-muted-foreground">Upcoming</p>
                            </div>
                            <div className="text-center p-3 bg-card rounded-xl">
                              <p className="text-xl font-bold text-sm mt-1">
                                {summary.lastSession
                                  ? formatDistanceToNow(new Date(summary.lastSession), { addSuffix: true })
                                  : "N/A"}
                              </p>
                              <p className="text-xs text-muted-foreground">Last Session</p>
                            </div>
                          </div>
                        )}

                        {/* Diagnostic attempts */}
                        {learnerDiag && learnerDiag.attempts.length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                              <Brain className="w-4 h-4 text-primary" />
                              Diagnostic Results
                            </h4>
                            <div className="space-y-2">
                              {learnerDiag.attempts.slice(0, 5).map(attempt => {
                                const pct = attempt.total_questions
                                  ? Math.round(((attempt.score || 0) / attempt.total_questions) * 100)
                                  : 0;
                                return (
                                  <div key={attempt.id} className="flex items-center gap-3 bg-card rounded-lg p-3">
                                    <BookOpen className={`w-4 h-4 shrink-0 ${
                                      attempt.diagnostic_tests?.subject === "Mathematics" ? "text-coral" : "text-teal"
                                    }`} />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium truncate">{attempt.diagnostic_tests?.title}</p>
                                      <Progress value={pct} className="h-1.5 mt-1" />
                                    </div>
                                    <span className={`text-sm font-bold ${pct >= 70 ? "text-teal" : "text-coral"}`}>
                                      {pct}%
                                    </span>
                                    {attempt.completed_at && (
                                      <span className="text-xs text-muted-foreground shrink-0">
                                        {format(new Date(attempt.completed_at), "dd MMM")}
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {!learnerDiag?.attempts.length && !summary && (
                          <p className="text-sm text-muted-foreground text-center py-2">
                            No diagnostic or session data available yet.
                          </p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default MyLearners;
