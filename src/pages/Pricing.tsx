import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  GraduationCap, 
  Check, 
  ArrowRight,
  Sparkles,
  Zap
} from "lucide-react";
import { useState } from "react";

const Navbar = () => (
  <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
    <div className="container mx-auto px-4 h-16 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-2">
        <div className="w-10 h-10 bg-gradient-hero rounded-xl flex items-center justify-center">
          <GraduationCap className="w-6 h-6 text-primary-foreground" />
        </div>
        <span className="font-display font-bold text-xl">Thuto AI</span>
      </Link>
      
      <div className="hidden md:flex items-center gap-8">
        <Link to="/how-it-works" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
          How It Works
        </Link>
        <Link to="/pricing" className="text-foreground font-medium">
          Pricing
        </Link>
        <Link to="/contact" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
          Contact
        </Link>
      </div>
      
      <div className="flex items-center gap-3">
        <Button variant="ghost" asChild>
          <Link to="/auth">Login</Link>
        </Button>
        <Button asChild>
          <Link to="/auth?signup=true">Get Started</Link>
        </Button>
      </div>
    </div>
  </nav>
);

const plans = [
  {
    name: "Starter",
    description: "Perfect for trying out Thuto AI",
    price: { monthly: 0, annually: 0 },
    features: [
      "1 Free AI Diagnostic Test",
      "AI Homework Helper (5 questions/day)",
      "Access to Learning Resources",
      "Email Support",
    ],
    cta: "Get Started Free",
    popular: false,
    color: "muted",
  },
  {
    name: "Learner",
    description: "For dedicated learners ready to excel",
    price: { monthly: 499, annually: 399 },
    features: [
      "Unlimited AI Diagnostics",
      "4 Tutoring Sessions/month",
      "AI Homework Helper (unlimited)",
      "Session Summaries & Analytics",
      "Priority Booking",
      "WhatsApp Support",
    ],
    cta: "Start Learning",
    popular: true,
    color: "coral",
  },
  {
    name: "Achiever",
    description: "Intensive support for exam success",
    price: { monthly: 999, annually: 799 },
    features: [
      "Everything in Learner, plus:",
      "10 Tutoring Sessions/month",
      "Exam Prep Workshops",
      "Progress Reports for Parents",
      "Dedicated Tutor Match",
      "24/7 Priority Support",
    ],
    cta: "Achieve More",
    popular: false,
    color: "teal",
  },
];

const Pricing = () => {
  const [isAnnual, setIsAnnual] = useState(true);
  
  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero */}
      <section className="pt-32 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 right-20 w-72 h-72 bg-coral/20 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 left-20 w-80 h-80 bg-teal/20 rounded-full blur-3xl animate-float-delayed" />
        </div>
        
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-muted rounded-full px-4 py-2 text-sm font-medium mb-6">
            <Zap className="w-4 h-4 text-sunshine" />
            <span>Affordable for Every Learner</span>
          </div>
          
          <h1 className="font-display text-4xl md:text-6xl font-bold mb-6">
            Simple, Transparent <span className="text-gradient-hero">Pricing</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Invest in your future. Choose the plan that fits your learning goals.
            All prices in South African Rand (ZAR).
          </p>
          
          {/* Toggle */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <span className={`font-medium ${!isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
              Monthly
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={`relative w-16 h-8 rounded-full transition-colors ${isAnnual ? 'bg-coral' : 'bg-muted'}`}
            >
              <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform shadow-sm ${isAnnual ? 'left-9' : 'left-1'}`} />
            </button>
            <span className={`font-medium ${isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
              Annually
              <span className="ml-2 text-xs bg-sunshine/20 text-sunshine px-2 py-0.5 rounded-full">
                Save 20%
              </span>
            </span>
          </div>
        </div>
      </section>
      
      {/* Plans */}
      <section className="pb-24">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <div 
                key={plan.name}
                className={`relative bg-card rounded-3xl p-8 shadow-card transition-all hover:-translate-y-2 ${
                  plan.popular ? 'ring-2 ring-coral' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-coral text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="font-display text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-muted-foreground text-sm">{plan.description}</p>
                  
                  <div className="mt-6">
                    <span className="text-4xl font-display font-bold">
                      R{isAnnual ? plan.price.annually : plan.price.monthly}
                    </span>
                    {plan.price.monthly > 0 && (
                      <span className="text-muted-foreground">/month</span>
                    )}
                  </div>
                  {isAnnual && plan.price.monthly > 0 && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Billed R{plan.price.annually * 12} annually
                    </p>
                  )}
                </div>
                
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-teal flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  variant={plan.popular ? "hero" : "outline"} 
                  className="w-full"
                  asChild
                >
                  <Link to="/auth?signup=true">
                    {plan.cta}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* FAQ teaser */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-2xl font-bold mb-4">Have Questions?</h2>
          <p className="text-muted-foreground mb-6">
            We're here to help. Reach out to our team.
          </p>
          <Button variant="secondary" asChild>
            <Link to="/contact">Contact Us</Link>
          </Button>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="border-t bg-muted/30 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Thuto AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Pricing;
