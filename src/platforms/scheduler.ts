import { validatePhoto, validateVideo } from "../utils/media.js";
import { uploadToS3 } from "../utils/s3.js";
import * as db from "../utils/database.js"; // Importamos nuestro módulo de DB
import path from "path";
import { logger } from "../utils/loggers.js";
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
          items: { enum: ["instagram", "facebook"] },
          description: "Un array de plataformas donde publicar, ej. ['instagram', 'facebook']"
        },
        media_path: {
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
      required: ["platforms", "media_path", "caption", "scheduled_time"],
    },
  },
  {
    name: "list_scheduled_posts",
    description: "Lista todos los posts programados que están pendientes de publicar.",
    inputSchema: {  // <-- AÑADIDO
      type: "object",
      properties: {}
    }
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
      const { platforms, media_path, caption, scheduled_time } = args as any;

      // 1. Validar el archivo local 
      // (Asumimos que es una foto por simplicidad, puedes añadir lógica para video)
        logger.info("Scheduler: Validando archivo", { 
        mediaPath: media_path,
        extension: path.extname(media_path).toLowerCase()
        });
        const ext = path.extname(media_path).toLowerCase();

    try {
        if (['.mp4', '.mov'].includes(ext)) {
          logger.debug("Scheduler: Es un video, validando video..."); // <-- .error
          await validateVideo(media_path); // <-- ¡Añadido AWAIT!
        } else {
          logger.debug("Scheduler: Es una imagen, validando foto..."); // <-- .error
          await validatePhoto(media_path); // <-- ¡Añadido AWAIT!
        }
        logger.info("Scheduler: Archivo validado exitosamente", { 
        mediaPath: media_path,
        type: ['.mp4', '.mov'].includes(ext) ? 'video' : 'image'
        });
      } catch (validationError: any) {
        // Si la validación falla (ej. muy largo, muy grande), detenemos
        logger.error("Scheduler: Validación de archivo falló", {
            mediaPath: media_path,
            extension: ext,
            error: validationError.message,
            stack: validationError.stack
        });
        throw new Error(`Validación de archivo falló: ${validationError.message}`);
      }

      // 2. Subir a S3
      logger.info("Scheduler: Subiendo a S3...");
      const s3_url = await uploadToS3(media_path);
      logger.info(`Scheduler: URL de S3: ${s3_url}`);

      // 3. Guardar en DynamoDB
       logger.info("Scheduler: Guardando en DynamoDB", {
        platforms,
        scheduledTime: scheduled_time
    });
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