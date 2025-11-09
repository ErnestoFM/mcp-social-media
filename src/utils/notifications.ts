// src/utils/notifications.ts

import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

// 1. El cliente se inicializa una vez (reutiliza la región de .env)
const sesClient = new SESClient({ 
  region: process.env.AWS_REGION 
});

// 2. Definimos el correo "De" (¡Debe ser el que verificaste en AWS!)
const SENDER_EMAIL = process.env.VERIFIED_SENDER_EMAIL!; 

/**
 * Envía un reporte de crecimiento formateado en HTML.
 */
export async function sendGrowthReportEmail(
  stats: any, // Puedes crear una Interfaz para esto
  recipientEmail: string
): Promise<void> {

  if (!SENDER_EMAIL) {
    throw new Error("VERIFIED_SENDER_EMAIL no está configurado en .env");
  }

  // 3. Formatear los datos (¡tu lógica de HTML es perfecta!)
  const htmlBody = `
    <h1>📊 Reporte Semanal de Crecimiento</h1>
    <p>¡Aquí está tu resumen de los últimos 30 días!</p>
    
    <h2>Plataforma: ${stats.platform.toUpperCase()}</h2>
    <ul>
      <li>Período: ${stats.period.days} días (de ${stats.period.start} a ${stats.period.end})</li>
      <li>Seguidores Iniciales: ${stats.followers.start}</li>
      <li>Seguidores Finales: ${stats.followers.end}</li>
      <li><b>Crecimiento Neto: ${stats.followers.growth}</b></li>
      <li><b>Tasa de Crecimiento: ${stats.followers.growthRate}</b></li>
    </ul>
    
    <h3>Posts</h3>
    <ul>
      <li>Posts Nuevos: ${stats.posts.growth}</li>
      <li>Promedio por día: ${stats.posts.avgPerDay}</li>
    </ul>
  `;

  // 4. Crear y enviar el comando
  const command = new SendEmailCommand({
    Source: SENDER_EMAIL, // <-- El correo verificado
    Destination: { 
      ToAddresses: [recipientEmail] // <-- El correo verificado (mientras estés en sandbox)
    },
    Message: {
      Subject: { Data: `Tu Reporte de Crecimiento para ${stats.platform}` },
      Body: { Html: { Data: htmlBody } }
    }
  });

  try {
    console.log(`Email: ✉️ Enviando reporte de ${stats.platform} a ${recipientEmail}...`);
    await sesClient.send(command);
    console.log(`Email: ✅ Reporte enviado exitosamente.`);
  } catch (error: any) {
    console.error(`Email: ❌ Error al enviar correo:`, error.message);
    throw new Error(`Error de SES: ${error.message}`);
  }
}