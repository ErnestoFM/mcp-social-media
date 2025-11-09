// src/platforms/instagram.ts

import { uploadToS3 } from "../utils/s3.js"; // Importamos la utilidad compartida
import axios from "axios";
import fs from "fs";
import path from "path";
import { validatePhoto, validateVideo } from "../utils/media.js";

// Leemos las variables de entorno (cargadas en index.ts)
const API_URL = process.env.INSTAGRAM_API_URL!;
const ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN!;
const USER_ID = process.env.INSTAGRAM_USER_ID!;

// ==============================================================================
// 1. LÓGICA DE NEGOCIO (EXPORTADA PARA multi.ts)
// ==============================================================================
// Estas funciones devuelven los DATOS PUROS (raw)

/**
 * Sube un archivo local a S3
 */
export async function delete_comment(comment_id: string) {
  const response = await axios.delete(`${API_URL}/${comment_id}`, {
    params: { access_token: ACCESS_TOKEN },
  });
  return response.data; // { success: true }
}

// --- AÑADE A LA LISTA 'instagramTools' ---
async function internal_upload_to_s3(local_path: string): Promise<string> {
  if (!fs.existsSync(local_path)) {
    throw new Error(`No se encontró el archivo: ${local_path}`);
  }
  console.error(`IG: 📤 Subiendo a S3: ${local_path}`);
  const imageUrl = await uploadToS3(local_path);
  console.error(`IG: ✅ URL generada: ${imageUrl}`);
  return imageUrl;
}

/**
 * Paso 1 de publicación: Crea un contenedor de medios en Instagram
 */
async function create_media_container(
  params: { [key: string]: any }
): Promise<string> {
  console.error(`IG: 📝 Creando contenedor en Instagram...`);
  const response = await axios.post(`${API_URL}/${USER_ID}/media`, null, {
    params: { ...params, access_token: ACCESS_TOKEN },
  });

  if (!response.data.id) {
    console.error(`IG: ❌ No se recibió creation_id`);
    throw new Error("Instagram no devolvió un Media ID");
  }
  console.error(`IG: ✅ Creation ID recibido: ${response.data.id}`);
  return response.data.id;
}

/**
 * Paso 2 de publicación: Publica un contenedor de medios
 */
async function publish_media_container(creation_id: string): Promise<any> {
  console.error(`IG: 📤 Publicando contenedor...`);
  const response = await axios.post(
    `${API_URL}/${USER_ID}/media_publish`,
    null,
    {
      params: { creation_id, access_token: ACCESS_TOKEN },
    }
  );
  console.error(`IG: ✅ Post publicado: ${response.data.id}`);
  return response.data; // { id: "..." }
}

/**
 * Espera a que un video (Reel) termine de procesarse
 */
async function poll_for_video_status(creation_id: string): Promise<string> {
  console.error("IG: ⏳ Esperando que Instagram procese el video...");
  let status = "IN_PROGRESS";
  let attempts = 0;
  const maxAttempts = 60; // 3 minutos (60 * 3s)

  while (status === "IN_PROGRESS" && attempts < maxAttempts) {
    await new Promise((resolve) => setTimeout(resolve, 3000));
    const response = await axios.get(`${API_URL}/${creation_id}`, {
      params: { fields: "status_code", access_token: ACCESS_TOKEN },
    });
    status = response.data.status_code;
    attempts++;
    if (attempts % 10 === 0) {
      console.error(`IG:   Intentos: ${attempts}/${maxAttempts}, Estado: ${status}`);
    }
  }
  return status;
}

// --- Funciones de Lógica de Herramienta (Exportadas) ---

export async function get_profile() {
  const response = await axios.get(`${API_URL}/${USER_ID}`, {
    params: {
      fields: "username,followers_count,media_count,biography",
      access_token: ACCESS_TOKEN,
    },
  });
  return response.data;
}

export async function get_posts(limit: number = 10) {
  const response = await axios.get(`${API_URL}/${USER_ID}/media`, {
    params: {
      fields: "id,caption,media_type,timestamp,like_count,comments_count,media_product_type",
      limit: 50,
      access_token: ACCESS_TOKEN,
    },
  });
  return response.data.data
    .filter((p: any) => p.media_product_type === "FEED" || !p.media_product_type)
    .slice(0, limit);
}

export async function get_reels(limit: number = 10) {
  const response = await axios.get(`${API_URL}/${USER_ID}/media`, {
    params: {
      fields: "id,caption,timestamp,like_count,comments_count,media_product_type",
      limit: 50,
      access_token: ACCESS_TOKEN,
    },
  });
  return response.data.data
    .filter((p: any) => p.media_product_type === "REELS")
    .slice(0, limit);
}

export async function get_comments(media_id: string) {
  const response = await axios.get(`${API_URL}/${media_id}/comments`, {
    params: { fields: "id,text,username,timestamp", access_token: ACCESS_TOKEN },
  });
  return response.data.data;
}

export async function get_post_stats(media_id: string) {
  const response = await axios.get(`${API_URL}/${media_id}`, {
    params: { fields: "id,like_count,comments_count,caption", access_token: ACCESS_TOKEN },
  });
  return response.data;
}

export async function reply_to_comment(comment_id: string, message: string) {
  const response = await axios.post(
    `${API_URL}/${comment_id}/replies`,
    null,
    { params: { message, access_token: ACCESS_TOKEN } }
  );
  return response.data; // { id: "..." }
}

export async function delete_post(media_id: string) {
  const response = await axios.delete(`${API_URL}/${media_id}`, {
    params: { access_token: ACCESS_TOKEN },
  });
  return response.data; // { success: true }
}

export async function publish_photo_from_url(
  image_url: string,
  caption?: string
) {
  const creation_id = await create_media_container({
    image_url,
    caption: caption || "",
  });
  return await publish_media_container(creation_id);
}

export async function upload_and_publish_photo(
  image_path: string,
  caption?: string
) {
  const imageUrl = await internal_upload_to_s3(image_path);
  await axios.head(imageUrl); // Verificar accesibilidad
  const result = await publish_photo_from_url(imageUrl, caption);
  return { ...result, imageUrl, imagePath: image_path };
}

export async function upload_and_publish_story(
  media_path: string,
  media_type: 'IMAGE' | 'VIDEO'
) {
  let s3Url = "";
  if (media_type === 'IMAGE') {
    validatePhoto(media_path);
    s3Url = await internal_upload_to_s3(media_path);
  } else {
    validateVideo(media_path);
    s3Url = await internal_upload_to_s3(media_path);
  }
  
  // Paso 1: Crear contenedor de Historia
  const params: any = {
    media_type: "STORIES"
  };
  
  if (media_type === 'IMAGE') {
    params.image_url = s3Url;
  } else {
    params.video_url = s3Url;
  }

  const creation_id = await create_media_container(params);
  
  // Paso 2: Publicar
  return await publish_media_container(creation_id);
}

export async function upload_and_publish_reel(
  video_path: string,
  caption?: string,
  share_to_feed: boolean = true
) {
  if (!video_path.toLowerCase().endsWith('.mp4')) {
    throw new Error('El video debe ser formato MP4');
  }
  const videoUrl = await internal_upload_to_s3(video_path);
  const creation_id = await create_media_container({
    media_type: "REELS",
    video_url: videoUrl,
    caption: caption || "",
    share_to_feed: share_to_feed,
  });

  const status = await poll_for_video_status(creation_id);
  if (status !== "FINISHED") {
    throw new Error(`Procesamiento de video falló o agotó tiempo. Estado: ${status}`);
  }

  const result = await publish_media_container(creation_id);
  return { ...result, videoUrl };
}
export async function get_profile_insights(period: 'day' | 'week' | 'month') {
  console.error(`IG: 📈 Obteniendo insights del perfil para ${period}...`);
  // Métricas comunes del perfil
  const metrics = "profile_views,website_clicks,reach,impressions,follower_count";

  const response = await axios.get(`${API_URL}/${USER_ID}/insights`, {
    params: {
      metric: metrics,
      period: period,
      access_token: ACCESS_TOKEN,
    },
  });
  return response.data.data;
}
export async function upload_and_publish_carousel(
  image_paths: string[],
  caption?: string
) {
  if (image_paths.length < 2 || image_paths.length > 10) {
    throw new Error("El carrusel debe tener entre 2 y 10 imágenes");
  }

  console.error(`IG: 📤 Subiendo ${image_paths.length} imágenes a S3...`);
  const uploadedUrls: string[] = [];
  for (const p of image_paths) {
    const url = await internal_upload_to_s3(p);
    uploadedUrls.push(url);
  }
  console.error(`IG: ✅ Todas las imágenes subidas`);

  const childrenIds = [];
  for (const url of uploadedUrls) {
    const child_id = await create_media_container({
      image_url: url,
      is_carousel_item: true,
    });
    childrenIds.push(child_id);
  }

  const carousel_id = await create_media_container({
    media_type: "CAROUSEL",
    children: childrenIds.join(","),
    caption: caption || "",
  });

  const result = await publish_media_container(carousel_id);
  return { ...result, uploadedUrls };
}

// ==============================================================================
// 2. DEFINICIÓN DE HERRAMIENTAS (EXPORTADA PARA index.ts)
// ==============================================================================

// (Copia aquí el array 'instagramTools' completo que ya tenías)
export const instagramTools = [
   {
  name: "get_profile_insights",
  description: "Obtiene analíticas del perfil (vistas de perfil, clics en web) para un período.",
  inputSchema: {
    type: "object",
    properties: {
      period: {
        type: "string",
        enum: ["day", "week", "month"],
        description: "El período de tiempo para el reporte (day, week, o month). 'month' es 28 días.",
        default: "week",
      }
    },
  },
},
    {
  name: "upload_and_publish_story",
  description: "Sube un video o foto a S3 y lo publica como una Historia de Instagram.",
  inputSchema: {
    type: "object",
    properties: {
      media_path: {
        type: "string",
        description: "Ruta local del archivo (foto o video). Ej: C:\\...\\mifoto.jpg"
      },
      media_type: {
        type: "string",
        enum: ["IMAGE", "VIDEO"],
        description: "Especifica si el archivo es 'IMAGE' o 'VIDEO'."
      }
    },
    required: ["media_path", "media_type"],
  },
},
    {
    name: "delete_comment",
    description: "Elimina un comentario de Instagram",
    inputSchema: {
        type: "object",
        properties: { comment_id: { type: "string" } },
        required: ["comment_id"],
        },
    },
    {
    name: "upload_and_publish_photo",
    description: "Sube una foto desde tu PC a S3 y la publica en Instagram",
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
    name: "upload_and_publish_carousel",
    description: "Sube múltiples fotos a S3 y publica un carrusel",
    inputSchema: {
      type: "object",
      properties: {
        image_paths: { type: "array", items: { type: "string" } },
        caption: { type: "string" },
      },
      required: ["image_paths"],
    },
  },
  {
    name: "upload_image_to_s3",
    description: "Solo sube una imagen a S3 y devuelve la URL",
    inputSchema: {
      type: "object",
      properties: {
        image_path: { type: "string" },
      },
      required: ["image_path"],
    },
  },
  {
    name: "publish_photo_from_url",
    description: "Publica una foto desde una URL (S3 u otra)",
    inputSchema: {
      type: "object",
      properties: {
        image_url: { type: "string" },
        caption: { type: "string" },
      },
      required: ["image_url"],
    },
  },
  {
    name: "get_profile",
    description: "Obtiene información del perfil de Instagram",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "get_posts",
    description: "Obtiene posts recientes de Instagram",
    inputSchema: {
      type: "object",
      properties: { limit: { type: "number", default: 10 } },
    },
  },
  {
    name: "get_reels",
    description: "Obtiene reels recientes de Instagram",
    inputSchema: {
      type: "object",
      properties: { limit: { type: "number", default: 10 } },
    },
  },
  {
    name: "get_comments",
    description: "Obtiene comentarios de un post de Instagram",
    inputSchema: {
      type: "object",
      properties: { media_id: { type: "string" } },
      required: ["media_id"],
    },
  },
  {
    name: "upload_and_publish_reel",
    description: "Sube un video desde tu PC a S3 y lo publica como Reel",
    inputSchema: {
      type: "object",
      properties: {
        video_path: { type: "string" },
        caption: { type: "string" },
        share_to_feed: { type: "boolean", default: true },
      },
      required: ["video_path"],
    },
  },
  {
    name: "reply_to_comment",
    description: "Responde a un comentario de Instagram",
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
    name: "delete_post",
    description: "Elimina un post de Instagram",
    inputSchema: {
      type: "object",
      properties: { media_id: { type: "string" } },
      required: ["media_id"],
    },
  },
];

// ==============================================================================
// 3. MANEJADOR MCP (EXPORTADO PARA index.ts)
// ==============================================================================
// Este manejador LLAMA a la lógica de negocio y FORMATEA la respuesta para el usuario

export async function handleInstagramCall(
  name: string,
  args: any
){
  switch (name) {
    case "upload_and_publish_story": {
      const { media_path, media_type } = args as any;
      const result = await upload_and_publish_story(media_path, media_type);
      return {
        content: [{
          type: "text",
          text: `✅ ¡Historia publicada exitosamente!\n🆔 ID de Media: ${result.id}`
        }]
      };
    }
    case "delete_comment": {
      const { comment_id } = args as any;
      await delete_comment(comment_id);
      return {
        content: [{ type: "text", text: `✅ Comentario ${comment_id} de Instagram eliminado.` }],
      };
    }
    case "get_profile": {
      const profile = await get_profile();
      return {
        content: [
          {
            type: "text",
            text: `📸 @${profile.username}\n` +
                  `👥 ${profile.followers_count} seguidores\n` +
                  `📷 ${profile.media_count} posts\n` +
                  `📝 ${profile.biography || 'Sin bio'}`,
          },
        ],
      };
    }
    case "get_profile_insights": {
      const { period } = args as any;
      const insights = await get_profile_insights(period || 'week');
      
      let text = `📈 Analíticas del Perfil (Período: ${period || 'week'}):\n\n`;
      insights.forEach((metric: any) => {
        // Los insights de perfil devuelven 3 valores (de los 3 últimos períodos)
        const lastValue = metric.values[metric.values.length - 1]; 
        text += `  - ${metric.title}: ${lastValue.value}\n`;
      });

      return {
        content: [{ type: "text", text }]
      };
    }
    case "get_posts": {
      const posts = await get_posts(args.limit);
      if (posts.length === 0) {
        return { content: [{ type: "text", text: "📱 No se encontraron posts." }] };
      }
      let text = `📱 Posts de Instagram (${posts.length}):\n\n`;
      posts.forEach((post: any, i: number) => {
        text += `${i + 1}. ${post.media_type}\n`;
        text += `   ${post.caption?.substring(0, 60) || "Sin texto"}...\n`;
        text += `   ❤️ ${post.like_count} | 💬 ${post.comments_count}\n`;
        text += `   🆔 ${post.id}\n\n`;
      });
      return { content: [{ type: "text", text }] };
    }

    case "get_reels": {
      const reels = await get_reels(args.limit);
      if (reels.length === 0) {
        return { content: [{ type: "text", text: "🎬 No hay reels" }] };
      }
      let text = `🎬 Reels de Instagram (${reels.length}):\n\n`;
      reels.forEach((reel: any, i: number) => {
        text += `${i + 1}. ${reel.caption?.substring(0, 60) || "Sin texto"}...\n`;
        text += `   ❤️ ${reel.like_count} | 💬 ${reel.comments_count}\n`;
        text += `   🆔 ${reel.id}\n\n`;
      });
      return { content: [{ type: "text", text }] };
    }

    case "get_comments": {
      const comments = await get_comments(args.media_id);
      if (comments.length === 0) {
        return { content: [{ type: "text", text: "💬 No hay comentarios" }] };
      }
      let text = `💬 Comentarios de Instagram (${comments.length}):\n\n`;
      comments.forEach((comment: any, i: number) => {
        text += `${i + 1}. @${comment.username} (ID: ${comment.id})\n`;
        text += `   "${comment.text}"\n`;
        text += `   📅 ${new Date(comment.timestamp).toLocaleDateString()}\n\n`;
      });
      return { content: [{ type: "text", text }] };
    }

    case "reply_to_comment": {
      const { comment_id, message } = args as any;
      const result = await reply_to_comment(comment_id, message);
      return {
        content: [{ type: "text", text: `✅ Respuesta publicada\n🆔 ID: ${result.id}` }],
      };
    }

    case "delete_post": {
      const { media_id } = args as any;
      await delete_post(media_id);
      return {
        content: [{ type: "text", text: `✅ Post eliminado: ${media_id}` }],
      };
    }

    case "publish_photo_from_url": {
      const { image_url, caption } = args as any;
      const result = await publish_photo_from_url(image_url, caption);
      return {
        content: [
          {
            type: "text",
            text: `✅ Foto publicada desde URL!\n🆔 Post ID: ${result.id}`,
          },
        ],
      };
    }

    case "upload_image_to_s3": {
      const { image_path } = args as any;
      const imageUrl = await internal_upload_to_s3(image_path);
      return {
        content: [
          {
            type: "text",
            text: `✅ Imagen subida a S3\n\n` +
                  `📁 Archivo: ${path.basename(image_path)}\n` +
                  `☁️ URL: ${imageUrl}\n\n` +
                  `Puedes usar esta URL para publicar en Instagram.`,
          },
        ],
      };
    }

    case "upload_and_publish_photo": {
      const { image_path, caption } = args as any;
      const result = await upload_and_publish_photo(image_path, caption);
      return {
        content: [
          {
            type: "text",
            text: `✅ Foto publicada exitosamente en Instagram!\n\n` +
                  `📁 Archivo: ${path.basename(result.imagePath)}\n` +
                  `☁️ URL S3: ${result.imageUrl}\n` +
                  `🆔 Post ID: ${result.id}\n` +
                  `📝 Caption: ${caption || "Sin texto"}`,
          },
        ],
      };
    }

    case "upload_and_publish_reel": {
      const { video_path, caption, share_to_feed } = args as any;
      const result = await upload_and_publish_reel(video_path, caption, share_to_feed);
      return {
        content: [
          {
            type: "text",
            text: `✅ Reel publicado!\n\n` +
                  `🎬 Reel ID: ${result.id}\n` +
                  `📝 Caption: ${caption || "Sin texto"}\n` +
                  `☁️ Video en S3: ${result.videoUrl}`,
          },
        ],
      };
    }

    case "upload_and_publish_carousel": {
      const { image_paths, caption } = args as any;
      const result = await upload_and_publish_carousel(image_paths, caption);
      return {
        content: [
          {
            type: "text",
            text: `✅ Carrusel publicado!\n\n` +
                  `🆔 Post ID: ${result.id}\n` +
                  `🖼️ Imágenes: ${image_paths.length}\n` +
                  `📝 Caption: ${caption || "Sin texto"}\n\n` +
                  `☁️ URLs en S3:\n` +
                  result.uploadedUrls.map((url:string, i:number) => `${i + 1}. ${url.split('/').pop()}`).join('\n'),
          },
        ],
      };
    }

    default:
      throw new Error(`Herramienta desconocida de Instagram: ${name}`);
  }
}