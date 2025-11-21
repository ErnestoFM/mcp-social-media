// src/utils/gemini.ts
import 'dotenv/config';
import { logger } from './loggers.js';
import { GoogleGenAI } from "@google/genai";

// 1. Cargar la clave desde el .env
const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  logger.error('❌ Falta la variable de entorno GEMINI_API_KEY');
  logger.error('👉 Asegúrate de tener un archivo .env con: GEMINI_API_KEY=tu_clave');
  throw new Error("Falta la variable de entorno GEMINI_API_KEY");
}

logger.info('✅ Variable de entorno GEMINI_API_KEY cargada correctamente');

// 2. Inicializar el cliente
const ai = new GoogleGenAI({ apiKey: API_KEY });

// Configuración del modelo
const MODEL_NAME = "gemini-2.0-flash"; // Usando la versión 2.0 Flash que es la más reciente y rápida

logger.info(`✅ Cliente Gemini inicializado con modelo: ${MODEL_NAME}`);

/**
 * Función simple para probar la API (el "Hola Mundo")
 */
export async function simpleTextPrompt(prompt: string) {
  logger.debug(`🔹 simpleTextPrompt: "${prompt.substring(0, 50)}..."`);

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        temperature: 0.8,
        maxOutputTokens: 230,
      }
    });

    // EN EL NUEVO SDK, text() PUEDE SER UN MÉTODO O UNA PROPIEDAD DEPENDIENDO DE LA VERSIÓN EXACTA
    // PERO LA DOCUMENTACIÓN SUGIERE QUE ES UN MÉTODO response.text() O LA PROPIEDAD response.text
    // VAMOS A PROBAR ACCEDERLO DE FORMA SEGURA
    let text: string | undefined | null;

    // Caso 1: Es una función (SDK viejo o Vertex AI)
    if (typeof (response as any).text === 'function') {
      text = (response as any).text();
    }
    // Caso 2: Es una propiedad/getter (SDK nuevo @google/genai)
    else if (response.text) {
      text = response.text;
    }
    // Caso 3: Fallback manual (buscar en candidates)
    else if (response.candidates && response.candidates.length > 0) {
      text = response.candidates[0].content?.parts?.[0]?.text;
    }

    if (!text) {
      throw new Error("La respuesta de Gemini vino vacía o no se pudo leer el texto.");
    }

    logger.info(`✅ Gemini: Texto generado exitosamente (${text.length} caracteres)`);
    return text;

  } catch (error: any) {
    logger.error(`❌ Gemini: Error al generar texto: ${error.message}`, {
      error,
      prompt: prompt.substring(0, 100)
    });
    // Lanzamos un error limpio para que el frontend lo muestre
    throw new Error(`Error de Gemini: ${error.message}`);
  }
}

/**
 * Genera texto creativo usando Gemini
 */
export async function generateCreativeText(prompt: string): Promise<string> {
  logger.info(`🧠 Gemini: Generando texto creativo para... "${prompt.substring(0, 50)}..."`);

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        temperature: 0.8,
        maxOutputTokens: 1000, // Aumentado para permitir respuestas más completas
      }
    });

    let text: string | undefined | null;

    // Caso 1: Es una función (SDK viejo o Vertex AI)
    if (typeof (response as any).text === 'function') {
      text = (response as any).text();
    }
    // Caso 2: Es una propiedad/getter (SDK nuevo @google/genai)
    else if (response.text) {
      text = response.text;
    }
    // Caso 3: Fallback manual (buscar en candidates)
    else if (response.candidates && response.candidates.length > 0) {
      text = response.candidates[0].content?.parts?.[0]?.text;
    }

    if (!text) {
      throw new Error("La respuesta de Gemini vino vacía o no se pudo leer el texto.");
    }

    logger.info(`✅ Gemini: Texto generado exitosamente (${text.length} caracteres)`);

    logger.debug(`📝 Contenido: "${text.substring(0, 100)}..."`);

    return text;
  } catch (error: any) {
    logger.error(`❌ Gemini: Error al generar texto: ${error.message}`, {
      error,
      prompt: prompt.substring(0, 100)
    });
    throw new Error(`Error de Gemini: ${error.message}`);
  }
}

/**
 * Función avanzada que usa "Function Calling"
 * NOTA: La implementación de Function Calling en el nuevo SDK es diferente.
 * Por ahora, mantendremos esta función simplificada o adaptada si es necesario.
 * Si no se usa activamente en el frontend actual, podemos dejarla como placeholder o adaptarla.
 */
export async function generativeTask(
  prompt: string,
  tools: any[] // Ajustar tipo según el nuevo SDK si es necesario
) {
  // TODO: Adaptar Function Calling al nuevo SDK @google/genai cuando sea necesario
  // Por ahora, usaremos generateCreativeText como fallback para evitar romper la compilación
  // si esta función se llama desde algún lugar.
  logger.warn("⚠️ generativeTask: Function calling aún no migrado completamente al nuevo SDK. Usando generación de texto simple.");
  return {
    type: 'text',
    content: await generateCreativeText(prompt)
  };
}
