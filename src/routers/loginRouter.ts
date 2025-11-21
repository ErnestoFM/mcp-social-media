// src/routers/loginRouter.ts

import { Router, Request, Response } from 'express';
import { findUserByEmail, verifyPassword } from '../models/User.js';
import { generateToken } from '../middleware/authMiddleware.js';
import { logger } from '../utils/loggers.js';

const router = Router();

/**
 * POST /api/login
 * Ruta para iniciar sesión con email y contraseña
 */
router.post('/login', async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Email y contraseña son requeridos" });
        }

        // 1. Buscar usuario
        const user = await findUserByEmail(email);
        if (!user) {
            return res.status(401).json({ error: "Credenciales inválidas" });
        }

        // 2. Verificar contraseña (si es usuario local)
        if (user.provider === 'local') {
            const isValid = await verifyPassword(password, user.password_hash);
            if (!isValid) {
                return res.status(401).json({ error: "Credenciales inválidas" });
            }
        } else {
            // Si es usuario de Google/Facebook, no debería loguearse con contraseña aquí
            return res.status(400).json({ error: `Por favor inicia sesión con ${user.provider}` });
        }

        // 3. Generar Token
        const token = generateToken({ user_id: user.user_id, email: user.email });

        // 4. Responder
        res.json({
            message: "Login exitoso",
            token,
            user: {
                user_id: user.user_id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error: any) {
        logger.error("Error en login:", error);
        res.status(500).json({ error: "Error interno al iniciar sesión" });
    }
});

export default router;
