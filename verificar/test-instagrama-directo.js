// test-instagram-directo.js
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN;
const USER_ID = process.env.INSTAGRAM_USER_ID;

async function testInstagram() {
  console.log('🧪 Probando Instagram con diferentes métodos...\n');

  try {
    // Método 1: Usando Facebook Graph (no Instagram Graph)
    console.log('1️⃣ Método 1: Via Facebook Graph API...');
    const fbResponse = await axios.get(
      `https://graph.facebook.com/v18.0/${USER_ID}`,
      {
        params: {
          fields: 'id,username,followers_count,media_count',
          access_token: TOKEN
        }
      }
    );

    console.log('✅ ¡FUNCIONA con Facebook Graph API!');
    console.log(`   @${fbResponse.data.username}`);
    console.log(`   Seguidores: ${fbResponse.data.followers_count}`);
    console.log(`   Posts: ${fbResponse.data.media_count}\n`);

    // Método 2: Obtener posts
    console.log('2️⃣ Obteniendo posts...');
    const postsResponse = await axios.get(
      `https://graph.facebook.com/v18.0/${USER_ID}/media`,
      {
        params: {
          fields: 'id,caption,media_type,timestamp',
          limit: 3,
          access_token: TOKEN
        }
      }
    );

    console.log(`✅ Posts obtenidos: ${postsResponse.data.data.length}\n`);

    postsResponse.data.data.forEach((post, i) => {
      console.log(`   ${i + 1}. ${post.media_type} - ${new Date(post.timestamp).toLocaleDateString()}`);
      if (post.caption) {
        console.log(`      "${post.caption.substring(0, 50)}..."`);
      }
    });

    console.log('\n╔════════════════════════════════════════════╗');
    console.log('║  ✅ ¡TODO FUNCIONA!                        ║');
    console.log('╚════════════════════════════════════════════╝\n');

    console.log('🔧 Actualiza tu servidor MCP:');
    console.log('   Cambia todas las URLs de:');
    console.log('   ❌ https://graph.instagram.com/v18.0');
    console.log('   ✅ https://graph.facebook.com/v18.0\n');

  } catch (error) {
    console.error('❌ Error:', error.response?.data?.error?.message || error.message);
    
    if (error.response?.data?.error) {
      console.log('\nDetalles:', error.response.data.error);
    }
  }
}

testInstagram();