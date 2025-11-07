// diagnosticar-token.js
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

// Carga TODOS los tokens
const INSTA_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN;
const FB_PAGE_TOKEN = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
const USER_ID = process.env.INSTAGRAM_USER_ID;
const PAGE_ID = process.env.FACEBOOK_PAGE_ID;

// Función de diagnóstico genérica
async function checkToken(token, tokenName) {
  if (!token) {
    console.error(`❌ ${tokenName} no encontrado en .env\n`);
    return false;
  }
  
  console.log(`🔍 Diagnosticando ${tokenName}...\n`);
  let isValid = true;

  try {
    const debugResponse = await axios.get(
      'https://graph.facebook.com/v18.0/debug_token',
      {
        params: {
          input_token: token,
          access_token: token // Puedes usar el mismo token para depurarse a sí mismo
        }
      }
    );

    const tokenInfo = debugResponse.data.data;
    console.log(`✅ Token ${tokenName} es válido`);
    console.log(`   App ID:`, tokenInfo.app_id);
    console.log(`   User ID:`, tokenInfo.user_id);
    console.log(`   Expira:`, tokenInfo.expires_at === 0 ? 'Nunca' : new Date(tokenInfo.expires_at * 1000).toLocaleString());
    
    console.log('\n   Permisos (Scopes):');
    const scopes = tokenInfo.scopes || [];
    scopes.forEach(scope => console.log(`   ✓ ${scope}`));

    // --- Verificar permisos REQUERIDOS ---
    let required = [];
    if (tokenName === 'INSTAGRAM_ACCESS_TOKEN') {
      required = [
        'instagram_basic', 
        'instagram_content_publish', 
        'threads_publishing_content', // <-- NUEVO
        'threads_read_replies'        // <-- NUEVO
      ];
    } else if (tokenName === 'FACEBOOK_PAGE_ACCESS_TOKEN') {
      required = ['pages_manage_posts', 'pages_read_engagement'];
    }

    const missing = required.filter(p => !scopes.includes(p));
    
    if (missing.length > 0) {
      console.log('\n   ❌ PERMISOS FALTANTES para este token:');
      missing.forEach(p => console.log(`   - ${p}`));
      isValid = false;
    } else {
      console.log('\n   ✅ Todos los permisos necesarios están presentes.');
    }

  } catch (error) {
    console.error(`\n❌ Error al diagnosticar ${tokenName}:`, error.response?.data?.error?.message || error.message);
    if (error.response?.data?.error?.code === 190) {
      console.log('💡 SOLUCIÓN: El token es inválido o expiró. Genera uno nuevo.\n');
    }
    isValid = false;
  }
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  return isValid;
}

async function diagnosticarTodo() {
  const isInstaValid = await checkToken(INSTA_TOKEN, 'INSTAGRAM_ACCESS_TOKEN');
  const isFbValid = await checkToken(FB_PAGE_TOKEN, 'FACEBOOK_PAGE_ACCESS_TOKEN');

  if (isInstaValid && isFbValid) {
    console.log("✅ ¡Diagnóstico completado! Todos los tokens parecen estar configurados correctamente.");
  } else {
    console.error("❌ Diagnóstico falló. Revisa los permisos o tokens expirados.");
  }
}

diagnosticarTodo();