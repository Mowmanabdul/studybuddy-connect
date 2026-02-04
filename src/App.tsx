import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route
              path="/dashboard/learner"
              element={
                <ProtectedRoute allowedRoles={["learner"]}>
                  <LearnerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/tutor"
              element={
                <ProtectedRoute allowedRoles={["tutor"]}>
                  <TutorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/diagnostic"
              element={
                <ProtectedRoute allowedRoles={["learner"]}>
                  <DiagnosticTest />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/homework"
              element={
                <ProtectedRoute allowedRoles={["learner"]}>
                  <HomeworkHelper />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/book-session"
              element={
                <ProtectedRoute allowedRoles={["learner"]}>
                  <BookSession />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/availability"
              element={
                <ProtectedRoute allowedRoles={["tutor"]}>
                  <TutorAvailability />
                </ProtectedRoute>
              }
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
