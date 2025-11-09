// src/platforms/analytics.ts
import * as db from "../utils/database.js";
import { get_posts as getIgPosts, get_post_stats as getIgPostStats } from "./instagram.js";
import { get_posts as getFbPosts, get_post_stats as getFbPostStats } from "./facebook.js";
import axios from "axios";

// --- Constantes de la API (¡Asegúrate de que estén en .env!) ---
const API_URL = process.env.INSTAGRAM_API_URL!;
const ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN!;
const USER_ID = process.env.INSTAGRAM_USER_ID!;

// ==============================================================================
// 1. DEFINICIÓN DE HERRAMIENTAS
// ==============================================================================

export const analyticsTools = [
  {
    name: "track_collaboration",
    description: "Registra una nueva colaboración con otra cuenta/marca.",
    inputSchema: {
      type: "object",
      properties: {
        platform: {
          type: "string",
          enum: ["instagram", "facebook"],
          description: "La plataforma de la colaboración."
        },
        username: {
          type: "string",
          description: "El @username del colaborador."
        },
        type: {
          type: "string",
          enum: ["shoutout", "giveaway", "collab_post"],
          description: "El tipo de colaboración."
        },
        post_id: {
          type: "string",
          description: "El ID del post asociado a esta colaboración."
        },
        notes: {
          type: "string",
          description: "Notas adicionales (opcional)."
        }
      },
      required: ["platform", "username", "type", "post_id"],
    },
  },
  {
    name: "list_collaborations",
    description: "Lista todas las colaboraciones registradas y analiza su rendimiento comparativo.",
    inputSchema: {
      type: "object",
      properties: {
        platform: {
          type: "string",
          enum: ["instagram", "facebook"],
          description: "La plataforma de la que quieres el reporte."
        }
      },
      required: ["platform"],
    },
  },
  {
    name: "cancel_collaboration", // (Cambié el nombre de tu 'cancel_scheduled_post')
    description: "Elimina un registro de colaboración de la base de datos.",
    inputSchema: {
      type: "object",
      properties: {
        platform: {
          type: "string",
          enum: ["instagram", "facebook"],
          description: "La plataforma."
        },
        collaboration_id: {
          type: "string",
          description: "El ID de la colaboración (obtenido de 'list_collaborations')."
        }
      },
      required: ["platform", "collaboration_id"],
    },
},
  {
    name: "analyze_hashtag_performance",
    description: "Busca los posts públicos más populares de un hashtag, calcula su engagement promedio y lo guarda en la base de datos.",
    inputSchema: {
      type: "object",
      properties: {
        hashtag_name: { 
          type: "string", 
          description: "El hashtag que quieres analizar (sin el #). ej: 'valorant'" 
        },
      },
      required: ["hashtag_name"],
    },
  },
  {
    name: "compare_my_stats_to_hashtag",
    description: "Compara el engagement promedio de tus posts de Instagram con el promedio guardado de un hashtag.",
    inputSchema: {
      type: "object",
      properties: {
        hashtag_name: { 
          type: "string", 
          description: "El hashtag (sin #) contra el que quieres comparar. ej: 'valorant'" 
        },
      },
      required: ["hashtag_name"],
    },
  },
];

// ==============================================================================
// 2. LÓGICA DEL MANEJADOR (HANDLER) 
// ==============================================================================

export async function handleAnalyticsCall(name: string, args: any) {
  switch (name) {
case "track_collaboration": {
      const { platform, username, type, post_id, notes } = args as any;
      
      const collab = await db.saveCollaboration({
        platform,
        username,
        type,
        post_id,
        notes: notes || null
      });

      return {
        content: [{
          type: "text",
          text: `✅ Colaboración con @${username} registrada con ID: ${collab.collaboration_id}`
        }]
      };
    }

    case "list_collaborations": {
      const { platform } = args as any;
      
      // 1. Definir las funciones correctas por plataforma
      let getPostsFn: (limit: number) => Promise<any[]>;
      let getStatsFn: (postId: string) => Promise<any>;

      if (platform === 'instagram') {
        getPostsFn = getIgPosts;
        getStatsFn = getIgPostStats;
      } else if (platform === 'facebook') {
        getPostsFn = getFbPosts;
        getStatsFn = getFbPostStats;
      } else {
        throw new Error("Plataforma no soportada");
      }

      console.error(`Analytics: 📊 Analizando colaboraciones para ${platform}...`);
      
      // 2. Obtener el rendimiento base
      const baselinePosts = await getPostsFn(30);
      let totalLikes = 0;
      let totalComments = 0;
      baselinePosts.forEach(p => {
        totalLikes += p.like_count || p.likes?.summary?.total_count || 0;
        totalComments += p.comments_count || p.comments?.summary?.total_count || 0;
      });
      const avgEngagementBase = (totalLikes + totalComments) / baselinePosts.length;

      // 3. Obtener todas las colaboraciones
      const collabs = await db.getCollaborations(platform);
      if (collabs.length === 0) {
        return { content: [{ type: "text", text: "No hay colaboraciones registradas para esta plataforma." }] };
      }

      let text = `📊 Reporte de Colaboraciones [${platform.toUpperCase()}]\n`;
      text += `(Promedio de Engagement (Likes+Comentarios) de posts normales: ${avgEngagementBase.toFixed(2)})\n\n`;

      // 4. Analizar cada colaboración
      for (const collab of collabs) {
        try {
          const stats = await getStatsFn(collab.post_id);
          const likes = stats.like_count || stats.likes?.summary?.total_count || 0;
          const comments = stats.comments_count || stats.comments?.summary?.total_count || 0;
          const totalEngagement = likes + comments;

          // Guardar los nuevos stats en la DB (¡no es necesario esperar!)
          db.updateCollabEngagement(platform, collab.collaboration_id, { likes, comments });
          
          const performance = ((totalEngagement - avgEngagementBase) / avgEngagementBase) * 100;

          text += `--- @${collab.username} (${collab.type}) ---\n`;
          text += `  ID: ${collab.collaboration_id}\n`;
          text += `  Post ID: ${collab.post_id}\n`;
          text += `  Engagement: ${totalEngagement} (❤️${likes} 💬${comments})\n`;
          text += `  Rendimiento vs Promedio: ${performance.toFixed(2)}%\n\n`;

        } catch (error: any) {
          text += `--- @${collab.username} (ID: ${collab.collaboration_id}) ---\n`;
          text += `  Error al obtener stats: ${error.message}\n\n`;
        }
      }

      return { content: [{ type: "text", text }] };
    }

    case "cancel_collaboration": {
      const { platform, collaboration_id } = args as any;
      await db.deleteCollaboration(platform, collaboration_id);
      return {
        content: [{
          type: "text",
          text: `✅ Colaboración ${collaboration_id} eliminada.`
        }]
      };
    }
    case "analyze_hashtag_performance": {
      const { hashtag_name } = args as any;

      console.error(`Analytics: 🔍 Buscando ID para #${hashtag_name}...`);
      
      // 1. Buscar el ID del Hashtag
      const searchResponse = await axios.get(`${API_URL}/ig_hashtag_search`, {
        params: {
          user_id: USER_ID,
          q: hashtag_name,
          access_token: ACCESS_TOKEN,
        },
      });
      
      const hashtag_id = searchResponse.data.data[0]?.id;
      if (!hashtag_id) {
        throw new Error(`No se pudo encontrar el hashtag '${hashtag_name}'.`);
      }
      console.error(`Analytics: 🆔 ID encontrado: ${hashtag_id}`);

      // 2. Obtener los "Top Media" (posts más populares) de ese hashtag
      const mediaResponse = await axios.get(`${API_URL}/${hashtag_id}/top_media`, {
        params: {
          user_id: USER_ID,
          fields: "like_count,comments_count",
          limit: 50, // La API nos da hasta 50
          access_token: ACCESS_TOKEN,
        },
      });

      const posts: any[] = mediaResponse.data.data;
      if (!posts || posts.length === 0) {
        throw new Error(`No se encontraron posts para #${hashtag_name}.`);
      }

      // 3. Calcular los promedios
      let totalLikes = 0;
      let totalComments = 0;
      posts.forEach((post: any) => {
        totalLikes += post.like_count || 0;
        totalComments += post.comments_count || 0;
      });

      const avgLikes = totalLikes / posts.length;
      const avgComments = totalComments / posts.length;
      
      // 4. Guardar en nuestra DB
      const stats: Omit<db.HashtagStats, 'stat_date'> = {
        hashtag: hashtag_name,
        avg_likes: avgLikes,
        avg_comments: avgComments,
        total_posts_analyzed: posts.length
      };
      await db.saveHashtagStats(stats);
      
      const text = `📊 Análisis de #${hashtag_name} (basado en ${posts.length} posts populares):\n` +
                   `  - Promedio de Likes: ${avgLikes.toFixed(2)} ❤️\n` +
                   `  - Promedio de Comentarios: ${avgComments.toFixed(2)} 💬\n` +
                   `\n✅ Estadísticas guardadas en la base de datos para futuras comparaciones.`;
      
      return { content: [{ type: "text", text }] };
    }

    // --- ¡NUEVO CASE! ---
    case "compare_my_stats_to_hashtag": {
      const { hashtag_name } = args as any;

      console.error(`Analytics: 📊 Comparando tu perfil vs #${hashtag_name}...`);

      // 1. Obtener tus estadísticas promedio (de tus últimos 30 posts)
      const myPosts = await getIgPosts(30);
      let myTotalLikes = 0;
      let myTotalComments = 0;
      myPosts.forEach((p: any) => {
        myTotalLikes += p.like_count || 0;
        myTotalComments += p.comments_count || 0;
      });
      const myAvgEngagement = (myTotalLikes + myTotalComments) / myPosts.length;

      // 2. Obtener las estadísticas del hashtag (de nuestra DB)
      const hashtagStats = await db.getHashtagStats(hashtag_name);
      if (!hashtagStats) {
        throw new Error(`No tengo datos guardados para #${hashtag_name}. Por favor, ejecuta 'analyze_hashtag_performance' primero.`);
      }
      const hashtagAvgEngagement = hashtagStats.avg_likes + hashtagStats.avg_comments;

      // 3. Calcular la diferencia
      const difference = myAvgEngagement - hashtagAvgEngagement;
      const percentageDiff = (difference / hashtagAvgEngagement) * 100;
      
      let text = `📊 Comparativa de Engagement (Tus 30 posts vs. #${hashtag_name}):\n\n`;
      text += `  - Tu Engagement Promedio: ${myAvgEngagement.toFixed(2)} (Likes+Comentarios)\n`;
      text += `  - #${hashtag_name} Engagement Promedio: ${hashtagAvgEngagement.toFixed(2)} (Likes+Comentarios)\n\n`;
      
      if (percentageDiff > 0) {
        text += `🏆 ¡Felicidades! Tu engagement es **${percentageDiff.toFixed(1)}% más alto** que el promedio de #${hashtag_name}.`;
      } else {
        text += `📉 Tu engagement es **${Math.abs(percentageDiff).toFixed(1)}% más bajo** que el promedio de #${hashtag_name}.`;
      }

      return { content: [{ type: "text", text }] };
    }
    
    default:
      throw new Error(`Herramienta de analytics desconocida: ${name}`);
  }
}