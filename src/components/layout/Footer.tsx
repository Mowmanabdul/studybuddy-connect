import { Link } from "react-router-dom";
import { GraduationCap } from "lucide-react";

interface FooterProps {
  minimal?: boolean;
}

export const Footer = ({ minimal = false }: FooterProps) => {
  if (minimal) {
    return (
      <footer className="border-t bg-muted/30 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Thuto AI. All rights reserved.</p>
        </div>
      </footer>
    );
  }

  return (
    <footer className="border-t bg-card py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-hero rounded-xl flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-xl">Thuto AI</span>
            </Link>
            <p className="text-muted-foreground text-sm max-w-xs">
              Empowering South African learners with AI-powered tutoring for Maths and Science. Built for CAPS curriculum success.
            </p>
            {/* Social links */}
            <div className="flex gap-3 pt-2">
              {[
                { label: "Twitter", href: "#", icon: "𝕏" },
                { label: "Instagram", href: "#", icon: "📷" },
                { label: "TikTok", href: "#", icon: "🎵" },
                { label: "YouTube", href: "#", icon: "▶️" },
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="w-9 h-9 bg-muted rounded-lg flex items-center justify-center text-sm hover:bg-primary hover:text-primary-foreground transition-all"
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Platform</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li><Link to="/how-it-works" className="hover:text-foreground transition-colors">How It Works</Link></li>
              <li><Link to="/pricing" className="hover:text-foreground transition-colors">Pricing</Link></li>
              <li><Link to="/auth" className="hover:text-foreground transition-colors">Login</Link></li>
              <li><Link to="/auth?signup=true" className="hover:text-foreground transition-colors">Sign Up</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Subjects</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>Mathematics</li>
              <li>Physical Sciences</li>
              <li>Grade 8–10</li>
              <li>Grade 11–12 & Matric</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li><Link to="/contact" className="hover:text-foreground transition-colors">Contact Us</Link></li>
              <li>support@thutoai.co.za</li>
              <li className="text-xs pt-1">Mon–Fri, 8am–5pm SAST</li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Thuto AI. All rights reserved.</p>
          <div className="flex gap-6">
            <span className="hover:text-foreground cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-foreground cursor-pointer transition-colors">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
