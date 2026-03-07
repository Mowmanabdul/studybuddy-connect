import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import { 
  ArrowRight,
  ClipboardCheck,
  Calendar,
  Video,
  MessageCircle,
  BarChart3,
  Sparkles,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const stepColorMap: Record<string, { bg: string; text: string }> = {
  coral: { bg: "bg-coral/20", text: "text-coral" },
  teal: { bg: "bg-teal/20", text: "text-teal" },
  sunshine: { bg: "bg-sunshine/20", text: "text-sunshine" },
  lavender: { bg: "bg-lavender/20", text: "text-lavender" },
  mint: { bg: "bg-mint/20", text: "text-mint" },
};

const steps = [
  {
    number: "01",
    icon: ClipboardCheck,
    title: "Take AI Diagnostic",
    description: "Complete a smart diagnostic test that identifies your knowledge gaps in Mathematics or Physical Sciences. Our AI analyzes your responses to create a personalized learning profile.",
    color: "coral",
  },
  {
    number: "02",
    icon: BarChart3,
    title: "Get Your Roadmap",
    description: "Receive a detailed diagnostic report showing your strengths and areas for improvement. We recommend topics to focus on and match you with the perfect tutor.",
    color: "teal",
  },
  {
    number: "03",
    icon: Calendar,
    title: "Book Sessions",
    description: "Browse available tutors, check their qualifications, and book 1-on-1 sessions at times that work for you. Flexible scheduling for busy learners.",
    color: "sunshine",
  },
  {
    number: "04",
    icon: Video,
    title: "Learn Live",
    description: "Join video sessions with your tutor via Zoom or Google Meet. Interactive whiteboard, screen sharing, and real-time problem solving.",
    color: "lavender",
  },
  {
    number: "05",
    icon: MessageCircle,
    title: "Get AI Homework Help",
    description: "Stuck between sessions? Our AI assistant guides you through problems step-by-step, helping you learn without giving away answers.",
    color: "mint",
  },
  {
    number: "06",
    icon: Sparkles,
    title: "Track Progress",
    description: "After each session, receive an AI-generated summary of what you learned. Track your improvement over time with detailed analytics.",
    color: "coral",
  },
];

const HowItWorks = () => {
  return (
    <div className="min-h-screen">
      <SEO title="How It Works – Thuto AI" description="Learn how Thuto AI helps SA learners master Maths and Science in 6 simple steps with AI diagnostics and expert tutors." />
      <Navbar />
      
      <section className="pt-32 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-coral/20 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-teal/20 rounded-full blur-3xl animate-float-delayed" />
        </div>
        
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-muted rounded-full px-4 py-2 text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4 text-coral" />
            <span>Simple 6-Step Process</span>
          </div>
          
          <h1 className="font-display text-4xl md:text-6xl font-bold mb-6">
            How <span className="text-gradient-hero">Thuto AI</span> Works
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            From diagnostic to success – here's how we help South African learners 
            master Maths and Science.
          </p>
        </div>
      </section>
      
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {steps.map((step, index) => {
              const colors = stepColorMap[step.color];
              return (
                <div key={step.number} className="relative">
                  {index < steps.length - 1 && (
                    <div className="absolute left-[39px] top-24 bottom-0 w-0.5 bg-border" />
                  )}
                  
                  <div className="flex gap-8 mb-12 group">
                    <div className="relative">
                      <div className={`w-20 h-20 rounded-2xl ${colors.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <step.icon className={`w-8 h-8 ${colors.text}`} />
                      </div>
                      <span className="absolute -top-2 -right-2 bg-foreground text-background text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                        {step.number}
                      </span>
                    </div>
                    
                    <div className="flex-1 pt-2">
                      <h3 className="font-display text-2xl font-bold mb-2">{step.title}</h3>
                      <p className="text-muted-foreground text-lg">{step.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-hero rounded-3xl p-12 text-center">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              Ready to Start Your Journey?
            </h2>
            <p className="text-primary-foreground/80 text-lg mb-8 max-w-xl mx-auto">
              Begin with a free AI diagnostic to discover your learning path.
            </p>
            <Button variant="hero-outline" size="xl" asChild>
              <Link to="/auth?signup=true">
                Take Free Diagnostic
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
      
      <Footer minimal />
    </div>
  );
};

export default HowItWorks;
