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
    <footer className="border-t bg-muted/30 py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-hero rounded-xl flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-xl">Thuto AI</span>
            </Link>
            <p className="text-muted-foreground text-sm">
              Empowering South African learners with AI-powered tutoring for Maths and Science.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Platform</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/how-it-works" className="hover:text-foreground transition-colors">How It Works</Link></li>
              <li><Link to="/pricing" className="hover:text-foreground transition-colors">Pricing</Link></li>
              <li><Link to="/auth" className="hover:text-foreground transition-colors">Login</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Subjects</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Mathematics</li>
              <li>Physical Sciences</li>
              <li>Grades 8-12</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/contact" className="hover:text-foreground transition-colors">Contact Us</Link></li>
              <li>support@thutoai.co.za</li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-12 pt-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Thuto AI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
