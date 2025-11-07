// src/utils/media.ts

import fs from 'fs';
import path from 'path';
import Ffmpeg from 'fluent-ffmpeg'; // Asegúrate de haber hecho 'npm install fluent-ffmpeg'

// --- Constantes de Configuración ---
const MAX_IMAGE_SIZE_MB = 8;
const MAX_VIDEO_SIZE_MB = 100;
const MAX_REEL_DURATION_S = 90;
const MIN_REEL_DURATION_S = 3;

const VALID_IMAGE_EXT = ['.jpg', '.jpeg', '.png', '.webp'];
const VALID_VIDEO_EXT = ['.mp4', '.mov'];

// --- Funciones de Validación ---

/**
 * Verifica si un archivo existe en la ruta especificada.
 */
export function validateFileExists(filePath: string): boolean {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Archivo no encontrado: ${filePath}`);
  }
  return true;
}

/**
 * Revisa si la extensión del archivo es válida para un tipo de medio.
 */
export function validateExtension(filePath: string, type: 'image' | 'video'): boolean {
  const ext = path.extname(filePath).toLowerCase();
  const validExtensions = (type === 'image') ? VALID_IMAGE_EXT : VALID_VIDEO_EXT;
  
  if (!validExtensions.includes(ext)) {
    throw new Error(
      `Extensión de archivo inválida. Se esperaba [${validExtensions.join(', ')}] pero se obtuvo "${ext}".`
    );
  }
  return true;
}

/**
 * Revisa que el archivo no exceda el límite de tamaño.
 */
export function validateFileSize(filePath: string, type: 'image' | 'video'): boolean {
  try {
    const stats = fs.statSync(filePath);
    const fileSizeInMB = stats.size / (1024 * 1024);
    const limit = (type === 'image') ? MAX_IMAGE_SIZE_MB : MAX_VIDEO_SIZE_MB;

    if (fileSizeInMB > limit) {
      throw new Error(
        `El archivo es muy grande (${fileSizeInMB.toFixed(2)} MB). El límite para este tipo (${type}) es ${limit} MB.`
      );
    }
    return true;
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      throw new Error(`Archivo no encontrado al verificar tamaño: ${filePath}`);
    }
    throw error;
  }
}

/**
 * Verifica la duración de un video usando ffprobe.
 */
export async function validateVideoDuration(videoPath: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    Ffmpeg.ffprobe(videoPath, (err: any, metadata: any) => {
      if (err) {
        return reject(new Error(`No se pudo leer la metadata del video: ${err.message}`));
      }

      const duration = metadata.format.duration;
      if (!duration) {
        return reject(new Error("No se pudo determinar la duración del video."));
      }

      if (duration < MIN_REEL_DURATION_S) {
        return reject(new Error(`El video es muy corto (${duration.toFixed(1)}s). Mínimo: ${MIN_REEL_DURATION_S}s.`));
      }
      if (duration > MAX_REEL_DURATION_S) {
        return reject(new Error(`El video es muy largo (${duration.toFixed(1)}s). Máximo: ${MAX_REEL_DURATION_S}s.`));
      }

      console.log(`Duración del video validada: ${duration.toFixed(1)}s`);
      resolve(true);
    });
  });
}

/**
 * Una función de validación "todo en uno" para fotos.
 */
export function validatePhoto(filePath: string): boolean {
  console.log(`Validando foto: ${filePath}...`);
  validateFileExists(filePath);
  validateExtension(filePath, 'image');
  validateFileSize(filePath, 'image');
  console.log(`✅ Foto validada.`);
  return true;
}

/**
 * Una función de validación "todo en uno" para videos.
 */
export async function validateVideo(filePath: string): Promise<boolean> {
  console.log(`Validando video: ${filePath}...`);
  validateFileExists(filePath);
  validateExtension(filePath, 'video');
  validateFileSize(filePath, 'video');
  await validateVideoDuration(filePath); // Se asegura de checar la duración
  console.log(`✅ Video validado (incluyendo duración).`);
  return true;
}