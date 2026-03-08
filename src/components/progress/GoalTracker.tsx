import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Target, Plus, Check, X, Pencil, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Goal {
  id: string;
  subject: string;
  target_percentage: number;
}

interface GoalTrackerProps {
  userId: string;
  subjectAverages: { subject: string; average: number }[];
  availableSubjects: string[];
}

const GoalTracker = ({ userId, subjectAverages, availableSubjects }: GoalTrackerProps) => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newSubject, setNewSubject] = useState("");
  const [newTarget, setNewTarget] = useState("70");
  const [editTarget, setEditTarget] = useState("");

  useEffect(() => {
    fetchGoals();
  }, [userId]);

  const fetchGoals = async () => {
    const { data } = await supabase
      .from("learning_goals" as any)
      .select("id, subject, target_percentage")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });
    if (data) setGoals(data as any as Goal[]);
  };

  const subjectsWithoutGoals = availableSubjects.filter(
    (s) => !goals.some((g) => g.subject === s)
  );

  const handleAdd = async () => {
    if (!newSubject || !newTarget) return;
    const target = Math.min(100, Math.max(1, parseInt(newTarget) || 70));

    const { error } = await supabase.from("learning_goals" as any).insert({
      user_id: userId,
      subject: newSubject,
      target_percentage: target,
    } as any);

    if (error) {
      toast.error("Failed to add goal");
      return;
    }

    toast.success("Goal added!");
    setAdding(false);
    setNewSubject("");
    setNewTarget("70");
    fetchGoals();
  };

  const handleUpdate = async (id: string) => {
    const target = Math.min(100, Math.max(1, parseInt(editTarget) || 70));
    const { error } = await supabase
      .from("learning_goals" as any)
      .update({ target_percentage: target } as any)
      .eq("id", id);

    if (error) {
      toast.error("Failed to update goal");
      return;
    }

    setEditingId(null);
    fetchGoals();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("learning_goals" as any).delete().eq("id", id);
    fetchGoals();
  };

  const getProgress = (subject: string) => {
    const avg = subjectAverages.find((s) => s.subject === subject);
    return avg?.average ?? 0;
  };

  return (
    <Card className="rounded-2xl shadow-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            My Goals
          </CardTitle>
          {!adding && subjectsWithoutGoals.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-7"
              onClick={() => setAdding(true)}
            >
              <Plus className="w-3 h-3 mr-1" />
              Set Goal
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Add new goal form */}
        {adding && (
          <div className="flex items-center gap-2 mb-4 p-3 bg-muted/50 rounded-xl">
            <Select value={newSubject} onValueChange={setNewSubject}>
              <SelectTrigger className="h-8 text-xs flex-1">
                <SelectValue placeholder="Subject" />
              </SelectTrigger>
              <SelectContent>
                {subjectsWithoutGoals.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-1">
              <Input
                type="number"
                min={1}
                max={100}
                value={newTarget}
                onChange={(e) => setNewTarget(e.target.value)}
                className="h-8 w-16 text-xs text-center"
              />
              <span className="text-xs text-muted-foreground">%</span>
            </div>
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={handleAdd}>
              <Check className="w-4 h-4 text-secondary" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0"
              onClick={() => setAdding(false)}
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </Button>
          </div>
        )}

        {/* Goals list */}
        {goals.length === 0 && !adding ? (
          <div className="text-center py-6">
            <Target className="w-8 h-8 mx-auto mb-2 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground mb-2">No goals set yet</p>
            {subjectsWithoutGoals.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => setAdding(true)}
              >
                <Plus className="w-3 h-3 mr-1" />
                Set Your First Goal
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {goals.map((goal) => {
              const current = getProgress(goal.subject);
              const ratio = Math.min(100, Math.round((current / goal.target_percentage) * 100));
              const achieved = current >= goal.target_percentage;
              const isEditing = editingId === goal.id;

              return (
                <div key={goal.id} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{goal.subject}</span>
                    <div className="flex items-center gap-1.5">
                      {isEditing ? (
                        <>
                          <Input
                            type="number"
                            min={1}
                            max={100}
                            value={editTarget}
                            onChange={(e) => setEditTarget(e.target.value)}
                            className="h-6 w-14 text-xs text-center"
                          />
                          <span className="text-xs text-muted-foreground">%</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                            onClick={() => handleUpdate(goal.id)}
                          >
                            <Check className="w-3 h-3 text-secondary" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                            onClick={() => setEditingId(null)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <span
                            className={`text-xs font-semibold ${
                              achieved ? "text-secondary" : "text-muted-foreground"
                            }`}
                          >
                            {current}% / {goal.target_percentage}%
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:opacity-100"
                            onClick={() => {
                              setEditingId(goal.id);
                              setEditTarget(String(goal.target_percentage));
                            }}
                          >
                            <Pencil className="w-3 h-3 text-muted-foreground" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:opacity-100"
                            onClick={() => handleDelete(goal.id)}
                          >
                            <Trash2 className="w-3 h-3 text-muted-foreground" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="relative">
                    <Progress value={ratio} className="h-2" />
                    {achieved && (
                      <div className="absolute -right-1 -top-1">
                        <div className="w-4 h-4 bg-secondary rounded-full flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 text-secondary-foreground" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GoalTracker;
