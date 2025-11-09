// src/index.ts

// ¡PASO 1: Cargar y validar ENV primero que nada!
import { loadEnv, validateEnvVariables } from "./utils/auth.js";
loadEnv();
validateEnvVariables(); 

// --- Ahora el resto de tus importaciones ---
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

// --- Importar nuestros módulos de plataforma ---
import { instagramTools, handleInstagramCall, publish_photo_from_url as igPublish } from "./platforms/instagram.js";
import { facebookTools, handleFacebookCall, publish_photo as fbPublish } from "./platforms/facebook.js";
import { multiTools, handleMultiCall } from "./platforms/multi.js";
//import { threadsTools, handleThreadsCall } from "./platforms/threads.js"; 
import { filesystemTools, handleFilesystemCall } from "./platforms/filesystem.js";
import { generativeTools, handleGenerativeCall } from "./platforms/generative.js";
import { schedulerTools, handleSchedulerCall } from "./platforms/scheduler.js";
import { analyticsTools, handleAnalyticsCall } from "./platforms/analytics.js";

// --- Importar lógica de DB para el "Reloj" ---
import * as db from "./utils/database.js";

// ==============================================================================
// INICIALIZACIÓN DEL SERVIDOR
// ==============================================================================
const server = new Server(
  {
    name: "social-media-mcp-server",
    version: "5.0.0", // ¡Versión 5 con todo!
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
      console.error(`Enrutando a Filesystem: ${name}`);
      response = await handleFilesystemCall(name, args);
    }
    else if (name.startsWith("facebook_")) {
      console.error(`Enrutando a Facebook: ${name}`);
      response = await handleFacebookCall(name, args);
    }
    // else if (name.startsWith("threads_")) { 
    //  console.error(`Enrutando a Threads: ${name}`);
    //  response = await handleThreadsCall(name, args);
    // }
    else if (name.startsWith("generate_") || name.startsWith("ai_")) {
      console.error(`Enrutando a Generative (Gemini): ${name}`);
      response = await handleGenerativeCall(name, args);
    }
    else if (name.startsWith("schedule_") || name.startsWith("list_sched") || name.startsWith("cancel_sched")) {
      console.error(`Enrutando a Scheduler: ${name}`);
      response = await handleSchedulerCall(name, args);
    }
    else if (name.startsWith("track_") || name.startsWith("list_collab") || name.startsWith("cancel_collab") || name.startsWith("analyze_") || name.startsWith("compare_my_")) {
      console.error(`Enrutando a Analytics: ${name}`);
      response = await handleAnalyticsCall(name, args);
    }
    else if (name.startsWith("get_all_") || name.startsWith("compare_post_") || name.startsWith("suggest_")) {
      console.error(`Enrutando a Multi-plataforma: ${name}`);
      response = await handleMultiCall(name, args);
    }
    else { // Instagram (y herramientas de S3) al final
      console.error(`Enrutando a Instagram: ${name}`);
      response = await handleInstagramCall(name, args);
    }
    
    return response;

  } catch (error: any) {
    console.error(`❌ Error en el manejador principal: ${name}`);
    console.error(error.message);
    
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
  console.log("Scheduler: ⏰ Buscando posts pendientes...");
  
  const duePosts = await db.getDueScheduledPosts();
  if (duePosts.length === 0) {
    console.log("Scheduler: 😌 No hay posts pendientes por ahora.");
    return;
  }

  console.log(`Scheduler: 🚀 ¡Encontrados ${duePosts.length} posts para publicar!`);

  for (const post of duePosts) {
    console.log(`Scheduler: Publicando Post ID: ${post.post_id}`);
    try {
      let publishedPlatforms = [];
      
      // Publicar en cada plataforma
      if (post.platforms.includes('instagram')) {
        await igPublish(post.s3_url, post.caption); // Llama a la lógica interna de IG
        publishedPlatforms.push('Instagram');
      }
      if (post.platforms.includes('facebook')) {
        // (Asumiendo que refactorizaste fbPublish para tomar url y caption)
        // await fbPublish(post.s3_url, post.caption); 
        // publishedPlatforms.push('Facebook');
      }
      // ... (añadir lógica de threads si se activa)

      // Marcar como publicado
      await db.updateScheduledPostStatus(post.post_id, 'PUBLISHED');
      console.log(`Scheduler: ✅ Post ${post.post_id} publicado en [${publishedPlatforms.join(', ')}]`);

    } catch (error: any) {
      console.error(`Scheduler: ❌ Error al publicar ${post.post_id}:`, error.message);
      await db.updateScheduledPostStatus(post.post_id, 'FAILED', error.message);
    }
  }
}

// ==============================================================================
// FUNCIÓN PRINCIPAL DE ARRANQUE
// ==============================================================================
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  console.error("================================================");
  console.error("✅ Servidor MCP de Redes Sociales v5.0 iniciado");
  console.error("================================================");
  console.error(`   -> Cargadas ${instagramTools.length} herramientas de Instagram`);
  console.error(`   -> Cargadas ${facebookTools.length} herramientas de Facebook`);
  //console.error(`   -> Cargadas ${threadsTools.length} herramientas de Threads`);
  console.error(`   -> Cargadas ${multiTools.length} herramientas Multi-plataforma`);
  console.error(`   -> Cargadas ${generativeTools.length} herramientas Generativas (Gemini)`);
  console.error(`   -> Cargadas ${schedulerTools.length} herramientas de Programador`);
  console.error(`   -> Cargadas ${analyticsTools.length} herramientas de Analíticas`);
  console.error(`☁️ Bucket S3: ${process.env.AWS_S3_BUCKET}`);
  console.error(`🗄️ Tabla Stats: ${process.env.DYNAMODB_TABLE_NAME}`);
  console.error(`🗄️ Tabla Collabs: ${process.env.DYNAMODB_COLLAB_TABLE_NAME}`);
  console.error(`🗄️ Tabla Hashtags: ${process.env.DYNAMODB_HASHTAG_TABLE_NAME}`);
  console.error(`🗄️ Tabla Scheduler: ${process.env.SCHEDULED_TABLE_NAME}`); // (¡Asegúrate de añadir esta variable!)
  console.error(`📁 Sandbox: ${process.env.FILESYSTEM_SANDBOX}`);

  // ¡AQUÍ INICIA EL RELOJ!
  console.error("================================================");
  console.error("⏰ Iniciando el programador de posts (revisión cada 60s)");
  console.error("================================================");
  
  // Revisa inmediatamente al iniciar
  checkAndPublishDuePosts(); 
  
  // Y luego revisa cada 60 segundos
  setInterval(checkAndPublishDuePosts, 60000); 
}

main().catch((error) => {
  console.error("💥 Error fatal al iniciar:", error);
  process.exit(1);
});