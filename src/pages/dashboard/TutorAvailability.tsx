import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Clock, Calendar } from "lucide-react";
import { AvailabilityManager } from "@/components/booking/AvailabilityManager";
import { SessionList } from "@/components/booking/SessionList";

const TutorAvailability = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/dashboard/tutor">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div>
              <h1 className="font-display text-2xl font-bold">Manage Schedule</h1>
              <p className="text-muted-foreground text-sm">
                Set your availability and manage upcoming sessions
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="availability" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="availability" className="gap-2">
              <Clock className="w-4 h-4" />
              Availability
            </TabsTrigger>
            <TabsTrigger value="sessions" className="gap-2">
              <Calendar className="w-4 h-4" />
              Sessions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="availability">
            <AvailabilityManager />
          </TabsContent>

          <TabsContent value="sessions">
            <SessionList />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default TutorAvailability;
