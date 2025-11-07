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

// Este es el modelo que usaremos, soporta "function calling"
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });


/**
 * Función simple para probar la API (el "Hola Mundo")
 */
export async function simpleTextPrompt(prompt: string) {
  const result = await model.generateContent(prompt);
  return result.response.text();
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