// test-page-token.js
import axios from 'axios';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function testToken() {
  const accessToken = await new Promise(resolve => {
    rl.question('Pega tu Access Token (puede ser de usuario o de página): ', resolve);
  });

  try {
    console.log('\n🔍 Probando acceso...\n');
    
    // Primero verificamos qué tipo de token es
    const debugResponse = await axios.get(
      'https://graph.facebook.com/v18.0/debug_token',
      {
        params: {
          input_token: accessToken.trim(),
          access_token: accessToken.trim()
        }
      }
    );

    console.log('📋 Información del token:');
    console.log(`   Tipo: ${debugResponse.data.data.type}`);
    console.log(`   App ID: ${debugResponse.data.data.app_id}`);
    console.log(`   Válido: ${debugResponse.data.data.is_valid ? '✅' : '❌'}`);
    console.log(`   Expira: ${debugResponse.data.data.expires_at === 0 ? 'Nunca' : new Date(debugResponse.data.data.expires_at * 1000)}\n`);

    // Si es un Page Token, consultar directamente
    if (debugResponse.data.data.type === 'PAGE') {
      const pageId = debugResponse.data.data.data.page_id || debugResponse.data.data.user_id;
      
      console.log('✅ Es un Page Access Token');
      console.log(`   Page ID: ${pageId}\n`);
      
      // Obtener Instagram directamente
      const instagramResponse = await axios.get(
        `https://graph.facebook.com/v18.0/${pageId}`,
        {
          params: {
            fields: 'instagram_business_account{id,username,name,followers_count,media_count}',
            access_token: accessToken.trim()
          }
        }
      );

      if (instagramResponse.data.instagram_business_account) {
        const ig = instagramResponse.data.instagram_business_account;
        console.log('╔════════════════════════════════════════════╗');
        console.log('║  ✅ INSTAGRAM ENCONTRADO                   ║');
        console.log('╚════════════════════════════════════════════╝\n');
        console.log(`📸 Usuario: @${ig.username}`);
        console.log(`👤 Nombre: ${ig.name || 'N/A'}`);
        console.log(`👥 Seguidores: ${ig.followers_count || 'N/A'}`);
        console.log(`📷 Posts: ${ig.media_count || 'N/A'}`);
        console.log(`\n🆔 Instagram User ID: ${ig.id}\n`);
        console.log('📝 Usa esto en tu .env:');
        console.log(`INSTAGRAM_USER_ID=${ig.id}`);
        console.log(`INSTAGRAM_ACCESS_TOKEN=${accessToken.trim()}`);
      } else {
        console.log('❌ Esta página no tiene Instagram vinculado');
      }

    } else {
      // Es un User Token, buscar páginas
      console.log('ℹ️  Es un User Access Token, buscando páginas...\n');
      
      const pagesResponse = await axios.get(
        'https://graph.facebook.com/v18.0/me/accounts',
        {
          params: {
            fields: 'id,name,access_token,instagram_business_account',
            access_token: accessToken.trim()
          }
        }
      );

      const pages = pagesResponse.data.data;
      
      if (pages.length === 0) {
        console.log('❌ No se encontraron páginas accesibles');
        console.log('\n💡 Posibles causas:');
        console.log('   • Tu página está en un Business Portfolio');
        console.log('   • No tienes rol de administrador en la página');
        console.log('   • Falta el permiso pages_show_list\n');
        console.log('🔧 Solución: Genera un Page Access Token desde Graph API Explorer');
        console.log('   seleccionando tu página directamente en el dropdown.');
      } else {
        console.log(`📄 Páginas encontradas: ${pages.length}\n`);
        pages.forEach((page, i) => {
          console.log(`${i + 1}. ${page.name}`);
          if (page.instagram_business_account) {
            console.log(`   ✅ Instagram: ${page.instagram_business_account.id}`);
          } else {
            console.log(`   ❌ Sin Instagram`);
          }
        });
      }
    }

  } catch (error) {
    console.error('\n❌ Error:', error.response?.data?.error?.message || error.message);
    console.log('\n💡 Verifica:');
    console.log('   • El token es válido');
    console.log('   • Tienes los permisos correctos');
    console.log('   • Tu página no está bloqueada por el Portfolio');
  } finally {
    rl.close();
  }
}

testToken();
