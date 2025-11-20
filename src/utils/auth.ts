import { logger } from './loggers.js';

/**
 * Verifica que todas las variables de entorno necesarias estén presentes.
 * Llama a esto en tu 'main()' antes de iniciar el servidor.
 */
export function validateEnvVariables(): void {
  logger.info('🔍 Validando variables de entorno...');
  
  const requiredEnv = [
    // AWS
    "AWS_REGION",
    "AWS_ACCESS_KEY_ID",
    "AWS_SECRET_ACCESS_KEY",
    "AWS_S3_BUCKET",
    "DYNAMODB_TABLE_NAME",
    "DYNAMODB_SCHEDULED_TABLE_NAME",
    "DYNAMODB_HASHTAG_TABLE_NAME",
    "DYNAMODB_COLLAB_TABLE_NAME",
    
    // Gemini AI
    "GEMINI_API_KEY",
    
    // Instagram
    "INSTAGRAM_API_URL",
    "INSTAGRAM_ACCESS_TOKEN",
    "INSTAGRAM_USER_ID",

    // Facebook
    "FACEBOOK_PAGE_ID",
    "FACEBOOK_PAGE_ACCESS_TOKEN",

    // Sistema de archivos
    "FILESYSTEM_SANDBOX_LOCAL"
  ];

  const missingEnv: string[] = [];
  const presentEnv: string[] = [];

  for (const envVar of requiredEnv) {
    if (!process.env[envVar]) {
      missingEnv.push(envVar);
    } else {
      presentEnv.push(envVar);
    }
  }

  if (missingEnv.length > 0) {
    logger.error("================================================");
    logger.error("❌ ERROR FATAL: Faltan variables de entorno críticas");
    logger.error("================================================");
    logger.error(`Total faltantes: ${missingEnv.length}/${requiredEnv.length}`);
    logger.error("Variables faltantes:", { missingVariables: missingEnv });
    logger.error("================================================");
    logger.error("👉 Acción requerida: Agrega estas variables a tu archivo .env");
    logger.error("================================================");
    
    // Log detallado para debugging
    logger.debug("Variables presentes:", { presentVariables: presentEnv });
    
    throw new Error(
      `Faltan ${missingEnv.length} variables de entorno críticas: ${missingEnv.join(", ")}`
    );
  }

  logger.info("================================================");
  logger.info("✅ TODAS LAS VARIABLES DE ENTORNO VALIDADAS");
  logger.info("================================================");
  logger.info(`Total validadas: ${requiredEnv.length} variables`);
  logger.debug("Variables cargadas:", { 
    variables: presentEnv,
    count: presentEnv.length 
  });
  logger.info("================================================");
}

/**
 * Valida variables de entorno opcionales y muestra advertencias si faltan.
 * Útil para features no críticas.
 */
export function validateOptionalEnvVariables(): void {
  const optionalEnv = [
    "LOG_LEVEL",
    "PORT",
    "NODE_ENV"
  ];

  const missingOptional: string[] = [];

  for (const envVar of optionalEnv) {
    if (!process.env[envVar]) {
      missingOptional.push(envVar);
    }
  }

  if (missingOptional.length > 0) {
    logger.warn("⚠️  Variables de entorno opcionales faltantes:", {
      missingOptional,
      impact: "El servidor usará valores por defecto"
    });
  } else {
    logger.info("✅ Todas las variables opcionales están presentes");
  }
}

/**
 * Muestra un resumen de la configuración actual (sin exponer valores sensibles)
 */
export function logEnvironmentSummary(): void {
  logger.info("================================================");
  logger.info("📋 RESUMEN DE CONFIGURACIÓN");
  logger.info("================================================");
  logger.info(`Entorno: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`Región AWS: ${process.env.AWS_REGION}`);
  logger.info(`Bucket S3: ${process.env.AWS_S3_BUCKET}`);
  logger.info(`Instagram User ID: ${process.env.INSTAGRAM_USER_ID}`);
  logger.info(`Facebook Page ID: ${process.env.FACEBOOK_PAGE_ID}`);
  logger.info(`Log Level: ${process.env.LOG_LEVEL || 'info'}`);
  logger.info(`Sandbox Local: ${process.env.FILESYSTEM_SANDBOX_LOCAL}`);
  logger.info("================================================");
}