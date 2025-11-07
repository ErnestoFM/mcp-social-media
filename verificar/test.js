// test-mcp.js
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const TOKEN = 'EAAvphgMl7NUBPiQhrzEkLQmViH6lCyjAvprcMqUDp3yjvYU1M9IdC73WrqFoZCdRossPvOJE8L1LQZByZBsxKZAU7Yp6EYyDNrJUAPkiincVm3IAlftvZAhG9KwoPt0nNMhTSNuffJPs58om7vHHZAlFN59NzJ1miPh42LuWG1MgxetWyIS4QjPIsuZAoUUJeQ1jQZDZD';
const USER_ID = '17841475997356098';

async function test() {
  console.log('🧪 Probando conexión a Instagram...\n');

  try {
    // Test 1: Perfil
    const profile = await axios.get(
      `https://graph.instagram.com/v18.0/${USER_ID}`,
      {
        params: {
          fields: 'username,followers_count,media_count',
          access_token: TOKEN
        }
      }
    );

    console.log('✅ Perfil obtenido:');
    console.log(`   @${profile.data.username}`);
    console.log(`   ${profile.data.followers_count} seguidores`);
    console.log(`   ${profile.data.media_count} posts\n`);

    // Test 2: Posts
    const posts = await axios.get(
      `https://graph.instagram.com/v18.0/${USER_ID}/media`,
      {
        params: {
          fields: 'id,caption',
          limit: 3,
          access_token: TOKEN
        }
      }
    );

    console.log(`✅ Últimos ${posts.data.data.length} posts obtenidos\n`);

    console.log('╔═══════════════════════════════════════╗');
    console.log('║  ✅ ¡TODO FUNCIONA CORRECTAMENTE!    ║');
    console.log('╚═══════════════════════════════════════╝\n');
    console.log('Ahora puedes:');
    console.log('1. npm run build');
    console.log('2. Configurar Claude Desktop');
    console.log('3. ¡Usar tu servidor MCP!\n');

  } catch (error) {
    console.error('❌ Error:', error.response?.data?.error?.message || error.message);
  }
}

test();