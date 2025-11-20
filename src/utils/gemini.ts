// src/utils/gemini.ts
import 'dotenv/config';
import { logger } from './loggers.js';

import { 
  GoogleGenerativeAI, 
  GenerationConfig,
  Tool,
  FunctionDeclarationSchema,
  FunctionDeclaration,
} from "@google/generative-ai";

// 1. Cargar la clave desde el .env
const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  logger.error('❌ Falta la variable de entorno GEMINI_API_KEY');
  logger.error('👉 Asegúrate de tener un archivo .env con: GEMINI_API_KEY=tu_clave');
  throw new Error("Falta la variable de entorno GEMINI_API_KEY");
}

logger.info('✅ Variable de entorno GEMINI_API_KEY cargada correctamente');

// 2. Inicializar el cliente
const genAI = new GoogleGenerativeAI(API_KEY);

const creativeConfig: GenerationConfig = {
  temperature: 0.8, // Un poco más creativo
  maxOutputTokens: 230, // No más de 230 tokens
};

// Este es el modelo que usaremos, soporta "function calling"
const model = genAI.getGenerativeModel({ 
  model: "gemini-1.5-flash", 
  generationConfig: creativeConfig 
});

logger.info('✅ Modelo Gemini inicializado: gemini-1.5-flash');

/**
 * Función simple para probar la API (el "Hola Mundo")
 */
export async function simpleTextPrompt(prompt: string) {
  logger.debug(`🔹 simpleTextPrompt: "${prompt.substring(0, 50)}..."`);
  
  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    logger.debug(`✅ Respuesta recibida (${text.length} caracteres)`);
    return text;
  } catch (error: any) {
    logger.error(`❌ Error en simpleTextPrompt: ${error.message}`, { error });
    throw error;
  }
}

/**
 * Genera texto creativo usando Gemini
 */
export async function generateCreativeText(prompt: string): Promise<string> {
  logger.info(`🧠 Gemini: Generando texto creativo para... "${prompt.substring(0, 50)}..."`);
  
  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();

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
 */
export async function generativeTask(
  prompt: string,
  tools: FunctionDeclaration[]
) {
  logger.info(`🔧 Gemini: Iniciando tarea generativa con ${tools.length} herramienta(s)`);
  logger.debug(`📋 Herramientas disponibles: ${tools.map(t => t.name).join(', ')}`);
  logger.debug(`💬 Prompt: "${prompt.substring(0, 100)}..."`);
  
  try {
    // Iniciamos el chat pasándole las herramientas que puede usar
    const chat = model.startChat({
      tools: [{ functionDeclarations: tools }],
    });

    // Enviamos el prompt del usuario
    const result = await chat.sendMessage(prompt);
    const call = result.response.functionCalls()?.[0];

    if (!call) {
      // Si la IA no quiso llamar a una función y solo respondió con texto
      const textContent = result.response.text();
      logger.info(`💬 Gemini respondió con texto (sin llamar función)`);
      logger.debug(`📝 Respuesta: "${textContent.substring(0, 100)}..."`);
      
      return { 
        type: 'text', 
        content: textContent 
      };
    }
    
    // Si la IA SÍ quiere llamar a una función
    logger.info(`🎯 Gemini llamó a la función: ${call.name}`);
    logger.debug(`📦 Argumentos:`, call.args);
    
    return {
      type: 'function_call',
      call: {
        name: call.name,
        args: call.args,
      }
    };
  } catch (error: any) {
    logger.error(`❌ Error en generativeTask: ${error.message}`, {
      error,
      prompt: prompt.substring(0, 100),
      toolsCount: tools.length
    });
    throw error;
  }
}
