// src/utils/s3.ts
import { S3Client, PutObjectCommand, ListObjectsCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
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
        '.gif': 'image/gif',
        '.webp': 'image/webp',
        '.mp4': 'video/mp4',
        '.mov': 'video/quicktime',
        '.avi': 'video/x-msvideo',
        '.webm': 'video/webm'
    };
    return types[extension.toLowerCase()] || 'application/octet-stream';
}

// 3. Exportar la función principal (File Path)
export async function uploadToS3(imagePath: string): Promise<string> {
    try {
        if (!S3_BUCKET) {
            throw new Error("AWS_S3_BUCKET no está configurado en .env");
        }

        const fileContent = fs.readFileSync(imagePath);
        const fileName = path.basename(imagePath);
        const extension = path.extname(fileName);

        return await uploadBufferToS3(fileContent, extension);
    } catch (error: any) {
        throw new Error(`Error subiendo archivo local a S3: ${error.message}`);
    }
}

// 4. Subir Buffer directamente (para Multer)
export async function uploadBufferToS3(buffer: Buffer, extension: string): Promise<string> {
    try {
        if (!S3_BUCKET) {
            throw new Error("AWS_S3_BUCKET no está configurado en .env");
        }

        const timestamp = Date.now();
        const randomString = crypto.randomBytes(8).toString('hex');
        // Asegurar que la extensión tenga punto
        const ext = extension.startsWith('.') ? extension : `.${extension}`;
        const uniqueFileName = `social-media/${timestamp}-${randomString}${ext}`;
        const contentType = getContentType(ext);

        const command = new PutObjectCommand({
            Bucket: S3_BUCKET,
            Key: uniqueFileName,
            Body: buffer,
            ContentType: contentType,
        });

        await s3Client.send(command);

        // Construir URL
        const region = process.env.AWS_REGION || 'us-east-1';
        const regionString = region === 'us-east-1' ? '' : `.${region}`;
        const publicUrl = `https://${S3_BUCKET}.s3${regionString}.amazonaws.com/${uniqueFileName}`;

        return publicUrl;
    } catch (error: any) {
        throw new Error(`Error subiendo buffer a S3: ${error.message}`);
    }
}

// 5. Listar archivos
export async function listS3Files(userId: string): Promise<any[]> {
    try {
        const listCommand = new ListObjectsCommand({
            Bucket: S3_BUCKET!,
            Prefix: `user-media/${userId}/`, // Solo lista la carpeta del usuario
        });

        const response = await s3Client.send(listCommand);

        const files = (response.Contents || [])
            .filter(item => item.Key && !item.Key.endsWith('/'));

        // 1. Generar URLs firmadas en paralelo
        const signedUrls = await Promise.all(files.map(async (file) => {

            // Comando para OBTENER el objeto
            const getCommand = new GetObjectCommand({
                Bucket: S3_BUCKET!,
                Key: file.Key!,
            });

            // Generar la URL temporal (válida por 1 hora)
            const url = await getSignedUrl(s3Client, getCommand, { expiresIn: 3600 }); // 1 hora

            return {
                key: file.Key!,
                url: url, // <-- El frontend usará ESTA URL temporal
                size: file.Size,
                lastModified: file.LastModified,
            };
        }));

        return signedUrls;
    } catch (error: any) {
        console.error("Error listando archivos S3:", error);
        return [];
    }
}