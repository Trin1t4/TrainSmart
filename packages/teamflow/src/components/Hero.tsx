import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";

export default function Hero() {
  return (
    <div className="min-h-screen bg-background flex items-center">
      <div className="max-w-7xl mx-auto px-4 py-16 w-full">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Allenamento Basato sulla Scienza</span>
            </div>
            
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl leading-tight text-foreground">
              Allenati con <span className="text-primary">Intelligenza</span>
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-lg">
              Programmi personalizzati basati sui tuoi dati, progressione scientifica e tracciamento dettagliato per raggiungere i tuoi obiettivi fitness.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Button 
                size="lg" 
                className="text-base"
                asChild
                data-testid="button-start"
              >
                <a href="/api/login">
                  Inizia Ora
                </a>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="text-base"
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                data-testid="button-learn-more"
              >
                Scopri di più
              </Button>
            </div>            
            <div className="flex items-center gap-8 pt-4">
              <div>
                <div className="text-3xl font-bold text-primary">500+</div>
                <div className="text-sm text-muted-foreground">Atleti attivi</div>
              </div>
              <div className="h-12 w-px bg-border" />
              <div>
                <div className="text-3xl font-bold text-primary">10K+</div>
                <div className="text-sm text-muted-foreground">Workout completati</div>
              </div>
            </div>
          </div>
          
          <div className="relative hidden md:block">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-chart-2/20 rounded-3xl blur-3xl" />
            <div className="relative bg-gradient-to-br from-card to-card/50 backdrop-blur-sm rounded-3xl p-12 border border-card-border">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                    <Zap className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">TrainSmart</div>
                    <div className="text-sm text-muted-foreground">Il tuo coach personale</div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-background/50 rounded-lg border border-border">
                    <span className="text-sm">Progressione Forza</span>
                    <span className="text-lg font-bold text-chart-3">+12%</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-background/50 rounded-lg border border-border">
                    <span className="text-sm">Volume Settimanale</span>
                    <span className="text-lg font-bold text-chart-1">8.5T</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-background/50 rounded-lg border border-border">
                    <span className="text-sm">Serie Completate</span>
                    <span className="text-lg font-bold text-chart-4">156</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
