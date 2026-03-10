import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, GraduationCap, Calendar, BookOpen, TrendingUp, Activity } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface PlatformStats {
  totalLearners: number;
  totalTutors: number;
  totalSessions: number;
  totalDiagnostics: number;
  pendingSessions: number;
  completedSessions: number;
}

const COLORS = [
  "hsl(16, 90%, 55%)",
  "hsl(174, 72%, 46%)",
  "hsl(45, 95%, 55%)",
  "hsl(270, 60%, 65%)",
];

export default function AdminOverview() {
  const [stats, setStats] = useState<PlatformStats>({
    totalLearners: 0,
    totalTutors: 0,
    totalSessions: 0,
    totalDiagnostics: 0,
    pendingSessions: 0,
    completedSessions: 0,
  });
  const [sessionsByStatus, setSessionsByStatus] = useState<{ name: string; value: number }[]>([]);
  const [recentSignups, setRecentSignups] = useState<{ date: string; count: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      // Fetch role counts
      const { data: roles } = await supabase.from("user_roles").select("role");
      const learners = roles?.filter((r) => r.role === "learner").length || 0;
      const tutors = roles?.filter((r) => r.role === "tutor").length || 0;

      // Fetch session counts
      const { data: sessions } = await supabase.from("session_bookings").select("status");
      const totalSessions = sessions?.length || 0;
      const pending = sessions?.filter((s) => s.status === "pending").length || 0;
      const confirmed = sessions?.filter((s) => s.status === "confirmed").length || 0;
      const completed = sessions?.filter((s) => s.status === "completed").length || 0;
      const cancelled = sessions?.filter((s) => s.status === "cancelled").length || 0;

      // Fetch diagnostic count
      const { count: diagCount } = await supabase
        .from("diagnostic_attempts")
        .select("*", { count: "exact", head: true });

      setStats({
        totalLearners: learners,
        totalTutors: tutors,
        totalSessions: totalSessions,
        totalDiagnostics: diagCount || 0,
        pendingSessions: pending,
        completedSessions: completed,
      });

      setSessionsByStatus([
        { name: "Pending", value: pending },
        { name: "Confirmed", value: confirmed },
        { name: "Completed", value: completed },
        { name: "Cancelled", value: cancelled },
      ]);

      // Simulate recent signup data from profiles
      const { data: profiles } = await supabase
        .from("profiles")
        .select("created_at")
        .order("created_at", { ascending: true });

      if (profiles) {
        const grouped: Record<string, number> = {};
        profiles.forEach((p) => {
          const date = new Date(p.created_at).toLocaleDateString("en-ZA", { month: "short", day: "numeric" });
          grouped[date] = (grouped[date] || 0) + 1;
        });
        setRecentSignups(
          Object.entries(grouped)
            .slice(-7)
            .map(([date, count]) => ({ date, count }))
        );
      }
    } catch (err) {
      console.error("Error fetching admin stats:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    { title: "Total Learners", value: stats.totalLearners, icon: GraduationCap, color: "text-primary" },
    { title: "Total Tutors", value: stats.totalTutors, icon: Users, color: "text-secondary" },
    { title: "Total Sessions", value: stats.totalSessions, icon: Calendar, color: "text-accent-foreground" },
    { title: "Diagnostics Taken", value: stats.totalDiagnostics, icon: BookOpen, color: "text-primary" },
    { title: "Pending Sessions", value: stats.pendingSessions, icon: Activity, color: "text-destructive" },
    { title: "Completed Sessions", value: stats.completedSessions, icon: TrendingUp, color: "text-secondary" },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="font-display text-2xl font-bold">Platform Overview</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="pt-6 h-24" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">Platform Overview</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">User Signups</CardTitle>
          </CardHeader>
          <CardContent>
            {recentSignups.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={recentSignups}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" fontSize={12} />
                  <YAxis allowDecimals={false} fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(16, 90%, 55%)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-sm text-center py-8">No signup data yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Sessions by Status</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.totalSessions > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={sessionsByStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {sessionsByStatus.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-sm text-center py-8">No session data yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
