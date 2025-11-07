// test-publicacion-simple.js
import axios from 'axios';
import fs from 'fs';
import dotenv from 'dotenv';
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import crypto from 'crypto';

dotenv.config();

const TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN;
const USER_ID = process.env.INSTAGRAM_USER_ID;
const S3_BUCKET = process.env.AWS_S3_BUCKET;
const AWS_REGION = process.env.AWS_REGION || 'us-east-1';

const s3Client = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

async function testPublicacion() {
  console.log('🔍 TEST DE PUBLICACIÓN\n');

  // 1. Verificar perfil (sin account_type)
  console.log('1️⃣ Verificando perfil...\n');
  try {
    const profileRes = await axios.get(`https://graph.facebook.com/v18.0/${USER_ID}`, {
      params: {
        fields: 'username,media_count',
        access_token: TOKEN
      }
    });
    console.log(`   ✅ Usuario: @${profileRes.data.username}`);
    console.log(`   Posts: ${profileRes.data.media_count}\n`);
  } catch (error) {
    console.log(`   ❌ Error: ${error.response?.data?.error?.message}\n`);
    return;
  }

  // 2. Crear imagen de prueba válida
  console.log('2️⃣ Creando imagen de prueba...\n');
  const testImagePath = 'test-ig.jpg';
  
  // Imagen JPEG válida de 100x100px (base64)
  const validJpeg = '/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCABkAGQDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlbaWmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD+/iiiigAooooAKKKKACiiigAooooA';
  
  fs.writeFileSync(testImagePath, Buffer.from(validJpeg, 'base64'));
  console.log(`   ✅ Imagen creada (${fs.statSync(testImagePath).size} bytes)\n`);

  // 3. Subir a S3
  console.log('3️⃣ Subiendo a S3...\n');
  let imageUrl;
  try {
    const fileContent = fs.readFileSync(testImagePath);
    const uniqueFileName = `test/${Date.now()}-${crypto.randomBytes(4).toString('hex')}.jpg`;

    await s3Client.send(new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: uniqueFileName,
      Body: fileContent,
      ContentType: 'image/jpeg',
    }));

    imageUrl = `https://${S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com/${uniqueFileName}`;
    console.log(`   ✅ URL: ${imageUrl}\n`);

    // Verificar accesibilidad
    const check = await axios.head(imageUrl);
    console.log(`   ✅ URL accesible (HTTP ${check.status})\n`);
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}\n`);
    fs.unlinkSync(testImagePath);
    return;
  }

  // 4. Crear contenedor
  console.log('4️⃣ Creando contenedor en Instagram...\n');
  try {
    const createRes = await axios.post(
      `https://graph.facebook.com/v18.0/${USER_ID}/media`,
      null,
      {
        params: {
          image_url: imageUrl,
          caption: 'Test MCP',
          access_token: TOKEN
        }
      }
    );

    console.log('   📦 Respuesta:');
    console.log(JSON.stringify(createRes.data, null, 2));
    console.log('');

    if (!createRes.data.id) {
      console.log('   ❌ No se recibió Media ID\n');
      fs.unlinkSync(testImagePath);
      return;
    }

    const creationId = createRes.data.id;
    console.log(`   ✅ Container ID: ${creationId}\n`);

    // 5. Publicar
    console.log('5️⃣ Publicando...\n');
    
    const publishRes = await axios.post(
      `https://graph.facebook.com/v18.0/${USER_ID}/media_publish`,
      null,
      {
        params: {
          creation_id: creationId,
          access_token: TOKEN
        }
      }
    );

    console.log('╔════════════════════════════════════════╗');
    console.log('║  ✅ ¡PUBLICADO CON ÉXITO!              ║');
    console.log('╚════════════════════════════════════════╝\n');
    console.log(`   Post ID: ${publishRes.data.id}\n`);

  } catch (error) {
    console.log('   ❌ ERROR:\n');
    
    if (error.response?.data?.error) {
      const err = error.response.data.error;
      console.log(`   Mensaje: ${err.message}`);
      console.log(`   Código: ${err.code}`);
      console.log(`   Subcode: ${err.error_subcode || 'N/A'}`);
      console.log(`   FB Trace: ${err.fbtrace_id}\n`);
      
      // Diagnóstico específico
      if (err.message.includes('Media ID')) {
        console.log('   💡 El contenedor no se creó. Posibles causas:');
        console.log('      • Imagen no cumple requisitos (min 320x320px)');
        console.log('      • Formato incorrecto');
        console.log('      • URL no accesible desde servidores de Instagram\n');
      }
    } else {
      console.log(`   ${error.message}\n`);
    }
  }

  // Limpiar
  fs.unlinkSync(testImagePath);
}

testPublicacion();