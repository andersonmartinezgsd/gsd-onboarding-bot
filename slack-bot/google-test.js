/**
 * google-test.js — Verificación completa de la integración con Google Workspace.
 *
 * Ejecutar: node google-test.js
 *
 * Pruebas:
 *   1. Autenticación con Service Account (domain-wide delegation)
 *   2. Listar usuarios del dominio (valida scope directory.user)
 *   3. Crear usuario de prueba  → TEST_bot_verify@domain
 *   4. Verificar que el usuario existe
 *   5. Eliminar el usuario de prueba (limpieza)
 *   6. Listar archivos en la carpeta de onboarding (valida scope drive)
 */

import { google } from 'googleapis';
import dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env') });

const C = {
  reset:  '\x1b[0m',
  green:  '\x1b[32m',
  red:    '\x1b[31m',
  yellow: '\x1b[33m',
  cyan:   '\x1b[36m',
  bold:   '\x1b[1m',
};

function ok(msg)   { console.log(`${C.green}  ✔ ${msg}${C.reset}`); }
function fail(msg) { console.error(`${C.red}  ✘ ${msg}${C.reset}`); }
function info(msg) { console.log(`${C.cyan}  ℹ ${msg}${C.reset}`); }
function warn(msg) { console.log(`${C.yellow}  ⚠ ${msg}${C.reset}`); }
function step(msg) { console.log(`\n${C.bold}${C.cyan}▶ ${msg}${C.reset}`); }

// ── Config ─────────────────────────────────────────────────────────────────────

const cfg = {
  clientEmail:  process.env.GOOGLE_CLIENT_EMAIL,
  privateKey:   (process.env.GOOGLE_PRIVATE_KEY ?? '').replace(/\\n/g, '\n').replace(/^"|"$/g, ''),
  adminEmail:   process.env.GOOGLE_ADMIN_EMAIL,
  domain:       process.env.GOOGLE_DOMAIN,
  driveFolderId: process.env.GOOGLE_ONBOARDING_DRIVE_FOLDER_ID,
};

console.log(`\n${C.bold}═══════════════════════════════════════════════════${C.reset}`);
console.log(`${C.bold}  Verificación integración Google Workspace${C.reset}`);
console.log(`${C.bold}═══════════════════════════════════════════════════${C.reset}`);
info(`Service Account : ${cfg.clientEmail}`);
info(`Admin impersonado: ${cfg.adminEmail}`);
info(`Dominio          : ${cfg.domain}`);
info(`Drive folder ID  : ${cfg.driveFolderId ?? '(no configurado)'}`);

// ── Validate config present ────────────────────────────────────────────────────

step('0. Verificar variables de entorno');
let configOk = true;
for (const [key, val] of Object.entries(cfg)) {
  if (!val && key !== 'driveFolderId') {
    fail(`${key} no está configurado`);
    configOk = false;
  }
}
if (!configOk) {
  console.error(`\n${C.red}Configura las variables GOOGLE_* en el .env antes de continuar.${C.reset}`);
  process.exit(1);
}
ok('Variables de entorno presentes');

// ── Auth ───────────────────────────────────────────────────────────────────────

function getAuth(extraScopes = []) {
  return new google.auth.JWT({
    email:   cfg.clientEmail,
    key:     cfg.privateKey,
    scopes: [
      'https://www.googleapis.com/auth/admin.directory.user',
      'https://www.googleapis.com/auth/admin.directory.customer.readonly',
      'https://www.googleapis.com/auth/drive',
      ...extraScopes,
    ],
    subject: cfg.adminEmail,
  });
}

// ── Tests ──────────────────────────────────────────────────────────────────────

async function test1_authenticate() {
  step('1. Autenticación (obtener access token)');
  try {
    const auth = getAuth();
    const tokenInfo = await auth.getAccessToken();
    ok(`Token obtenido correctamente (expira en ~${Math.round((auth.credentials?.expiry_date - Date.now()) / 60000)} min)`);
    return auth;
  } catch (err) {
    fail(`Autenticación fallida: ${err.message}`);
    if (err.message.includes('invalid_grant')) {
      warn('Causa probable: la clave privada está mal formateada o el servicio de cuenta no tiene domain-wide delegation habilitado.');
      warn('Verifica en: Google Admin → Seguridad → Acceso a la API → Administrar la delegación en todo el dominio');
    }
    throw err;
  }
}

async function test2_listUsers(auth) {
  step('2. Listar usuarios del dominio (scope: admin.directory.user)');
  const adminClient = google.admin({ version: 'directory_v1', auth });
  try {
    const { data } = await adminClient.users.list({
      domain:     cfg.domain,
      maxResults: 3,
      orderBy:    'email',
    });
    const users = data.users ?? [];
    ok(`Directorio accesible — ${data.nextPageToken ? '3+' : users.length} usuario(s) encontrado(s)`);
    users.slice(0, 3).forEach((u) => info(`  ${u.primaryEmail} | ${u.name?.fullName ?? '—'}`));
    return true;
  } catch (err) {
    fail(`No se pudo listar usuarios: ${err.message}`);
    if (err.code === 403) {
      warn('Error 403: el service account no tiene delegación en todo el dominio para este scope.');
      warn('Solución: Google Admin Console → Seguridad → API → Delegación de todo el dominio');
      warn(`  Client ID: ${await getClientId(auth)}`);
      warn(`  Scopes: https://www.googleapis.com/auth/admin.directory.user,https://www.googleapis.com/auth/drive,https://www.googleapis.com/auth/admin.directory.customer.readonly`);
    }
    throw err;
  }
}

async function test3_createTestUser(auth) {
  step('3. Crear usuario de prueba');
  const adminClient = google.admin({ version: 'directory_v1', auth });
  const testEmail = `bot.test.verify@${cfg.domain}`;

  try {
    const { data } = await adminClient.users.insert({
      requestBody: {
        name:      { givenName: 'Bot', familyName: 'TestVerify' },
        primaryEmail: testEmail,
        password:  'T3st@B0t!2026',
        changePasswordAtNextLogin: true,
        orgUnitPath: '/',
      },
    });
    ok(`Usuario de prueba creado: ${data.primaryEmail} (ID: ${data.id})`);
    return { email: testEmail, id: data.id };
  } catch (err) {
    if (err.code === 409) {
      warn(`El usuario ${testEmail} ya existe (de una prueba anterior). Continuando...`);
      try {
        const { data } = await adminClient.users.get({ userKey: testEmail });
        return { email: testEmail, id: data.id };
      } catch (_) {}
    }
    fail(`No se pudo crear el usuario de prueba: ${err.message}`);
    if (err.code === 403) warn('Verifica que el scope admin.directory.user tenga permiso de ESCRITURA (no solo lectura).');
    throw err;
  }
}

async function test4_verifyUserExists(auth, testUser) {
  step('4. Verificar que el usuario existe en el directorio');
  // Google Directory propagation typically takes 2-5 seconds after creation
  info('Esperando 5s para propagación en el directorio...');
  await new Promise((r) => setTimeout(r, 5000));

  const adminClient = google.admin({ version: 'directory_v1', auth });
  try {
    const { data } = await adminClient.users.get({ userKey: testUser.email });
    ok(`Usuario verificado: ${data.primaryEmail} | Suspendido: ${data.suspended}`);
    return true;
  } catch (err) {
    fail(`No se pudo verificar el usuario: ${err.message}`);
    throw err;
  }
}

async function test5_deleteTestUser(auth, testUser) {
  step('5. Eliminar usuario de prueba (limpieza)');
  const adminClient = google.admin({ version: 'directory_v1', auth });
  try {
    await adminClient.users.delete({ userKey: testUser.email });
    ok(`Usuario de prueba eliminado: ${testUser.email}`);
    return true;
  } catch (err) {
    warn(`No se pudo eliminar el usuario de prueba: ${err.message}`);
    warn(`Por favor elimina manualmente: ${testUser.email}`);
    return false;
  }
}

async function test6_driveAccess(auth) {
  step('6. Verificar acceso a Google Drive');
  const drive = google.drive({ version: 'v3', auth });

  try {
    if (cfg.driveFolderId) {
      // Verify access to the specific onboarding folder
      const { data } = await drive.files.get({
        fileId:          cfg.driveFolderId,
        fields:          'id, name, mimeType',
        supportsAllDrives: true,
      });
      ok(`Carpeta de onboarding accesible: "${data.name}" (${data.id})`);

      // Try to create a test folder inside it
      const testFolderName = `[TEST] bot-verify-${Date.now()}`;
      const { data: created } = await drive.files.create({
        requestBody: {
          name:     testFolderName,
          mimeType: 'application/vnd.google-apps.folder',
          parents:  [cfg.driveFolderId],
        },
        fields: 'id, name, webViewLink',
        supportsAllDrives: true,
      });
      ok(`Subcarpeta de prueba creada: "${created.name}"`);
      info(`  URL: ${created.webViewLink}`);

      // Clean up test folder
      await drive.files.delete({ fileId: created.id, supportsAllDrives: true });
      ok('Subcarpeta de prueba eliminada (limpieza)');
    } else {
      // Fallback: just list files in My Drive
      const { data } = await drive.files.list({ pageSize: 1, fields: 'files(id, name)' });
      ok(`Drive accesible — ${data.files?.length ?? 0} archivo(s) visibles`);
      warn('GOOGLE_ONBOARDING_DRIVE_FOLDER_ID no configurado — las carpetas se crearán en My Drive del admin.');
      warn('Configura GOOGLE_ONBOARDING_DRIVE_FOLDER_ID=0AFXARejfds2BUk9PVA en el .env');
    }
    return true;
  } catch (err) {
    fail(`Error accediendo a Drive: ${err.message}`);
    if (err.code === 404) warn('La carpeta de Drive no existe o el service account no tiene acceso. Comparte la carpeta con el service account o con todo el dominio.');
    if (err.code === 403) warn('Sin permisos en Drive. Verifica que el scope drive esté en la delegación.');
    return false;
  }
}

async function getClientId(auth) {
  try {
    await auth.getAccessToken();
    return auth.key ? '(verificar en Google Cloud Console → IAM → Service Accounts)' : '—';
  } catch (_) { return '—'; }
}

// ── Main ───────────────────────────────────────────────────────────────────────

async function main() {
  let testUser = null;
  let exitCode = 0;

  try {
    const auth = await test1_authenticate();
    await test2_listUsers(auth);
    testUser = await test3_createTestUser(auth);
    await test4_verifyUserExists(auth, testUser);
    await test5_deleteTestUser(auth, testUser);
    await test6_driveAccess(auth);

    console.log(`\n${C.bold}${C.green}═══════════════════════════════════════════════════${C.reset}`);
    console.log(`${C.bold}${C.green}  ✔ Todas las pruebas pasaron — el bot está listo${C.reset}`);
    console.log(`${C.bold}${C.green}═══════════════════════════════════════════════════${C.reset}\n`);
  } catch (err) {
    console.log(`\n${C.bold}${C.red}═══════════════════════════════════════════════════${C.reset}`);
    console.log(`${C.bold}${C.red}  ✘ Una o más pruebas fallaron${C.reset}`);
    console.log(`${C.bold}${C.red}═══════════════════════════════════════════════════${C.reset}\n`);
    exitCode = 1;
  } finally {
    // Safety: ensure test user is always cleaned up
    if (testUser) {
      try {
        const auth = getAuth();
        const adminClient = google.admin({ version: 'directory_v1', auth });
        await adminClient.users.delete({ userKey: testUser.email }).catch(() => {});
      } catch (_) {}
    }
  }

  process.exit(exitCode);
}

main();
