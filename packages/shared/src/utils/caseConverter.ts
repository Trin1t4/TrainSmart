/**
 * Case Converter Utilities
 *
 * Converte automaticamente tra snake_case (Supabase/DB) e camelCase (TypeScript).
 * Utile per standardizzare l'interfaccia tra frontend e backend.
 *
 * @module caseConverter
 */

/**
 * Converte una stringa da snake_case a camelCase
 */
export function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Converte una stringa da camelCase a snake_case
 */
export function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

/**
 * Converte tutte le chiavi di un oggetto da snake_case a camelCase (deep)
 */
export function snakeToCamelObject<T = Record<string, unknown>>(obj: unknown): T {
  if (obj === null || obj === undefined) {
    return obj as T;
  }

  if (Array.isArray(obj)) {
    return obj.map(snakeToCamelObject) as T;
  }

  if (typeof obj === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      const camelKey = snakeToCamel(key);
      result[camelKey] = snakeToCamelObject(value);
    }
    return result as T;
  }

  return obj as T;
}

/**
 * Converte tutte le chiavi di un oggetto da camelCase a snake_case (deep)
 */
export function camelToSnakeObject<T = Record<string, unknown>>(obj: unknown): T {
  if (obj === null || obj === undefined) {
    return obj as T;
  }

  if (Array.isArray(obj)) {
    return obj.map(camelToSnakeObject) as T;
  }

  if (typeof obj === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      const snakeKey = camelToSnake(key);
      result[snakeKey] = camelToSnakeObject(value);
    }
    return result as T;
  }

  return obj as T;
}

/**
 * Wrapper per fetch da Supabase che converte automaticamente le chiavi
 * @example
 * const data = await fetchFromSupabase(supabase.from('users').select('*'));
 * // data ha chiavi in camelCase
 */
export async function fetchWithCaseConversion<T>(
  queryPromise: Promise<{ data: unknown; error: unknown }>
): Promise<{ data: T | null; error: unknown }> {
  const { data, error } = await queryPromise;

  if (error || !data) {
    return { data: null, error };
  }

  return {
    data: snakeToCamelObject<T>(data),
    error: null
  };
}

/**
 * Prepara un oggetto per l'inserimento in Supabase (converte a snake_case)
 */
export function prepareForSupabase<T = Record<string, unknown>>(obj: unknown): T {
  return camelToSnakeObject<T>(obj);
}

/**
 * Lista di campi che NON devono essere convertiti (es. UUID, date ISO, JSON)
 * Utile per evitare conversioni su campi speciali
 */
const PRESERVE_KEYS = ['id', 'user_id', 'userId', 'created_at', 'updated_at', 'createdAt', 'updatedAt'];

/**
 * Converte selettivamente, preservando alcune chiavi
 */
export function selectiveSnakeToCamel<T = Record<string, unknown>>(
  obj: unknown,
  preserveKeys: string[] = PRESERVE_KEYS
): T {
  if (obj === null || obj === undefined) {
    return obj as T;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => selectiveSnakeToCamel(item, preserveKeys)) as T;
  }

  if (typeof obj === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      // Preserva la chiave originale se è nella lista
      const shouldPreserve = preserveKeys.includes(key);
      const newKey = shouldPreserve ? key : snakeToCamel(key);
      result[newKey] = selectiveSnakeToCamel(value, preserveKeys);
    }
    return result as T;
  }

  return obj as T;
}
