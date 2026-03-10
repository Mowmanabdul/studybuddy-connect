import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Filter } from "lucide-react";

interface SessionRow {
  id: string;
  subject: string;
  scheduled_at: string;
  duration_minutes: number;
  status: string;
  tutor_name: string;
  learner_name: string;
}

export default function AdminSessions() {
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("session_bookings")
        .select("*")
        .order("scheduled_at", { ascending: false });

      if (error) throw error;

      // Get all unique user IDs
      const userIds = new Set<string>();
      data?.forEach((s) => {
        userIds.add(s.tutor_id);
        userIds.add(s.learner_id);
      });

      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, first_name, last_name")
        .in("user_id", Array.from(userIds));

      const nameMap = new Map(
        profiles?.map((p) => [p.user_id, `${p.first_name} ${p.last_name}`]) || []
      );

      setSessions(
        (data || []).map((s) => ({
          id: s.id,
          subject: s.subject,
          scheduled_at: s.scheduled_at,
          duration_minutes: s.duration_minutes,
          status: s.status,
          tutor_name: nameMap.get(s.tutor_id) || "Unknown",
          learner_name: nameMap.get(s.learner_id) || "Unknown",
        }))
      );
    } catch (err) {
      console.error("Error fetching sessions:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const filtered =
    statusFilter === "all"
      ? sessions
      : sessions.filter((s) => s.status === statusFilter);

  const statusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "secondary" as const;
      case "completed": return "default" as const;
      case "cancelled": return "destructive" as const;
      default: return "outline" as const;
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">Session Overview</h1>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center text-muted-foreground">Loading sessions...</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Tutor</TableHead>
                    <TableHead>Learner</TableHead>
                    <TableHead>Scheduled</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        No sessions found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className="font-medium">{s.subject}</TableCell>
                        <TableCell>{s.tutor_name}</TableCell>
                        <TableCell>{s.learner_name}</TableCell>
                        <TableCell className="text-sm">
                          {new Date(s.scheduled_at).toLocaleDateString("en-ZA", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </TableCell>
                        <TableCell>{s.duration_minutes} min</TableCell>
                        <TableCell>
                          <Badge variant={statusColor(s.status)}>{s.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
          <p className="text-xs text-muted-foreground mt-3">{filtered.length} session(s)</p>
        </CardContent>
      </Card>
    </div>
  );
}
