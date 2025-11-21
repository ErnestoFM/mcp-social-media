// src/routers/authRouter.ts

import { Router, Request, Response } from 'express';
import { debugAndVerifyMetaToken } from '../utils/metaAuthUtils.js';
import { createUser } from '../models/User.js';
import { authenticateJWT, generateToken } from '../middleware/authMiddleware.js';
import { saveSocialAccount } from '../models/socialAccount.js';

const router = Router();
const API_URL = process.env.INSTAGRAM_API_URL!;

/**
 * Ruta para registrar un nuevo usuario (Ejemplo)
 */
router.post('/register', async (req: Request, res: Response) => {
    try {
        const { email, name, password } = req.body;
        const user = await createUser(email, name, password);
        const token = generateToken({ user_id: user.user_id, email: user.email });

        return res.status(201).json({ user_id: user.user_id, token });

    } catch (error: any) {
        // En tu logger, puedes poner este error.
        return res.status(400).json({ error: error.message });
    }
});

/**
 * Ruta para verificar un token de Meta/IG/FB sin guardarlo
 * Esta ruta NO requiere autenticación JWT (es pública para verificar antes de agregar)
 */
router.post('/verify-token', async (req: Request, res: Response) => {
    console.log('🔍 Endpoint /verify-token llamado con body:', req.body);

    try {
        const { accessToken, platform } = req.body;

        if (!accessToken) {
            return res.status(400).json({ error: 'El access token es requerido' });
        }

        // Verificar el token con la API de Meta
        const tokenInfo = await debugAndVerifyMetaToken(accessToken);

        // Retornar la información del token
        return res.status(200).json({
            is_valid: tokenInfo.is_valid,
            platform: tokenInfo.platform,
            scopes: tokenInfo.scopes || [],
            expires_at: tokenInfo.expires_at,
            user_id: tokenInfo.user_id,
            page_id: tokenInfo.page_id
        });

    } catch (error: any) {
        console.error('Error verificando token:', error);
        return res.status(500).json({
            error: 'Error al verificar el token. Verifica que sea válido.',
            details: error.message
        });
    }
});

/**
 * Ruta para vincular una cuenta de Meta/IG/FB
 * Esta ruta DEBE estar protegida por un token JWT (es decir, el usuario debe haber iniciado sesión)
 */
router.post('/link-meta', authenticateJWT, async (req: Request, res: Response) => {
    // 1. Obtenemos el user_id y email del token JWT que el middleware autenticó
    const { user_id, email } = (req as any).user;

    // 2. Obtenemos el token de Meta/IG/FB del body
    const { accessToken, handle, pageId, platform } = req.body;

    try {
        // 3. Verificamos la validez del token con la API de Meta
        const tokenInfo = await debugAndVerifyMetaToken(accessToken);

        if (!tokenInfo.is_valid) {
            return res.status(403).json({ error: 'Token de Meta inválido o expirado. Por favor, inicia sesión de nuevo.' });
        }

        // 4. Lógica de verificación de permisos
        const requiredScope = platform === 'instagram' ? 'instagram_content_publish' : 'pages_manage_posts';
        if (!tokenInfo.scopes.includes(requiredScope)) {
            return res.status(403).json({ error: `Permiso faltante: '${requiredScope}'. Vuelve a conectar con permisos de publicación.` });
        }

        // 5. Guardar la cuenta social usando saveSocialAccount
        const savedAccount = await saveSocialAccount(
            user_id, // Usamos user_id en lugar de email
            platform, // 'instagram'
            pageId,   // ID de la página o perfil de IG/FB
            handle,
            accessToken,
            new Date(tokenInfo.expires_at * 1000).toISOString()
        );

        return res.status(200).json({
            message: 'Cuenta social vinculada correctamente.',
            account: savedAccount
        });

    } catch (error: any) {
        console.error('Error en /link-meta:', error);
        return res.status(500).json({
            error: 'Error al verificar o guardar la cuenta Meta.',
            details: error.message
        });
    }
});

export default router;