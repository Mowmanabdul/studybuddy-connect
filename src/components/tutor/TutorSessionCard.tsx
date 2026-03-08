import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  Video,
  BookOpen,
  CheckCircle2,
  Link2,
  Check,
  X,
  User,
  FileText,
  PenLine,
} from "lucide-react";
import { format, isToday, isTomorrow, isPast } from "date-fns";

interface TutorSession {
  id: string;
  learner_id: string;
  learner_name: string;
  grade: string | null;
  subject: string;
  scheduled_at: string;
  duration_minutes: number;
  status: string;
  notes: string | null;
  meeting_link: string | null;
  tutor_notes: string | null;
}

interface TutorSessionCardProps {
  session: TutorSession;
  variant: "upcoming" | "recent";
  onConfirm?: (id: string) => void;
  onDecline?: (id: string) => void;
  onAddMeetingLink?: (id: string, link: string) => void;
  onComplete?: (id: string) => void;
  onSaveNotes?: (id: string, notes: string) => void;
}

const formatSessionDate = (dateStr: string) => {
  const date = new Date(dateStr);
  if (isToday(date)) return "Today";
  if (isTomorrow(date)) return "Tomorrow";
  return format(date, "EEE, dd MMM");
};

export function TutorSessionCard({
  session,
  variant,
  onConfirm,
  onDecline,
  onAddMeetingLink,
  onComplete,
  onSaveNotes,
}: TutorSessionCardProps) {
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkValue, setLinkValue] = useState("");
  const [showNotesInput, setShowNotesInput] = useState(false);
  const [notesValue, setNotesValue] = useState(session.tutor_notes || "");

  const handleSaveLink = () => {
    if (linkValue.trim() && onAddMeetingLink) {
      onAddMeetingLink(session.id, linkValue.trim());
      setShowLinkInput(false);
    }
  };

  const handleSaveNotes = () => {
    if (notesValue.trim() && onSaveNotes) {
      onSaveNotes(session.id, notesValue.trim());
      setShowNotesInput(false);
    }
  };

  if (variant === "upcoming") {
    return (
      <div
        className={`p-4 rounded-xl border transition-colors ${
          session.status === "pending"
            ? "bg-sunshine/5 border-sunshine/30"
            : "bg-muted/50 border-transparent"
        }`}
      >
        <div className="flex items-center gap-4">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              session.subject === "Mathematics" ? "bg-coral/20" : "bg-teal/20"
            }`}
          >
            <BookOpen
              className={`w-6 h-6 ${
                session.subject === "Mathematics" ? "text-coral" : "text-teal"
              }`}
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold truncate">{session.learner_name}</h4>
              <Badge
                variant={session.status === "pending" ? "outline" : "secondary"}
                className="text-xs shrink-0"
              >
                {session.status === "pending" ? "⏳ Pending" : "✓ Confirmed"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {session.grade ? `Grade ${session.grade} · ` : ""}
              {session.subject} · {session.duration_minutes}min
            </p>
          </div>

          <div className="text-right shrink-0">
            <p className="font-semibold text-sm">
              {formatSessionDate(session.scheduled_at)}
            </p>
            <p className="text-sm text-muted-foreground flex items-center justify-end gap-1">
              <Clock className="w-3 h-3" />{" "}
              {format(new Date(session.scheduled_at), "HH:mm")}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-border/50">
          {session.status === "pending" && (
            <>
              <Button size="sm" onClick={() => onConfirm?.(session.id)}>
                <Check className="w-3 h-3 mr-1" /> Confirm
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onDecline?.(session.id)}
              >
                <X className="w-3 h-3 mr-1" /> Decline
              </Button>
            </>
          )}

          {session.status === "confirmed" &&
            !session.meeting_link &&
            (showLinkInput ? (
              <div className="flex gap-2 flex-1">
                <Input
                  placeholder="Paste Zoom/Meet link..."
                  value={linkValue}
                  onChange={(e) => setLinkValue(e.target.value)}
                  className="h-8 text-sm"
                />
                <Button size="sm" onClick={handleSaveLink}>
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowLinkInput(false)}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowLinkInput(true)}
              >
                <Link2 className="w-3 h-3 mr-1" /> Add Meeting Link
              </Button>
            ))}

          {session.meeting_link && (
            <Button size="sm" variant="secondary" asChild>
              <a
                href={session.meeting_link}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Video className="w-3 h-3 mr-1" /> Join Meeting
              </a>
            </Button>
          )}

          {session.status === "confirmed" &&
            isPast(new Date(session.scheduled_at)) && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onComplete?.(session.id)}
              >
                <CheckCircle2 className="w-3 h-3 mr-1" /> Mark Complete
              </Button>
            )}
        </div>
      </div>
    );
  }

  // Recent/completed variant
  return (
    <div className="p-4 bg-muted/50 rounded-xl space-y-3">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
          <User className="w-5 h-5 text-muted-foreground" />
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="font-semibold truncate">{session.learner_name}</h4>
          <p className="text-sm text-muted-foreground">
            {session.subject} · {session.duration_minutes}min
          </p>
        </div>

        <div className="text-right shrink-0">
          <span className="flex items-center gap-1 text-sm text-teal font-medium">
            <CheckCircle2 className="w-4 h-4" /> Complete
          </span>
          <p className="text-xs text-muted-foreground">
            {format(new Date(session.scheduled_at), "dd MMM")}
          </p>
        </div>
      </div>

      {/* Tutor Notes */}
      {session.tutor_notes && !showNotesInput ? (
        <div className="bg-card rounded-lg p-3 border border-border/50">
          <div className="flex items-center gap-2 mb-1">
            <FileText className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-semibold text-primary">
              Session Notes
            </span>
          </div>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {session.tutor_notes}
          </p>
          <Button
            size="sm"
            variant="ghost"
            className="mt-2 h-7 text-xs"
            onClick={() => {
              setNotesValue(session.tutor_notes || "");
              setShowNotesInput(true);
            }}
          >
            <PenLine className="w-3 h-3 mr-1" /> Edit
          </Button>
        </div>
      ) : !showNotesInput ? (
        <Button
          size="sm"
          variant="outline"
          className="h-8 text-xs"
          onClick={() => {
            setNotesValue("");
            setShowNotesInput(true);
          }}
        >
          <PenLine className="w-3 h-3 mr-1" /> Add Session Notes
        </Button>
      ) : null}

      {showNotesInput && (
        <div className="space-y-2">
          <Textarea
            placeholder="Write a summary of this session... (topics covered, progress, homework assigned)"
            value={notesValue}
            onChange={(e) => setNotesValue(e.target.value)}
            className="text-sm min-h-[80px]"
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSaveNotes}>
              Save Notes
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowNotesInput(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
