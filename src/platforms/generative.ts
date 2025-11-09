// src/platforms/generative.ts

import { generateCreativeText } from "../utils/gemini.js";

// ==============================================================================
// 1. DEFINICIÓN DE HERRAMIENTAS (¡Añade las 2 nuevas!)
// ==============================================================================
export const generativeTools = [
  {
    name: "generate_creative_caption",
    description: "Genera un texto creativo (caption) para un post de redes sociales basado en un tema o prompt.",
    inputSchema: {
      type: "object",
      properties: {
        topic: {
          type: "string",
          description: "El tema o idea para el post (ej. 'un atardecer en la playa', 'un nuevo logro').",
        },
      },
      required: ["topic"],
    },
  },

  // --- ¡NUEVA HERRAMIENTA 1! ---
  {
    name: "ai_moderate_comment",
    description: "Analiza si un comentario es spam/tóxico y sugiere una respuesta, o recomienda eliminarlo.",
    inputSchema: {
      type: "object",
      properties: {
        comment_text: { type: "string", description: "El texto del comentario a analizar." },
        post_context: { 
          type: "string", 
          description: "El caption del post original (para dar contexto).",
          default: "Sin contexto"
        }
      },
      required: ["comment_text"],
    },
  },

  // --- ¡NUEVA HERRAMIENTA 2! ---
  {
    name: "ai_generate_content_ideas",
    description: "Genera ideas de posts (para IG, FB, Threads) basadas en tendencias y tu nicho.",
    inputSchema: {
      type: "object",
      properties: {
        niche: { 
          type: "string", 
          description: "El tema o nicho. ej: 'gaming y valorant', 'cocina vegana'"
        },
        count: { 
          type: "number", 
          default: 5 // 5 es un número más manejable
        }
      },
      required: ["niche"],
    },
  }
];

// ==============================================================================
// 2. LÓGICA DEL MANEJADOR (HANDLER) (¡Añade los 2 'case' nuevos!)
// ==============================================================================
export async function handleGenerativeCall(name: string, args: any) {
  switch (name) {
    case "generate_creative_caption": {
      const { topic } = args as any;
      const fullPrompt = `Escribe un caption corto, creativo y atractivo para un post de Instagram. Incluye 2-3 emojis y 1-2 hashtags relevantes. El tema es: "${topic}"`;
      const generatedText = await generateCreativeText(fullPrompt);

      return {
        content: [
          { type: "text", text: `Aquí tienes un texto creativo:\n\n${generatedText}` },
          { type: "json", json: { generated_caption: generatedText } }
        ],
      };
    }

    // --- ¡NUEVO CASE 1! ---
    case "ai_moderate_comment": {
      const { comment_text, post_context } = args as any;
      
      const prompt = `
        Analiza el siguiente comentario y clasifícalo en una de estas 4 categorías:
        [POSITIVO], [NEUTRO], [NEGATIVO], [SPAM]
        
        Además, proporciona una "acción sugerida" (suggested_action):
        - Si es POSITIVO o NEUTRO, sugiere una respuesta corta y profesional.
        - Si es NEGATIVO, sugiere una respuesta profesional y conciliadora.
        - Si es SPAM, la acción sugerida debe ser "DELETE" (eliminar).
        
        Contexto del Post: "${post_context}"
        Comentario a analizar: "${comment_text}"
        
        Responde *solo* en formato JSON. Ejemplo:
        { "classification": "POSITIVO", "suggested_reply": "¡Muchas gracias! 😊", "action": "REPLY" }
        O si es spam:
        { "classification": "SPAM", "suggested_reply": null, "action": "DELETE" }
      `;
      
      const geminiResponse = await generateCreativeText(prompt);
      
      // Limpiamos el JSON por si Gemini añade "```json"
      const cleanJson = geminiResponse.replace(/```json\n?|\n?```/g, '');
      
      return {
        content: [
          { type: "text", text: `Análisis de IA (Gemini):\n\n${cleanJson}` },
          { type: "json", json: JSON.parse(cleanJson) }
        ]
      };
    }
    
    // --- ¡NUEVO CASE 2! ---
    case "ai_generate_content_ideas": {
      const { niche, count } = args as any;
      
      const prompt = `
        Actúa como un estratega de redes sociales experto.
        Genera ${count} ideas de posts creativos y de alto engagement para Instagram, Facebook y Threads sobre el nicho: "${niche}".
        Para cada idea, dame un "title" corto, una "description" de la idea, y la "platform" sugerida (Instagram, Facebook, o Threads).
        
        Responde *solo* en formato JSON. Ejemplo:
        {
          "ideas": [
            { "title": "Tutorial Rápido (Reel)", "description": "Un Reel de 30s mostrando un truco clave sobre ${niche}.", "platform": "Instagram" },
            { "title": "Pregunta Abierta", "description": "Un post de texto con una pregunta para generar conversación.", "platform": "Threads" }
          ]
        }
      `;
      
      const geminiResponse = await generateCreativeText(prompt);
      const cleanJson = geminiResponse.replace(/```json\n?|\n?```/g, '');

      return {
        content: [
          { type: "text", text: `Aquí hay ${count} ideas de contenido para "${niche}":\n\n${cleanJson}` },
          { type: "json", json: JSON.parse(cleanJson) }
        ]
      };
    }

    default:
      throw new Error(`Herramienta generativa desconocida: ${name}`);
  }
}