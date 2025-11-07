// verificar-permisos-token.js
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN;

async function verificar() {
  console.log('🔍 Verificando permisos del token...\n');

  try {
    const response = await axios.get(
      'https://graph.facebook.com/v18.0/debug_token',
      {
        params: {
          input_token: TOKEN,
          access_token: TOKEN
        }
      }
    );

    const data = response.data.data;

    console.log('Token Info:');
    console.log(`  Tipo: ${data.type}`);
    console.log(`  Válido: ${data.is_valid ? '✅' : '❌'}`);
    console.log(`  Expira: ${data.expires_at === 0 ? 'Nunca' : new Date(data.expires_at * 1000).toLocaleString()}\n`);

    console.log('📋 Permisos actuales:\n');

    const permisos = data.scopes || [];
    
    const necesarios = [
      'instagram_basic',
      'instagram_content_publish',
      'instagram_manage_comments',
      'pages_read_engagement',
      'pages_show_list'
    ];

    necesarios.forEach(permiso => {
      const tiene = permisos.includes(permiso);
      console.log(`${tiene ? '✅' : '❌'} ${permiso}`);
    });

    console.log('\n📦 Otros permisos:');
    permisos
      .filter(p => !necesarios.includes(p))
      .forEach(p => console.log(`   • ${p}`));

    const faltantes = necesarios.filter(p => !permisos.includes(p));

    if (faltantes.length > 0) {
      console.log('\n⚠️  PERMISOS FALTANTES:');
      faltantes.forEach(p => console.log(`   ❌ ${p}`));
      console.log('\n🔧 Genera un nuevo token con estos permisos en Graph API Explorer.\n');
    } else {
      console.log('\n✅ ¡Todos los permisos necesarios están presentes!\n');
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data?.error?.message || error.message);
  }
}

verificar();