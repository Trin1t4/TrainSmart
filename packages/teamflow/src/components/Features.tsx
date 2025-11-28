import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, TrendingUp, Shield, Target, BarChart3, Zap, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const features = [
  {
    icon: Sparkles,
    title: "ADAPTFLOW™",
    description: "Sistema intelligente che adatta automaticamente il tuo piano in base a dolori, situazioni e progressi",
    highlight: true
  },
  {
    icon: Brain,
    title: "Quiz Tecnico",
    description: "Quiz iniziale per stabilire il tuo livello di conoscenza degli esercizi"
  },
  {
    icon: Target,
    title: "Programmi Personalizzati",
    description: "Schede basate sul tuo livello, frequenza e obiettivi specifici"
  },
  {
    icon: TrendingUp,
    title: "Progressione Scientifica",
    description: "Calcolo automatico dei pesi usando formule validate scientificamente"
  },
  {
    icon: BarChart3,
    title: "Tracciamento Dettagliato",
    description: "Monitora ogni serie, ripetizione e kg sollevato nel tempo"
  },
  {
    icon: Shield,
    title: "Gestione Infortuni",
    description: "Esercizi alternativi sicuri in base alle tue zone doloranti"
  }
];

export default function Features() {
  return (
    <div className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl mb-4 text-foreground">
            Tutto ciò che ti serve per <span className="text-primary">crescere</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Sistema completo di allenamento che si adatta al tuo livello e ai tuoi obiettivi
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className={`hover-elevate ${feature.highlight ? 'border-primary shadow-lg' : ''}`} 
              data-testid={`card-feature-${index}`}
            >
              <CardHeader>
                {feature.highlight && (
                  <Badge className="w-fit mb-2 bg-chart-2">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Tecnologia Esclusiva
                  </Badge>
                )}
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
                <CardDescription className="text-base">{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
