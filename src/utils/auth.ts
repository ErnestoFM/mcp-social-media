// src/platforms/instagram.ts
// src/utils/auth.ts
import dotenv from "dotenv";

/**
 * Carga las variables de entorno desde .env
 * ¡Este debe ser el PRIMER import en tu index.ts!
 */
export function loadEnv() {
  dotenv.config();
}

/**
 * Verifica que todas las variables de entorno necesarias estén presentes.
 * Llama a esto en tu 'main()' antes de iniciar el servidor.
 */
export function validateEnvVariables() {
  const requiredEnv = [
    // AWS
    "AWS_REGION",
    "AWS_ACCESS_KEY_ID",
    "AWS_SECRET_ACCESS_KEY",
    "AWS_S3_BUCKET",
    "DYNAMODB_TABLE_NAME",
    
    // Instagram
    "INSTAGRAM_API_URL",
    "INSTAGRAM_ACCESS_TOKEN",
    "INSTAGRAM_USER_ID",

    // Facebook
    "FACEBOOK_PAGE_ID",
    "FACEBOOK_PAGE_ACCESS_TOKEN",

    "FILESYSTEM_SANDBOX"
  ];

  const missingEnv = [];

  for (const envVar of requiredEnv) {
    if (!process.env[envVar]) {
      missingEnv.push(envVar);
    }
  }

  if (missingEnv.length > 0) {
    console.error("❌ Error Fatal: Faltan variables de entorno críticas:");
    console.error(missingEnv.join("\n"));
    throw new Error("Faltan variables de entorno. Revisa tu archivo .env");
  }

  console.error("✅ Todas las variables de entorno están cargadas y validadas.");
}