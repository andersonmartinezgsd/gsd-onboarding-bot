import { google } from 'googleapis';
import dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env') });

async function testDirect() {
  console.log('--- Probando Conexión Directa (Sin Impersonación) ---');
  try {
    const auth = new google.auth.JWT({
      email: process.env.GOOGLE_CLIENT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n').replace(/"/g, ''),
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });

    const token = await auth.getAccessToken();
    console.log('✅ ÉXITO: La Service Account y la Llave son VÁLIDAS.');
    console.log('Token obtenido correctamente.');
    console.log('\nCONCLUSIÓN: El error "unauthorized_client" se debe ÚNICAMENTE a que falta configurar el "Domain-wide Delegation" en el panel de Google Admin para el correo ' + process.env.GOOGLE_ADMIN_EMAIL);
  } catch (err) {
    console.log('❌ ERROR: Ni siquiera la Service Account puede conectar. Revisa la GOOGLE_PRIVATE_KEY.');
    console.error(err.message);
  }
}
testDirect();
