// src/platforms/filesystem.ts

import * as fs from '../utils/filesystem.js'; // Importamos nuestro módulo seguro

// ==============================================================================
// 1. DEFINICIÓN DE HERRAMIENTAS
// ==============================================================================

export const filesystemTools = [
  {
    name: "fs_list_directory",
    description: "Lista el contenido (archivos y carpetas) de un directorio dentro del sandbox.",
    inputSchema: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "La ruta del directorio a listar (relativa al sandbox). '.' es la raíz.",
          default: ".",
        },
      },
    },
  },
  {
    name: "fs_read_file",
    description: "Lee el contenido de un archivo de texto dentro del sandbox.",
    inputSchema: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "La ruta del archivo a leer (ej. 'documento.txt' o 'subcarpeta/notas.md').",
        },
      },
      required: ["path"],
    },
  },
  {
    name: "fs_write_file",
    description: "Escribe (o sobrescribe) contenido en un archivo de texto dentro del sandbox.",
    inputSchema: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "La ruta del archivo a escribir (ej. 'nuevo.txt' o 'reportes/reporte.json').",
        },
        content: {
          type: "string",
          description: "El contenido de texto que se escribirá en el archivo.",
        },
      },
      required: ["path", "content"],
    },
  },
  {
    name: "fs_create_folder",
    description: "Crea una nueva carpeta (y cualquier subcarpeta necesaria) dentro del sandbox.",
    inputSchema: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "La ruta de la carpeta a crear (ej. 'nuevos_documentos/fotos').",
        },
      },
      required: ["path"],
    },
  },
  {
    name: "fs_move_file",
    description: "Mueve o renombra un archivo o carpeta dentro del sandbox.",
    inputSchema: {
      type: "object",
      properties: {
        from_path: {
          type: "string",
          description: "La ruta de origen (ej. 'archivo_viejo.txt').",
        },
        to_path: {
          type: "string",
          description: "La ruta de destino (ej. 'archivado/archivo_nuevo.txt').",
        },
      },
      required: ["from_path", "to_path"],
    },
  },
];

// ==============================================================================
// 2. LÓGICA DEL MANEJADOR (HANDLER)
// ==============================================================================

export async function handleFilesystemCall(name: string, args: any) {
  switch (name) {
    case "fs_list_directory": {
      const entries = await fs.listDirectory(args.path || ".");
      const list = entries.map(e => `[${e.type === 'dir' ? '📁' : '📄'}] ${e.name}`).join('\n');
      return {
        content: [{ type: "text", text: `Contenido de "${args.path || "."}":\n\n${list}` }],
      };
    }

    case "fs_read_file": {
      const content = await fs.readFile(args.path);
      return {
        content: [{ type: "text", text: `Contenido de "${args.path}":\n\n${content}` }],
      };
    }

    case "fs_write_file": {
      await fs.writeFile(args.path, args.content);
      return {
        content: [{ type: "text", text: `✅ Archivo guardado exitosamente en "${args.path}".` }],
      };
    }

    case "fs_create_folder": {
      await fs.createFolder(args.path);
      return {
        content: [{ type: "text", text: `✅ Carpeta creada exitosamente en "${args.path}".` }],
      };
    }

    case "fs_move_file": {
      await fs.moveFile(args.from_path, args.to_path);
      return {
        content: [{ type: "text", text: `✅ Archivo movido/renombrado de "${args.from_path}" a "${args.to_path}".` }],
      };
    }

    default:
      throw new Error(`Herramienta desconocida de Filesystem: ${name}`);
  }
}