// get-instagram-id.ts
import axios from 'axios';
import * as readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query: string): Promise<string> {
  return new Promise(resolve => {
    rl.question(query, resolve);
  });
}

async function getInstagramUserId() {
  console.log('🔍 Obteniendo tu Instagram User ID...\n');

  try {
    // Solicitar el Access Token
    const accessToken = await question('📝 Pega tu Access Token de Graph API Explorer: ');
    
    console.log('\n⏳ Buscando tus páginas de Facebook...\n');

    // Paso 1: Obtener las páginas de Facebook del usuario
    const pagesResponse = await axios.get(
      'https://graph.facebook.com/v18.0/me/accounts',
      {
        params: {
          access_token: accessToken.trim()
        }
      }
    );

    const pages = pagesResponse.data.data;

    if (pages.length === 0) {
      console.log('❌ No se encontraron páginas de Facebook asociadas.');
      console.log('💡 Asegúrate de tener una página de Facebook y que esté vinculada a tu Instagram Business.');
      rl.close();
      return;
    }

    // Mostrar las páginas disponibles
    console.log('📄 Páginas de Facebook encontradas:\n');
    pages.forEach((page: any, index: number) => {
      console.log(`${index + 1}. ${page.name} (ID: ${page.id})`);
    });

    // Si hay múltiples páginas, preguntar cuál usar
    let selectedPage;
    if (pages.length > 1) {
      const selection = await question(`\n🔢 Selecciona el número de tu página (1-${pages.length}): `);
      const index = parseInt(selection) - 1;
      selectedPage = pages[index];
    } else {
      selectedPage = pages[0];
    }

    console.log(`\n✅ Usando página: ${selectedPage.name}`);
    console.log(`📋 Page ID: ${selectedPage.id}\n`);

    // Paso 2: Obtener la cuenta de Instagram vinculada
    console.log('⏳ Buscando cuenta de Instagram vinculada...\n');

    const instagramResponse = await axios.get(
      `https://graph.facebook.com/v18.0/${selectedPage.id}`,
      {
        params: {
          fields: 'instagram_business_account',
          access_token: accessToken.trim()
        }
      }
    );

    if (!instagramResponse.data.instagram_business_account) {
      console.log('❌ Esta página no tiene una cuenta de Instagram Business vinculada.');
      console.log('\n📱 Para vincular tu Instagram:');
      console.log('   1. Abre la app de Instagram');
      console.log('   2. Ve a Configuración → Cuenta');
      console.log('   3. Cambia a "Cuenta profesional"');
      console.log('   4. Vincula con tu página de Facebook\n');
      rl.close();
      return;
    }

    const instagramUserId = instagramResponse.data.instagram_business_account.id;

    // Obtener información adicional del perfil
    const profileResponse = await axios.get(
      `https://graph.facebook.com/v18.0/${instagramUserId}`,
      {
        params: {
          fields: 'username,name,profile_picture_url,followers_count,media_count',
          access_token: accessToken.trim()
        }
      }
    );

    // Mostrar resultados
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║           ✅ INSTAGRAM USER ID ENCONTRADO                  ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    console.log(`📸 Usuario: @${profileResponse.data.username}`);
    console.log(`👤 Nombre: ${profileResponse.data.name || 'No disponible'}`);
    console.log(`👥 Seguidores: ${profileResponse.data.followers_count || 'No disponible'}`);
    console.log(`📷 Posts: ${profileResponse.data.media_count || 'No disponible'}\n`);

    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log(`║  Instagram User ID: ${instagramUserId.padEnd(37)}║`);
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    console.log('📝 Copia esto a tu archivo .env:\n');
    console.log(`INSTAGRAM_USER_ID=${instagramUserId}`);
    console.log(`INSTAGRAM_ACCESS_TOKEN=${accessToken.trim()}\n`);

    console.log('✨ ¡Listo! Ya puedes usar estos valores en tu servidor MCP.\n');

  } catch (error: any) {
    console.error('\n❌ Error:', error.response?.data?.error?.message || error.message);
    
    if (error.response?.status === 400) {
      console.log('\n💡 Posibles soluciones:');
      console.log('   • Verifica que el Access Token sea correcto');
      console.log('   • Asegúrate de haber dado los permisos necesarios');
      console.log('   • Revisa que tu token no haya expirado\n');
    }
  } finally {
    rl.close();
  }
}

// Ejecutar
console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║    🔍 Herramienta para obtener Instagram User ID          ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

getInstagramUserId();