import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Check, 
  ArrowRight,
  Zap
} from "lucide-react";
import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

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
  },
];

const Pricing = () => {
  const [isAnnual, setIsAnnual] = useState(true);
  
  return (
    <div className="min-h-screen">
      <Navbar />
      
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
          
          <div className="flex items-center justify-center gap-4 mb-12">
            <span className={`font-medium ${!isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
              Monthly
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={`relative w-16 h-8 rounded-full transition-colors ${isAnnual ? 'bg-coral' : 'bg-muted'}`}
            >
              <div className={`absolute top-1 w-6 h-6 bg-card rounded-full transition-transform shadow-sm ${isAnnual ? 'left-9' : 'left-1'}`} />
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
      
      <Footer minimal />
    </div>
  );
};

export default Pricing;
