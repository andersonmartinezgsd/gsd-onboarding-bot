import { appConfig } from '../config/index.js';
import { logger } from '../utils/logger.js';
import { createHmac } from 'crypto';

export async function notifyWebhook(event, payload) {
  if (!appConfig.webhook.enabled) return;

  const body = JSON.stringify({ event, payload, ts: Date.now() });
  const headers = {
    'Content-Type': 'application/json',
  };

  if (appConfig.webhook.secret) {
    const sig = createHmac('sha256', appConfig.webhook.secret).update(body).digest('hex');
    headers['X-Signature-256'] = `sha256=${sig}`;
  }

  try {
    const res = await fetch(appConfig.webhook.url, { method: 'POST', headers, body });
    if (!res.ok) {
      logger.warn('Webhook delivery failed', { event, status: res.status });
    } else {
      logger.debug('Webhook delivered', { event });
    }
  } catch (err) {
    logger.warn('Webhook delivery error', { event, error: err.message });
  }
}
