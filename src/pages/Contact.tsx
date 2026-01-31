import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  GraduationCap, 
  Mail,
  Phone,
  MapPin,
  Send,
  MessageCircle
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

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
        <Link to="/pricing" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
          Pricing
        </Link>
        <Link to="/contact" className="text-foreground font-medium">
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

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success("Message sent! We'll get back to you soon.");
    setIsSubmitting(false);
    (e.target as HTMLFormElement).reset();
  };
  
  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero */}
      <section className="pt-32 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-1/4 w-72 h-72 bg-teal/20 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-coral/20 rounded-full blur-3xl animate-float-delayed" />
        </div>
        
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-muted rounded-full px-4 py-2 text-sm font-medium mb-6">
            <MessageCircle className="w-4 h-4 text-teal" />
            <span>We're Here to Help</span>
          </div>
          
          <h1 className="font-display text-4xl md:text-6xl font-bold mb-6">
            Get in <span className="text-gradient-cool">Touch</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Questions about our tutoring platform? Want to become a tutor? 
            We'd love to hear from you.
          </p>
        </div>
      </section>
      
      {/* Contact Form & Info */}
      <section className="pb-24">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 max-w-5xl mx-auto">
            {/* Contact Info */}
            <div className="space-y-8">
              <div>
                <h2 className="font-display text-2xl font-bold mb-4">Contact Information</h2>
                <p className="text-muted-foreground">
                  Reach out through any of these channels, and we'll respond as quickly as possible.
                </p>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-coral/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-coral" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Email</h4>
                    <p className="text-muted-foreground">support@thutoai.co.za</p>
                    <p className="text-muted-foreground">tutors@thutoai.co.za</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-teal/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-teal" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Phone / WhatsApp</h4>
                    <p className="text-muted-foreground">+27 12 345 6789</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-sunshine/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-sunshine" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Location</h4>
                    <p className="text-muted-foreground">
                      Cape Town, South Africa<br />
                      (Online Platform)
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Become a tutor */}
              <div className="bg-gradient-to-br from-coral/10 to-teal/10 rounded-2xl p-6">
                <h3 className="font-display font-bold text-lg mb-2">Want to Become a Tutor?</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Are you passionate about teaching Maths or Science? Join our team of expert tutors 
                  and help SA learners succeed.
                </p>
                <Button variant="secondary" size="sm">
                  Apply as Tutor
                </Button>
              </div>
            </div>
            
            {/* Form */}
            <div className="bg-card rounded-3xl p-8 shadow-card">
              <h2 className="font-display text-2xl font-bold mb-6">Send Us a Message</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">First Name</label>
                    <Input placeholder="John" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Last Name</label>
                    <Input placeholder="Doe" required />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <Input type="email" placeholder="john@example.com" required />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Phone (Optional)</label>
                  <Input type="tel" placeholder="+27 12 345 6789" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">I am a...</label>
                  <select className="w-full h-11 px-4 rounded-xl border bg-background text-foreground">
                    <option>Learner / Student</option>
                    <option>Parent</option>
                    <option>Prospective Tutor</option>
                    <option>School Administrator</option>
                    <option>Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Message</label>
                  <Textarea 
                    placeholder="How can we help you?" 
                    className="min-h-[120px]"
                    required
                  />
                </div>
                
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    "Sending..."
                  ) : (
                    <>
                      Send Message
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>
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

export default Contact;
