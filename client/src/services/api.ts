import axios, { AxiosError } from 'axios';

// La URL de tu backend (el que está corriendo en la otra terminal)
const API_URL = 'http://localhost:3000/api';

// Tipos para las respuestas
export interface ToolResponse {
  content: Array<{
    type: string;
    text: string;
  }>; 
  isError?: boolean;
}

export interface ErrorResponse {
  error: string;
  details?: string;
}

/**
 * Función genérica para llamar a cualquier herramienta de tu MCP
 */
export const callTool = async (
  toolName: string, 
  args: Record<string, any> = {}
): Promise<ToolResponse> => {
  try {
    const response = await axios.post<ToolResponse>(`${API_URL}/tool-call`, {
      name: toolName,
      args: args
    }, {
      timeout: 10000, // 10 segundos de timeout
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    return response.data;
  } catch (error) {
    // Manejo mejorado de errores
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ErrorResponse>;
      
      if (axiosError.response) {
        // El servidor respondió con un error
        console.error("❌ Error del servidor:", axiosError.response.data);
        throw new Error(
          axiosError.response.data.error || 
          `Error del servidor: ${axiosError.response.status}`
        );
      } else if (axiosError.request) {
        // La petición se hizo pero no hubo respuesta
        console.error("❌ No se pudo conectar con el servidor");
        throw new Error("No se pudo conectar con el servidor. ¿Está corriendo en el puerto 3000?");
      }
    }
    
    // Error desconocido
    console.error("❌ Error inesperado:", error);
    throw new Error("Error inesperado al llamar a la API");
  }
};