// src/routers/mediaRouter.ts

import { Router, Request, Response } from 'express';
import { authenticateJWT } from '../middleware/authMiddleware.js';
import { generatePresignedUploadUrl } from '../utils/s3Presigner.js';
import { listS3Files } from '../utils/s3.js'; // Asegúrate de exportar esto en s3.ts
import { logger } from '../utils/loggers.js';

const router = Router();

/**
 * GET /api/media
 * Lista los archivos del usuario en S3
 */
router.get('/', authenticateJWT, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.user_id;
        // const prefix = `user-media/${userId}/`; // Prefijo específico del usuario

        const files = await listS3Files(userId);
        res.json(files);
    } catch (error: any) {
        logger.error('Media: Error listando archivos', { error });
        res.status(500).json({ error: 'Error al obtener tus recursos multimedia.' });
    }
});

/**
 * POST /api/media/presign-upload
 * Genera URL para subir archivo
 */
router.post('/presign-upload', authenticateJWT, async (req: Request, res: Response) => {
    // El user_id viene de tu token JWT (gracias al middleware)
    const userId = (req as any).user.user_id;
    const { fileName, fileType } = req.body;

    if (!fileName || !fileType) {
        return res.status(400).json({ error: 'Faltan fileName y fileType.' });
    }

    // Validación de tipo de archivo (Backend)
    const allowedTypes = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'video/mp4', 'video/quicktime', 'video/webm'
    ];

    if (!allowedTypes.includes(fileType)) {
        return res.status(400).json({
            error: 'Tipo de archivo no permitido. Solo imágenes (jpg, png, gif) y videos (mp4, mov).'
        });
    }

    try {
        const { signedUrl, fileKey } = await generatePresignedUploadUrl(fileName, fileType, userId);

        logger.info(`Media: Generada URL pre-firmada para el usuario ${userId}`);

        // Devolvemos la URL y la ruta final del archivo al frontend
        return res.status(200).json({
            signedUrl,
            fileKey,
            finalUrl: `https://${process.env.AWS_S3_BUCKET}.s3.amazonaws.com/${fileKey}`
        });

    } catch (error: any) {
        logger.error('Media: Error al generar URL presignada', { error: error });
        return res.status(500).json({ error: 'Error al generar la URL de subida.' });
    }
});

export default router;