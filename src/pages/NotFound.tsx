import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GraduationCap, Home, ArrowLeft, Search } from "lucide-react";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      {/* Minimal header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 h-16 flex items-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-hero rounded-xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl">Thuto AI</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          {/* Big 404 */}
          <div className="relative mb-8">
            <span className="text-[10rem] font-display font-bold leading-none text-gradient-hero opacity-20 select-none">
              404
            </span>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 bg-gradient-hero rounded-2xl flex items-center justify-center animate-float shadow-glow-coral">
                <Search className="w-10 h-10 text-primary-foreground" />
              </div>
            </div>
          </div>

          <h1 className="font-display text-3xl font-bold mb-3">Page Not Found</h1>
          <p className="text-muted-foreground text-lg mb-8">
            Eish! Looks like this page doesn't exist. Let's get you back on track.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="hero" size="lg" asChild>
              <Link to="/">
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Link>
            </Button>
            <Button variant="outline" size="lg" onClick={() => window.history.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NotFound;
