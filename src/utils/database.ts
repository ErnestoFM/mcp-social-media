// db/dynamodb.ts
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import crypto from 'crypto';
export interface ScheduledPost {
  post_id: string;
  status: 'PENDING' | 'PUBLISHED' | 'FAILED';
  scheduled_time: string; // ISO 8601
  platforms: ('instagram' | 'facebook')[];
  s3_url: string;
  caption: string;
}

export interface HashtagStats {
  hashtag: string;
  stat_date: string;
  avg_likes: number;
  avg_comments: number;
  total_posts_analyzed: number;
}

import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
  DeleteCommand,
  UpdateCommand,
  BatchWriteCommand
} from "@aws-sdk/lib-dynamodb";

// ========== TIPOS ==========

export interface DailyStats {
  followers: number;
  posts_count: number;
  avg_engagement?: number;
  total_likes?: number;
  total_comments?: number;
}

export interface StoredStats extends DailyStats {
  platform: 'instagram' | 'facebook' | 'threads';
  stat_date: string;
  last_updated: string;
}

export type Platform = 'instagram' | 'facebook' | 'threads';

// ========== CONFIGURACIÓN ==========
export interface Collaboration {
  platform: Platform;
  collaboration_id: string; // SK (ej: 20251109-hatueyfierro)
  username: string;
  type: 'shoutout' | 'giveaway' | 'collab_post';
  post_id: string;
  notes?: string;
  // Estos se actualizan después
  post_engagement?: {
    likes: number;
    comments: number;
  };
}

const client = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  }
});

export const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || "social_stats";
const SCHEDULED_TABLE_NAME = process.env.DYNAMODB_SCHEDULED_TABLE_NAME || "scheduled_posts"
const HASHTAG_TABLE_NAME = process.env.DYNAMODB_HASHTAG_TABLE_NAME || "hashtag_stats";
const COLLAB_TABLE_NAME = process.env.DYNAMODB_COLLAB_TABLE_NAME || "social_collaborations";
// ========== HELPERS ==========

async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      console.error(`DB: ⚠️ Intento ${i + 1} falló, reintentando en ${delay * (i + 1)}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
    }
  }
  throw new Error('Max retries reached');
}

function validateStats(stats: DailyStats): boolean {
  if (typeof stats.followers !== 'number' || stats.followers < 0) {
    console.error(`DB: ⚠️ Seguidores inválidos: ${stats.followers}`);
    return false;
  }
  if (typeof stats.posts_count !== 'number' || stats.posts_count < 0) {
    console.error(`DB: ⚠️ Posts inválidos: ${stats.posts_count}`);
    return false;
  }
  return true;
}

// ========== FUNCIONES PRINCIPALES ==========

/**
 * Guarda o sobrescribe las estadísticas promedio de un hashtag para el día de hoy
 */

/**
 * Guarda una nueva colaboración en la DB
 */
export async function saveCollaboration(
  data: Omit<Collaboration, 'collaboration_id' | 'post_engagement'>
): Promise<Collaboration> {

  const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, ''); // 20251109
  const collabId = `${timestamp}-${data.username}`; // ej: 20251109-hatueyfierro

  const newItem: Collaboration = {
    ...data,
    collaboration_id: collabId
  };

  const command = new PutCommand({
    TableName: COLLAB_TABLE_NAME,
    Item: newItem,
  });

  await docClient.send(command);
  return newItem;
}

/**
 * Obtiene todas las colaboraciones de una plataforma
 */
export async function getCollaborations(platform: Platform): Promise<Collaboration[]> {
  const command = new QueryCommand({
    TableName: COLLAB_TABLE_NAME,
    KeyConditionExpression: "#p = :p",
    ExpressionAttributeNames: { "#p": "platform" },
    ExpressionAttributeValues: { ":p": platform },
  });

  const response = await docClient.send(command);
  return (response.Items || []) as Collaboration[];
}

/**
 * Actualiza una colaboración con sus datos de engagement
 */
export async function updateCollabEngagement(
  platform: Platform,
  collaboration_id: string,
  engagement: { likes: number; comments: number }
): Promise<void> {
  const command = new UpdateCommand({
    TableName: COLLAB_TABLE_NAME,
    Key: { platform, collaboration_id },
    UpdateExpression: "SET post_engagement = :e",
    ExpressionAttributeValues: { ":e": engagement },
  });
  await docClient.send(command);
}

/**
 * Borra una colaboración de la DB
 */
export async function deleteCollaboration(platform: Platform, collaboration_id: string): Promise<void> {
  const command = new DeleteCommand({
    TableName: COLLAB_TABLE_NAME,
    Key: { platform, collaboration_id },
  });
  await docClient.send(command);
}

export async function saveHashtagStats(stats: Omit<HashtagStats, 'stat_date'>): Promise<void> {
  const today = new Date().toISOString().split('T')[0];

  const newItem: HashtagStats = {
    ...stats,
    stat_date: today,
  };

  const command = new PutCommand({
    TableName: HASHTAG_TABLE_NAME,
    Item: newItem,
  });

  await docClient.send(command); // (Puedes añadirle 'withRetry' si quieres)
  console.log(`DB: ✅ Estadísticas guardadas para #${stats.hashtag}`);
}

/**
 * Obtiene las estadísticas más recientes guardadas para un hashtag
 */
export async function getHashtagStats(hashtag: string): Promise<HashtagStats | null> {
  const command = new QueryCommand({
    TableName: HASHTAG_TABLE_NAME,
    KeyConditionExpression: "#h = :h",
    ExpressionAttributeNames: { "#h": "hashtag" },
    ExpressionAttributeValues: { ":h": hashtag },
    ScanIndexForward: false, // Ordenar por fecha (descendente)
    Limit: 1, // Traer solo el más reciente
  });

  const response = await docClient.send(command);
  if (!response.Items || response.Items.length === 0) {
    return null;
  }
  return response.Items[0] as HashtagStats;
}

export async function getDueScheduledPosts(): Promise<ScheduledPost[]> {
  const now = new Date().toISOString();

  const command = new QueryCommand({
    TableName: SCHEDULED_TABLE_NAME,
    // ¡Aquí usamos un Índice Secundario Global (GSI)!
    // Necesitas crear un GSI en tu tabla DynamoDB llamado 'StatusAndTimeIndex' con:
    // - Clave de partición: 'status' (String)
    // - Clave de ordenación: 'scheduled_time' (String)
    IndexName: "StatusAndTimeIndex",
    KeyConditionExpression: "#s = :status AND #st <= :now",
    ExpressionAttributeNames: {
      "#s": "status",
      "#st": "scheduled_time",
    },
    ExpressionAttributeValues: {
      ":status": "PENDING",
      ":now": now,
    },
  });

  const response = await docClient.send(command);
  return (response.Items || []) as ScheduledPost[];
}

export async function updateScheduledPostStatus(
  post_id: string,
  status: 'PUBLISHED' | 'FAILED',
  error?: string
): Promise<void> {
  const command = new UpdateCommand({
    TableName: SCHEDULED_TABLE_NAME,
    Key: { post_id },
    UpdateExpression: "SET #s = :status, error_message = :error",
    ExpressionAttributeNames: {
      "#s": "status",
    },
    ExpressionAttributeValues: {
      ":status": status,
      ":error": error || null,
    },
  });
  await docClient.send(command);
}

/**
 * Obtiene todos los posts pendientes
 */
export async function listPendingPosts(): Promise<ScheduledPost[]> {
  // Esta es la misma consulta que getDueScheduledPosts pero sin el filtro de tiempo
  const command = new QueryCommand({
    TableName: SCHEDULED_TABLE_NAME,
    IndexName: "StatusAndTimeIndex",
    KeyConditionExpression: "#s = :status",
    ExpressionAttributeNames: { "#s": "status" },
    ExpressionAttributeValues: { ":status": "PENDING" },
  });
  const response = await docClient.send(command);
  return (response.Items || []) as ScheduledPost[];
}

/**
 * Borra un post programado de la DB
 */
export async function deleteScheduledPost(post_id: string): Promise<void> {
  const command = new DeleteCommand({
    TableName: SCHEDULED_TABLE_NAME,
    Key: { post_id },
  });
  await docClient.send(command);
}
export async function saveDailyStats(
  platform: Platform,
  stats: DailyStats
): Promise<void> {
  if (!validateStats(stats)) return;

  const today = new Date().toISOString().split('T')[0];
  console.error(`DB: 📊 Guardando estadísticas para ${platform} del día ${today}...`);

  const command = new PutCommand({
    TableName: TABLE_NAME,
    Item: {
      platform,
      stat_date: today,
      ...stats,
      last_updated: new Date().toISOString(),
    },
  });

  try {
    await withRetry(() => docClient.send(command));
    console.error(`DB: ✅ Estadísticas de ${platform} guardadas.`);
  } catch (error: any) {
    console.error(`DB: ❌ Error al guardar en DynamoDB:`, error.message);
  }
}

export async function getStatsLastNDays(
  platform: Platform,
  days: number = 30
): Promise<StoredStats[]> {
  const date = new Date();
  date.setDate(date.getDate() - days);
  const startDate = date.toISOString().split('T')[0];

  console.error(`DB: 🔍 Obteniendo estadísticas de ${platform} desde ${startDate}...`);

  const command = new QueryCommand({
    TableName: TABLE_NAME,
    KeyConditionExpression: "#p = :p AND #d >= :d",
    ExpressionAttributeNames: {
      "#p": "platform",
      "#d": "stat_date",
    },
    ExpressionAttributeValues: {
      ":p": platform,
      ":d": startDate,
    },
  });

  try {
    const response = await docClient.send(command);
    console.error(`DB: ✅ Encontrados ${response.Items?.length || 0} registros.`);
    return (response.Items || []) as StoredStats[];
  } catch (error: any) {
    console.error(`DB: ❌ Error al consultar DynamoDB:`, error.message);
    return [];
  }
}

export async function getGrowthAnalysis(
  platform: Platform,
  days: number = 30
) {
  const stats = await getStatsLastNDays(platform, days);

  if (stats.length < 2) {
    return {
      error: "No hay suficientes datos para calcular crecimiento",
      platform,
      days
    };
  }

  stats.sort((a, b) => a.stat_date.localeCompare(b.stat_date));

  const oldest = stats[0];
  const newest = stats[stats.length - 1];

  const followersGrowth = newest.followers - oldest.followers;
  const followersGrowthRate = oldest.followers > 0
    ? ((followersGrowth / oldest.followers) * 100).toFixed(2)
    : '0';

  const postsGrowth = newest.posts_count - oldest.posts_count;

  return {
    platform,
    period: {
      start: oldest.stat_date,
      end: newest.stat_date,
      days: stats.length
    },
    followers: {
      start: oldest.followers,
      end: newest.followers,
      growth: followersGrowth,
      growthRate: `${followersGrowthRate}%`
    },
    posts: {
      start: oldest.posts_count,
      end: newest.posts_count,
      growth: postsGrowth,
      avgPerDay: stats.length > 0 ? (postsGrowth / stats.length).toFixed(1) : '0'
    },
    dailyData: stats
  };
}

export async function compareAllPlatforms(days: number = 30) {
  console.error(`DB: 🔍 Comparando todas las plataformas (${days} días)...`);

  const [instagram, facebook, threads] = await Promise.all([
    getGrowthAnalysis('instagram', days),
    getGrowthAnalysis('facebook', days),
    getGrowthAnalysis('threads', days)
  ]);

  const validPlatforms = [
    { name: 'instagram', data: instagram },
    { name: 'facebook', data: facebook },
    { name: 'threads', data: threads }
  ].filter(p => !p.data.error);

  const bestGrowth = validPlatforms.length > 0
    ? validPlatforms.reduce((best, current) => {
      const currentRate = parseFloat(current.data.followers?.growthRate || '0');
      const bestRate = parseFloat(best.data.followers?.growthRate || '0');
      return currentRate > bestRate ? current : best;
    }).name
    : 'ninguna';

  return {
    period: `Últimos ${days} días`,
    platforms: {
      instagram,
      facebook,
      threads
    },
    summary: {
      // Usamos 'reduce' en el array que ya filtramos
      totalFollowers: validPlatforms.reduce((total, platform) => {
        return total + (platform.data.followers?.end || 0);
      }, 0), // Inicia el total en 0

      bestGrowthPlatform: bestGrowth
    }
  };
}

export async function cleanOldData(
  platform: Platform,
  keepLastDays: number = 90
) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - keepLastDays);
  const cutoff = cutoffDate.toISOString().split('T')[0];

  console.error(`DB: 🧹 Limpiando datos de ${platform} anteriores a ${cutoff}...`);

  // 1. Encontrar todos los items viejos (igual que antes)
  const queryCommand = new QueryCommand({
    TableName: TABLE_NAME,
    KeyConditionExpression: "#p = :p AND #d < :cutoff",
    ExpressionAttributeNames: {
      "#p": "platform",
      "#d": "stat_date",
    },
    ExpressionAttributeValues: {
      ":p": platform,
      ":cutoff": cutoff,
    },
  });

  try {
    const response = await docClient.send(queryCommand);
    const oldItems = response.Items || [];

    if (oldItems.length === 0) {
      console.error("DB: ✅ No hay registros antiguos que eliminar.");
      return;
    }

    console.error(`DB: 🔎 Encontrados ${oldItems.length} registros para eliminar. Procesando en lotes de 25...`);

    // 2. Borrar en lotes de 25
    for (let i = 0; i < oldItems.length; i += 25) {
      const batch = oldItems.slice(i, i + 25);

      // Crear un array de peticiones de borrado
      const deleteRequests = batch.map(item => ({
        DeleteRequest: {
          Key: {
            platform: item.platform,
            stat_date: item.stat_date
          }
        }
      }));

      // Enviar el lote
      const batchCommand = new BatchWriteCommand({
        RequestItems: {
          [TABLE_NAME]: deleteRequests
        }
      });

      // (Opcional: puedes envolver esto en un withRetry también)
      await docClient.send(batchCommand);
    }

    console.error(`DB: ✅ ${oldItems.length} registros eliminados exitosamente.`);

  } catch (error: any) {
    console.error(`DB: ❌ Error limpiando datos:`, error.message);
  }
}

export async function saveScheduledPost(// Usamos Omit para decir "todos los campos de ScheduledPost MENOS post_id y status"
  data: Omit<ScheduledPost, 'post_id' | 'status'>
): Promise<string> {

  // 1. Genera un ID único para el post
  const postId = crypto.randomUUID();

  // 2. Crea el objeto completo que se guardará
  const newItem: ScheduledPost = {
    ...data,
    post_id: postId,
    status: 'PENDING', // Todos los posts empiezan como PENDIENTES
  };

  // 3. Crea el comando para DynamoDB
  const command = new PutCommand({
    TableName: SCHEDULED_TABLE_NAME,
    Item: newItem,
  });

  // 4. Envía el comando (con reintentos si implementaste withRetry)
  await docClient.send(command);

  // 5. Devuelve el ID al usuario
  return postId;
}
