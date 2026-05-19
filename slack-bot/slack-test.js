import pkg from '@slack/bolt';
const { App } = pkg;
import dotenv from 'dotenv';

// El script ahora usará directamente las variables de entorno si están presentes
async function testSlack() {
  console.log('--- Probando Conexión de Slack ---');
  
  const botToken = process.env.SLACK_BOT_TOKEN;
  const appToken = process.env.SLACK_APP_TOKEN;
  const signingSecret = process.env.SLACK_SIGNING_SECRET;

  console.log('Tokens detectados:');
  console.log('- Bot Token empieza con:', botToken ? botToken.substring(0, 10) + '...' : 'MISSING');
  console.log('- App Token empieza con:', appToken ? appToken.substring(0, 10) + '...' : 'MISSING');

  if (!botToken || botToken.includes('your-bot-token') || botToken.startsWith('xoxp-')) {
    if (botToken && botToken.startsWith('xoxp-')) {
        console.error('❌ Error: Estás usando un User Token (xoxp-). Debes usar un Bot User OAuth Token (xoxb-).');
    } else {
        console.error('❌ Error: Tokens no configurados correctamente.');
    }
    return;
  }

  try {
    const app = new App({
      token: botToken,
      signingSecret: signingSecret,
      socketMode: true,
      appToken: appToken,
    });

    await app.start();
    const auth = await app.client.auth.test();
    
    console.log('\n✨ ¡CONEXIÓN EXITOSA! ✨');
    console.log('Bot Name:', auth.user);
    console.log('Workspace:', auth.team);
    
    await app.stop();
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    process.exit(1);
  }
}

testSlack();
