import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  GraduationCap, 
  ArrowRight,
  Eye,
  EyeOff,
  User,
  BookOpen
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

type UserRole = "learner" | "tutor";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isSignup, setIsSignup] = useState(searchParams.get("signup") === "true");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>("learner");
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    grade: "10",
  });
  
  useEffect(() => {
    setIsSignup(searchParams.get("signup") === "true");
  }, [searchParams]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate auth - replace with real auth when Cloud is connected
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast.success(isSignup ? "Account created! Welcome to Thuto AI." : "Welcome back!");
    
    // Navigate to appropriate dashboard
    if (selectedRole === "learner") {
      navigate("/dashboard/learner");
    } else {
      navigate("/dashboard/tutor");
    }
    
    setIsLoading(false);
  };
  
  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-gradient-hero rounded-xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl">Thuto AI</span>
          </Link>
          
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold mb-2">
              {isSignup ? "Create your account" : "Welcome back"}
            </h1>
            <p className="text-muted-foreground">
              {isSignup 
                ? "Start your journey to academic success" 
                : "Sign in to continue learning"
              }
            </p>
          </div>
          
          {/* Role Selector (only for signup) */}
          {isSignup && (
            <div className="mb-6">
              <label className="block text-sm font-medium mb-3">I am a...</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedRole("learner")}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    selectedRole === "learner" 
                      ? "border-coral bg-coral/10" 
                      : "border-border hover:border-muted-foreground"
                  }`}
                >
                  <User className={`w-6 h-6 mx-auto mb-2 ${selectedRole === "learner" ? "text-coral" : "text-muted-foreground"}`} />
                  <p className="font-semibold text-sm">Learner</p>
                  <p className="text-xs text-muted-foreground">Grades 8-12</p>
                </button>
                
                <button
                  type="button"
                  onClick={() => setSelectedRole("tutor")}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    selectedRole === "tutor" 
                      ? "border-teal bg-teal/10" 
                      : "border-border hover:border-muted-foreground"
                  }`}
                >
                  <BookOpen className={`w-6 h-6 mx-auto mb-2 ${selectedRole === "tutor" ? "text-teal" : "text-muted-foreground"}`} />
                  <p className="font-semibold text-sm">Tutor</p>
                  <p className="text-xs text-muted-foreground">Teach & earn</p>
                </button>
              </div>
            </div>
          )}
          
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignup && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-2">First Name</label>
                  <Input 
                    placeholder="John" 
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Last Name</label>
                  <Input 
                    placeholder="Doe" 
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    required 
                  />
                </div>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <Input 
                type="email" 
                placeholder="john@example.com" 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required 
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <Input 
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••" 
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required 
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            
            {isSignup && selectedRole === "learner" && (
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
            
            <Button 
              type="submit" 
              className="w-full" 
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? (
                "Please wait..."
              ) : (
                <>
                  {isSignup ? "Create Account" : "Sign In"}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>
          
          {/* Toggle */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
            <button 
              onClick={() => setIsSignup(!isSignup)}
              className="text-coral font-semibold hover:underline"
            >
              {isSignup ? "Sign in" : "Sign up"}
            </button>
          </p>
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
            Learn Smarter, Not Harder
          </h2>
          
          <p className="text-primary-foreground/80 text-lg">
            Join thousands of South African learners achieving their academic goals with AI-powered tutoring.
          </p>
          
          {/* Stats */}
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
