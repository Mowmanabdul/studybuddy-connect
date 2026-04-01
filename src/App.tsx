import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import PageTransition from "@/components/layout/PageTransition";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Loader2 } from "lucide-react";

// Eager-load landing & auth (critical path)
import Index from "./pages/Index";
import Auth from "./pages/Auth";

// Lazy-load everything else
const HowItWorks = lazy(() => import("./pages/HowItWorks"));
const Pricing = lazy(() => import("./pages/Pricing"));
const Contact = lazy(() => import("./pages/Contact"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const LearnerDashboard = lazy(() => import("./pages/dashboard/LearnerDashboard"));
const TutorDashboard = lazy(() => import("./pages/dashboard/TutorDashboard"));
const DiagnosticTest = lazy(() => import("./pages/dashboard/DiagnosticTest"));
const HomeworkHelper = lazy(() => import("./pages/dashboard/HomeworkHelper"));
const BookSession = lazy(() => import("./pages/dashboard/BookSession"));
const TutorAvailability = lazy(() => import("./pages/dashboard/TutorAvailability"));
const LearnerProgress = lazy(() => import("./pages/dashboard/LearnerProgress"));
const AdaptiveQuiz = lazy(() => import("./pages/dashboard/AdaptiveQuiz"));
const MyLearners = lazy(() => import("./pages/dashboard/MyLearners"));
const AdminOverview = lazy(() => import("./pages/admin/AdminOverview"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminSessions = lazy(() => import("./pages/admin/AdminSessions"));
const AdminContent = lazy(() => import("./pages/admin/AdminContent"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Lazy-load AdminLayout (uses Outlet)
const AdminLayout = lazy(() => import("./components/admin/AdminLayout").then(m => ({ default: m.AdminLayout })));

const queryClient = new QueryClient();

const LazyFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <Loader2 className="w-8 h-8 animate-spin text-coral" />
  </div>
);

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <Suspense fallback={<LazyFallback />}>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageTransition><Index /></PageTransition>} />
          <Route path="/how-it-works" element={<PageTransition><HowItWorks /></PageTransition>} />
          <Route path="/pricing" element={<PageTransition><Pricing /></PageTransition>} />
          <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
          <Route path="/auth" element={<PageTransition><Auth /></PageTransition>} />
          <Route path="/onboarding" element={<PageTransition><Onboarding /></PageTransition>} />
          <Route
            path="/dashboard/learner"
            element={<ProtectedRoute allowedRoles={["learner"]}><PageTransition><LearnerDashboard /></PageTransition></ProtectedRoute>}
          />
          <Route
            path="/dashboard/tutor"
            element={<ProtectedRoute allowedRoles={["tutor"]}><PageTransition><TutorDashboard /></PageTransition></ProtectedRoute>}
          />
          <Route
            path="/dashboard/diagnostic"
            element={<ProtectedRoute allowedRoles={["learner"]}><PageTransition><DiagnosticTest /></PageTransition></ProtectedRoute>}
          />
          <Route
            path="/dashboard/homework"
            element={<ProtectedRoute allowedRoles={["learner"]}><PageTransition><HomeworkHelper /></PageTransition></ProtectedRoute>}
          />
          <Route
            path="/dashboard/book-session"
            element={<ProtectedRoute allowedRoles={["learner"]}><PageTransition><BookSession /></PageTransition></ProtectedRoute>}
          />
          <Route
            path="/dashboard/availability"
            element={<ProtectedRoute allowedRoles={["tutor"]}><PageTransition><TutorAvailability /></PageTransition></ProtectedRoute>}
          />
          <Route
            path="/dashboard/my-learners"
            element={<ProtectedRoute allowedRoles={["tutor"]}><PageTransition><MyLearners /></PageTransition></ProtectedRoute>}
          />
          <Route
            path="/dashboard/progress"
            element={<ProtectedRoute allowedRoles={["learner"]}><PageTransition><LearnerProgress /></PageTransition></ProtectedRoute>}
          />
          <Route
            path="/dashboard/quiz"
            element={<ProtectedRoute allowedRoles={["learner"]}><PageTransition><AdaptiveQuiz /></PageTransition></ProtectedRoute>}
          />
          <Route
            path="/admin"
            element={<ProtectedRoute allowedRoles={["admin"]}><AdminLayout /></ProtectedRoute>}
          >
            <Route index element={<AdminOverview />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="sessions" element={<AdminSessions />} />
            <Route path="content" element={<AdminContent />} />
          </Route>
          <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
        </Routes>
      </AnimatePresence>
    </Suspense>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AnimatedRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
