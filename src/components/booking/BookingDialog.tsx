import { useState, useMemo } from "react";
import { format, addDays, startOfWeek, isSameDay, setHours, setMinutes } from "date-fns";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Clock, CalendarDays, BookOpen } from "lucide-react";
import { useSessionBooking, TutorWithAvailability, TutorAvailability } from "@/hooks/useSessionBooking";
import { cn } from "@/lib/utils";

interface BookingDialogProps {
  tutor: TutorWithAvailability | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BookingDialog({ tutor, open, onOpenChange }: BookingDialogProps) {
  const { bookSession, DAY_NAMES } = useSessionBooking();
  
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedSlot, setSelectedSlot] = useState<TutorAvailability | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [isBooking, setIsBooking] = useState(false);

  // Get available days from tutor's availability
  const availableDays = useMemo(() => {
    if (!tutor) return new Set<number>();
    return new Set(tutor.availability.map(a => a.day_of_week));
  }, [tutor]);

  // Get slots for the selected date
  const slotsForDate = useMemo(() => {
    if (!tutor || !selectedDate) return [];
    const dayOfWeek = selectedDate.getDay();
    return tutor.availability.filter(a => a.day_of_week === dayOfWeek);
  }, [tutor, selectedDate]);

  // Get available subjects
  const subjects = useMemo(() => {
    if (!tutor) return [];
    return [...new Set(tutor.availability.map(a => a.subject))];
  }, [tutor]);

  // Generate time options for selected slot
  const timeOptions = useMemo(() => {
    if (!selectedSlot) return [];
    
    const [startHour, startMin] = selectedSlot.start_time.split(":").map(Number);
    const [endHour, endMin] = selectedSlot.end_time.split(":").map(Number);
    
    const times: string[] = [];
    let hour = startHour;
    let min = startMin;
    
    while (hour < endHour || (hour === endHour && min < endMin)) {
      times.push(`${hour.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`);
      min += 30;
      if (min >= 60) {
        min = 0;
        hour++;
      }
    }
    
    return times;
  }, [selectedSlot]);

  // Disable dates that tutor is not available
  const disabledDates = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Can't book in the past
    if (date < today) return true;
    
    // Can't book more than 4 weeks out
    const maxDate = addDays(today, 28);
    if (date > maxDate) return true;
    
    // Can only book on days tutor is available
    return !availableDays.has(date.getDay());
  };

  const handleBook = async () => {
    if (!tutor || !selectedDate || !selectedTime || !selectedSubject) return;
    
    const [hour, min] = selectedTime.split(":").map(Number);
    const scheduledAt = setMinutes(setHours(selectedDate, hour), min);
    
    setIsBooking(true);
    const success = await bookSession(
      tutor.tutor_id,
      selectedSubject,
      scheduledAt,
      60,
      notes || undefined
    );
    setIsBooking(false);
    
    if (success) {
      onOpenChange(false);
      resetForm();
    }
  };

  const resetForm = () => {
    setSelectedDate(undefined);
    setSelectedSlot(null);
    setSelectedTime("");
    setSelectedSubject("");
    setNotes("");
  };

  if (!tutor) return null;

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) resetForm(); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Book Session with {tutor.first_name} {tutor.last_name}</DialogTitle>
          <DialogDescription>
            Select a date, time, and subject for your tutoring session
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6 mt-4">
          {/* Calendar */}
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <CalendarDays className="w-4 h-4" />
              Select Date
            </h4>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                setSelectedDate(date);
                setSelectedSlot(null);
                setSelectedTime("");
              }}
              disabled={disabledDates}
              className={cn("rounded-md border p-3 pointer-events-auto")}
            />
            <div className="mt-2 flex flex-wrap gap-1">
              {Array.from(availableDays).sort().map(day => (
                <Badge key={day} variant="outline" className="text-xs">
                  {DAY_NAMES[day]}
                </Badge>
              ))}
            </div>
          </div>

          {/* Time & Subject Selection */}
          <div className="space-y-4">
            {/* Subject */}
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Subject
              </h4>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Time Slots */}
            {selectedDate && (
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Available Times for {format(selectedDate, "EEEE, MMM d")}
                </h4>
                {slotsForDate.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No slots available for this day</p>
                ) : (
                  <div className="space-y-3">
                    {slotsForDate.map((slot) => (
                      <div key={slot.id}>
                        <Button
                          variant={selectedSlot?.id === slot.id ? "default" : "outline"}
                          className="w-full justify-between"
                          onClick={() => {
                            setSelectedSlot(slot);
                            setSelectedTime("");
                            if (!selectedSubject) setSelectedSubject(slot.subject);
                          }}
                        >
                          <span>{slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}</span>
                          <Badge variant="secondary">{slot.subject}</Badge>
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Specific Time */}
            {selectedSlot && (
              <div>
                <h4 className="font-medium mb-3">Select Start Time</h4>
                <div className="flex flex-wrap gap-2">
                  {timeOptions.map((time) => (
                    <Button
                      key={time}
                      variant={selectedTime === time ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedTime(time)}
                    >
                      {time}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            <div>
              <h4 className="font-medium mb-3">Notes (Optional)</h4>
              <Textarea
                placeholder="Any specific topics you'd like to cover?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Book Button */}
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleBook}
            disabled={!selectedDate || !selectedTime || !selectedSubject || isBooking}
          >
            {isBooking ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Booking...
              </>
            ) : (
              "Book Session"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
