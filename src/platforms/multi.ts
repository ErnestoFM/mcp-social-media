// src/platforms/multi.ts

import { saveDailyStats, getStatsLastNDays, getGrowthAnalysis, compareAllPlatforms, Platform} from "../utils/database.js";
// IMPORTAMOS LA LÓGICA DE NEGOCIO DE TODOS LOS MÓDULOS
import { sendGrowthReportEmail } from "../utils/notifications.js";
import {
  get_profile as getIgProfile,
  get_comments as getIgComments,
  get_posts as getIgPosts,
  get_post_stats as getIgPostStats
} from "./instagram.js";

import {
  get_page_details as getFbPageDetails,
  get_comments as getFbComments,
  get_posts as getFbPosts,
  get_post_stats as getFbPostStats
} from "./facebook.js";

// --- IMPORTACIONES DE THREADS DESACTIVADAS ---
// import {
//     get_user_threads as getThreads,
//     get_thread_replies as getThreadReplies,
//     get_thread_stats as getThreadStats
// } from "./threads.js";

/**
 * Función genérica para obtener estadísticas y guardarlas en la DB.
 * Es un helper interno, no se expone como herramienta.
 */
async function snapshotCurrentStats(
  platform: 'instagram' | 'facebook', // <-- CORREGIDO: Eliminado 'threads'
  // Le pasamos una función que sabe cómo obtener los datos
  getCurrentStats: () => Promise<{ followers: number; posts_count: number }>
) {
  console.error(`DB: 📸 Tomando snapshot de ${platform}...`);

  try {
    // 1. Llama a la función específica (ej. getIgProfile)
    const stats = await getCurrentStats();
    
    // 2. Llama a la DB para guardar los datos
    await saveDailyStats(platform, stats);
    console.error(`DB: ✅ Snapshot completado para ${platform}`);
  } catch (error: any) {
    console.error(`DB: ❌ Error en snapshot de ${platform}:`, error.message);
    // Lanzamos el error para que Promise.allSettled lo capture
    throw new Error(`Fallo en snapshot de ${platform}: ${error.message}`);
  }
}

// ==============================================================================
// DEFINICIÓN DE HERRAMIENTAS (CORREGIDO)
// ==============================================================================

export const multiTools = [
{
    name: "send_growth_report_by_email",
    description: "Genera un reporte de crecimiento (últimos 30 días) y lo envía a un correo.",
    inputSchema: {
      type: "object",
      properties: {
        platform: {
          type: "string",
          enum: ["instagram", "facebook"],
          description: "La plataforma para analizar."
        },
        email: {
          type: "string",
          description: "El correo del destinatario (Debe estar verificado en AWS SES)."
        }
      },
      required: ["platform", "email"],
    },
  },
    {
    name: "run_daily_snapshot",
    description: "Toma una 'foto' de las estadísticas actuales (seguidores, posts) de Instagram y Facebook y las guarda en la base de datos.", // <-- CORREGIDO
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "get_growth_report",
    description: "Genera un reporte de crecimiento (seguidores, posts) para una plataforma usando los datos guardados en la base de datos.",
    inputSchema: {
      type: "object",
      properties: {
        platform: {
          type: "string",
          enum: ["instagram", "facebook"], // <-- CORREGIDO
          description: "La plataforma para analizar."
        },
        days: {
          type: "number",
          default: 30,
          description: "El número de días hacia atrás para el análisis."
        }
      },
      required: ["platform"],
    },
  },
  {
    name: "get_full_comparison_report",
    description: "Compara el crecimiento de Instagram y Facebook en los últimos 30 días.", // <-- CORREGIDO
    inputSchema: {
      type: "object",
      properties: {
        days: {
          type: "number",
          default: 30
        }
      }
    }
  },  
    {
    name: "get_all_stats",
    description: "Obtiene estadísticas de perfil de alto nivel de Instagram y Facebook.",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "compare_post_engagement",
    description: "Compara el rendimiento (likes, comments) de posts en Instagram y Facebook. Proporciona al menos un ID.", // <-- CORREGIDO
    inputSchema: {
      type: "object",
      properties: {
        instagram_post_id: {
          type: "string",
          description: "El ID del post de Instagram a comparar (opcional).",
        },
        facebook_post_id: {
          type: "string",
          description: "El ID del post de Facebook a comparar (opcional).",
        },
        // --- BLOQUE DE THREADS COMENTADO ---
        // threads_post_id: {
        //   type: "string",
        //   description: "El ID del post (hilo) de Threads a comparar (opcional).",
        // }
      },
    },
  },
  {
    name: "suggest_platform",
    description: "Sugiere la mejor plataforma (Instagram o Facebook) para publicar basado en una descripción del contenido.", // <-- CORREGIDO
    inputSchema: {
      type: "object",
      properties: {
        content_description: {
          type: "string",
          description: "Una breve descripción del post. Ej: 'un video corto divertido', 'un artículo de blog sobre IA', 'una foto de alta calidad de un paisaje'",
        },
      },
      required: ["content_description"],
    },
  },
  {
    name: "get_all_comments",
    description: "Obtiene comentarios/respuestas de posts en Instagram y Facebook. Proporciona al menos un ID.", // <-- CORREGIDO
    inputSchema: {
      type: "object",
      properties: {
        instagram_post_id: {
          type: "string",
          description: "El ID del post de Instagram (opcional).",
        },
        facebook_post_id: {
          type: "string",
          description: "El ID del post de Facebook (opcional).",
        }
        // --- BLOQUE DE THREADS COMENTADO ---
        // threads_post_id: {
        //   type: "string",
        //   description: "El ID del post (hilo) de Threads (opcional).",
        // }
      },
    },
  },
];

// ==============================================================================
// 2. LÓGICA DEL MANEJADOR (HANDLER) (CORREGIDO)
// ==============================================================================

export async function handleMultiCall(
  name: string,
  args: any
) {

  switch (name) {
    case "send_growth_report_by_email": {
      const { platform, email } = args as any;
      
      // 1. Obtener el análisis (reutilizando tu lógica de DB)
      console.log(`Multi: 📊 Generando reporte para email...`);
      const analysis = await getGrowthAnalysis(platform, 30); // 30 días

      if ('error' in analysis) {
        throw new Error(`Error al generar reporte: ${analysis.error}`);
      }

      // 2. Enviar el correo (usando el nuevo módulo)
      await sendGrowthReportEmail(analysis, email);
      
      return {
        content: [{ 
          type: "text", 
          text: `✅ ¡Reporte de ${platform} enviado exitosamente a ${email}!` 
        }]
      };
    }
    case "run_daily_snapshot": {
      console.error("Multi: 🏃 Ejecutando snapshot diario para todas las plataformas...");

      const results = await Promise.allSettled([
        // --- Snapshot de Instagram ---
        snapshotCurrentStats('instagram', async () => {
          const profile = await getIgProfile();
          return {
            followers: profile.followers_count,
            posts_count: profile.media_count
          };
        }),

        // --- Snapshot de Facebook ---
        snapshotCurrentStats('facebook', async () => {
          const details = await getFbPageDetails(); // Asumiendo que getFbPageDetails fue actualizado
          return {
            followers: details.fan_count,
            posts_count: details.posts_count
          };
        }),

        // --- Snapshot de Threads (COMENTADO) ---
        // snapshotCurrentStats('threads', ...),
      ]);

      // Construir un reporte de lo que se hizo
      let log = "Reporte del Snapshot Diario:\n";
      results.forEach((res, i) => {
        const platform = ['Instagram', 'Facebook'][i]; // <-- CORREGIDO: Eliminado 'Threads'
        if (platform) { // <-- Añadida comprobación
          if (res.status === 'fulfilled') {
            log += `  ✅ ${platform}: Snapshot guardado.\n`;
          } else {
            log += `  ❌ ${platform}: Falló (${res.reason?.message})\n`;
          }
        }
      });

      return { content: [{ type: "text", text: log }] };
    }

    case "get_growth_report": {
      const { platform, days } = args as any;
      // Añadida validación por si se pide 'threads'
      if (platform === 'threads') {
        throw new Error("El análisis de Threads está desactivado temporalmente.");
      }
      console.error(`Multi: 📊 Generando reporte de ${platform} para ${days} días...`);
      
      const analysis = await getGrowthAnalysis(platform, days);

      if ('error' in analysis) {
        return { content: [{ type: "text", text: `No se pudo generar el reporte: ${analysis.error}` }] };
      }
      
      const reportText = 
`📊 Reporte de Crecimiento (${platform})
------------------------------
Período: ${analysis.period.days} días (de ${analysis.period.start} a ${analysis.period.end})

📈 Seguidores:
   - Empezó con: ${analysis.followers.start}
   - Terminó con: ${analysis.followers.end}
   - Crecimiento: ${analysis.followers.growth}
   - Tasa: ${analysis.followers.growthRate}

📝 Posts:
   - Empezó con: ${analysis.posts.start} (Total)
   - Terminó con: ${analysis.posts.end} (Total)
   - Nuevos Posts: ${analysis.posts.growth}
   - Promedio/día: ${analysis.posts.avgPerDay}
`;
      return { content: [{ type: "text", text: reportText }] };
    }

    case "get_full_comparison_report": {
        const { days } = args as any;
        console.error(`Multi: 📊 Comparando todas las plataformas (${days} días)...`);
        
        // ¡DEBES CORREGIR 'compareAllPlatforms' en database.ts para que no llame a 'threads'!
        const report = await compareAllPlatforms(days); // Asumiendo que fue corregido
        
        let text = `📊 Comparativa Global (${report.period})\n`;
        text += `------------------------------\n`;
        text += `🏆 Plataforma con Mejor Crecimiento: ${report.summary.bestGrowthPlatform}\n`;
        text += `👥 Total Seguidores (Redes Activas): ${report.summary.totalFollowers}\n\n`;

        for (const p of ['instagram', 'facebook']) { // <-- CORREGIDO: Eliminado 'threads'
          const data = report.platforms[p as Platform];
          text += `--- ${p.toUpperCase()} ---\n`;
          
          if ('error' in data) {
            text += `  Error: ${data.error}\n\n`;
          } else {
            text += `  📈 Crecimiento Seguidores: ${data.followers.growth} (${data.followers.growthRate})\n`;
            text += `  📝 Nuevos Posts: ${data.posts.growth}\n\n`;
          }
        }
        text += `--- THREADS ---\n  (Análisis desactivado)\n\n`; // <-- Añadido
        
        return { content: [{ type: "text", text }] };
    }

    case "get_all_stats": {
      console.error("Multi: Obteniendo estadísticas...");
      
      const results = await Promise.allSettled([
        getIgProfile(),
        getFbPageDetails()
      ]);

      let text = `📊 Estadísticas CombinADAS:\n\n`;

      // --- Instagram ---
      if (results[0].status === 'fulfilled') {
        const igProfile = results[0].value;
        text += `--- Instagram (@${igProfile.username}) ---\n` +
                `👥 Seguidores: ${igProfile.followers_count}\n` +
                `📷 Posts: ${igProfile.media_count}\n\n`;
      } else {
        text += `--- Instagram ---\n (Error al obtener datos: ${results[0].reason?.message})\n\n`;
      }

      // --- Facebook ---
      if (results[1].status === 'fulfilled') {
        const fbDetails = results[1].value;
        text += `--- Facebook (${fbDetails.name}) ---\n` +
                `👍 Fans: ${fbDetails.fan_count}\n` +
                `📝 Categoría: ${fbDetails.category || 'N/A'}\n`;
      } else {
        text += `--- Facebook ---\n (Error al obtener datos: ${results[1].reason?.message})\n`;
      }
      
      return { content: [{ type: "text", text }] };
    }

    case "compare_post_engagement": {
      const { instagram_post_id, facebook_post_id, threads_post_id } = args as any;
      
      // <-- CORREGIDO: Lanzar error si se intenta usar Threads
      if (threads_post_id) {
        throw new Error("La comparación de Threads está desactivada temporalmente.");
      }

      let text = `📊 Comparativa de Engagement:\n\n`;
      let promises = [];

      if (instagram_post_id) {
        promises.push(getIgPostStats(instagram_post_id).then(stats => ({
          platform: 'Instagram',
          caption: stats.caption?.substring(0, 50) || 'N/A',
          likes: stats.like_count || 0,
          comments: stats.comments_count || 0
        })));
      }
      if (facebook_post_id) {
        promises.push(getFbPostStats(facebook_post_id).then(stats => ({
          platform: 'Facebook',
          caption: stats.message?.substring(0, 50) || 'N/A',
          likes: stats.likes?.summary?.total_count || 0,
          comments: stats.comments?.summary?.total_count || 0
        })));
      }
      // --- BLOQUE DE THREADS COMENTADO ---
//       if (threads_post_id) {
//         promises.push(getThreadStats(threads_post_id).then(stats => ({
//           platform: 'Threads',
//           caption: stats.text?.substring(0, 50) || 'N/A',
//           likes: stats.like_count || 0,
//           comments: stats.replies_count || 0
//         })));
//       }

      if (promises.length === 0) {
        throw new Error("Debes proporcionar al menos un ID de post de Instagram o Facebook."); // <-- CORREGIDO
      }
      
      const results = await Promise.allSettled(promises);

      results.forEach(result => {
        if (result.status === 'fulfilled') {
          const stats = result.value;
          text += `--- ${stats.platform} Post ---\n` +
                  `"${stats.caption}..."\n` +
                  `❤️ Likes: ${stats.likes}\n` +
                  `💬 Comentarios/Respuestas: ${stats.comments}\n` +
                  `👉 Total: ${stats.likes + stats.comments}\n\n`;
        }
      });

      return { content: [{ type: "text", text }] };
  }

    case "get_all_comments": {
      const { instagram_post_id, facebook_post_id, threads_post_id } = args as any;
      
      // <-- CORREGIDO: Lanzar error si se intenta usar Threads
      if (threads_post_id) {
        throw new Error("La obtención de comentarios de Threads está desactivada temporalmente.");
      }

      let text = `💬 Comentarios y Respuestas Combinados:\n\n`;
      let promises = [];

      if (instagram_post_id) {
        promises.push(getIgComments(instagram_post_id).then(cs => ({ p: 'Instagram', cs })));
      }
      if (facebook_post_id) {
        promises.push(getFbComments(facebook_post_id).then(cs => ({ p: 'Facebook', cs })));
      }
      // --- BLOQUE DE THREADS COMENTADO ---
//       if (threads_post_id) {
//         promises.push(getThreadReplies(threads_post_id).then(rs => ({ p: 'Threads', cs: rs })));
//       }

      if (promises.length === 0) {
        throw new Error("Debes proporcionar al menos un ID de post de Instagram o Facebook."); // <-- CORREGIDO
      }

      const results = await Promise.allSettled(promises);

      results.forEach(result => {
        if (result.status === 'fulfilled') {
          const { p, cs } = result.value;
          text += `--- ${p} (${cs.length}) ---\n`;
          if (cs.length > 0) {
            cs.slice(0, 5).forEach((c: any) => {
              const user = c.username || c.from?.name || 'Usuario';
              const msg = c.text || c.message || '';
              text += `@${user}: "${msg.substring(0, 40)}..."\n`;
            });
          } else {
            text += "(Sin comentarios)\n";
          }
          text += "\n";
        }
      });

      return { content: [{ type: "text", text }] };
    }

    case "suggest_platform": {
      const { content_description } = args as any;
      const desc = content_description.toLowerCase();
      let suggestion = "";

      // --- LÓGICA CORREGIDA (Sin Threads) ---
      if (desc.includes("foto") || desc.includes("paisaje") || desc.includes("visual") || desc.includes("estético")) {
        suggestion = "Instagram (Post/Carrusel): Perfecto para contenido altamente visual y estético.";
      } else if (desc.includes("video corto") || desc.includes("divertido") || desc.includes("baile") || desc.includes("tendencia")) {
        suggestion = "Instagram Reels: El mejor formato para video corto vertical y de entretenimiento.";
      } else if (desc.includes("artículo") || desc.includes("blog") || desc.includes("enlace") || desc.includes("noticia") || desc.includes("texto corto") || desc.includes("conversación") || desc.includes("pregunta")) {
        suggestion = "Facebook: Mejor para compartir enlaces externos, texto largo e iniciar conversaciones.";
      } else if (desc.includes("anuncio") || desc.includes("evento")) {
        suggestion = "Facebook: Tiene mejores herramientas para promocionar eventos y anuncios formales.";
      } else {
        suggestion = "Cross-post (Instagram/Facebook): El contenido parece general. Publicar en IG y compartir en FB es una buena estrategia.";
      }

      return {
        content: [{
          type: "text",
          text: `🧠 Sugerencia de Plataforma:\n\n${suggestion}`
        }]
      };
    }

    default:
      throw new Error(`Herramienta desconocida de Multi-plataforma: ${name}`);
  }
}