import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, GraduationCap, Lightbulb, FileText } from "lucide-react";

type Subject = "Mathematics" | "Physical Sciences";
type Mode = "guidance" | "exam";

interface ChatSettingsProps {
  subject: Subject;
  grade: string;
  mode: Mode;
  onSubjectChange: (subject: Subject) => void;
  onGradeChange: (grade: string) => void;
  onModeChange: (mode: Mode) => void;
  disabled?: boolean;
}

export const ChatSettings = ({
  subject,
  grade,
  mode,
  onSubjectChange,
  onGradeChange,
  onModeChange,
  disabled,
}: ChatSettingsProps) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[150px]">
          <BookOpen className="w-4 h-4 text-muted-foreground shrink-0" />
          <Select
            value={subject}
            onValueChange={(v) => onSubjectChange(v as Subject)}
            disabled={disabled}
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Mathematics">Mathematics</SelectItem>
              <SelectItem value="Physical Sciences">Physical Sciences</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 flex-1 min-w-[120px]">
          <GraduationCap className="w-4 h-4 text-muted-foreground shrink-0" />
          <Select
            value={grade}
            onValueChange={onGradeChange}
            disabled={disabled}
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Grade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="8">Grade 8</SelectItem>
              <SelectItem value="9">Grade 9</SelectItem>
              <SelectItem value="10">Grade 10</SelectItem>
              <SelectItem value="11">Grade 11</SelectItem>
              <SelectItem value="12">Grade 12</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs
        value={mode}
        onValueChange={(v) => onModeChange(v as Mode)}
        className="w-full"
      >
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="guidance" className="flex items-center gap-2" disabled={disabled}>
            <Lightbulb className="w-4 h-4" />
            <span className="hidden sm:inline">Guidance Mode</span>
            <span className="sm:hidden">Guidance</span>
          </TabsTrigger>
          <TabsTrigger value="exam" className="flex items-center gap-2" disabled={disabled}>
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Exam Mode</span>
            <span className="sm:hidden">Exam</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <p className="text-xs text-muted-foreground text-center">
        {mode === "guidance" 
          ? "I'll guide you step-by-step to find the answer yourself"
          : "I'll provide direct explanations and exam techniques"
        }
      </p>
    </div>
  );
};
