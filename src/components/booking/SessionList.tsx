import { useEffect } from "react";
import { format, isPast, isFuture } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar, 
  Clock, 
  User, 
  Video, 
  CheckCircle, 
  XCircle, 
  Loader2,
  ExternalLink 
} from "lucide-react";
import { useSessionBooking, SessionBooking } from "@/hooks/useSessionBooking";
import { useAuth } from "@/hooks/useAuth";

interface SessionListProps {
  showActions?: boolean;
}

const statusConfig = {
  pending: { label: "Pending", color: "bg-yellow-500/10 text-yellow-600", icon: Clock },
  confirmed: { label: "Confirmed", color: "bg-green-500/10 text-green-600", icon: CheckCircle },
  completed: { label: "Completed", color: "bg-blue-500/10 text-blue-600", icon: CheckCircle },
  cancelled: { label: "Cancelled", color: "bg-red-500/10 text-red-600", icon: XCircle },
};

export function SessionList({ showActions = true }: SessionListProps) {
  const { sessions, isLoading, fetchMySessions, updateSessionStatus, cancelSession } = useSessionBooking();
  const { role } = useAuth();

  useEffect(() => {
    fetchMySessions();
  }, []);

  const upcomingSessions = sessions.filter(
    s => isFuture(new Date(s.scheduled_at)) && s.status !== "cancelled"
  );
  const pastSessions = sessions.filter(
    s => isPast(new Date(s.scheduled_at)) || s.status === "cancelled"
  );

  const renderSession = (session: SessionBooking) => {
    const config = statusConfig[session.status];
    const StatusIcon = config.icon;
    const scheduledDate = new Date(session.scheduled_at);
    const isUpcoming = isFuture(scheduledDate) && session.status !== "cancelled";
    const otherPerson = role === "tutor" 
      ? session.learner_profile 
      : session.tutor_profile;

    return (
      <Card key={session.id} className="overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <Badge className={config.color}>
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {config.label}
                </Badge>
                <Badge variant="outline">{session.subject}</Badge>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {format(scheduledDate, "EEE, MMM d, yyyy")}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {format(scheduledDate, "h:mm a")} ({session.duration_minutes} min)
                </span>
              </div>

              {otherPerson && (
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span>
                    {role === "tutor" ? "Student" : "Tutor"}: {otherPerson.first_name} {otherPerson.last_name}
                  </span>
                </div>
              )}

              {session.notes && (
                <p className="text-sm text-muted-foreground border-l-2 pl-3 mt-2">
                  {session.notes}
                </p>
              )}

              {session.meeting_link && session.status === "confirmed" && (
                <Button variant="outline" size="sm" asChild className="mt-2">
                  <a href={session.meeting_link} target="_blank" rel="noopener noreferrer">
                    <Video className="w-4 h-4 mr-2" />
                    Join Meeting
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                </Button>
              )}
            </div>

            {/* Actions */}
            {showActions && isUpcoming && (
              <div className="flex flex-col gap-2">
                {role === "tutor" && session.status === "pending" && (
                  <>
                    <Button 
                      size="sm" 
                      onClick={() => updateSessionStatus(session.id, "confirmed")}
                    >
                      Confirm
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => updateSessionStatus(session.id, "cancelled")}
                    >
                      Decline
                    </Button>
                  </>
                )}
                {role === "learner" && session.status === "pending" && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => cancelSession(session.id)}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <Tabs defaultValue="upcoming" className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="upcoming">
          Upcoming ({upcomingSessions.length})
        </TabsTrigger>
        <TabsTrigger value="past">
          Past ({pastSessions.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="upcoming">
        {upcomingSessions.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">No Upcoming Sessions</h3>
              <p className="text-muted-foreground text-sm">
                {role === "learner" 
                  ? "Browse tutors and book your first session!" 
                  : "Set your availability to start receiving bookings."
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {upcomingSessions.map(renderSession)}
          </div>
        )}
      </TabsContent>

      <TabsContent value="past">
        {pastSessions.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">No Past Sessions</h3>
              <p className="text-muted-foreground text-sm">
                Your completed sessions will appear here.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {pastSessions.map(renderSession)}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}
