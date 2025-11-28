import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Construction, Rocket } from "lucide-react";

interface RoadmapItem {
  title: string;
  description: string;
  status: 'live' | 'beta' | 'coming';
}

const roadmapItems: RoadmapItem[] = [
  // LIVE FEATURES
  {
    title: "Screening Avanzato",
    description: "Valutazione completa con quiz tecnico esercizi",
    status: "live"
  },
  {
    title: "Programmi Personalizzati",
    description: "Piani allenamento basati su 1RM e progressione scientifica",
    status: "live"
  },
  {
    title: "ADAPTFLOW™",
    description: "Adattamento automatico esercizi per location e attrezzatura",
    status: "live"
  },
  {
    title: "Tracking Completo",
    description: "Registrazione workout con gestione zone doloranti",
    status: "live"
  },
  {
    title: "Body Part Targeting",
    description: "Isolamento muscoli specifici per toning/ipertrofia",
    status: "live"
  },
  
  // BETA FEATURES
  {
    title: "Supporto Gravidanza",
    description: "Programmi trimestre-specifici con safety rules (richiede validazione medica)",
    status: "beta"
  },
  {
    title: "Supporto Disabilità",
    description: "Adattamenti esercizi per condizioni motorie (richiede validazione fisioterapica)",
    status: "beta"
  },
  
  // COMING SOON
  {
    title: "Deload Cycles",
    description: "Settimane scarico automatico con riduzione volume/intensità",
    status: "coming"
  },
  {
    title: "End-Cycle Testing",
    description: "Retest 1RM al termine ciclo con auto-recalibrazione",
    status: "coming"
  },
  {
    title: "AI Form Corrections",
    description: "Analisi video tecnica esercizi con feedback AI",
    status: "coming"
  },
  {
    title: "Stripe/PayPal Payments",
    description: "Sistema pagamento completo per subscription",
    status: "coming"
  },
  {
    title: "Video Library",
    description: "Tutorial video per ogni esercizio",
    status: "coming"
  },
  {
    title: "Community Hub",
    description: "Condivisione progressi e competizioni amichevoli",
    status: "coming"
  },
  {
    title: "Advanced Analytics",
    description: "Dashboard analytics con insights predittivi",
    status: "coming"
  },
];

const statusConfig = {
  live: {
    label: "Live",
    icon: Check,
    color: "bg-emerald-600",
    textColor: "text-emerald-600"
  },
  beta: {
    label: "Beta",
    icon: Construction,
    color: "bg-amber-600",
    textColor: "text-amber-600"
  },
  coming: {
    label: "In Arrivo",
    icon: Rocket,
    color: "bg-blue-600",
    textColor: "text-blue-600"
  }
};

export default function Roadmap() {
  const liveItems = roadmapItems.filter(item => item.status === 'live');
  const betaItems = roadmapItems.filter(item => item.status === 'beta');
  const comingItems = roadmapItems.filter(item => item.status === 'coming');

  return (
    <div className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl mb-4 text-foreground">
            Roadmap <span className="text-primary">TrainSmart</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Trasparenza totale su cosa è live, in test e in arrivo
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* LIVE */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-emerald-600/20 flex items-center justify-center">
                <Check className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-bold text-xl">Live</h3>
                <p className="text-sm text-muted-foreground">Disponibile ora</p>
              </div>
            </div>
            {liveItems.map((item, idx) => (
              <Card key={idx} className="border-emerald-600/30" data-testid={`card-roadmap-live-${idx}`}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-start gap-2 justify-between">
                    <span>{item.title}</span>
                    <Badge className="bg-emerald-600 text-xs shrink-0">Live</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm">{item.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* BETA */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-amber-600/20 flex items-center justify-center">
                <Construction className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-bold text-xl">Beta</h3>
                <p className="text-sm text-muted-foreground">In fase test</p>
              </div>
            </div>
            {betaItems.map((item, idx) => (
              <Card key={idx} className="border-amber-600/30" data-testid={`card-roadmap-beta-${idx}`}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-start gap-2 justify-between">
                    <span>{item.title}</span>
                    <Badge className="bg-amber-600 text-xs shrink-0">Beta</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm">{item.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* COMING SOON */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-blue-600/20 flex items-center justify-center">
                <Rocket className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-xl">In Arrivo</h3>
                <p className="text-sm text-muted-foreground">Prossimamente</p>
              </div>
            </div>
            {comingItems.map((item, idx) => (
              <Card key={idx} className="border-blue-600/30" data-testid={`card-roadmap-coming-${idx}`}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-start gap-2 justify-between">
                    <span>{item.title}</span>
                    <Badge className="bg-blue-600 text-xs shrink-0">Q2 2026</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm">{item.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            💡 La roadmap viene aggiornata mensilmente in base al feedback della community
          </p>
        </div>
      </div>
    </div>
  );
}
