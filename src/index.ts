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
import { instagramTools, handleInstagramCall } from "./platforms/instagram.js";
import { facebookTools, handleFacebookCall } from "./platforms/facebook.js";
import { multiTools, handleMultiCall } from "./platforms/multi.js";
//import { threadsTools, handleThreadsCall } from "./platforms/threads.js"; 
import { filesystemTools, handleFilesystemCall } from "./platforms/filesystem.js";

// ==============================================================================
// INICIALIZACIÓN DEL SERVIDOR
// ==============================================================================
const server = new Server(
  {
    name: "social-media-mcp-server",
    version: "4.0.0",
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
    ...multiTools,
    //...threadsTools,
    ...filesystemTools
  ];
  
  return { tools: allTools };
});

// --- MANEJADOR DE LLAMADA DE HERRAMIENTA (EL "ROUTER") ---
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    let response; 
        // Lógica de enrutamiento (Router)

    if (name.startsWith("fs_")) { 
      console.error(`Enrutando a Filesystem: ${name}`);
      response = await handleFilesystemCall(name, args);
    }

    else if (name.startsWith("facebook_")) {
      console.error(`Enrutando a Facebook: ${name}`);
      response = await handleFacebookCall(name, args);
    } 
    //else if (name.startsWith("threads_")) { 
    //  console.error(`Enrutando a Threads: ${name}`);
    //  response = await handleThreadsCall(name, args);
    //}
    else if (name.startsWith("get_all_") || name.startsWith("compare_") || name.startsWith("suggest_")) {
      console.error(`Enrutando a Multi-plataforma: ${name}`);
      response = await handleMultiCall(name, args);
    }
    else { // Instagram al final
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
// FUNCIÓN PRINCIPAL DE ARRANQUE
// ==============================================================================
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  console.error("================================================");
  console.error("✅ Servidor MCP de Redes Sociales v4.0 iniciado");
  console.error("================================================");
  console.error(`   -> Cargadas ${instagramTools.length} herramientas de Instagram`);
  console.error(`   -> Cargadas ${facebookTools.length} herramientas de Facebook`);
  console.error(`   -> Cargadas ${threadsTools.length} herramientas de Threads`); // <-- NUEVO
  console.error(`   -> Cargadas ${multiTools.length} herramientas Multi-plataforma`);
  console.error(`☁️ Bucket: ${process.env.AWS_S3_BUCKET}`);
}

main().catch((error) => {
  console.error("💥 Error fatal al iniciar:", error);
  process.exit(1);
});