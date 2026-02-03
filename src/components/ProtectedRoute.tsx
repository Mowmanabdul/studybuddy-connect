import { Navigate, useLocation } from "react-router-dom";
import { useAuth, AppRole } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: AppRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, role, isLoading, needsOnboarding } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-coral" />
      </div>
    );
  }

  if (!user) {
    // Redirect to auth page, saving the attempted location
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Redirect to onboarding if profile/role is missing
  if (needsOnboarding) {
    return <Navigate to="/onboarding" replace />;
  }

  // Check role-based access
  if (allowedRoles && role && !allowedRoles.includes(role)) {
    // Redirect to appropriate dashboard based on role
    if (role === "learner") {
      return <Navigate to="/dashboard/learner" replace />;
    } else if (role === "tutor") {
      return <Navigate to="/dashboard/tutor" replace />;
    } else {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
}
