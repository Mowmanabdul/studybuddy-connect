import { Link, useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  GraduationCap, 
  ArrowRight,
  Eye,
  EyeOff,
  Loader2
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

const emailSchema = z.string().email("Please enter a valid email address");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");

const Auth = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, role, signUp, signIn } = useAuth();
  
  const [isSignup, setIsSignup] = useState(searchParams.get("signup") === "true");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    if (user) {
      if (!profile || !role) {
        navigate("/onboarding", { replace: true });
        return;
      }
      
      const from = (location.state as { from?: Location })?.from?.pathname;
      if (from && from !== "/onboarding") {
        navigate(from, { replace: true });
      } else if (role === "learner") {
        navigate("/dashboard/learner", { replace: true });
      } else if (role === "tutor") {
        navigate("/dashboard/tutor", { replace: true });
      }
    }
  }, [user, profile, role, navigate, location.state]);
  
  useEffect(() => {
    setIsSignup(searchParams.get("signup") === "true");
  }, [searchParams]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    try {
      emailSchema.parse(formData.email);
    } catch (e) {
      if (e instanceof z.ZodError) {
        newErrors.email = e.errors[0].message;
      }
    }

    if (!isForgotPassword) {
      try {
        passwordSchema.parse(formData.password);
      } catch (e) {
        if (e instanceof z.ZodError) {
          newErrors.password = e.errors[0].message;
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    try {
      emailSchema.parse(formData.email);
    } catch (err) {
      if (err instanceof z.ZodError) {
        newErrors.email = err.errors[0].message;
      }
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
        redirectTo: `${window.location.origin}/auth`,
      });
      if (error) throw error;
      toast.success("Password reset link sent! Check your email.");
      setIsForgotPassword(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to send reset link.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isForgotPassword) {
      return handleForgotPassword(e);
    }

    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      if (isSignup) {
        const { error } = await signUp(formData.email, formData.password);
        
        if (error) {
          if (error.message.includes("already registered")) {
            toast.error("This email is already registered. Please sign in instead.");
          } else {
            toast.error(error.message);
          }
          return;
        }
        
        toast.success("Account created! Please check your email to verify your account.");
      } else {
        const { error } = await signIn(formData.email, formData.password);
        
        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            toast.error("Invalid email or password. Please try again.");
          } else if (error.message.includes("Email not confirmed")) {
            toast.error("Please verify your email before signing in.");
          } else {
            toast.error(error.message);
          }
          return;
        }
        
        toast.success("Welcome back!");
      }
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Link to="/" className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-gradient-hero rounded-xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl">Thuto AI</span>
          </Link>
          
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold mb-2">
              {isForgotPassword 
                ? "Reset your password" 
                : isSignup 
                  ? "Create your account" 
                  : "Welcome back"}
            </h1>
            <p className="text-muted-foreground">
              {isForgotPassword
                ? "Enter your email and we'll send you a reset link"
                : isSignup 
                  ? "Start your journey to academic success" 
                  : "Sign in to continue learning"}
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <Input 
                type="email" 
                placeholder="john@example.com" 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className={errors.email ? "border-destructive" : ""}
              />
              {errors.email && (
                <p className="text-xs text-destructive mt-1">{errors.email}</p>
              )}
            </div>
            
            {!isForgotPassword && (
              <div>
                <label className="block text-sm font-medium mb-2">Password</label>
                <div className="relative">
                  <Input 
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••" 
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className={errors.password ? "border-destructive" : ""}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-destructive mt-1">{errors.password}</p>
                )}
              </div>
            )}

            {!isSignup && !isForgotPassword && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => { setIsForgotPassword(true); setErrors({}); }}
                  className="text-sm text-coral hover:underline font-medium"
                >
                  Forgot password?
                </button>
              </div>
            )}
            
            <Button 
              type="submit" 
              className="w-full" 
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Please wait...
                </>
              ) : isForgotPassword ? (
                <>
                  Send Reset Link
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  {isSignup ? "Create Account" : "Sign In"}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>
          
          <p className="text-center text-sm text-muted-foreground mt-6">
            {isForgotPassword ? (
              <button 
                onClick={() => { setIsForgotPassword(false); setErrors({}); }}
                className="text-coral font-semibold hover:underline"
              >
                ← Back to sign in
              </button>
            ) : (
              <>
                {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
                <button 
                  onClick={() => setIsSignup(!isSignup)}
                  className="text-coral font-semibold hover:underline"
                >
                  {isSignup ? "Sign in" : "Sign up"}
                </button>
              </>
            )}
          </p>
        </div>
      </div>
      
      <div className="hidden lg:flex flex-1 bg-gradient-hero items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
        </div>
        
        <div className="relative text-center text-primary-foreground max-w-md">
          <div className="w-24 h-24 mx-auto bg-white/20 rounded-3xl flex items-center justify-center mb-8 animate-float">
            <GraduationCap className="w-12 h-12" />
          </div>
          
          <h2 className="font-display text-4xl font-bold mb-4">
            Learn Smarter, Not Harder
          </h2>
          
          <p className="text-primary-foreground/80 text-lg">
            Join thousands of South African learners achieving their academic goals with AI-powered tutoring.
          </p>
          
          <div className="grid grid-cols-3 gap-4 mt-12">
            <div>
              <p className="text-3xl font-bold">500+</p>
              <p className="text-sm text-primary-foreground/70">Active Learners</p>
            </div>
            <div>
              <p className="text-3xl font-bold">50+</p>
              <p className="text-sm text-primary-foreground/70">Expert Tutors</p>
            </div>
            <div>
              <p className="text-3xl font-bold">95%</p>
              <p className="text-sm text-primary-foreground/70">Grade Improvement</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
