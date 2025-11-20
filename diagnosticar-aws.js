// diagnosticar-aws.js
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadBucketCommand,
} from "@aws-sdk/client-s3";
import dotenv from "dotenv";

// Cargar variables de entorno del .env
dotenv.config();

// --- Cargar variables ---
const REGION = process.env.AWS_REGION;
const KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const SECRET_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const BUCKET = process.env.AWS_S3_BUCKET;
const TEST_KEY = "_mcp_diagnostic_test.txt";

async function diagnosticarAWS() {
  console.log("🔍 Diagnosticando configuración de AWS S3 y credenciales...\n");

  // --- 1. Verificación Previa (Variables de Entorno) ---
  console.log("--- Paso 1: Verificando variables .env ---");
  if (!REGION || !KEY_ID || !SECRET_KEY || !BUCKET) {
    console.error("❌ ERROR: Faltan variables de AWS en tu .env");
    console.log("Asegúrate de tener: \n- AWS_REGION\n- AWS_ACCESS_KEY_ID\n- AWS_SECRET_ACCESS_KEY\n- AWS_S3_BUCKET\n");
    return;
  }
  console.log("✅ Variables .env encontradas.");
  console.log(` 🔑 Key ID: ${KEY_ID.substring(0, 4)}...`);

  // --- 2. Inicializar Cliente ---
  const s3Client = new S3Client({
    region: REGION,
    credentials: {
      accessKeyId: KEY_ID,
      secretAccessKey: SECRET_KEY,
    },
  });

  // --- 3. Verificar Conexión y Permisos ---
  console.log("\n--- Paso 2: Probando Subida y Permiso Público (ACL) ---");
  try {
    // A. Subir un archivo de prueba
    console.log(` 📤 Intentando subir '${TEST_KEY}' con ACL 'public-read'...`);
    const putCommand = new PutObjectCommand({
      Bucket: BUCKET,
      Key: TEST_KEY,
      Body: "Archivo de prueba de diagnóstico",
      ACL: "public-read", // Requerido para tu flujo de Instagram
    });
    await s3Client.send(putCommand);
    console.log(" ✅ ¡Subida exitosa! Las claves y el permiso 'public-read' funcionan.");

  } catch (error) {
    console.error("\n❌ ERROR CRÍTICO EN CREDENCIALES/PERMISOS:", error.name || "Error desconocido");
    console.error(" 💬 Mensaje:", error.message);
    
    if (error.name === 'InvalidAccessKeyId' || error.name === 'SignatureDoesNotMatch') {
      console.log("\n💡 SOLUCIÓN: Las claves (Access Key ID/Secret Key) son incorrectas o expiraron. ¡Reemplázalas!");
    } else if (error.name === "AccessDenied") {
      console.log("\n💡 SOLUCIÓN: Las claves son válidas, pero el usuario IAM no tiene los permisos necesarios (S3FullAccess o s3:PutObjectAcl).");
    } else if (error.name === "NoSuchBucket") {
      console.log("\n💡 SOLUCIÓN: El bucket S3 configurado no existe. Revisa el nombre en tu .env.");
    }
    return;
    
  } finally {
    // B. Limpiar (¡Siempre!)
    try {
      console.log(`\n 🧹 Limpiando archivo de prueba...`);
      const deleteCommand = new DeleteObjectCommand({
        Bucket: BUCKET,
        Key: TEST_KEY,
      });
      await s3Client.send(deleteCommand);
      console.log(" ✅ Limpieza completa.");
    } catch (cleanupError) {
      // Ignoramos el error de limpieza si el archivo nunca se subió
    }
  }

  console.log("\n================================================");
  console.log(" ✅ ¡Diagnóstico de AWS S3 completado! Claves y permisos OK.");
  console.log("================================================");
}

diagnosticarAWS();