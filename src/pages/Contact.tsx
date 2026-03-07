import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Mail,
  Phone,
  MapPin,
  Send,
  MessageCircle
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    
    const { error } = await supabase.from("contact_submissions").insert({
      first_name: formData.get("first_name") as string,
      last_name: formData.get("last_name") as string,
      email: formData.get("email") as string,
      phone: (formData.get("phone") as string) || null,
      user_type: formData.get("user_type") as string,
      message: formData.get("message") as string,
    });
    
    if (error) {
      console.error("Contact form error:", error);
      toast.error("Failed to send message. Please try again.");
    } else {
      toast.success("Message sent! We'll get back to you soon.");
      (e.target as HTMLFormElement).reset();
    }
    
    setIsSubmitting(false);
  };
  
  return (
    <div className="min-h-screen">
      <Navbar />
      
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
      
      <section className="pb-24">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 max-w-5xl mx-auto">
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
            
            <div className="bg-card rounded-3xl p-8 shadow-card">
              <h2 className="font-display text-2xl font-bold mb-6">Send Us a Message</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">First Name</label>
                    <Input name="first_name" placeholder="John" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Last Name</label>
                    <Input name="last_name" placeholder="Doe" required />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <Input name="email" type="email" placeholder="john@example.com" required />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Phone (Optional)</label>
                  <Input name="phone" type="tel" placeholder="+27 12 345 6789" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">I am a...</label>
                  <select name="user_type" className="w-full h-11 px-4 rounded-xl border bg-background text-foreground">
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
                    name="message"
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
      
      <Footer minimal />
    </div>
  );
};

export default Contact;
