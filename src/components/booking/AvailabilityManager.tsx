import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Clock, Plus, Trash2, Loader2 } from "lucide-react";
import { useSessionBooking } from "@/hooks/useSessionBooking";

const SUBJECTS = ["Mathematics", "Physical Sciences"];
const TIME_SLOTS = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, "0");
  return [`${hour}:00`, `${hour}:30`];
}).flat();

export function AvailabilityManager() {
  const { 
    availability, 
    isLoading, 
    fetchMyAvailability, 
    addAvailability, 
    removeAvailability,
    DAY_NAMES 
  } = useSessionBooking();
  
  const [newSlot, setNewSlot] = useState({
    day_of_week: "1",
    start_time: "09:00",
    end_time: "10:00",
    subject: "Mathematics",
  });
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    fetchMyAvailability();
  }, []);

  const handleAdd = async () => {
    setIsAdding(true);
    await addAvailability({
      day_of_week: parseInt(newSlot.day_of_week),
      start_time: newSlot.start_time,
      end_time: newSlot.end_time,
      subject: newSlot.subject,
    });
    setIsAdding(false);
  };

  const groupedByDay = availability.reduce((acc, slot) => {
    if (!acc[slot.day_of_week]) acc[slot.day_of_week] = [];
    acc[slot.day_of_week].push(slot);
    return acc;
  }, {} as Record<number, typeof availability>);

  return (
    <div className="space-y-6">
      {/* Add New Slot */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Add Availability</CardTitle>
          <CardDescription>Set when you're available for tutoring sessions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <Select
              value={newSlot.day_of_week}
              onValueChange={(v) => setNewSlot({ ...newSlot, day_of_week: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Day" />
              </SelectTrigger>
              <SelectContent>
                {DAY_NAMES.map((day, i) => (
                  <SelectItem key={i} value={i.toString()}>{day}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={newSlot.start_time}
              onValueChange={(v) => setNewSlot({ ...newSlot, start_time: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Start" />
              </SelectTrigger>
              <SelectContent>
                {TIME_SLOTS.map((time) => (
                  <SelectItem key={time} value={time}>{time}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={newSlot.end_time}
              onValueChange={(v) => setNewSlot({ ...newSlot, end_time: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="End" />
              </SelectTrigger>
              <SelectContent>
                {TIME_SLOTS.filter(t => t > newSlot.start_time).map((time) => (
                  <SelectItem key={time} value={time}>{time}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={newSlot.subject}
              onValueChange={(v) => setNewSlot({ ...newSlot, subject: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Subject" />
              </SelectTrigger>
              <SelectContent>
                {SUBJECTS.map((subject) => (
                  <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button onClick={handleAdd} disabled={isAdding}>
              {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4 mr-1" />}
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Current Availability */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Your Availability</CardTitle>
          <CardDescription>
            {availability.length === 0 
              ? "You haven't set any availability yet" 
              : `${availability.length} time slot${availability.length !== 1 ? "s" : ""} configured`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : availability.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Add your first availability slot above to start receiving bookings.
            </p>
          ) : (
            <div className="space-y-4">
              {Object.entries(groupedByDay)
                .sort(([a], [b]) => parseInt(a) - parseInt(b))
                .map(([day, slots]) => (
                  <div key={day}>
                    <h4 className="font-medium mb-2">{DAY_NAMES[parseInt(day)]}</h4>
                    <div className="flex flex-wrap gap-2">
                      {slots.map((slot) => (
                        <div
                          key={slot.id}
                          className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2"
                        >
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">
                            {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            {slot.subject}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-destructive hover:text-destructive"
                            onClick={() => removeAvailability(slot.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
