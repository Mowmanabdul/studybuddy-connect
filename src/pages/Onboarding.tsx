import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  GraduationCap, 
  ArrowRight,
  User,
  BookOpen,
  Loader2,
  Sparkles
} from "lucide-react";
import { toast } from "sonner";
import { useAuth, AppRole } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

const nameSchema = z.string().min(1, "This field is required");

const Onboarding = () => {
  const navigate = useNavigate();
  const { user, profile, role, isLoading: authLoading, refreshUserData } = useAuth();
  
  const [step, setStep] = useState<"role" | "profile">("role");
  const [selectedRole, setSelectedRole] = useState<AppRole | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    grade: "10",
    bio: "",
  });

  // If user already has profile and role, redirect to dashboard
  useEffect(() => {
    if (!authLoading && user && profile && role) {
      if (role === "learner") {
        navigate("/dashboard/learner", { replace: true });
      } else if (role === "tutor") {
        navigate("/dashboard/tutor", { replace: true });
      }
    }
  }, [authLoading, user, profile, role, navigate]);

  const validateProfile = (): boolean => {
    const newErrors: Record<string, string> = {};

    try {
      nameSchema.parse(formData.firstName);
    } catch (e) {
      if (e instanceof z.ZodError) {
        newErrors.firstName = e.errors[0].message;
      }
    }

    try {
      nameSchema.parse(formData.lastName);
    } catch (e) {
      if (e instanceof z.ZodError) {
        newErrors.lastName = e.errors[0].message;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRoleSelect = (role: AppRole) => {
    setSelectedRole(role);
    setStep("profile");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateProfile() || !user || !selectedRole) return;
    
    setIsLoading(true);
    
    try {
      // Check if profile already exists
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!existingProfile) {
        // Create profile only if it doesn't exist
        const { error: profileError } = await supabase.from("profiles").insert({
          user_id: user.id,
          first_name: formData.firstName,
          last_name: formData.lastName,
          grade: selectedRole === "learner" ? formData.grade : null,
          bio: selectedRole === "tutor" ? formData.bio : null,
        });

        if (profileError && profileError.code !== "23505") {
          throw profileError;
        }
      }

      // Check if role already exists
      const { data: existingRole } = await supabase
        .from("user_roles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!existingRole) {
        // Create user role only if it doesn't exist
        const { error: roleError } = await supabase.from("user_roles").insert({
          user_id: user.id,
          role: selectedRole,
        });

        if (roleError && roleError.code !== "23505") {
          throw roleError;
        }
      }

      // Refresh user data in auth context
      await refreshUserData();
      
      toast.success("Welcome to Thuto AI!");
      
      // Navigate to appropriate dashboard based on existing or selected role
      const finalRole = existingRole ? role : selectedRole;
      if (finalRole === "learner") {
        navigate("/dashboard/learner", { replace: true });
      } else {
        navigate("/dashboard/tutor", { replace: true });
      }
    } catch (error: any) {
      console.error("Onboarding error:", error);
      toast.error(error.message || "Failed to complete setup. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-gradient-hero rounded-xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl">Thuto AI</span>
          </div>
          
          {/* Progress indicator */}
          <div className="flex items-center gap-2 mb-8">
            <div className={`h-2 flex-1 rounded-full ${step === "role" ? "bg-coral" : "bg-coral"}`} />
            <div className={`h-2 flex-1 rounded-full ${step === "profile" ? "bg-coral" : "bg-muted"}`} />
          </div>

          {step === "role" ? (
            <>
              {/* Role Selection */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-coral" />
                  <h1 className="font-display text-3xl font-bold">
                    Welcome!
                  </h1>
                </div>
                <p className="text-muted-foreground">
                  Let's get your account set up. First, tell us who you are.
                </p>
              </div>

              <div className="space-y-4">
                <button
                  type="button"
                  onClick={() => handleRoleSelect("learner")}
                  className="w-full p-6 rounded-2xl border-2 border-border hover:border-coral hover:bg-coral/5 transition-all text-left group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-coral/10 rounded-xl flex items-center justify-center group-hover:bg-coral/20 transition-colors">
                      <User className="w-6 h-6 text-coral" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-lg mb-1">I'm a Learner</p>
                      <p className="text-sm text-muted-foreground">
                        I'm a student in Grades 8-12 looking to improve my grades with AI-powered tutoring.
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-coral transition-colors mt-1" />
                  </div>
                </button>
                
                <button
                  type="button"
                  onClick={() => handleRoleSelect("tutor")}
                  className="w-full p-6 rounded-2xl border-2 border-border hover:border-teal hover:bg-teal/5 transition-all text-left group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-teal/10 rounded-xl flex items-center justify-center group-hover:bg-teal/20 transition-colors">
                      <BookOpen className="w-6 h-6 text-teal" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-lg mb-1">I'm a Tutor</p>
                      <p className="text-sm text-muted-foreground">
                        I'm an educator looking to teach and earn by helping students succeed.
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-teal transition-colors mt-1" />
                  </div>
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Profile Form */}
              <div className="mb-8">
                <button 
                  onClick={() => setStep("role")}
                  className="text-sm text-muted-foreground hover:text-foreground mb-4 flex items-center gap-1"
                >
                  ← Back to role selection
                </button>
                <h1 className="font-display text-3xl font-bold mb-2">
                  Complete your profile
                </h1>
                <p className="text-muted-foreground">
                  {selectedRole === "learner" 
                    ? "Tell us a bit about yourself so we can personalize your learning experience." 
                    : "Set up your tutor profile to start connecting with students."
                  }
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-2">First Name</label>
                    <Input 
                      placeholder="John" 
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      className={errors.firstName ? "border-destructive" : ""}
                    />
                    {errors.firstName && (
                      <p className="text-xs text-destructive mt-1">{errors.firstName}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Last Name</label>
                    <Input 
                      placeholder="Doe" 
                      value={formData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                      className={errors.lastName ? "border-destructive" : ""}
                    />
                    {errors.lastName && (
                      <p className="text-xs text-destructive mt-1">{errors.lastName}</p>
                    )}
                  </div>
                </div>

                {selectedRole === "learner" && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Current Grade</label>
                    <select 
                      className="w-full h-11 px-4 rounded-xl border bg-background text-foreground"
                      value={formData.grade}
                      onChange={(e) => setFormData({...formData, grade: e.target.value})}
                    >
                      <option value="8">Grade 8</option>
                      <option value="9">Grade 9</option>
                      <option value="10">Grade 10</option>
                      <option value="11">Grade 11</option>
                      <option value="12">Grade 12</option>
                    </select>
                  </div>
                )}

                {selectedRole === "tutor" && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Short Bio (Optional)</label>
                    <textarea 
                      className="w-full px-4 py-3 rounded-xl border bg-background text-foreground resize-none"
                      rows={3}
                      placeholder="Tell students about your teaching experience and expertise..."
                      value={formData.bio}
                      onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    />
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
                      Setting up...
                    </>
                  ) : (
                    <>
                      Complete Setup
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
      
      {/* Right side - Decorative */}
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
            {step === "role" ? "Choose Your Path" : "Almost There!"}
          </h2>
          
          <p className="text-primary-foreground/80 text-lg">
            {step === "role" 
              ? "Whether you're here to learn or teach, we've got you covered."
              : "Just a few more details and you'll be ready to start your journey."
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
