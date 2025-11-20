// src/platforms/facebook.ts

import { uploadToS3 } from "../utils/s3.js"; // Importamos la utilidad compartida
import axios from "axios";
import fs from "fs";
import path from "path";


// Leemos las variables de entorno (cargadas en index.ts)
const PAGE_ID = process.env.FACEBOOK_PAGE_ID;
const PAGE_TOKEN = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
const API_URL = process.env.INSTAGRAM_API_URL; // Reutilizamos la URL base de Graph API


async function internal_upload_to_s3(local_path: string): Promise<string> {
  if (!fs.existsSync(local_path)) {
    throw new Error(`No se encontró el archivo: ${local_path}`);
  }
  console.error(`FB: 📤 Subiendo a S3: ${local_path}`);
  const imageUrl = await uploadToS3(local_path);
  console.error(`FB: ✅ URL de S3 generada: ${imageUrl}`);
  return imageUrl;
}

// --- Funciones de Lógica de Herramienta (Exportadas) ---

    export async function get_page_details() {
        const PAGE_ID = process.env.FACEBOOK_PAGE_ID;
        const PAGE_TOKEN = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
        const API_URL = process.env.INSTAGRAM_API_URL;

        // 1. Obtener detalles
        const detailsPromise = axios.get(`${API_URL}/${PAGE_ID}`, {
            params: {
            fields: "name,about,fan_count,category",
            access_token: PAGE_TOKEN,
            },
        });

        // 2. Obtener conteo de posts
        const postsCountPromise = axios.get(`${API_URL}/${PAGE_ID}/posts`, {
            params: {
            limit: 0, // No queremos los posts
            summary: true, // ¡Queremos el resumen!
            total_count: 1, // ¡Pedimos el conteo total!
            access_token: PAGE_TOKEN
            }
        });

        const [detailsResponse, postsResponse] = await Promise.all([detailsPromise, postsCountPromise]);
        
        return {
            ...detailsResponse.data,
            posts_count: postsResponse.data?.summary?.total_count || 0 // <-- ¡Aquí está el conteo!
        };
    }

export async function get_posts(limit: number = 10) {
  const response = await axios.get(`${API_URL}/${PAGE_ID}/posts`, {
    params: {
      fields: "id,message,created_time,permalink_url,likes.summary(true),comments.summary(true)",
      limit: limit,
      access_token: PAGE_TOKEN,
    },
  });
  return response.data.data; // Devuelve el array de posts
}

export async function get_comments(post_id: string) {
  const response = await axios.get(`${API_URL}/${post_id}/comments`, {
    params: {
      fields: "id,message,from{name,id},created_time",
      access_token: PAGE_TOKEN,
    },
  });
  return response.data.data; // Devuelve el array de comentarios
}

export async function get_post_stats(post_id: string) {
  const response = await axios.get(`${API_URL}/${post_id}`, {
    params: {
      fields: "id,message,likes.summary(true),comments.summary(true)",
      access_token: PAGE_TOKEN,
    },
  });
  return response.data;
}

export async function publish_text_post(message: string) {
  const response = await axios.post(`${API_URL}/${PAGE_ID}/feed`, null, {
    params: {
      message: message,
      access_token: PAGE_TOKEN,
    },
  });
  return response.data; // { id: "..." }
}

export async function publish_link_post(link_url: string, message?: string) {
  const response = await axios.post(`${API_URL}/${PAGE_ID}/feed`, null, {
    params: {
      link: link_url,
      message: message || "",
      access_token: PAGE_TOKEN,
    },
  });
  return response.data; // { id: "..." }
}

export async function reply_to_comment(comment_id: string, message: string) {
  const response = await axios.post(`${API_URL}/${comment_id}/comments`, null, {
    params: {
      message: message,
      access_token: PAGE_TOKEN,
    },
  });
  return response.data; // { id: "..." }
}

export async function delete_post(post_id: string) {
  const response = await axios.delete(`${API_URL}/${post_id}`, {
    params: { access_token: PAGE_TOKEN },
  });
  return response.data; // { success: true }
}

export async function publish_photo_from_url(url: string, caption?: string) {
  console.error(`FB: 📝 Publicando desde URL: ${url}`);
  
  const response = await axios.post(
    `${API_URL}/${PAGE_ID}/photos`,
    null,
    {
      params: {
        url: url,
        caption: caption || "",
        access_token: PAGE_TOKEN,
      },
    }
  );
  
  // Devuelve { id, post_id }
  return response.data; 
}

export async function publish_photo(image_path: string, caption?: string) {
  const imageUrl = await internal_upload_to_s3(image_path);
  console.error(`FB: 📝 Publicando en Facebook Page ID: ${PAGE_ID}...`);

  const response = await axios.post(`${API_URL}/${PAGE_ID}/photos`, null, {
    params: {
      url: imageUrl,
      caption: caption || "",
      access_token: PAGE_TOKEN,
    },
  });
  // Adjuntamos la info local para el log
  return { ...response.data, imageUrl, imagePath: image_path };
}

export async function publish_video(video_path: string, caption?: string) {
  const videoUrl = await internal_upload_to_s3(video_path);
  console.error(`FB: 📝 Publicando video en Facebook Page ID: ${PAGE_ID}...`);

  const response = await axios.post(`${API_URL}/${PAGE_ID}/videos`, null, {
    params: {
      file_url: videoUrl,
      description: caption || "",
      access_token: PAGE_TOKEN,
    },
  });
  // Adjuntamos la info local para el log
  return { ...response.data, videoUrl };
}

// ==============================================================================
// 2. DEFINICIÓN DE HERRAMIENTAS (EXPORTADA PARA index.ts)
// ==============================================================================

// (Esta sección es la misma que ya tenías, está perfecta)
export const facebookTools = [
  {
    name: "facebook_publish_photo",
    description: "Sube una foto desde tu PC a S3 y la publica en una Página de Facebook",
    inputSchema: {
      type: "object",
      properties: {
        image_path: { type: "string" },
        caption: { type: "string" },
      },
      required: ["image_path"],
    },
  },
  {
    name: "facebook_get_posts",
    description: "Obtiene los posts recientes de tu Página de Facebook",
    inputSchema: {
      type: "object",
      properties: {
        limit: { type: "number", default: 10 },
      },
    },
  },
  {
    name: "facebook_get_page_details",
    description: "Obtiene la información principal de tu Página de Facebook.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "facebook_get_comments",
    description: "Obtiene los comentarios de un post específico de Facebook.",
    inputSchema: {
      type: "object",
      properties: { post_id: { type: "string" } },
      required: ["post_id"],
    },
  },
  {
    name: "facebook_publish_text_post",
    description: "Publica un post de solo texto en la Página de Facebook.",
    inputSchema: {
      type: "object",
      properties: { message: { type: "string" } },
      required: ["message"],
    },
  },
  {
    name: "facebook_publish_link_post",
    description: "Publica un post con un enlace (link) y un mensaje de texto opcional.",
    inputSchema: {
      type: "object",
      properties: {
        link_url: { type: "string" },
        message: { type: "string" },
      },
      required: ["link_url"],
    },
  },
  {
    name: "facebook_publish_video",
    description: "Sube un video desde la PC a S3 y lo publica en la Página de Facebook.",
    inputSchema: {
      type: "object",
      properties: {
        video_path: { type: "string" },
        caption: { type: "string" },
      },
      required: ["video_path"],
    },
  },
  {
    name: "facebook_reply_to_comment",
    description: "Responde a un comentario específico en un post de Facebook.",
    inputSchema: {
      type: "object",
      properties: {
        comment_id: { type: "string" },
        message: { type: "string" },
      },
      required: ["comment_id", "message"],
    },
  },
  {
    name: "facebook_delete_post",
    description: "Elimina un post (foto, video o texto) de la Página de Facebook.",
    inputSchema: {
      type: "object",
      properties: { post_id: { type: "string" } },
      required: ["post_id"],
    },
  },
];

// ==============================================================================
// 3. MANEJADOR MCP (EXPORTADO PARA index.ts)
// ==============================================================================
// Este manejador LLAMA a la lógica de negocio y FORMATEA la respuesta para el usuario

export async function handleFacebookCall(
  name: string,
  args: any
){
  // Verificamos que las variables de entorno estén cargadas
  if (!PAGE_ID || !PAGE_TOKEN || !API_URL) {
    throw new Error("Faltan variables de entorno de Facebook (PAGE_ID, PAGE_TOKEN, API_URL)");
  }

  switch (name) {
    case "facebook_publish_photo": {
      const { image_path, caption } = args as any;
      const result = await publish_photo(image_path, caption);
      return {
        content: [
          {
            type: "text",
            text: `✅ Foto publicada exitosamente en Facebook!\n\n` +
                  `📁 Archivo: ${path.basename(result.imagePath)}\n` +
                  `☁️ URL S3: ${result.imageUrl}\n` +
                  `🆔 Post ID: ${result.id}\n` +
                  `🆔 Photo ID: ${result.post_id}\n` +
                  `📝 Caption: ${caption || "Sin texto"}`,
          },
        ],
      };
    }

    case "facebook_get_posts": {
      const posts = await get_posts(args.limit);
      if (!posts || posts.length === 0) {
        return {
          content: [{ type: "text", text: "No se encontraron posts en la página." }],
        };
      }
      let text = `📱 Posts Recientes de Facebook (${posts.length}):\n\n`;
      posts.forEach((post: any, i: number) => {
        text += `${i + 1}. ${post.message?.substring(0, 80) || "Sin texto"}...\n`;
        text += `  ❤️ ${post.likes?.summary?.total_count || 0} | 💬 ${post.comments?.summary?.total_count || 0}\n`;
        text += `  📅 ${new Date(post.created_time).toLocaleString()}\n`;
        text += `  🆔 ${post.id}\n`;
        text += `  🔗 ${post.permalink_url}\n\n`;
      });
      return { content: [{ type: "text", text }] };
    }

        case "facebook_get_page_details": {
        const data = await get_page_details();
        return {
            content: [
            {
                type: "text",
                text: `📖 Detalles de la Página:\n\n` +
                    `Nombre: ${data.name}\n` +
                    `Categoría: ${data.category}\n` +
                    `Fans: ${data.fan_count}\n` +
                    `Acerca de: ${data.about || "Sin descripción"}`,
            },
            ],
        };
        }

    case "facebook_get_comments": {
      const comments = await get_comments(args.post_id);
      if (!comments || comments.length === 0) {
        return {
          content: [{ type: "text", text: "💬 No se encontraron comentarios para este post." }],
        };
      }
      let text = `💬 Comentarios (${comments.length}):\n\n`;
      comments.forEach((comment: any, i: number) => {
        text += `${i + 1}. @${comment.from.name} (ID: ${comment.id})\n`;
        text += `  "${comment.message}"\n`;
        text += `  📅 ${new Date(comment.created_time).toLocaleString()}\n\n`;
      });
      return { content: [{ type: "text", text }] };
    }

    case "facebook_publish_text_post": {
      const { message } = args as any;
      const result = await publish_text_post(message);
      return {
        content: [
          {
            type: "text",
            text: `✅ Post de texto publicado!\n\n` +
                  `🆔 Post ID: ${result.id}\n` +
                  `📝 Mensaje: ${message}`,
          },
        ],
      };
    }

    case "facebook_publish_link_post": {
      const { link_url, message } = args as any;
      const result = await publish_link_post(link_url, message);
      return {
        content: [
          {
            type: "text",
            text: `✅ Post de enlace publicado!\n\n` +
                  `🆔 Post ID: ${result.id}\n` +
                  `🔗 URL: ${link_url}`,
          },
        ],
      };
    }

    case "facebook_publish_video": {
      const { video_path, caption } = args as any;
      const result = await publish_video(video_path, caption);
      return {
        content: [
          {
            type: "text",
            text: `✅ Video publicado exitosamente en Facebook!\n\n` +
                  `🆔 Video ID: ${result.id}\n` +
                  `☁️ URL S3: ${result.videoUrl}\n` +
                  `📝 Caption: ${caption || "Sin texto"}\n\n` +
                  `⏳ Puede tardar unos minutos en procesarse y aparecer.`,
          },
        ],
      };
    }

    case "facebook_reply_to_comment": {
      const { comment_id, message } = args as any;
      const result = await reply_to_comment(comment_id, message);
      return {
        content: [
          {
            type: "text",
            text: `✅ Respuesta publicada al comentario ${comment_id}\n` +
                  `🆔 ID de Respuesta: ${result.id}`,
          },
        ],
      };
    }

    case "facebook_delete_post": {
      const { post_id } = args as any;
      await delete_post(post_id);
      return {
        content: [
          {
            type: "text",
            text: `✅ Post eliminado exitosamente: ${post_id}`,
          },
        ],
      };
    }

    default:
      throw new Error(`Herramienta desconocida de Facebook: ${name}`);
  }
}