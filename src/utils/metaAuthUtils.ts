// src/utils/metaAuthUtils.ts

import axios from 'axios';

// La URL de Facebook Graph API (usamos la misma que en otros módulos)
const API_URL = process.env.INSTAGRAM_API_URL || 'https://graph.facebook.com/v18.0';

// Tu token de app (Necesitas crear uno. Este es diferente de los tokens de usuario/página)
// Debes añadir esta clave a tu .env: APP_ACCESS_TOKEN
const APP_ACCESS_TOKEN = process.env.APP_ACCESS_TOKEN;

// Estructura de la respuesta del debug_token
export interface DebugTokenInfo {
    is_valid: boolean;
    user_id?: string;
    page_id?: string;
    scopes: string[];
    expires_at: number;
    platform: 'instagram' | 'facebook';
}

/**
 * 🛡️ Verifica si un token de acceso es válido y obtiene su metadata (incluyendo scopes).
 * Esta función es la base para la seguridad. Funciona para IG y FB.
 */
export async function debugAndVerifyMetaToken(token: string): Promise<DebugTokenInfo> {
    if (!APP_ACCESS_TOKEN) {
        throw new Error("Falta la variable de entorno APP_ACCESS_TOKEN para depuración de tokens.");
    }

    // 1. Llamar al endpoint de depuración de Meta
    const debugResponse = await axios.get(`${API_URL}/debug_token`, {
        params: {
            input_token: token,
            access_token: APP_ACCESS_TOKEN, // Se usa el token de la App (o un token de usuario con scopes de debug)
        }
    });

    const data = debugResponse.data.data;

    // 2. Extraer el tipo de plataforma (IG o FB)
    let platform: 'instagram' | 'facebook';
    if (data.metadata?.sso === 'instagram') {
        platform = 'instagram';
    } else if (data.user_id && data.application === 'Tú App ID') { // Más complejo, requiere verificar el ID de la App
        platform = 'facebook';
    } else {
        // En una implementación real, se necesitaría más lógica aquí.
        platform = 'instagram'; // Asumimos Instagram por defecto
    }

    // 3. Devolver la información estructurada
    return {
        is_valid: data.is_valid,
        user_id: data.user_id,
        scopes: data.scopes || [],
        expires_at: data.expires_at,
        platform: platform
    } as DebugTokenInfo;
}