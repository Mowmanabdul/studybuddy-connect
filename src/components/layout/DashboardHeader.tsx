import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, LogOut } from "lucide-react";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { ProfileEditor } from "@/components/profile/ProfileEditor";
import { useState } from "react";

interface DashboardHeaderProps {
  displayName: string;
  subtitle?: string;
  avatarUrl?: string | null;
  initials: string;
  roleBadge?: { label: string; color: string };
  pendingBadge?: string;
  onLogout: () => void;
}

export function DashboardHeader({
  displayName,
  subtitle,
  avatarUrl,
  initials,
  roleBadge,
  pendingBadge,
  onLogout,
}: DashboardHeaderProps) {
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);

  return (
    <header className="bg-card border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-hero rounded-xl flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-xl">Thuto AI</span>
          {roleBadge && (
            <span className={`text-xs ${roleBadge.color} px-2 py-0.5 rounded-full font-medium`}>
              {roleBadge.label}
            </span>
          )}
        </Link>

        <div className="flex items-center gap-4">
          {pendingBadge && (
            <Badge className="bg-coral text-primary-foreground">{pendingBadge}</Badge>
          )}
          <NotificationBell />
          <Dialog open={profileDialogOpen} onOpenChange={setProfileDialogOpen}>
            <DialogTrigger asChild>
              <button className="flex items-center gap-3 hover:bg-muted rounded-lg px-2 py-1 transition-colors">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={avatarUrl || undefined} />
                  <AvatarFallback className="bg-gradient-hero text-primary-foreground">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-semibold leading-tight">{displayName}</p>
                  {subtitle && <p className="text-xs text-muted-foreground leading-tight">{subtitle}</p>}
                </div>
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl p-0 overflow-hidden">
              <ProfileEditor onClose={() => setProfileDialogOpen(false)} />
            </DialogContent>
          </Dialog>
          <Button variant="ghost" size="sm" onClick={onLogout}>
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
