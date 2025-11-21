import express from 'express';
import { generateCreativeText } from '../utils/gemini.js';
import { logger } from '../utils/loggers.js';

const router = express.Router();

router.post('/generate', async (req, res) => {
    const { type, prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: 'El prompt es requerido' });
    }

    try {
        let finalPrompt = '';

        switch (type) {
            case 'ideas':
                finalPrompt = `Genera 3 ideas creativas y detalladas para posts de redes sociales sobre: "${prompt}". 
                Formato JSON esperado: un array de objetos con las propiedades "title", "description" y "platform" (sugerida).
                Responde SOLO con el JSON válido, sin markdown ni explicaciones adicionales.`;
                break;
            case 'caption':
                finalPrompt = `Escribe un caption atractivo y profesional para Instagram sobre: "${prompt}". 
                Incluye emojis relevantes. No incluyas hashtags todavía.`;
                break;
            case 'hashtags':
                finalPrompt = `Genera una lista de 15 hashtags relevantes y populares para un post sobre: "${prompt}". 
                Responde SOLO con los hashtags separados por espacios.`;
                break;
            case 'video':
                finalPrompt = `Genera 3 ideas para videos cortos (Reels/TikTok) sobre: "${prompt}".
                Formato JSON esperado: un array de objetos con las propiedades "title", "description" (guion breve) y "platform".
                Responde SOLO con el JSON válido, sin markdown ni explicaciones adicionales.`;
                break;
            case 'image':
                finalPrompt = `Describe in English a highly detailed and artistic image about: "${prompt}". 
                Keep it under 100 characters. Focus on visual elements, lighting, and style. 
                Do not include "Here is a description" or similar, just the description.`;
                break;
            default:
                finalPrompt = prompt;
        }

        logger.info(`🧠 Gemini Router: Generando contenido tipo '${type}'`);

        const generatedText = await generateCreativeText(finalPrompt);

        // Procesamiento específico según el tipo
        let data: any = generatedText;

        if (type === 'ideas' || type === 'video') {
            try {
                // Limpiar markdown si existe
                const jsonStr = generatedText.replace(/```json\n?|\n?```/g, '').trim();
                data = JSON.parse(jsonStr);
            } catch (e) {
                logger.warn('Error al parsear JSON de Gemini, devolviendo texto plano', { error: e });
                // Si falla el parseo, devolvemos una estructura básica con el texto completo
                data = [{ title: 'Respuesta Generada', description: generatedText, platform: 'General' }];
            }
        } else if (type === 'hashtags') {
            data = generatedText.split(' ').filter(t => t.startsWith('#'));
        }

        res.json({
            type: type === 'caption' ? 'text' : type,
            data
        });

    } catch (error: any) {
        logger.error('Error en Gemini Router:', error);
        res.status(500).json({ error: error.message || 'Error interno al generar contenido' });
    }
});

export default router;
