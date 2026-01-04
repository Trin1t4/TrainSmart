/**
 * ============================================================================
 * GDPR COMPLIANCE SERVICE - TrainSmart
 * ============================================================================
 *
 * Gestione completa della privacy secondo GDPR (EU) e normativa italiana.
 * Include:
 * - Consensi granulari (standard + dati sanitari)
 * - Data retention e cancellazione automatica
 * - Export dati (diritto portabilità)
 * - Verifica età minima
 * - Audit trail consensi
 * - Anonimizzazione dati
 *
 * @version 1.0.0
 * @author TrainSmart Team
 */

import type { SupabaseClient } from '@supabase/supabase-js';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Tipi di consenso richiesti
 * - I consensi "required" bloccano la registrazione se non accettati
 * - I consensi "optional" possono essere rifiutati
 */
export interface ConsentTypes {
  // OBBLIGATORI
  privacy_policy: boolean;           // Accettazione privacy policy
  terms_of_service: boolean;         // Accettazione ToS
  data_processing: boolean;          // Trattamento dati personali base

  // OBBLIGATORIO SE USIAMO DATI SANITARI (Art. 9 GDPR)
  health_data_processing: boolean;   // Trattamento dati relativi alla salute

  // OPZIONALI
  marketing_emails: boolean;         // Email promozionali
  analytics_tracking: boolean;       // Analytics e tracking comportamentale
  third_party_sharing: boolean;      // Condivisione con terze parti (es. integrazioni)
  research_participation: boolean;   // Uso dati per ricerca/miglioramento algoritmi
}

/**
 * Record di un singolo consenso con audit trail
 */
export interface ConsentRecord {
  consent_type: keyof ConsentTypes;
  granted: boolean;
  granted_at: string | null;        // ISO timestamp quando concesso
  revoked_at: string | null;        // ISO timestamp quando revocato
  ip_address?: string;              // IP per audit (opzionale)
  user_agent?: string;              // Browser/device per audit
  version: string;                  // Versione del documento accettato
}

/**
 * Profilo consensi completo dell'utente
 */
export interface UserConsentProfile {
  user_id: string;
  consents: ConsentRecord[];
  age_verified: boolean;
  age_verification_date: string | null;
  date_of_birth?: string;           // Solo se necessario per verifica
  country: string;                  // Per determinare età minima
  created_at: string;
  updated_at: string;
}

/**
 * Configurazione data retention per tipo di dato
 */
export interface RetentionPolicy {
  data_type: string;
  retention_days: number;
  anonymize_instead_of_delete: boolean;
  legal_basis: string;
}

/**
 * Risultato export dati utente
 */
export interface UserDataExport {
  export_id: string;
  user_id: string;
  requested_at: string;
  completed_at: string | null;
  download_url: string | null;
  expires_at: string | null;
  status: 'pending' | 'processing' | 'ready' | 'expired' | 'failed';
  format: 'json' | 'csv' | 'pdf';
  includes: string[];               // Lista tabelle/dati inclusi
}

/**
 * Richiesta di cancellazione account
 */
export interface DeletionRequest {
  request_id: string;
  user_id: string;
  requested_at: string;
  scheduled_deletion_at: string;    // +30 giorni per cooling off
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  reason?: string;
  confirmed_at?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Età minima per paese (GDPR Art. 8)
 * Default UE: 16 anni, ma gli stati possono abbassare fino a 13
 */
export const MINIMUM_AGE_BY_COUNTRY: Record<string, number> = {
  // Paesi con 13 anni
  'BE': 13, 'DK': 13, 'EE': 13, 'FI': 13, 'LV': 13, 'MT': 13, 'PT': 13, 'SE': 13, 'UK': 13,

  // Paesi con 14 anni
  'AT': 14, 'BG': 14, 'CY': 14, 'ES': 14, 'IT': 14, 'LT': 14,

  // Paesi con 15 anni
  'CZ': 15, 'FR': 15, 'GR': 15, 'SI': 15,

  // Paesi con 16 anni (default GDPR)
  'DE': 16, 'HR': 16, 'HU': 16, 'IE': 16, 'LU': 16, 'NL': 16, 'PL': 16, 'RO': 16, 'SK': 16,

  // Extra-UE (riferimento)
  'US': 13, 'CA': 13, 'AU': 13, 'CH': 13,

  // Default
  'DEFAULT': 16
};

/**
 * Policy di retention dati
 * Basata su principio di minimizzazione (Art. 5 GDPR)
 */
export const DATA_RETENTION_POLICIES: RetentionPolicy[] = [
  {
    data_type: 'workout_sessions',
    retention_days: 730,  // 2 anni - necessario per tracking progressi
    anonymize_instead_of_delete: true,
    legal_basis: 'Esecuzione contratto + interesse legittimo per storico'
  },
  {
    data_type: 'pain_reports',
    retention_days: 365,  // 1 anno - dati sanitari, minimizzare
    anonymize_instead_of_delete: false,  // Cancellare, non anonimizzare
    legal_basis: 'Consenso esplicito Art. 9(2)(a)'
  },
  {
    data_type: 'body_measurements',
    retention_days: 365,  // 1 anno
    anonymize_instead_of_delete: false,
    legal_basis: 'Consenso esplicito Art. 9(2)(a)'
  },
  {
    data_type: 'menstrual_cycle',
    retention_days: 180,  // 6 mesi - dato molto sensibile
    anonymize_instead_of_delete: false,
    legal_basis: 'Consenso esplicito Art. 9(2)(a)'
  },
  {
    data_type: 'injury_history',
    retention_days: 730,  // 2 anni - necessario per sicurezza esercizi
    anonymize_instead_of_delete: false,
    legal_basis: 'Consenso esplicito Art. 9(2)(a)'
  },
  {
    data_type: 'consent_records',
    retention_days: 1825, // 5 anni - obbligo legale dimostrare consenso
    anonymize_instead_of_delete: false,
    legal_basis: 'Obbligo legale Art. 6(1)(c)'
  },
  {
    data_type: 'login_logs',
    retention_days: 90,   // 3 mesi - sicurezza
    anonymize_instead_of_delete: true,
    legal_basis: 'Interesse legittimo sicurezza Art. 6(1)(f)'
  },
  {
    data_type: 'analytics_events',
    retention_days: 365,  // 1 anno
    anonymize_instead_of_delete: true,
    legal_basis: 'Consenso Art. 6(1)(a)'
  }
];

/**
 * Versioni correnti dei documenti legali
 * Aggiornare quando si modificano i documenti
 */
export const LEGAL_DOCUMENT_VERSIONS = {
  privacy_policy: '1.0.0',
  terms_of_service: '1.0.0',
  cookie_policy: '1.0.0',
  health_data_consent: '1.0.0'
};

/**
 * Dati considerati "sanitari" secondo Art. 9 GDPR
 */
export const HEALTH_DATA_FIELDS = [
  'pain_areas',
  'pain_intensity',
  'injury_history',
  'menstrual_cycle',
  'body_fat_percentage',
  'medical_conditions',
  'physical_limitations',
  'disability_type',
  'pregnancy_status',
  'medications'
] as const;

// ============================================================================
// SUPABASE CLIENT (Dependency Injection)
// ============================================================================

let supabase: SupabaseClient | null = null;

export function initGDPRService(client: SupabaseClient): void {
  supabase = client;
}

function getSupabase(): SupabaseClient {
  if (!supabase) {
    throw new Error('[GDPRService] Supabase client not initialized. Call initGDPRService first.');
  }
  return supabase;
}

// ============================================================================
// CONSENT MANAGEMENT
// ============================================================================

/**
 * Verifica se l'utente ha tutti i consensi obbligatori
 */
export function hasRequiredConsents(consents: Partial<ConsentTypes>): {
  valid: boolean;
  missing: string[];
} {
  const required: (keyof ConsentTypes)[] = [
    'privacy_policy',
    'terms_of_service',
    'data_processing'
  ];

  const missing = required.filter(key => !consents[key]);

  return {
    valid: missing.length === 0,
    missing
  };
}

/**
 * Verifica se l'utente ha il consenso per dati sanitari
 * OBBLIGATORIO se l'app raccoglie pain_areas, injury_history, etc.
 */
export function hasHealthDataConsent(consents: Partial<ConsentTypes>): boolean {
  return consents.health_data_processing === true;
}

/**
 * Salva i consensi dell'utente con audit trail
 */
export async function saveConsents(
  userId: string,
  consents: Partial<ConsentTypes>,
  metadata?: { ip_address?: string; user_agent?: string }
): Promise<{ success: boolean; error?: string }> {
  try {
    const client = getSupabase();
    const now = new Date().toISOString();

    // Prepara i record di consenso
    const consentRecords: ConsentRecord[] = Object.entries(consents).map(([key, value]) => ({
      consent_type: key as keyof ConsentTypes,
      granted: value as boolean,
      granted_at: value ? now : null,
      revoked_at: value ? null : now,
      ip_address: metadata?.ip_address,
      user_agent: metadata?.user_agent,
      version: LEGAL_DOCUMENT_VERSIONS[key as keyof typeof LEGAL_DOCUMENT_VERSIONS] || '1.0.0'
    }));

    // Upsert nel database
    const { error } = await client
      .from('user_consents')
      .upsert({
        user_id: userId,
        consents: consentRecords,
        updated_at: now
      }, {
        onConflict: 'user_id'
      });

    if (error) throw error;

    // Log per audit trail
    await logConsentChange(userId, consentRecords, 'update');

    return { success: true };
  } catch (error: any) {
    console.error('[GDPRService] Error saving consents:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Ottieni i consensi correnti dell'utente
 */
export async function getConsents(userId: string): Promise<{
  success: boolean;
  data?: UserConsentProfile;
  error?: string;
}> {
  try {
    const client = getSupabase();

    const { data, error } = await client
      .from('user_consents')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found

    return { success: true, data: data || undefined };
  } catch (error: any) {
    console.error('[GDPRService] Error getting consents:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Revoca un consenso specifico
 */
export async function revokeConsent(
  userId: string,
  consentType: keyof ConsentTypes,
  metadata?: { ip_address?: string; user_agent?: string }
): Promise<{ success: boolean; error?: string; warning?: string }> {
  try {
    const client = getSupabase();
    const now = new Date().toISOString();

    // Ottieni consensi attuali
    const { data: current } = await client
      .from('user_consents')
      .select('consents')
      .eq('user_id', userId)
      .single();

    if (!current) {
      return { success: false, error: 'Consent profile not found' };
    }

    // Verifica se è un consenso obbligatorio
    const requiredConsents: (keyof ConsentTypes)[] = [
      'privacy_policy',
      'terms_of_service',
      'data_processing'
    ];

    let warning: string | undefined;
    if (requiredConsents.includes(consentType)) {
      warning = 'Revocare questo consenso comporterà la disattivazione dell\'account';
    }

    // Se revoca health_data_processing, cancella i dati sanitari
    if (consentType === 'health_data_processing') {
      await deleteHealthData(userId);
      warning = 'I tuoi dati sanitari (dolori, infortuni, ciclo) sono stati cancellati';
    }

    // Aggiorna il consenso
    const updatedConsents = current.consents.map((c: ConsentRecord) => {
      if (c.consent_type === consentType) {
        return {
          ...c,
          granted: false,
          revoked_at: now
        };
      }
      return c;
    });

    const { error } = await client
      .from('user_consents')
      .update({
        consents: updatedConsents,
        updated_at: now
      })
      .eq('user_id', userId);

    if (error) throw error;

    // Log per audit
    await logConsentChange(userId, [{ consent_type: consentType, granted: false, revoked_at: now, granted_at: null, version: '' }], 'revoke');

    return { success: true, warning };
  } catch (error: any) {
    console.error('[GDPRService] Error revoking consent:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Log delle modifiche ai consensi per audit trail
 */
async function logConsentChange(
  userId: string,
  consents: Partial<ConsentRecord>[],
  action: 'update' | 'revoke' | 'grant'
): Promise<void> {
  try {
    const client = getSupabase();

    await client.from('consent_audit_log').insert({
      user_id: userId,
      action,
      consents_affected: consents.map(c => c.consent_type),
      details: consents,
      created_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('[GDPRService] Error logging consent change:', error);
    // Non bloccare l'operazione principale per errore di logging
  }
}

// ============================================================================
// AGE VERIFICATION
// ============================================================================

/**
 * Calcola età da data di nascita
 */
export function calculateAge(dateOfBirth: string): number {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
}

/**
 * Verifica se l'utente ha l'età minima per il suo paese
 */
export function isOldEnough(dateOfBirth: string, countryCode: string): {
  allowed: boolean;
  minimumAge: number;
  userAge: number;
} {
  const minimumAge = MINIMUM_AGE_BY_COUNTRY[countryCode.toUpperCase()] || MINIMUM_AGE_BY_COUNTRY.DEFAULT;
  const userAge = calculateAge(dateOfBirth);

  return {
    allowed: userAge >= minimumAge,
    minimumAge,
    userAge
  };
}

/**
 * Salva verifica età
 */
export async function saveAgeVerification(
  userId: string,
  dateOfBirth: string,
  countryCode: string
): Promise<{ success: boolean; allowed: boolean; error?: string }> {
  try {
    const client = getSupabase();
    const verification = isOldEnough(dateOfBirth, countryCode);

    if (!verification.allowed) {
      return {
        success: true,
        allowed: false,
        error: `Devi avere almeno ${verification.minimumAge} anni per usare TrainSmart in ${countryCode}`
      };
    }

    const { error } = await client
      .from('user_consents')
      .upsert({
        user_id: userId,
        age_verified: true,
        age_verification_date: new Date().toISOString(),
        date_of_birth: dateOfBirth, // Considera se salvare o solo verificare
        country: countryCode
      }, {
        onConflict: 'user_id'
      });

    if (error) throw error;

    return { success: true, allowed: true };
  } catch (error: any) {
    console.error('[GDPRService] Error saving age verification:', error);
    return { success: false, allowed: false, error: error.message };
  }
}

// ============================================================================
// DATA RETENTION & CLEANUP
// ============================================================================

/**
 * Esegue pulizia dati secondo policy di retention
 * Da eseguire come cron job giornaliero
 */
export async function runDataRetentionCleanup(): Promise<{
  success: boolean;
  deleted: Record<string, number>;
  anonymized: Record<string, number>;
  errors: string[];
}> {
  const deleted: Record<string, number> = {};
  const anonymized: Record<string, number> = {};
  const errors: string[] = [];

  try {
    const client = getSupabase();

    for (const policy of DATA_RETENTION_POLICIES) {
      try {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - policy.retention_days);
        const cutoffISO = cutoffDate.toISOString();

        if (policy.anonymize_instead_of_delete) {
          // Anonimizza invece di cancellare
          const result = await anonymizeOldData(policy.data_type, cutoffISO);
          anonymized[policy.data_type] = result.count;
        } else {
          // Cancella direttamente
          const { count, error } = await client
            .from(policy.data_type)
            .delete()
            .lt('created_at', cutoffISO)
            .select('count');

          if (error) throw error;
          deleted[policy.data_type] = count || 0;
        }

        console.log(`[GDPRService] Retention cleanup: ${policy.data_type} - ${policy.anonymize_instead_of_delete ? 'anonymized' : 'deleted'}`);
      } catch (error: any) {
        errors.push(`${policy.data_type}: ${error.message}`);
      }
    }

    return { success: errors.length === 0, deleted, anonymized, errors };
  } catch (error: any) {
    console.error('[GDPRService] Error in retention cleanup:', error);
    return { success: false, deleted, anonymized, errors: [error.message] };
  }
}

/**
 * Anonimizza dati vecchi invece di cancellarli
 */
async function anonymizeOldData(
  tableName: string,
  beforeDate: string
): Promise<{ count: number }> {
  const client = getSupabase();

  // Logica di anonimizzazione specifica per tabella
  const anonymizationMap: Record<string, object> = {
    'workout_sessions': {
      user_id: null,
      notes: '[ANONYMIZED]',
      // Mantiene: exercise data, durata, data per analytics aggregate
    },
    'login_logs': {
      user_id: null,
      ip_address: '[ANONYMIZED]',
      user_agent: '[ANONYMIZED]',
      // Mantiene: timestamp per statistiche
    },
    'analytics_events': {
      user_id: null,
      // Mantiene: event_type, metadata aggregate
    }
  };

  const updates = anonymizationMap[tableName];
  if (!updates) {
    console.warn(`[GDPRService] No anonymization strategy for ${tableName}`);
    return { count: 0 };
  }

  const { count, error } = await client
    .from(tableName)
    .update({
      ...updates,
      anonymized_at: new Date().toISOString()
    })
    .lt('created_at', beforeDate)
    .is('anonymized_at', null)
    .select('count');

  if (error) throw error;

  return { count: count || 0 };
}

/**
 * Cancella tutti i dati sanitari di un utente
 * Chiamato quando revoca consenso health_data_processing
 */
async function deleteHealthData(userId: string): Promise<void> {
  const client = getSupabase();

  // Tabelle/campi con dati sanitari
  const healthDataTables = [
    'pain_reports',
    'injury_history',
    'body_measurements',
    'menstrual_tracking'
  ];

  for (const table of healthDataTables) {
    try {
      await client
        .from(table)
        .delete()
        .eq('user_id', userId);
    } catch (error) {
      console.error(`[GDPRService] Error deleting ${table}:`, error);
    }
  }

  // Pulisci anche i campi sanitari da user_profiles
  await client
    .from('user_profiles')
    .update({
      onboarding_data: client.rpc('remove_health_fields_from_jsonb', {
        user_id_param: userId
      })
    })
    .eq('user_id', userId);
}

// ============================================================================
// DATA EXPORT (Right to Portability - Art. 20 GDPR)
// ============================================================================

/**
 * Richiedi export di tutti i dati dell'utente
 */
export async function requestDataExport(
  userId: string,
  format: 'json' | 'csv' | 'pdf' = 'json'
): Promise<{ success: boolean; request_id?: string; error?: string }> {
  try {
    const client = getSupabase();
    const requestId = `export_${userId}_${Date.now()}`;

    const { error } = await client.from('data_export_requests').insert({
      request_id: requestId,
      user_id: userId,
      requested_at: new Date().toISOString(),
      status: 'pending',
      format,
      includes: [
        'user_profiles',
        'training_programs',
        'workout_sessions',
        'assessments',
        'pain_reports',
        'body_measurements',
        'achievements',
        'user_consents'
      ]
    });

    if (error) throw error;

    // Triggera job asincrono per generazione export
    // In produzione: usa queue (Bull, AWS SQS, etc.)
    // Per ora: edge function o cron
    await triggerExportJob(requestId);

    return { success: true, request_id: requestId };
  } catch (error: any) {
    console.error('[GDPRService] Error requesting data export:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Genera effettivamente l'export (chiamato da job asincrono)
 */
export async function generateDataExport(requestId: string): Promise<{
  success: boolean;
  download_url?: string;
  error?: string;
}> {
  try {
    const client = getSupabase();

    // Ottieni request
    const { data: request, error: reqError } = await client
      .from('data_export_requests')
      .select('*')
      .eq('request_id', requestId)
      .single();

    if (reqError || !request) throw new Error('Export request not found');

    // Aggiorna status
    await client
      .from('data_export_requests')
      .update({ status: 'processing' })
      .eq('request_id', requestId);

    // Raccogli tutti i dati
    const exportData: Record<string, any> = {};

    for (const tableName of request.includes) {
      const { data } = await client
        .from(tableName)
        .select('*')
        .eq('user_id', request.user_id);

      exportData[tableName] = data || [];
    }

    // Genera file
    let fileContent: string;
    let fileName: string;
    let contentType: string;

    switch (request.format) {
      case 'csv':
        fileContent = convertToCSV(exportData);
        fileName = `trainsmart_export_${request.user_id}.csv`;
        contentType = 'text/csv';
        break;
      case 'pdf':
        // Per PDF servirebbero librerie aggiuntive
        // Fallback a JSON
        fileContent = JSON.stringify(exportData, null, 2);
        fileName = `trainsmart_export_${request.user_id}.json`;
        contentType = 'application/json';
        break;
      default:
        fileContent = JSON.stringify(exportData, null, 2);
        fileName = `trainsmart_export_${request.user_id}.json`;
        contentType = 'application/json';
    }

    // Upload a storage (scade dopo 7 giorni)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const { error: uploadError } = await client.storage
      .from('data-exports')
      .upload(fileName, fileContent, {
        contentType,
        upsert: true
      });

    if (uploadError) throw uploadError;

    // Genera URL firmato
    const { data: urlData } = await client.storage
      .from('data-exports')
      .createSignedUrl(fileName, 60 * 60 * 24 * 7); // 7 giorni

    // Aggiorna request
    await client
      .from('data_export_requests')
      .update({
        status: 'ready',
        completed_at: new Date().toISOString(),
        download_url: urlData?.signedUrl,
        expires_at: expiresAt.toISOString()
      })
      .eq('request_id', requestId);

    // Notifica utente (email)
    await notifyExportReady(request.user_id, urlData?.signedUrl || '');

    return { success: true, download_url: urlData?.signedUrl };
  } catch (error: any) {
    console.error('[GDPRService] Error generating export:', error);

    // Marca come failed
    const client = getSupabase();
    await client
      .from('data_export_requests')
      .update({ status: 'failed' })
      .eq('request_id', requestId);

    return { success: false, error: error.message };
  }
}

/**
 * Converti dati in CSV
 */
function convertToCSV(data: Record<string, any[]>): string {
  let csv = '';

  for (const [tableName, rows] of Object.entries(data)) {
    csv += `\n\n=== ${tableName.toUpperCase()} ===\n`;

    if (rows.length === 0) {
      csv += '(Nessun dato)\n';
      continue;
    }

    // Header
    const headers = Object.keys(rows[0]);
    csv += headers.join(',') + '\n';

    // Rows
    for (const row of rows) {
      csv += headers.map(h => {
        const val = row[h];
        if (val === null || val === undefined) return '';
        if (typeof val === 'object') return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
        return `"${String(val).replace(/"/g, '""')}"`;
      }).join(',') + '\n';
    }
  }

  return csv;
}

/**
 * Trigger job export (placeholder - implementa con la tua queue)
 */
async function triggerExportJob(requestId: string): Promise<void> {
  // Opzione 1: Supabase Edge Function
  // await supabase.functions.invoke('generate-export', { body: { requestId } });

  // Opzione 2: Esegui subito (non ideale per grandi dataset)
  // setTimeout(() => generateDataExport(requestId), 1000);

  // Opzione 3: Cron job che processa pending requests
  console.log(`[GDPRService] Export job queued: ${requestId}`);
}

/**
 * Notifica utente che export è pronto
 */
async function notifyExportReady(userId: string, downloadUrl: string): Promise<void> {
  // Implementa con il tuo sistema di notifiche/email
  console.log(`[GDPRService] Export ready for user ${userId}: ${downloadUrl}`);
}

// ============================================================================
// ACCOUNT DELETION (Right to Erasure - Art. 17 GDPR)
// ============================================================================

/**
 * Richiedi cancellazione account
 * Include periodo di "cooling off" di 30 giorni
 */
export async function requestAccountDeletion(
  userId: string,
  reason?: string
): Promise<{ success: boolean; scheduled_date?: string; error?: string }> {
  try {
    const client = getSupabase();
    const requestId = `deletion_${userId}_${Date.now()}`;

    // Schedula cancellazione tra 30 giorni
    const scheduledDate = new Date();
    scheduledDate.setDate(scheduledDate.getDate() + 30);

    const { error } = await client.from('deletion_requests').insert({
      request_id: requestId,
      user_id: userId,
      requested_at: new Date().toISOString(),
      scheduled_deletion_at: scheduledDate.toISOString(),
      status: 'pending',
      reason
    });

    if (error) throw error;

    // Invia email di conferma con link per annullare
    await sendDeletionConfirmationEmail(userId, requestId, scheduledDate);

    return { success: true, scheduled_date: scheduledDate.toISOString() };
  } catch (error: any) {
    console.error('[GDPRService] Error requesting deletion:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Conferma cancellazione (dall'email)
 */
export async function confirmAccountDeletion(
  requestId: string,
  confirmationToken: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const client = getSupabase();

    // Verifica token (implementa la tua logica)
    // ...

    const { error } = await client
      .from('deletion_requests')
      .update({
        status: 'confirmed',
        confirmed_at: new Date().toISOString()
      })
      .eq('request_id', requestId)
      .eq('status', 'pending');

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Annulla richiesta di cancellazione
 */
export async function cancelAccountDeletion(
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const client = getSupabase();

    const { error } = await client
      .from('deletion_requests')
      .update({ status: 'cancelled' })
      .eq('user_id', userId)
      .in('status', ['pending', 'confirmed']);

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Esegue effettivamente la cancellazione
 * Da eseguire come cron job giornaliero
 */
export async function processScheduledDeletions(): Promise<{
  success: boolean;
  processed: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let processed = 0;

  try {
    const client = getSupabase();

    // Trova richieste confermate e scadute
    const { data: requests } = await client
      .from('deletion_requests')
      .select('*')
      .eq('status', 'confirmed')
      .lte('scheduled_deletion_at', new Date().toISOString());

    if (!requests || requests.length === 0) {
      return { success: true, processed: 0, errors: [] };
    }

    for (const request of requests) {
      try {
        await executeAccountDeletion(request.user_id);

        await client
          .from('deletion_requests')
          .update({ status: 'completed' })
          .eq('request_id', request.request_id);

        processed++;
      } catch (error: any) {
        errors.push(`User ${request.user_id}: ${error.message}`);
      }
    }

    return { success: errors.length === 0, processed, errors };
  } catch (error: any) {
    return { success: false, processed, errors: [error.message] };
  }
}

/**
 * Esegue cancellazione completa di un account
 */
async function executeAccountDeletion(userId: string): Promise<void> {
  const client = getSupabase();

  // Lista tabelle da pulire (ordine importante per foreign keys)
  const tablesToDelete = [
    'workout_sessions',
    'workout_exercises',
    'pain_reports',
    'body_measurements',
    'menstrual_tracking',
    'injury_history',
    'assessments',
    'training_programs',
    'achievements',
    'user_consents',
    'user_profiles'
  ];

  for (const table of tablesToDelete) {
    try {
      await client.from(table).delete().eq('user_id', userId);
    } catch (error) {
      console.error(`[GDPRService] Error deleting from ${table}:`, error);
    }
  }

  // Cancella anche da Auth
  // NOTA: Richiede service_role key
  // await client.auth.admin.deleteUser(userId);

  console.log(`[GDPRService] Account ${userId} deleted completely`);
}

/**
 * Placeholder per email di conferma
 */
async function sendDeletionConfirmationEmail(
  userId: string,
  requestId: string,
  scheduledDate: Date
): Promise<void> {
  // Implementa con il tuo sistema email (Resend, SendGrid, etc.)
  console.log(`[GDPRService] Deletion email sent to ${userId}, scheduled: ${scheduledDate}`);
}

// ============================================================================
// UTILITY HOOKS (per React)
// ============================================================================

/**
 * Verifica se i dati che stiamo per raccogliere richiedono consenso sanitario
 */
export function requiresHealthConsent(dataFields: string[]): boolean {
  return dataFields.some(field =>
    HEALTH_DATA_FIELDS.includes(field as typeof HEALTH_DATA_FIELDS[number])
  );
}

/**
 * Genera testo consenso per dati sanitari
 */
export function getHealthConsentText(language: 'it' | 'en' = 'it'): {
  title: string;
  description: string;
  dataTypes: string[];
  purpose: string;
  rights: string;
} {
  if (language === 'it') {
    return {
      title: 'Consenso al trattamento dei dati sanitari',
      description: 'TrainSmart raccoglie alcuni dati relativi alla tua salute per personalizzare il tuo programma di allenamento e proteggerti da infortuni.',
      dataTypes: [
        'Zone dolorose e intensità del dolore',
        'Storico infortuni e limitazioni fisiche',
        'Dati sul ciclo mestruale (opzionale)',
        'Composizione corporea e misurazioni'
      ],
      purpose: 'Questi dati sono utilizzati esclusivamente per adattare gli esercizi alle tue condizioni fisiche e non vengono condivisi con terze parti.',
      rights: 'Puoi revocare questo consenso in qualsiasi momento dalle impostazioni. La revoca comporterà la cancellazione di tutti i tuoi dati sanitari.'
    };
  }

  return {
    title: 'Health Data Processing Consent',
    description: 'TrainSmart collects some health-related data to personalize your training program and protect you from injuries.',
    dataTypes: [
      'Pain areas and intensity',
      'Injury history and physical limitations',
      'Menstrual cycle data (optional)',
      'Body composition and measurements'
    ],
    purpose: 'This data is used exclusively to adapt exercises to your physical conditions and is not shared with third parties.',
    rights: 'You can revoke this consent at any time from settings. Revocation will result in deletion of all your health data.'
  };
}
