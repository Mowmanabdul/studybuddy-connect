import { Skeleton } from "@/components/ui/skeleton";
import {
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  TrendingUp,
  Timer,
  Banknote,
} from "lucide-react";
import { motion } from "framer-motion";

interface TutorStats {
  totalSessions: number;
  thisMonth: number;
  completedThisMonth: number;
  upcomingCount: number;
  totalHours: number;
  uniqueLearners: number;
}

interface TutorStatsGridProps {
  stats: TutorStats;
  loading: boolean;
}

const HOURLY_RATE = 250;

const colorMap: Record<string, { bg: string; text: string }> = {
  coral: { bg: "bg-coral/20", text: "text-coral" },
  teal: { bg: "bg-teal/20", text: "text-teal" },
  sunshine: { bg: "bg-sunshine/20", text: "text-sunshine" },
  lavender: { bg: "bg-lavender/20", text: "text-lavender" },
};

export function TutorStatsGrid({ stats, loading }: TutorStatsGridProps) {
  const estimatedEarnings = stats.totalHours * HOURLY_RATE;

  const statItems = [
    { icon: Calendar, label: "Total Sessions", value: stats.totalSessions, color: "coral" },
    { icon: TrendingUp, label: "This Month", value: stats.thisMonth, color: "teal" },
    { icon: CheckCircle2, label: "Completed", value: stats.completedThisMonth, color: "sunshine" },
    { icon: Clock, label: "Upcoming", value: stats.upcomingCount, color: "lavender" },
    { icon: Timer, label: "Hours Tutored", value: stats.totalHours, color: "teal" },
    { icon: Users, label: "Learners", value: stats.uniqueLearners, color: "coral" },
    { icon: Banknote, label: "Est. Earnings", value: `R${estimatedEarnings.toLocaleString()}`, color: "sunshine" },
  ];

  if (loading) {
    return (
      <div className="grid sm:grid-cols-2 lg:grid-cols-7 gap-4 mb-8">
        {statItems.map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-7 gap-4 mb-8">
      {statItems.map((stat, i) => {
        const colors = colorMap[stat.color] || colorMap.coral;
        return (
          <motion.div
            key={stat.label}
            className="bg-card rounded-2xl p-5 shadow-card border"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 ${colors.bg} rounded-xl flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 ${colors.text}`} />
              </div>
              <div>
                <p className="text-2xl font-bold leading-tight">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
