# Stripe Payment Integration Setup

Questa guida spiega come configurare Stripe per i pagamenti in FitnessFlow.

## Overview

- **Modello**: One-time payments (no subscriptions auto-renewing)
- **Piani**: BASE (€19.90), PRO (€29.90), PREMIUM (€44.90)
- **Durata**: 6 settimane per acquisto
- **Metodi**: Carte di credito/debito (+ PayPal opzionale)

## Step 1: Crea Account Stripe

1. Vai su [stripe.com](https://stripe.com) e crea un account
2. Completa la verifica business (richiede P.IVA italiana)
3. Vai su **Dashboard > Developers > API keys**

## Step 2: Ottieni API Keys

### Test Mode (Sviluppo)
```
Publishable key: pk_test_...
Secret key: sk_test_...
```

### Live Mode (Produzione)
```
Publishable key: pk_live_...
Secret key: sk_live_...
```

## Step 3: Crea i Prodotti

1. Vai su **Stripe Dashboard > Products**
2. Crea 3 prodotti:

### BASE Plan
- Name: `FitnessFlow BASE`
- Price: `€19.90` (one-time)
- Description: `Programma completo 6 settimane`
- Copia il **Price ID** (es: `price_1ABC...`)

### PRO Plan
- Name: `FitnessFlow PRO`
- Price: `€29.90` (one-time)
- Description: `6 settimane + 12 video correzioni AI`
- Copia il **Price ID**

### PREMIUM Plan
- Name: `FitnessFlow PREMIUM`
- Price: `€44.90` (one-time)
- Description: `6 settimane + video illimitati + PDF export`
- Copia il **Price ID**

## Step 4: Configura Environment Variables

### Frontend (.env)
```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
VITE_STRIPE_PRICE_BASE=price_xxx
VITE_STRIPE_PRICE_PRO=price_xxx
VITE_STRIPE_PRICE_PREMIUM=price_xxx
```

### Supabase Edge Functions (Secrets)
In Supabase Dashboard > Edge Functions > Secrets:
```
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PRICE_BASE=price_xxx
STRIPE_PRICE_PRO=price_xxx
STRIPE_PRICE_PREMIUM=price_xxx
```

## Step 5: Deploy Edge Functions

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref YOUR_PROJECT_REF

# Deploy functions
supabase functions deploy create-checkout-session
supabase functions deploy stripe-webhook
supabase functions deploy get-subscription-status
```

## Step 6: Configura Webhook

1. Vai su **Stripe Dashboard > Developers > Webhooks**
2. Add endpoint:
   - URL: `https://YOUR_PROJECT.supabase.co/functions/v1/stripe-webhook`
   - Events:
     - `checkout.session.completed`
     - `payment_intent.payment_failed`
3. Copia il **Signing secret** (whsec_xxx)
4. Aggiungi ai secrets Supabase

## Step 7: Database Migration

Esegui in Supabase SQL Editor:
```sql
-- File: supabase/migrations/002_subscriptions.sql
-- Copia e incolla il contenuto del file
```

## Step 8: Test

1. Usa le [Stripe test cards](https://stripe.com/docs/testing):
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`
   - 3D Secure: `4000 0027 6000 3184`

2. Verifica:
   - [ ] Checkout si apre correttamente
   - [ ] Pagamento test funziona
   - [ ] Webhook ricevuto
   - [ ] Subscription salvata in DB
   - [ ] PaymentSuccess page mostra piano attivo

## Costi Stripe (Italia)

| Tipo | Fee |
|------|-----|
| Carte EU | 1.5% + €0.25 |
| Carte non-EU | 2.9% + €0.25 |
| PayPal (se abilitato) | 3.4% + €0.35 |

### Esempio calcolo:
- PRO €29.90 con carta EU
- Fee: €0.70 (2.34%)
- Netto: €29.20

## PayPal (Opzionale)

Per abilitare PayPal come metodo di pagamento:

1. Vai su **Stripe Dashboard > Settings > Payment methods**
2. Abilita PayPal
3. Collega account PayPal business
4. Nel checkout session, aggiungi:
```typescript
payment_method_types: ['card', 'paypal']
```

## Troubleshooting

### Webhook non ricevuto
- Verifica URL corretto
- Controlla logs Edge Function in Supabase
- Verifica signing secret corretto

### Errore "Invalid price"
- Verifica Price ID corretto in .env
- Price deve essere one-time, non recurring

### Pagamento fallito
- Controlla logs in Stripe Dashboard > Payments
- Verifica customer email valida

## Security Checklist

- [ ] Secret key MAI esposta nel frontend
- [ ] Webhook signature sempre verificata
- [ ] HTTPS in produzione
- [ ] Price IDs hardcoded (non da input utente)
- [ ] RLS attivo su tabella subscriptions
