/**
 * In-App Purchase Service
 * 
 * Gestisce acquisti in-app per iOS App Store.
 * Usa questo modulo SOLO per la versione iOS se decidi di usare IAP invece di Stripe.
 * 
 * Setup richiesto:
 * 1. npm install @capacitor-community/in-app-purchases
 * 2. npx cap sync ios
 * 3. Configura prodotti su App Store Connect
 */

import { Capacitor } from '@capacitor/core';

// Product IDs - devono corrispondere a quelli su App Store Connect
export const IAP_PRODUCTS = {
  base: 'trainsmart.subscription.base',
  pro: 'trainsmart.subscription.pro',
  premium: 'trainsmart.subscription.premium'
} as const;

export type IAPProductId = typeof IAP_PRODUCTS[keyof typeof IAP_PRODUCTS];

interface IAPProduct {
  productId: string;
  title: string;
  description: string;
  price: string;
  priceAsNumber: number;
  currency: string;
}

interface IAPTransaction {
  transactionId: string;
  productId: string;
  receipt: string;
}

// Lazy import per evitare errori su web/Android
let InAppPurchases: any = null;

async function getIAPPlugin() {
  if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'ios') {
    throw new Error('In-App Purchases are only available on iOS');
  }
  
  if (!InAppPurchases) {
    const module = await import('@capacitor-community/in-app-purchases');
    InAppPurchases = module.InAppPurchases;
  }
  
  return InAppPurchases;
}

/**
 * Inizializza il sistema IAP
 * Chiamare all'avvio dell'app
 */
export async function initIAP(): Promise<void> {
  try {
    const IAP = await getIAPPlugin();
    await IAP.initialize();
    console.log('[IAP] Initialized');
  } catch (error) {
    console.error('[IAP] Init error:', error);
    throw error;
  }
}

/**
 * Carica i prodotti disponibili da App Store Connect
 */
export async function loadProducts(): Promise<IAPProduct[]> {
  try {
    const IAP = await getIAPPlugin();
    
    const productIds = Object.values(IAP_PRODUCTS);
    const { products } = await IAP.getProducts({ productIds });
    
    console.log('[IAP] Products loaded:', products);
    
    return products.map((p: any) => ({
      productId: p.productId,
      title: p.title,
      description: p.description,
      price: p.price,
      priceAsNumber: p.priceAsNumber,
      currency: p.currency
    }));
  } catch (error) {
    console.error('[IAP] Load products error:', error);
    throw error;
  }
}

/**
 * Avvia l'acquisto di un prodotto
 */
export async function purchaseProduct(productId: IAPProductId): Promise<IAPTransaction> {
  try {
    const IAP = await getIAPPlugin();
    
    console.log('[IAP] Starting purchase:', productId);
    
    const { transaction } = await IAP.purchaseProduct({ productId });
    
    console.log('[IAP] Purchase successful:', transaction);
    
    return {
      transactionId: transaction.transactionId,
      productId: transaction.productId,
      receipt: transaction.receipt
    };
  } catch (error: any) {
    console.error('[IAP] Purchase error:', error);
    
    // Gestisci errori specifici
    if (error.code === 'E_USER_CANCELLED') {
      throw new Error('Acquisto annullato');
    }
    if (error.code === 'E_ALREADY_OWNED') {
      throw new Error('Hai già questo abbonamento');
    }
    
    throw error;
  }
}

/**
 * Verifica il receipt con il backend
 * IMPORTANTE: La verifica deve avvenire sul server!
 */
export async function verifyReceipt(receipt: string, productId: string): Promise<{
  valid: boolean;
  expiresAt?: Date;
  tier?: string;
}> {
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    const response = await fetch(`${supabaseUrl}/functions/v1/verify-iap-receipt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`
      },
      body: JSON.stringify({
        receipt,
        productId,
        platform: 'ios'
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Receipt verification failed');
    }
    
    return await response.json();
  } catch (error) {
    console.error('[IAP] Verify receipt error:', error);
    throw error;
  }
}

/**
 * Ripristina acquisti precedenti
 */
export async function restorePurchases(): Promise<IAPTransaction[]> {
  try {
    const IAP = await getIAPPlugin();
    
    console.log('[IAP] Restoring purchases...');
    
    const { transactions } = await IAP.restorePurchases();
    
    console.log('[IAP] Restored:', transactions);
    
    return transactions.map((t: any) => ({
      transactionId: t.transactionId,
      productId: t.productId,
      receipt: t.receipt
    }));
  } catch (error) {
    console.error('[IAP] Restore error:', error);
    throw error;
  }
}

/**
 * Finalizza una transazione
 * IMPORTANTE: Chiamare dopo aver verificato il receipt sul server!
 */
export async function finishTransaction(transactionId: string): Promise<void> {
  try {
    const IAP = await getIAPPlugin();
    await IAP.finishTransaction({ transactionId });
    console.log('[IAP] Transaction finished:', transactionId);
  } catch (error) {
    console.error('[IAP] Finish transaction error:', error);
    throw error;
  }
}

/**
 * Listener per transazioni in sospeso
 */
export function addTransactionListener(callback: (transaction: IAPTransaction) => void): () => void {
  let listener: any = null;
  
  getIAPPlugin().then((IAP) => {
    listener = IAP.addListener('transactionUpdated', (data: any) => {
      if (data.transaction) {
        callback({
          transactionId: data.transaction.transactionId,
          productId: data.transaction.productId,
          receipt: data.transaction.receipt
        });
      }
    });
  });
  
  return () => {
    if (listener) {
      listener.remove();
    }
  };
}

/**
 * Hook React per gestire IAP
 */
export function useIAP() {
  // Implementazione base - espandere secondo necessità
  return {
    isAvailable: Capacitor.getPlatform() === 'ios',
    products: IAP_PRODUCTS
  };
}

/*
 * =====================================================
 * EDGE FUNCTION PER VERIFICA RECEIPT (Supabase)
 * =====================================================
 * 
 * Crea questo file in: supabase/functions/verify-iap-receipt/index.ts
 * 
 * ```typescript
 * import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
 * import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
 * 
 * const APPLE_VERIFY_URL = 'https://buy.itunes.apple.com/verifyReceipt'
 * const APPLE_SANDBOX_URL = 'https://sandbox.itunes.apple.com/verifyReceipt'
 * 
 * serve(async (req) => {
 *   const { receipt, productId, userId } = await req.json()
 *   
 *   // Shared secret from App Store Connect
 *   const sharedSecret = Deno.env.get('APPLE_SHARED_SECRET')
 *   
 *   // Try production first
 *   let response = await fetch(APPLE_VERIFY_URL, {
 *     method: 'POST',
 *     body: JSON.stringify({
 *       'receipt-data': receipt,
 *       'password': sharedSecret,
 *       'exclude-old-transactions': true
 *     })
 *   })
 *   
 *   let data = await response.json()
 *   
 *   // If sandbox receipt, retry with sandbox URL
 *   if (data.status === 21007) {
 *     response = await fetch(APPLE_SANDBOX_URL, {
 *       method: 'POST',
 *       body: JSON.stringify({
 *         'receipt-data': receipt,
 *         'password': sharedSecret,
 *         'exclude-old-transactions': true
 *       })
 *     })
 *     data = await response.json()
 *   }
 *   
 *   if (data.status !== 0) {
 *     return new Response(JSON.stringify({ valid: false, error: 'Invalid receipt' }), {
 *       status: 400
 *     })
 *   }
 *   
 *   // Find the latest transaction for this product
 *   const latestInfo = data.latest_receipt_info?.find(
 *     (t: any) => t.product_id === productId
 *   )
 *   
 *   if (!latestInfo) {
 *     return new Response(JSON.stringify({ valid: false, error: 'Product not found' }), {
 *       status: 400
 *     })
 *   }
 *   
 *   const expiresAt = new Date(parseInt(latestInfo.expires_date_ms))
 *   const isActive = expiresAt > new Date()
 *   
 *   // Map product to tier
 *   const tierMap: Record<string, string> = {
 *     'trainsmart.subscription.base': 'base',
 *     'trainsmart.subscription.pro': 'pro',
 *     'trainsmart.subscription.premium': 'premium'
 *   }
 *   
 *   const tier = tierMap[productId] || 'free'
 *   
 *   // Update user subscription in database
 *   if (userId && isActive) {
 *     const supabase = createClient(
 *       Deno.env.get('SUPABASE_URL')!,
 *       Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
 *     )
 *     
 *     await supabase.from('users').update({
 *       subscription_tier: tier,
 *       subscription_expires_at: expiresAt.toISOString(),
 *       subscription_platform: 'ios',
 *       apple_original_transaction_id: latestInfo.original_transaction_id
 *     }).eq('id', userId)
 *   }
 *   
 *   return new Response(JSON.stringify({
 *     valid: isActive,
 *     tier,
 *     expiresAt: expiresAt.toISOString()
 *   }))
 * })
 * ```
 */
