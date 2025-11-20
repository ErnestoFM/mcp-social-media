// src/server.ts

// ¡PASO 1: Cargar y validar ENV primero que nada!
import 'dotenv/config';
import { validateEnvVariables, validateOptionalEnvVariables, logEnvironmentSummary } from "./utils/auth.js";

// Validar variables de entorno antes de hacer cualquier cosa
try {
  validateEnvVariables();
  validateOptionalEnvVariables();
  logEnvironmentSummary();
} catch (error: any) {
  console.error("💥 Error fatal al validar variables de entorno:", error.message);
  process.exit(1);
}

import express from "express";
import cors from "cors"; // Importante para permitir que tu frontend hable con este backend
import { logger } from "./utils/loggers.js";

// --- Importar TODOS tus manejadores de lógica ---
import { handleInstagramCall } from "./platforms/instagram.js";
import { handleFacebookCall } from "./platforms/facebook.js";
import { handleMultiCall } from "./platforms/multi.js";
import { handleFilesystemCall } from "./platforms/filesystem.js";
import { handleGenerativeCall } from "./platforms/generative.js";
import { handleSchedulerCall } from "./platforms/scheduler.js";
import { handleAnalyticsCall } from "./platforms/analytics.js";

// ==============================================================================
// 1. INICIALIZACIÓN DEL SERVIDOR WEB
// ==============================================================================

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173', // URL de tu frontend
  credentials: true
}));
app.use(express.json({ limit: '10mb' })); // Permite al servidor entender JSON (con límite de 10MB)
app.use(express.urlencoded({ extended: true }));

// Middleware de logging para todas las peticiones
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.path}`, {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip
    });
  });
  
  next();
});

// ==============================================================================
// 2. RUTAS DE SALUD Y PRUEBA
// ==============================================================================

// Ruta de "health check"
app.get("/", (req, res) => {
  res.json({
    status: "online",
    message: "¡El servidor API está vivo!",
    timestamp: new Date().toISOString(),
    version: "1.0.0"
  });
});

// Ruta de health check detallada
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    services: {
      instagram: !!process.env.INSTAGRAM_ACCESS_TOKEN,
      facebook: !!process.env.FACEBOOK_PAGE_ACCESS_TOKEN,
      aws: !!process.env.AWS_ACCESS_KEY_ID,
      gemini: !!process.env.GEMINI_API_KEY
    }
  });
});

// ==============================================================================
// 3. EL "TRADUCTOR" (API a MCP)
// ==============================================================================

// Este es el "enchufe" principal para tu frontend.
// Tu React llamará a esta ruta: POST http://localhost:3000/api/tool-call
app.post("/api/tool-call", async (req, res) => {
  const { name, args } = req.body;

  // Validación de entrada
  if (!name) {
    logger.warn("❌ Petición a /api/tool-call sin nombre de herramienta", { 
      body: req.body,
      ip: req.ip 
    });
    return res.status(400).json({ 
      error: "Falta el parámetro 'name' (nombre de la herramienta)" 
    });
  }

  if (args === undefined) {
    logger.warn("❌ Petición a /api/tool-call sin argumentos", { 
      toolName: name,
      ip: req.ip 
    });
    return res.status(400).json({ 
      error: "Falta el parámetro 'args' (argumentos de la herramienta)" 
    });
  }

  logger.info(`📞 API: Llamada a herramienta recibida: ${name}`, {
    toolName: name,
    argsKeys: Object.keys(args),
    ip: req.ip
  });

  try {
    let response;
    
    // Enrutamiento de herramientas (mismo que index.ts)
    if (name.startsWith("fs_")) { 
      logger.debug(`🗂️  Enrutando a Filesystem: ${name}`);
      response = await handleFilesystemCall(name, args);
    }
    else if (name.startsWith("facebook_")) {
      logger.debug(`📘 Enrutando a Facebook: ${name}`);
      response = await handleFacebookCall(name, args);
    }
    else if (name.startsWith("generate_") || name.startsWith("ai_")) {
      logger.debug(`🧠 Enrutando a Generative (Gemini): ${name}`);
      response = await handleGenerativeCall(name, args);
    }
    else if (name.startsWith("schedule_") || name.startsWith("list_sched") || name.startsWith("cancel_sched")) {
      logger.debug(`⏰ Enrutando a Scheduler: ${name}`);
      response = await handleSchedulerCall(name, args);
    }
    else if (name.startsWith("track_") || name.startsWith("list_collab") || name.startsWith("cancel_collab") || name.startsWith("analyze_") || name.startsWith("compare_my_")) {
      logger.debug(`📊 Enrutando a Analytics: ${name}`);
      response = await handleAnalyticsCall(name, args);
    }
    else if (name.startsWith("get_all_") || name.startsWith("compare_post_") || name.startsWith("suggest_") || name.startsWith("run_daily_snapshot") || name.startsWith("get_growth_report") || name.startsWith("get_full_comparison_") || name.startsWith("send_growth_report_") || name.startsWith("moderate_spam_")) {
      logger.debug(`🔀 Enrutando a Multi-plataforma: ${name}`);
      response = await handleMultiCall(name, args);
    }
    else { // Instagram por defecto
      logger.debug(`📸 Enrutando a Instagram: ${name}`);
      response = await handleInstagramCall(name, args);
    }
    
    // Verificar si la respuesta indica un error
    if (response && typeof response === 'object' && 'isError' in response && response.isError) {
      logger.error(`❌ La herramienta ${name} devolvió un error`, { response });
      return res.status(500).json(response);
    }
    
    logger.info(`✅ Herramienta ${name} ejecutada exitosamente`);
    return res.status(200).json(response);

  } catch (error: any) {
    logger.error(`💥 Error crítico al ejecutar herramienta: ${name}`, {
      toolName: name,
      error: error.message,
      stack: error.stack,
      args: args,
      ip: req.ip
    });
    
    return res.status(500).json({
      error: `Error al ejecutar ${name}`,
      details: error.message,
      content: [{ 
        type: "text", 
        text: `❌ Error en el servidor: ${error.message}` 
      }],
      isError: true,
    });
  }
});

// ==============================================================================
// 4. MANEJO DE ERRORES GLOBAL
// ==============================================================================

// Ruta no encontrada (404)
app.use((req, res) => {
  logger.warn(`⚠️  Ruta no encontrada: ${req.method} ${req.path}`, {
    method: req.method,
    path: req.path,
    ip: req.ip
  });
  
  res.status(404).json({
    error: "Ruta no encontrada",
    message: `La ruta ${req.method} ${req.path} no existe`,
    availableEndpoints: [
      "GET /",
      "GET /health",
      "POST /api/tool-call"
    ]
  });
});

// Manejo de errores global
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error("💥 Error no capturado en Express", {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip
  });

  res.status(500).json({
    error: "Error interno del servidor",
    message: err.message || "Ocurrió un error inesperado"
  });
});

// ==============================================================================
// 5. INICIAR EL SERVIDOR
// ==============================================================================

const server = app.listen(PORT, () => {
  logger.info("================================================");
  logger.info(`🚀 Servidor API Web iniciado exitosamente`);
  logger.info(`📍 URL: http://localhost:${PORT}`);
  logger.info(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`🔗 Frontend permitido: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
  logger.info("================================================");
});

// Manejo de cierre graceful
process.on('SIGTERM', () => {
  logger.info("⚠️  Señal SIGTERM recibida, cerrando servidor...");
  server.close(() => {
    logger.info("✅ Servidor cerrado correctamente");
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info("⚠️  Señal SIGINT recibida (Ctrl+C), cerrando servidor...");
  server.close(() => {
    logger.info("✅ Servidor cerrado correctamente");
    process.exit(0);
  });
});

// Capturar errores no manejados
process.on('unhandledRejection', (reason: any) => {
  logger.error("💥 Promesa rechazada no manejada", {
    reason: reason?.message || reason,
    stack: reason?.stack
  });
});

process.on('uncaughtException', (error: Error) => {
  logger.error("💥 Excepción no capturada", {
    error: error.message,
    stack: error.stack
  });
  process.exit(1);
});

export default app;