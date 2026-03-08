import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import PageTransition from "@/components/layout/PageTransition";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import HowItWorks from "./pages/HowItWorks";
import Pricing from "./pages/Pricing";
import Contact from "./pages/Contact";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import LearnerDashboard from "./pages/dashboard/LearnerDashboard";
import TutorDashboard from "./pages/dashboard/TutorDashboard";
import DiagnosticTest from "./pages/dashboard/DiagnosticTest";
import HomeworkHelper from "./pages/dashboard/HomeworkHelper";
import BookSession from "./pages/dashboard/BookSession";
import TutorAvailability from "./pages/dashboard/TutorAvailability";
import LearnerProgress from "./pages/dashboard/LearnerProgress";
import AdaptiveQuiz from "./pages/dashboard/AdaptiveQuiz";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
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
          element={
            <ProtectedRoute allowedRoles={["learner"]}>
              <PageTransition><LearnerDashboard /></PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/tutor"
          element={
            <ProtectedRoute allowedRoles={["tutor"]}>
              <PageTransition><TutorDashboard /></PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/diagnostic"
          element={
            <ProtectedRoute allowedRoles={["learner"]}>
              <PageTransition><DiagnosticTest /></PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/homework"
          element={
            <ProtectedRoute allowedRoles={["learner"]}>
              <PageTransition><HomeworkHelper /></PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/book-session"
          element={
            <ProtectedRoute allowedRoles={["learner"]}>
              <PageTransition><BookSession /></PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/availability"
          element={
            <ProtectedRoute allowedRoles={["tutor"]}>
              <PageTransition><TutorAvailability /></PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/progress"
          element={
            <ProtectedRoute allowedRoles={["learner"]}>
              <PageTransition><LearnerProgress /></PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/quiz"
          element={
            <ProtectedRoute allowedRoles={["learner"]}>
              <PageTransition><AdaptiveQuiz /></PageTransition>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
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
