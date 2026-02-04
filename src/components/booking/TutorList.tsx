import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Clock, Calendar, User, Loader2 } from "lucide-react";
import { useSessionBooking, TutorWithAvailability } from "@/hooks/useSessionBooking";

interface TutorListProps {
  onSelectTutor: (tutor: TutorWithAvailability) => void;
}

export function TutorList({ onSelectTutor }: TutorListProps) {
  const { tutors, isLoading, fetchTutors, DAY_NAMES } = useSessionBooking();

  useEffect(() => {
    fetchTutors();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (tutors.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <User className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-semibold mb-2">No Tutors Available</h3>
          <p className="text-muted-foreground text-sm">
            There are no tutors with available time slots at the moment. Check back later!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {tutors.map((tutor) => {
        const subjects = [...new Set(tutor.availability.map(a => a.subject))];
        const days = [...new Set(tutor.availability.map(a => a.day_of_week))].sort();

        return (
          <Card key={tutor.tutor_id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-teal/10 text-teal font-semibold">
                    {tutor.first_name[0]}{tutor.last_name[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-lg">
                    {tutor.first_name} {tutor.last_name}
                  </CardTitle>
                  {tutor.bio && (
                    <CardDescription className="line-clamp-2 mt-1">
                      {tutor.bio}
                    </CardDescription>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-1">
                {subjects.map((subject) => (
                  <Badge key={subject} variant="secondary">
                    {subject}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>Available: {days.map(d => DAY_NAMES[d].slice(0, 3)).join(", ")}</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>{tutor.availability.length} time slot{tutor.availability.length !== 1 ? "s" : ""}</span>
              </div>

              <Button 
                className="w-full mt-2" 
                onClick={() => onSelectTutor(tutor)}
              >
                Book Session
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
