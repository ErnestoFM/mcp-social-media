// src/platforms/threads.ts

import { uploadToS3 } from "../utils/s3.js";
import { validatePhoto, validateVideo } from "../utils/media.js";
import axios from "axios";
import fs from "fs";
import path from "path";

// Leemos las variables de entorno (cargadas en index.ts)
// Threads USA LA MISMA API Y CREDENCIALES que Instagram
const API_URL = process.env.INSTAGRAM_API_URL!;
const ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN!;
const USER_ID = process.env.INSTAGRAM_USER_ID!;

// ==============================================================================
// 1. LÓGICA DE NEGOCIO (EXPORTADA)
// ==============================================================================

/**
 * Paso 1 de publicación de Threads: Crea un contenedor de medios
 */
async function create_thread_container(
  params: { [key: string]: any }
): Promise<string> {
  console.error(`Threads: 📝 Creando contenedor...`);
  const response = await axios.post(`${API_URL}/${USER_ID}/media`, null, {
    params: { ...params, access_token: ACCESS_TOKEN },
  });

  if (!response.data.id) {
    throw new Error("La API de Threads no devolvió un creation_id");
  }
  return response.data.id;
}

/**
 * Paso 2 de publicación de Threads: Publica el contenedor
 */
async function publish_thread_container(creation_id: string): Promise<any> {
  console.error(`Threads: 📤 Publicando contenedor ${creation_id}...`);
  const response = await axios.post(
    `${API_URL}/${USER_ID}/media_publish`,
    null,
    {
      params: { creation_id, access_token: ACCESS_TOKEN },
    }
  );
  console.error(`Threads: ✅ Post publicado: ${response.data.id}`);
  return response.data; // { id: "..." }
}

// --- Funciones de Lógica de Herramienta (Exportadas) ---

export async function publish_text_thread(text_content: string) {
  const creation_id = await create_thread_container({
    media_type: "TEXT",
    text: text_content,
  });
  return await publish_thread_container(creation_id);
}

export async function publish_image_thread(
  image_path: string,
  text_content?: string
) {
  validatePhoto(image_path); // Validar la imagen
  const imageUrl = await uploadToS3(image_path); // Subir a S3

  const creation_id = await create_thread_container({
    media_type: "IMAGE",
    image_url: imageUrl,
    text: text_content || "",
  });
  
  const result = await publish_thread_container(creation_id);
  return { ...result, imageUrl, imagePath: image_path };
}

export async function get_user_threads(limit: number = 10) {
  const response = await axios.get(`${API_URL}/${USER_ID}/threads`, {
    params: {
      fields: "id,text,timestamp,like_count,replies_count,media_type,media_url",
      limit,
      access_token: ACCESS_TOKEN,
    },
  });
  return response.data.data; // Devuelve el array de hilos
}

export async function get_thread_replies(media_id: string) {
  const response = await axios.get(`${API_URL}/${media_id}/replies`, {
    params: {
      fields: "id,text,username,timestamp,like_count",
      access_token: ACCESS_TOKEN,
    },
  });
  return response.data.data; // Devuelve el array de respuestas
}

export async function get_thread_stats(media_id: string) {
  const response = await axios.get(`${API_URL}/${media_id}`, {
    params: {
      fields: "id,like_count,replies_count,text,media_type",
      access_token: ACCESS_TOKEN,
    },
  });
  return response.data;
}

// ==============================================================================
// 2. DEFINICIÓN DE HERRAMIENTAS (EXPORTADA)
// ==============================================================================

export const threadsTools = [
  {
    name: "threads_publish_text_post",
    description: "Publica un post de solo texto en Threads.",
    inputSchema: {
      type: "object",
      properties: {
        text_content: {
          type: "string",
          description: "El contenido de texto para el post (máx 500 caracteres).",
        },
      },
      required: ["text_content"],
    },
  },
  {
    name: "threads_publish_image_post",
    description: "Sube una imagen a S3 y la publica en Threads con texto.",
    inputSchema: {
      type: "object",
      properties: {
        image_path: {
          type: "string",
          description: "Ruta local de la imagen (JPG, PNG).",
        },
        text_content: {
          type: "string",
          description: "Texto que acompaña a la imagen (opcional).",
        },
      },
      required: ["image_path"],
    },
  },
  {
    name: "threads_get_user_threads",
    description: "Obtiene los hilos (posts) más recientes del perfil de Threads.",
    inputSchema: {
      type: "object",
      properties: {
        limit: {
          type: "number",
          description: "Número de hilos a obtener",
          default: 10,
        },
      },
    },
  },
  {
    name: "threads_get_thread_replies",
    description: "Obtiene las respuestas (replies) de un post de Threads específico.",
    inputSchema: {
      type: "object",
      properties: {
        media_id: {
          type: "string",
          description: "El ID del post (hilo) de Threads.",
        },
      },
      required: ["media_id"],
    },
  },
];

// ==============================================================================
// 3. MANEJADOR MCP (HANDLER)
// ==============================================================================

export async function handleThreadsCall(
  name: string,
  args: any
) {
  if (!USER_ID || !ACCESS_TOKEN || !API_URL) {
    throw new Error("Faltan variables de entorno de Instagram/Threads");
  }

  switch (name) {
    case "threads_publish_text_post": {
      const { text_content } = args as any;
      const result = await publish_text_thread(text_content);
      return {
        content: [
          {
            type: "text",
            text: `✅ Hilo de texto publicado en Threads!\n\n` +
                  `🆔 Post ID: ${result.id}\n` +
                  `📝 Texto: ${text_content.substring(0, 50)}...`,
          },
        ],
      };
    }

    case "threads_publish_image_post": {
      const { image_path, text_content } = args as any;
      // La validación ocurre dentro de la lógica de negocio
      const result = await publish_image_thread(image_path, text_content);
      return {
        content: [
          {
            type: "text",
            text: `✅ Hilo con imagen publicado en Threads!\n\n` +
                  `🆔 Post ID: ${result.id}\n` +
                  `☁️ URL S3: ${result.imageUrl}\n` +
                  `📝 Texto: ${text_content || "Sin texto"}`,
          },
        ],
      };
    }

    case "threads_get_user_threads": {
      const threads = await get_user_threads(args.limit);
      if (!threads || threads.length === 0) {
        return { content: [{ type: "text", text: "🧵 No se encontraron hilos (threads)." }] };
      }
      let text = `🧵 Hilos Recientes (${threads.length}):\n\n`;
      threads.forEach((thread: any, i: number) => {
        text += `${i + 1}. [${thread.media_type}] ${thread.text?.substring(0, 60) || ""}\n`;
        text += `  ❤️ ${thread.like_count || 0} | 💬 ${thread.replies_count || 0}\n`;
        text += `  🆔 ${thread.id}\n\n`;
      });
      return { content: [{ type: "text", text }] };
    }

    case "threads_get_thread_replies": {
      const replies = await get_thread_replies(args.media_id);
      if (!replies || replies.length === 0) {
        return { content: [{ type: "text", text: "💬 No se encontraron respuestas (replies) para este hilo." }] };
      }
      let text = `💬 Respuestas al Hilo (${replies.length}):\n\n`;
      replies.forEach((reply: any, i: number) => {
        text += `${i + 1}. @${reply.username} (ID: ${reply.id})\n`;
        text += `  "${reply.text}"\n\n`;
      });
      return { content: [{ type: "text", text }] };
    }

    default:
      throw new Error(`Herramienta desconocida de Threads: ${name}`);
  }
}