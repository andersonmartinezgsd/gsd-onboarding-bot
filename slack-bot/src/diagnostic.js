import pkg from '@slack/bolt';
const { App } = pkg;
import { google } from 'googleapis';
import dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env') });

async function runSurgicalDiagnostic() {
  console.log('\n🩺 DIAGNÓSTICO QUIRÚRGICO DE GOOGLE WORKSPACE\n' + '='.repeat(45));

  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n').replace(/"/g, '');
  const adminEmail = process.env.GOOGLE_ADMIN_EMAIL;
  const domain = process.env.GOOGLE_DOMAIN;

  console.log('📝 Configuración detectada:');
  console.log('   - Email Cliente:', clientEmail);
  console.log('   - Email Admin:', adminEmail);
  console.log('   - Dominio:', domain);

  // 1. Probar LLave y Cuenta sin impersonar
  try {
    const authDirect = new google.auth.JWT(clientEmail, null, privateKey, ['https://www.googleapis.com/auth/cloud-platform']);
    await authDirect.getAccessToken();
    console.log('✅ 1. Llave y Service Account: VÁLIDAS');
  } catch (err) {
    console.log('❌ 1. Llave o Service Account: ERROR -', err.message);
    return;
  }

  // 2. Probar Impersonación con un solo scope (Drive)
  try {
    const authDrive = new google.auth.JWT(clientEmail, null, privateKey, ['https://www.googleapis.com/auth/drive'], adminEmail);
    await authDrive.getAccessToken();
    console.log('✅ 2. Delegación de Dominio (Scope Drive): FUNCIONA');
  } catch (err) {
    console.log('❌ 2. Delegación de Dominio (Scope Drive): FALLÓ');
    console.log('      Motivo:', err.message);
  }

  // 3. Probar Impersonación con scope de Usuarios (el que da el error)
  try {
    const authUsers = new google.auth.JWT(clientEmail, null, privateKey, ['https://www.googleapis.com/auth/admin.directory.user'], adminEmail);
    await authUsers.getAccessToken();
    console.log('✅ 3. Delegación de Dominio (Scope Users): FUNCIONA');
    
    // Si funciona, intentar listar 1 usuario para rematar
    const admin = google.admin({ version: 'directory_v1', auth: authUsers });
    const res = await admin.users.list({ domain: domain, maxResults: 1 });
    console.log('✅ 4. Lectura de Directorio: ÉXITO (' + (res.data.users?.length || 0) + ' usuarios encontrados)');
  } catch (err) {
    console.log('❌ 3. Delegación de Dominio (Scope Users): FALLÓ');
    console.log('      Motivo:', err.message);
    if (err.message.includes('unauthorized_client')) {
        console.log('\n💡 ANÁLISIS:');
        console.log('   Si el punto 1 es OK pero el 2 o 3 fallan, el problema es el correo de Admin');
        console.log('   o la configuración en admin.google.com.');
        console.log('   ¿Estás SEGURO de que ' + adminEmail + ' es SUPER ADMIN?');
    }
  }

  console.log('\n' + '='.repeat(45));
}

runSurgicalDiagnostic();
