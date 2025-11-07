// src/utils/s3.ts
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";
import path from "path";
import crypto from "crypto";

// 1. Definir el cliente y bucket aquí
const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});
const S3_BUCKET = process.env.AWS_S3_BUCKET;

// 2. Función de ayuda (interna)
function getContentType(extension: string): string {
  const types: { [key: string]: string } = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    // ... (todos tus tipos)
    '.mp4': 'video/mp4',
    '.mov': 'video/quicktime',
  };
  return types[extension.toLowerCase()] || 'application/octet-stream';
}

// 3. Exportar la función principal
export async function uploadToS3(imagePath: string): Promise<string> {
  try {
    if (!S3_BUCKET) {
      throw new Error("AWS_S3_BUCKET no está configurado en .env");
    }

    const fileContent = fs.readFileSync(imagePath);
    const fileName = path.basename(imagePath);
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(8).toString('hex');
    const extension = path.extname(fileName);
    const uniqueFileName = `social-media/${timestamp}-${randomString}${extension}`; // Prefijo 'social-media'
    const contentType = getContentType(extension);

    const command = new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: uniqueFileName,
      Body: fileContent,
      ContentType: contentType,
      ACL: 'public-read',
    });

    await s3Client.send(command);

    // Construir URL (mejor práctica regional)
    const region = process.env.AWS_REGION || 'us-east-1';
    // Manejar la URL de us-east-1 que no incluye la región
    const regionString = region === 'us-east-1' ? '' : `.${region}`;
    const publicUrl = `https://${S3_BUCKET}.s3${regionString}.amazonaws.com/${uniqueFileName}`;
    
    return publicUrl;
  } catch (error: any) {
    throw new Error(`Error subiendo a S3: ${error.message}`);
  }
}