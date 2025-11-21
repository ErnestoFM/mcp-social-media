// src/utils/s3Presigner.ts

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Reutilizamos el cliente S3 configurado en utils/s3.ts
const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});

const S3_BUCKET = process.env.AWS_S3_BUCKET!;

/**
 * Genera una URL temporal y segura para que el frontend suba un archivo directamente a S3.
 * La clave se genera con el ID del usuario para asegurar la multi-tenancy.
 * @param fileName Nombre del archivo que el usuario va a subir.
 * @param fileType Tipo MIME del archivo (ej: image/jpeg).
 * @param userId ID del usuario autenticado (para la carpeta de seguridad).
 * @returns La URL pre-firmada y la ruta final del archivo en S3.
 */
export async function generatePresignedUploadUrl(
    fileName: string,
    fileType: string,
    userId: string
): Promise<{ signedUrl: string; fileKey: string }> {

    const timestamp = Date.now();
    // La ruta del archivo en S3 estará dentro de la carpeta segura del usuario
    const fileKey = `user-media/${userId}/${timestamp}-${fileName.replace(/\s/g, '_')}`;

    const command = new PutObjectCommand({
        Bucket: S3_BUCKET,
        Key: fileKey,
        ContentType: fileType,
        ACL: 'public-read', // Necesario para que Meta pueda leer la URL
    });

    const signedUrl = await getSignedUrl(s3Client, command, {
        expiresIn: 900 // La URL expira en 15 minutos (900 segundos)
    });

    return { signedUrl, fileKey };
}