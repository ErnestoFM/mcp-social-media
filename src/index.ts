import 'dotenv/config';
import { validateEnvVariables } from "./utils/auth.js";
import * as db from "./utils/database.js"; // Importar DB para el "Reloj"
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

// --- Importar nuestros módulos de plataforma ---
import { instagramTools, handleInstagramCall, publish_photo_from_url as igPublish } from "./platforms/instagram.js";
import { facebookTools, handleFacebookCall, publish_photo_from_url as fbPublish } from "./platforms/facebook.js";
import { multiTools, handleMultiCall } from "./platforms/multi.js";
//import { threadsTools, handleThreadsCall } from "./platforms/threads.js"; 
import { filesystemTools, handleFilesystemCall } from "./platforms/filesystem.js";
import { generativeTools, handleGenerativeCall } from "./platforms/generative.js";
import { schedulerTools, handleSchedulerCall } from "./platforms/scheduler.js";
import { analyticsTools, handleAnalyticsCall } from "./platforms/analytics.js";
import { logger } from "./utils/loggers.js";
import { log, time } from "console";

validateEnvVariables(); // Verificar ENV antes de continuar
// ==============================================================================
// INICIALIZACIÓN DEL SERVIDOR
// ==============================================================================
const server = new Server(
  {
    name: "social-media-mcp-server",
    version: "5.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// ==============================================================================
// MANEJADORES DE PETICIONES (REQUEST HANDLERS)
// ==============================================================================

// --- MANEJADOR DE LISTA DE HERRAMIENTAS ---
server.setRequestHandler(ListToolsRequestSchema, async () => {
  const allTools = [
    ...instagramTools,
    ...facebookTools,
    //...threadsTools,
    ...multiTools,
    ...filesystemTools,
    ...generativeTools,
    ...schedulerTools,
    ...analyticsTools,
  ];
  
  return { tools: allTools };
});

// --- MANEJADOR DE LLAMADA DE HERRAMIENTA (EL "ROUTER") ---
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    let response; 
    
    // Lógica de enrutamiento por prefijo
    if (name.startsWith("fs_")) { 
      logger.info(`Enrutando a Filesystem: ${name}`);
      response = await handleFilesystemCall(name, args);
    }
    else if (name.startsWith("facebook_")) {
      logger.info(`Enrutando a Facebook: ${name}`);
      response = await handleFacebookCall(name, args);
    }
    // else if (name.startsWith("threads_")) { ... }
    else if (name.startsWith("generate_") || name.startsWith("ai_")) {
      logger.info(`Enrutando a Generative (Gemini): ${name}`);
      response = await handleGenerativeCall(name, args);
    }
    else if (name.startsWith("schedule_") || name.startsWith("list_sched") || name.startsWith("cancel_sched")) {
      logger.info(`Enrutando a Scheduler: ${name}`);
      response = await handleSchedulerCall(name, args);
    }
    else if (name.startsWith("track_") || name.startsWith("list_collab") || name.startsWith("cancel_collab") || name.startsWith("analyze_") || name.startsWith("compare_my_")) {
      logger.info(`Enrutando a Analytics: ${name}`);
      response = await handleAnalyticsCall(name, args);
    }

    else if (
      name.startsWith("get_all_") || 
      name.startsWith("compare_post_") || 
      name.startsWith("suggest_") ||
      name.startsWith("run_daily_snapshot") || 
      name.startsWith("get_growth_report") || 
      name.startsWith("get_full_comparison_") || 
      name.startsWith("send_growth_report_") ||
      name.startsWith("moderate_spam_")
    ) {
      logger.info(`Enrutando a Multi-plataforma: ${name}`);
      response = await handleMultiCall(name, args);
    }
    else { // Instagram (y herramientas de S3) al final
      logger.info(`Enrutando a Instagram: ${name}`);
      response = await handleInstagramCall(name, args);
    }
    
    return response;

  } catch (error: any) {
    logger.error("Error en el manejador principal", {
      toolName: name,
      error: error.message,
      stack: error.stack,
      response: error.response?.data?.error?.message || null,
      args: args // Incluye los argumentos que causaron el error
    });
    
    return {
      content: [
        {
          type: "text",
          text: `❌ Error al ejecutar "${name}":\n\n${error.response?.data?.error?.message || error.message}`,
        },
      ],
      isError: true,
    };
  }
});

// ==============================================================================
// LÓGICA DEL "TRABAJADOR" (WORKER) DEL SCHEDULER
// ==============================================================================
async function checkAndPublishDuePosts() {
  // ¡EL TRY...CATCH GENERAL EMPIEZA AQUÍ!
const startTime = Date.now();
let successCount = 0;
let failCount = 0;
  try {
    logger.info("Scheduler: ⏰ Buscando posts pendientes..."); 
    
    const duePosts = await db.getDueScheduledPosts();
    if (duePosts.length === 0) {
      logger.info("Scheduler: 😌 No hay posts pendientes por ahora.");
      return;
    }

    logger.debug(`Scheduler: 🚀 ¡Encontrados ${duePosts.length} posts para publicar!`);

    for (const post of duePosts) {
      logger.info(`Scheduler: Publicando Post ID: ${post.post_id}`);
      
      // Un try...catch interno para cada post individual
      try {
        let publishedPlatforms: string[] = [];
        
        if (post.platforms.includes('instagram')) {
          await igPublish(post.s3_url, post.caption); 
          publishedPlatforms.push('Instagram');
        }
        if (post.platforms.includes('facebook')) {
          // ¡CORRECCIÓN 1! (Llamando a la función importada)
          await fbPublish(post.s3_url, post.caption); 
          publishedPlatforms.push('Facebook');
        }
        
        await db.updateScheduledPostStatus(post.post_id, 'PUBLISHED');
        logger.debug(`Scheduler: ✅ Post ${post.post_id} publicado en [${publishedPlatforms.join(', ')}]`);

      } catch (error: any) {
        // Si un post falla, lo marcamos y continuamos con el siguiente
        logger.error("Scheduler: ❌ Error al publicar:", {postId: post.post_id,  error: error.message, stack: error.stack });
        await db.updateScheduledPostStatus(post.post_id, 'FAILED', error.message);
      }
    }
  }catch (err: any) {
    // Atrapa errores al *iniciar* la función (ej. error de DB o de índice)
    logger.error("================================================");
    logger.error("💥 ERROR CRÍTICO EN EL SCHEDULER (¡El servidor sigue vivo!)");
    logger.error(`Mensaje: ${err.message}`);
    logger.error("================================================", {
      error: err,
      stack: err.stack,
      timestamp: new Date().toISOString(),
      errorType: err.name || 'UnknownError'
    });
  }
}

// ==============================================================================
// FUNCIÓN PRINCIPAL DE ARRANQUE
// ==============================================================================
async function main() {

  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  logger.info("================================================");
  logger.info("✅ Servidor MCP de Redes Sociales v5.0 iniciado");
  logger.info("================================================");
  logger.info(`   -> Cargadas ${instagramTools.length} herramientas de Instagram`);
  logger.info(`   -> Cargadas ${facebookTools.length} herramientas de Facebook`);
  //console.error(`   -> Cargadas ${threadsTools.length} herramientas de Threads`);
  logger.info(`   -> Cargadas ${multiTools.length} herramientas Multi-plataforma`);
  logger.info(`   -> Cargadas ${generativeTools.length} herramientas Generativas (Gemini)`);
  logger.info(`   -> Cargadas ${schedulerTools.length} herramientas de Programador`);
  logger.info(`   -> Cargadas ${analyticsTools.length} herramientas de Analíticas`);
  logger.info(`☁️ Bucket S3: ${process.env.AWS_S3_BUCKET}`);
  logger.info(`🗄️ Tabla Stats: ${process.env.DYNAMODB_TABLE_NAME}`);
  logger.info(`🗄️ Tabla Collabs: ${process.env.DYNAMODB_COLLAB_TABLE_NAME}`);
  logger.info(`🗄️ Tabla Hashtags: ${process.env.DYNAMODB_HASHTAG_TABLE_NAME}`);
  logger.info(`𗄄️ Tabla Scheduler: ${process.env.SCHEDULED_TABLE_NAME}`); 
  // ¡CORRECCIÓN 3! Eliminado el '_LOCAL'
  logger.info(`📁 Sandbox: ${process.env.FILESYSTEM_SANDBOX}`);

  // ¡AQUÍ INICIA EL RELOJ!
  logger.info("================================================");
  logger.info("⏰ Iniciando el programador de posts (revisión cada 60s)");
  logger.info("================================================");
  
  // Revisa inmediatamente al iniciar
  checkAndPublishDuePosts(); 
  
 // Y luego revisa cada 60 segundos
    setInterval(checkAndPublishDuePosts, 60000);

}

main().catch((error:any) => {
  logger.error("💥 Error fatal al iniciar", {
    message: error?.message ?? String(error),
    stack: error?.stack ?? null,
    time
  });
  process.exit(1);
});