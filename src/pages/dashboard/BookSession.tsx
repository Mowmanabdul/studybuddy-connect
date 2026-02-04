import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Users, Calendar } from "lucide-react";
import { TutorList } from "@/components/booking/TutorList";
import { BookingDialog } from "@/components/booking/BookingDialog";
import { SessionList } from "@/components/booking/SessionList";
import { TutorWithAvailability } from "@/hooks/useSessionBooking";

const BookSession = () => {
  const [selectedTutor, setSelectedTutor] = useState<TutorWithAvailability | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleSelectTutor = (tutor: TutorWithAvailability) => {
    setSelectedTutor(tutor);
    setDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/dashboard/learner">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div>
              <h1 className="font-display text-2xl font-bold">Book a Session</h1>
              <p className="text-muted-foreground text-sm">
                Find a tutor and schedule your next learning session
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="tutors" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="tutors" className="gap-2">
              <Users className="w-4 h-4" />
              Find Tutors
            </TabsTrigger>
            <TabsTrigger value="sessions" className="gap-2">
              <Calendar className="w-4 h-4" />
              My Sessions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tutors">
            <TutorList onSelectTutor={handleSelectTutor} />
          </TabsContent>

          <TabsContent value="sessions">
            <SessionList />
          </TabsContent>
        </Tabs>
      </main>

      {/* Booking Dialog */}
      <BookingDialog
        tutor={selectedTutor}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
};

export default BookSession;
