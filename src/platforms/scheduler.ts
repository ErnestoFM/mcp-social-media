// src/platforms/scheduler.ts

import { validatePhoto, validateVideo } from "../utils/media.js";
import { uploadToS3 } from "../utils/s3.js";
import * as db from "../utils/database.js"; // Importamos nuestro módulo de DB

// ==============================================================================
// 1. DEFINICIÓN DE HERRAMIENTAS
// ==============================================================================

export const schedulerTools = [
  {
    name: "schedule_post",
    description: "Programa un post para publicar en una fecha/hora específica. El archivo se sube a S3 inmediatamente.",
    inputSchema: {
      type: "object",
      properties: {
        platforms: {
          type: "array",
          items: { "enum": ["instagram", "facebook", "threads"] },
          description: "Un array de plataformas donde publicar, ej. ['instagram', 'facebook']"
        },
        image_path: {
          type: "string",
          description: "Ruta local de la imagen o video a publicar (ej. 'C:\\fotos\\foto.jpg')."
        },
        caption: {
          type: "string",
          description: "El texto del post."
        },
        scheduled_time: {
          type: "string",
          description: "La fecha y hora en formato ISO 8601 (UTC) para publicar. Ej: 2025-11-08T18:00:00Z"
        }
      },
      required: ["platforms", "image_path", "caption", "scheduled_time"],
    },
  },
  {
    name: "list_scheduled_posts",
    description: "Lista todos los posts programados que están pendientes de publicar."
  },
  {
    name: "cancel_scheduled_post",
    description: "Cancela un post programado que aún no se ha publicado.",
    inputSchema: {
      type: "object",
      properties: {
        post_id: {
          type: "string",
          description: "El ID del post programado (obtenido de 'list_scheduled_posts')."
        }
      },
      required: ["post_id"],
    },
  }
];

// ==============================================================================
// 2. LÓGICA DEL MANEJADOR (HANDLER)
// ==============================================================================

export async function handleSchedulerCall(name: string, args: any) {
  switch (name) {
    case "schedule_post": {
      const { platforms, image_path, caption, scheduled_time } = args as any;

      // 1. Validar el archivo local 
      // (Asumimos que es una foto por simplicidad, puedes añadir lógica para video)
      console.log("Scheduler: Validando archivo...");
      validatePhoto(image_path); // O 'validateVideo'

      // 2. Subir a S3
      console.log("Scheduler: Subiendo a S3...");
      const s3_url = await uploadToS3(image_path);
      console.log(`Scheduler: URL de S3: ${s3_url}`);

      // 3. Guardar en DynamoDB
      const postId = await db.saveScheduledPost({
        platforms: platforms,
        s3_url: s3_url,
        caption: caption,
        scheduled_time: scheduled_time
      });
      
      return {
        content: [{ type: "text", text: `✅ Post programado exitosamente.\nID de Post: ${postId}\nSe publicará en [${platforms.join(', ')}] a las ${scheduled_time}` }]
      };
    }

    case "list_scheduled_posts": {
      const posts = await db.listPendingPosts();
      if (posts.length === 0) {
        return { content: [{ type: "text", text: "No hay posts pendientes programados." }] };
      }
      
      let text = "🗓️ Posts Pendientes Programados:\n\n";
      posts.forEach(post => {
        text += `ID: ${post.post_id}\n`
        text += `  Plataformas: [${post.platforms.join(', ')}]\n`
        text += `  Hora: ${post.scheduled_time}\n`
        text += `  Caption: ${post.caption.substring(0, 30)}...\n\n`
      });
      return { content: [{ type: "text", text }] };
    }

    case "cancel_scheduled_post": {
      const { post_id } = args as any;
      await db.deleteScheduledPost(post_id);
      return {
        content: [{ type: "text", text: `✅ Post programado ${post_id} ha sido cancelado.` }]
      };
    }

    default:
      throw new Error(`Herramienta de scheduler desconocida: ${name}`);
  }
}