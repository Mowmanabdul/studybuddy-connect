import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import { 
  Sparkles, 
  BookOpen, 
  ArrowRight,
  Brain,
  Target,
  MessageCircle,
  CheckCircle2,
  Star,
  Zap,
  Users
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const HeroSection = () => (
  <section className="relative min-h-screen pt-24 pb-16 overflow-hidden">
    <div className="absolute inset-0 -z-10">
      <div className="absolute top-20 left-10 w-72 h-72 bg-coral/20 rounded-full blur-3xl animate-float" />
      <div className="absolute top-40 right-20 w-96 h-96 bg-teal/20 rounded-full blur-3xl animate-float-delayed" />
      <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-sunshine/20 rounded-full blur-3xl animate-float-slow" />
    </div>
    
    <div className="container mx-auto px-4">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-muted rounded-full px-4 py-2 text-sm font-medium">
            <Sparkles className="w-4 h-4 text-coral" />
            <span>AI-Powered Learning for SA Learners</span>
          </div>
          
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
            Master{" "}
            <span className="text-gradient-hero">Maths & Science</span>
            {" "}with Expert Tutors
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-lg">
            Personalized 1-on-1 tutoring for Grades 8-12. AI diagnostic tests, expert tutors, 
            and smart homework help – all designed for CAPS curriculum success.
          </p>
          
          <div className="flex flex-wrap gap-4">
            <Button variant="hero" size="xl" asChild>
              <Link to="/auth?signup=true">
                Start Free Trial
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <Button variant="outline" size="xl" asChild>
              <Link to="/how-it-works">See How It Works</Link>
            </Button>
          </div>
          
          <div className="flex items-center gap-6 pt-4">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div 
                  key={i}
                  className="w-10 h-10 rounded-full bg-gradient-cool border-2 border-background"
                />
              ))}
            </div>
            <div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-4 h-4 fill-sunshine text-sunshine" />
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">500+</span> learners improving their grades
              </p>
            </div>
          </div>
        </div>
        
        <div className="relative animate-fade-in-up">
          <div className="relative rounded-3xl overflow-hidden shadow-card bg-gradient-to-br from-coral/10 to-teal/10 p-8">
            <div className="aspect-video bg-muted rounded-2xl flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 mx-auto bg-gradient-hero rounded-2xl flex items-center justify-center animate-float">
                  <Brain className="w-10 h-10 text-primary-foreground" />
                </div>
                <p className="text-muted-foreground font-medium">Interactive AI Learning</p>
              </div>
            </div>
            
            <div className="absolute -top-4 -right-4 bg-card rounded-2xl p-4 shadow-card animate-float">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-teal/20 rounded-xl flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-teal" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Diagnostic Complete</p>
                  <p className="text-xs text-muted-foreground">Score: 85%</p>
                </div>
              </div>
            </div>
            
            <div className="absolute -bottom-4 -left-4 bg-card rounded-2xl p-4 shadow-card animate-float-delayed">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-coral/20 rounded-xl flex items-center justify-center">
                  <Zap className="w-5 h-5 text-coral" />
                </div>
                <div>
                  <p className="font-semibold text-sm">AI Homework Help</p>
                  <p className="text-xs text-muted-foreground">Available 24/7</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const featureColorMap: Record<string, { bg: string; text: string }> = {
  coral: { bg: "bg-coral/20", text: "text-coral" },
  teal: { bg: "bg-teal/20", text: "text-teal" },
  sunshine: { bg: "bg-sunshine/20", text: "text-sunshine" },
  lavender: { bg: "bg-lavender/20", text: "text-lavender" },
};

const FeaturesSection = () => {
  const features = [
    {
      icon: Brain,
      title: "AI Diagnostic Tests",
      description: "Identify knowledge gaps instantly with our smart diagnostic system. Get a personalized learning roadmap.",
      color: "coral",
    },
    {
      icon: Users,
      title: "Expert Tutors",
      description: "Learn from qualified South African tutors who understand the CAPS curriculum inside and out.",
      color: "teal",
    },
    {
      icon: MessageCircle,
      title: "AI Homework Helper",
      description: "Stuck on a problem? Our AI assistant guides you step-by-step without giving away the answer.",
      color: "sunshine",
    },
    {
      icon: Target,
      title: "Grade-Focused",
      description: "Content tailored for Grades 8-12 Mathematics and Physical Sciences. Exam-ready preparation.",
      color: "lavender",
    },
  ];
  
  return (
    <section className="py-24 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Everything You Need to <span className="text-gradient-hero">Succeed</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            A complete learning ecosystem designed to help South African learners achieve their academic goals.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const colors = featureColorMap[feature.color];
            return (
              <div 
                key={feature.title}
                className="group bg-card rounded-2xl p-6 shadow-card hover:shadow-lg transition-all duration-300 hover:-translate-y-2"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`w-14 h-14 rounded-2xl mb-4 flex items-center justify-center ${colors.bg}`}>
                  <feature.icon className={`w-7 h-7 ${colors.text}`} />
                </div>
                <h3 className="font-display font-bold text-xl mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

const SubjectsSection = () => (
  <section className="py-24">
    <div className="container mx-auto px-4">
      <div className="grid lg:grid-cols-2 gap-16 items-center">
        <div className="space-y-8">
          <h2 className="font-display text-4xl md:text-5xl font-bold">
            Focused on What <span className="text-gradient-cool">Matters Most</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            We specialize in the two subjects that challenge South African learners the most – 
            and the ones that open doors to STEM careers.
          </p>
          
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-card rounded-2xl shadow-soft">
              <div className="w-12 h-12 bg-coral/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">📐</span>
              </div>
              <div>
                <h4 className="font-display font-bold text-lg">Mathematics</h4>
                <p className="text-muted-foreground">
                  From algebra to calculus. Master problem-solving skills with step-by-step guidance.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 p-4 bg-card rounded-2xl shadow-soft">
              <div className="w-12 h-12 bg-teal/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">⚛️</span>
              </div>
              <div>
                <h4 className="font-display font-bold text-lg">Physical Sciences</h4>
                <p className="text-muted-foreground">
                  Physics and Chemistry combined. Understand concepts, not just formulas.
                </p>
              </div>
            </div>
          </div>
          
          <Button variant="hero" size="lg" asChild>
            <Link to="/auth?signup=true">
              Start Learning Now
              <ArrowRight className="w-5 h-5" />
            </Link>
          </Button>
        </div>
        
        <div className="relative">
          <div className="bg-gradient-to-br from-coral/10 via-teal/10 to-sunshine/10 rounded-3xl p-8">
            <div className="grid grid-cols-2 gap-4">
              {["Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12", "Matric Prep"].map((grade) => (
                <div 
                  key={grade}
                  className="bg-card rounded-2xl p-6 text-center shadow-soft hover:shadow-card transition-all hover:-translate-y-1"
                >
                  <BookOpen className="w-8 h-8 mx-auto mb-2 text-coral" />
                  <p className="font-semibold">{grade}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const CTASection = () => (
  <section className="py-24">
    <div className="container mx-auto px-4">
      <div className="relative bg-gradient-hero rounded-3xl p-12 md:p-16 text-center overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-0 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute bottom-0 right-0 w-60 h-60 bg-white/10 rounded-full blur-3xl" />
        </div>
        
        <h2 className="font-display text-3xl md:text-5xl font-bold text-primary-foreground mb-4">
          Ready to Ace Your Exams?
        </h2>
        <p className="text-primary-foreground/80 text-lg max-w-xl mx-auto mb-8">
          Join hundreds of South African learners who are already improving their grades with Thuto AI.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button variant="hero-outline" size="xl" asChild>
            <Link to="/auth?signup=true">
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  </section>
);

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <SubjectsSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Index;
