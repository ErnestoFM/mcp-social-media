// src/utils/moderation.ts

/**
 * Revisa un string para ver si coincide con patrones de spam comunes.
 */
export function isSpam(comment: string): boolean {
  const spamPatterns = [
    /follow.*back/i,
    /check.*profile/i,
    /dm.*me/i,
    /link.*bio/i,
    /www\./i, // 'i' para que no importe mayúsculas/minúsculas
    /http/i,  // 'i' para que no importe mayúsculas/minúsculas
    /💰|💵|💸|🚀|🔥/, // Añadí algunos emojis comunes de spam
  ];
  
  return spamPatterns.some(pattern => pattern.test(comment));
}