// db/dynamodb.ts
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { 
  DynamoDBDocumentClient, 
  PutCommand, 
  QueryCommand,
  DeleteCommand,
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

const client = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  }
});

const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || "social_stats";

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