// src/platforms/debug.ts
import { validateEnvVariables } from "../utils/auth.js"; // Importa la función de validación

export const debugTools = [
  {
    name: "debug_check_env_vars",
    description: "Re-ejecuta la validación de variables de entorno y reporta cuáles faltan.",
    inputSchema: { type: "object", properties: {} },
  },
];

export async function handleDebugCall(name: string, args: any) {
  if (name === "debug_check_env_vars") {
    try {
      validateEnvVariables(); // Intenta correr la validación
      return {
        content: [{ type: "text", text: "✅ ¡ÉXITO! Todas las variables de entorno requeridas están presentes." }]
      };
    } catch (error: any) {
      // ¡Si falla, nos da el error exacto!
      return {
        content: [{ 
          type: "text", 
          text: `❌ ¡FALLO! El servidor reporta este error:\n\n${error.message}` 
        }]
      };
    }
  }
  throw new Error(`Herramienta de depuración desconocida: ${name}`);
}