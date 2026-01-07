import { Button } from "@/components/ui/button";
import { Zap, Menu } from "lucide-react";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <Zap className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="font-display text-xl text-foreground">TrainSmart</span>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <a href="#features" className="text-sm font-medium hover:text-primary transition-colors">
            Funzionalità
          </a>
          <Link to="/pricing" className="text-sm font-medium hover:text-primary transition-colors">
            Prezzi
          </Link>
          <a href="#about" className="text-sm font-medium hover:text-primary transition-colors">
            Chi Siamo
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <Button 
            onClick={() => window.location.href = "/api/login"}
            data-testid="button-login"
          >
            Accedi / Registrati
          </Button>
          
          <Button variant="ghost" size="icon" className="md:hidden" data-testid="button-menu">
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
