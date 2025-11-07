// src/utils/filesystem.ts

import fs from "fs";
import path from "path";

// 1. Cargar la ruta de la "jaula" desde las variables de entorno
const SANDBOX_DIR = path.resolve(process.env.FILESYSTEM_SANDBOX!);
if (!fs.existsSync(SANDBOX_DIR) || !fs.statSync(SANDBOX_DIR).isDirectory()) {
  throw new Error(`La carpeta sandbox no existe: ${SANDBOX_DIR}. Por favor, créala.`);
}

/**
 * 🛡️ ¡EL GUARDIÁN DE SEGURIDAD! 🛡️
 * Resuelve una ruta de usuario y se asegura de que esté DENTRO del sandbox.
 * Previene ataques de "path traversal" (ej. ../../.aws/credentials).
 */
function resolveSandboxPath(userPath: string): string {
  // Resuelve la ruta completa (ej. C:\Users\...\mcp-sandbox\mi-archivo.txt)
  const resolvedPath = path.resolve(SANDBOX_DIR, userPath);

  // Comprobación de seguridad: ¿La ruta resuelta sigue estando DENTRO de la carpeta sandbox?
  if (!resolvedPath.startsWith(SANDBOX_DIR)) {
    throw new Error(`Acceso denegado: Se intentó acceder fuera del sandbox. Ruta: ${userPath}`);
  }
  
  return resolvedPath;
}

// ==============================================================================
// LÓGICA DE NEGOCIO (¡EXPORTADA!)
// ==============================================================================

/**
 * Lee el contenido de un archivo (en modo texto UTF-8)
 */
export async function readFile(filePath: string): Promise<string> {
  const safePath = resolveSandboxPath(filePath);
  return fs.readFileSync(safePath, 'utf-8');
}

/**
 * Escribe contenido en un archivo (sobrescribe si existe)
 */
export async function writeFile(filePath: string, content: string): Promise<void> {
  const safePath = resolveSandboxPath(filePath);
  fs.writeFileSync(safePath, content, 'utf-8');
}

/**
 * Crea una nueva carpeta (y las carpetas padres si no existen)
 */
export async function createFolder(dirPath: string): Promise<void> {
  const safePath = resolveSandboxPath(dirPath);
  fs.mkdirSync(safePath, { recursive: true });
}

/**
 * Mueve un archivo o carpeta de una ubicación a otra
 */
export async function moveFile(fromPath: string, toPath: string): Promise<void> {
  const safeFrom = resolveSandboxPath(fromPath);
  const safeTo = resolveSandboxPath(toPath);
  fs.renameSync(safeFrom, safeTo);
}

/**
 * Lista el contenido (archivos y carpetas) de un directorio
 */
export async function listDirectory(dirPath: string): Promise<{ type: 'file' | 'dir', name: string }[]> {
  const safePath = resolveSandboxPath(dirPath);
  const entries = fs.readdirSync(safePath, { withFileTypes: true });

  return entries.map(entry => ({
    type: entry.isDirectory() ? 'dir' : 'file',
    name: entry.name,
  }));
}