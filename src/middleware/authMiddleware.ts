// src/middleware/authMiddleware.ts

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// --- CONFIGURACIÓN CRÍTICA ---
// ¡DEBES AÑADIR ESTA CLAVE SECRETA A TU .ENV! (EJ: JWT_SECRET="tu_clave_super_secreta")
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_dev';

// --- JWT Payload Type ---
interface DecodedToken {
    user_id: string;
    email: string;
}

/**
 * Función para generar un token JWT (usado en la ruta de login)
 */
export const generateToken = (payload: { user_id: string, email: string }) => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' }); // Válido por 7 días
};


/**
 * Middleware para verificar el token JWT en el header de cada petición
 */
export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    // 1. Verificar si existe el token (Bearer Token)
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Acceso no autorizado: Token no proporcionado o formato inválido.' });
    }

    const token = authHeader.split(' ')[1];

    // 2. Verificar la validez del token
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            // El token expiró, es inválido o fue modificado
            return res.status(403).json({ error: 'Token inválido o expirado.' });
        }

        // 3. Si es válido, adjuntamos la información del usuario a la petición
        // Esto permite que las funciones de tu MCP sepan quién está haciendo la petición
        (req as any).user = decoded as DecodedToken;

        next(); // Continuar con la ruta
    });
};