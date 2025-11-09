// src/utils/gemini.ts
import { 
  GoogleGenerativeAI, 
  GenerationConfig,
  Tool, // <-- ¡Este es el tipo que buscábamos!
  FunctionDeclarationSchema,
  FunctionDeclaration,
} from "@google/generative-ai";

// 1. Cargar la clave desde el .env
const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  throw new Error("Falta la variable de entorno GEMINI_API_KEY");
}

// 2. Inicializar el cliente
const genAI = new GoogleGenerativeAI(API_KEY);

const creativeConfig: GenerationConfig = {
  temperature: 0.8, // Un poco más creativo
  maxOutputTokens: 230, // No más de 230 tokens
};
// Este es el modelo que usaremos, soporta "function calling"
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", generationConfig: creativeConfig });


/**
 * Función simple para probar la API (el "Hola Mundo")
 */
export async function simpleTextPrompt(prompt: string) {
  const result = await model.generateContent(prompt);
  return result.response.text();
}

export async function generateCreativeText(prompt: string): Promise<string> {
  console.error(`Gemini: 🧠 Generando texto para... "${prompt.substring(0, 50)}..."`);
  
  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    console.error(`Gemini: 🧠 Texto generado: "${text.substring(0, 50)}..."`);
    return text;
  } catch (error: any) {
    console.error(`Gemini: ❌ Error al generar texto: ${error.message}`);
    // Devuelve un error claro para que el manejador catch en 'index.ts' lo capture
    throw new Error(`Error de Gemini: ${error.message}`);
  }
}

/**
 * Función avanzada que usa "Function Calling"
 */
export async function generativeTask(
  prompt: string,
  tools: FunctionDeclaration[] // Usamos el tipo de Google
) {
  
  // Iniciamos el chat pasándole las herramientas que puede usar
  const chat = model.startChat({
    tools: [{ functionDeclarations: tools }],
  });

  // Enviamos el prompt del usuario
  const result = await chat.sendMessage(prompt);
  const call = result.response.functionCalls()?.[0];

  if (!call) {
    // Si la IA no quiso llamar a una función y solo respondió con texto
    return { type: 'text', content: result.response.text() };
  }
  
  // Si la IA SÍ quiere llamar a una función
  return {
    type: 'function_call',
    call: {
      name: call.name,
      args: call.args,
    }
  };
}