import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Lock, Sparkles } from "lucide-react";
import { PRICING_PLANS, getCurrentPrice, type SubscriptionTier } from "@shared/pricingUtils";
import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/types";
import PaymentModal from "./PaymentModal";

export default function Pricing() {
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier | null>(null);
  
  const { data: user } = useQuery<User>({
    queryKey: ['/api/auth/user'],
  });

  const handleSubscribe = (tier: SubscriptionTier) => {
    setSelectedTier(tier);
  };

  return (
    <div className="py-24 bg-card">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl mb-4 text-foreground">
            Scegli il tuo <span className="text-primary">piano</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-2">
            Allenamento personalizzato basato sulla scienza
          </p>
          <p className="text-sm text-muted-foreground">
            Prezzi bloccati per i primi 6 mesi, poi +€10/mese
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {PRICING_PLANS.map((plan) => {
            const isCurrentTier = user?.subscriptionTier === plan.tier;
            const currentPrice = getCurrentPrice(
              plan.tier, 
              user?.subscriptionStartDate ? new Date(user.subscriptionStartDate) : null
            );
            const isHighlighted = plan.tier === 'premium';
            
            return (
              <Card 
                key={plan.tier} 
                className={`relative flex flex-col ${isHighlighted ? 'border-primary shadow-lg scale-105' : ''}`}
                data-testid={`card-plan-${plan.tier}`}
              >
                {isHighlighted && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-chart-2">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Più Popolare
                  </Badge>
                )}
                
                {isCurrentTier && (
                  <Badge className="absolute -top-3 right-4 bg-chart-3">
                    Piano Attuale
                  </Badge>
                )}
                
                <CardHeader>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription className="text-base">{plan.description}</CardDescription>
                  <div className="pt-4">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold">€{currentPrice.toFixed(2)}</span>
                      <span className="text-muted-foreground">/mese</span>
                    </div>
                    {currentPrice === plan.basePrice ? (
                      <p className="text-xs text-muted-foreground mt-1">
                        Primi 6 mesi, poi €{plan.increasedPrice.toFixed(2)}/mese
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground mt-1">
                        Prezzo aumentato dopo 6 mesi
                      </p>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4 flex-1">
                  <div className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-chart-3 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                    {plan.lockedFeatures && plan.lockedFeatures.length > 0 && plan.lockedFeatures.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3 opacity-50">
                        <Lock className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
                
                <CardFooter>
                  <Button 
                    className="w-full" 
                    variant={isHighlighted ? "default" : "outline"}
                    size="lg"
                    onClick={() => handleSubscribe(plan.tier)}
                    disabled={isCurrentTier}
                    data-testid={`button-subscribe-${plan.tier}`}
                  >
                    {isCurrentTier ? 'Piano Attuale' : `Abbonati a ${plan.name}`}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
        
        <div className="mt-12 text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Pagamenti sicuri con Stripe e PayPal 🔒
          </p>
          <p className="text-xs text-muted-foreground">
            Dopo 6 mesi dall'abbonamento, il prezzo aumenta automaticamente di €10/mese
          </p>
        </div>
      </div>

      {selectedTier && (
        <PaymentModal
          isOpen={!!selectedTier}
          onClose={() => setSelectedTier(null)}
          tier={selectedTier}
          onSuccess={() => {
            setSelectedTier(null);
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}
