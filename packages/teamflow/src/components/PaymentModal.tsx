import { useState } from "react";
import { X, CreditCard, Loader2, Check, Crown, Sparkles, Zap } from "lucide-react";
import type { SubscriptionTier } from "@shared/pricingUtils";
import { getPlan } from "@shared/pricingUtils";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  tier: SubscriptionTier;
}

export default function PaymentModal({ isOpen, onClose, onSuccess, tier }: PaymentModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<"stripe" | "paypal" | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const plan = getPlan(tier);

  if (!isOpen) return null;

  const handleStripeCheckout = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/payment/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      });

      if (!res.ok) throw new Error("Failed to create checkout session");

      const { url } = await res.json();

      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (err) {
      setError("Errore nella creazione del pagamento. Riprova.");
      setLoading(false);
    }
  };

  const handlePayPalCheckout = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/payment/paypal/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      });

      if (!res.ok) throw new Error("Failed to create PayPal order");

      const { approvalUrl } = await res.json();

      // Redirect to PayPal
      window.location.href = approvalUrl;
    } catch (err) {
      setError("Errore nella creazione del pagamento PayPal. Riprova.");
      setLoading(false);
    }
  };

  const handlePayment = () => {
    if (selectedMethod === "stripe") {
      handleStripeCheckout();
    } else if (selectedMethod === "paypal") {
      handlePayPalCheckout();
    }
  };

  const tierIcon = {
    base: Crown,
    premium: Sparkles,
    elite: Zap,
  }[tier];

  const TierIcon = tierIcon;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto my-8 relative border">
        <div className="p-6 pb-8">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground z-10"
            data-testid="button-close-payment"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
              <TierIcon className="w-8 h-8 text-primary-foreground" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Abbonamento {plan.name}</h2>
            <p className="text-muted-foreground text-sm">
              {plan.description}
            </p>
          </div>

          {/* Features */}
          <div className="bg-muted/50 rounded-xl p-4 mb-6">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Check className="w-5 h-5 text-chart-3" />
              Cosa ottieni
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {plan.features.slice(0, 5).map((feature, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-chart-3 flex-shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Price */}
          <div className="text-center mb-6">
            <p className="text-4xl font-bold mb-1">€{plan.basePrice.toFixed(2)}</p>
            <p className="text-muted-foreground text-sm">
              /mese
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Primi 6 mesi: €{plan.basePrice.toFixed(2)}/mese, poi €{plan.increasedPrice.toFixed(2)}/mese
            </p>
          </div>

          {/* Payment Methods */}
          <div className="space-y-3 mb-6">
            <button
              onClick={() => setSelectedMethod("stripe")}
              className={`w-full p-4 rounded-xl border-2 transition-all hover-elevate ${
                selectedMethod === "stripe"
                  ? "border-primary bg-primary/10"
                  : "border-border"
              }`}
              data-testid="button-payment-stripe"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-primary-foreground" />
                </div>
                <div className="text-left flex-1">
                  <p className="font-semibold">Carta di Credito/Debito</p>
                  <p className="text-xs text-muted-foreground">
                    Pagamento sicuro con Stripe
                  </p>
                </div>
                {selectedMethod === "stripe" && (
                  <Check className="w-5 h-5 text-chart-3" />
                )}
              </div>
            </button>

            <button
              onClick={() => setSelectedMethod("paypal")}
              className={`w-full p-4 rounded-xl border-2 transition-all hover-elevate ${
                selectedMethod === "paypal"
                  ? "border-primary bg-primary/10"
                  : "border-border"
              }`}
              data-testid="button-payment-paypal"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#0070ba] rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-white"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 2.84a.77.77 0 0 1 .759-.64h8.936c2.886 0 4.935 2.092 4.535 4.633-.485 3.087-2.837 5.184-5.723 5.184h-3.51a.77.77 0 0 0-.758.64l-1.107 7.04z" />
                  </svg>
                </div>
                <div className="text-left flex-1">
                  <p className="font-semibold">PayPal</p>
                  <p className="text-xs text-muted-foreground">
                    Pagamento rapido e sicuro
                  </p>
                </div>
                {selectedMethod === "paypal" && (
                  <Check className="w-5 h-5 text-chart-3" />
                )}
              </div>
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 mb-4 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Checkout Button */}
          <button
            onClick={handlePayment}
            disabled={!selectedMethod || loading}
            className="w-full py-4 bg-primary hover:bg-primary/90 disabled:bg-muted disabled:cursor-not-allowed rounded-xl font-semibold text-lg transition-colors flex items-center justify-center gap-2 text-primary-foreground"
            data-testid="button-proceed-payment"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Reindirizzamento...
              </>
            ) : (
              <>
                <TierIcon className="w-5 h-5" />
                Procedi al Pagamento
              </>
            )}
          </button>

          {/* Security Note */}
          <p className="text-center text-xs text-muted-foreground mt-4">
            🔒 Pagamenti sicuri • Nessun dato salvato sui nostri server
          </p>
        </div>
      </div>
    </div>
  );
}
