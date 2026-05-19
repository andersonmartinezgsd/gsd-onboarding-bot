/**
 * ScaleFusion MDM Integration
 * API Docs: https://scalefusion.com/api-docs
 *
 * ScaleFusion es un MDM (Mobile Device Management) que permite:
 *   - Bloquear dispositivos remotamente (offboarding)
 *   - Desactivar/limpiar dispositivos (wipe)
 *   - Listar dispositivos asignados a un usuario
 *   - Enviar mensajes al dispositivo
 *
 * Auth: API key en header X-MspAPI-Token
 * Base URL: https://api.scalefusion.com/api/v1
 */

import { appConfig } from '../config/index.js';
import { logger } from '../utils/logger.js';
import { IntegrationError } from '../utils/errors.js';

const BASE_URL = 'https://api.scalefusion.com/api/v1';

async function apiRequest(method, path, body = null) {
  if (!appConfig.scalefusion?.enabled) {
    return { skipped: true, reason: 'ScaleFusion not configured' };
  }

  const url = `${BASE_URL}${path}`;
  const headers = {
    'X-MspAPI-Token': appConfig.scalefusion.apiKey,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`ScaleFusion API ${res.status}: ${errText}`);
  }

  if (res.status === 204) return { success: true };
  return res.json();
}

export const scalefusion = {
  /**
   * Lista todos los dispositivos registrados en el tenant.
   * Útil para encontrar los dispositivos de un empleado por email.
   */
  async listDevices(page = 1) {
    if (!appConfig.scalefusion?.enabled) return { skipped: true };
    try {
      return await apiRequest('GET', `/devices?page=${page}&per_page=50`);
    } catch (err) {
      throw new IntegrationError('ScaleFusion', `Error listando dispositivos: ${err.message}`);
    }
  },

  /**
   * Busca dispositivos asignados a un usuario por email.
   * Devuelve array de dispositivos encontrados.
   */
  async findDevicesByEmail(email) {
    if (!appConfig.scalefusion?.enabled) return { skipped: true, devices: [] };
    try {
      const data = await apiRequest('GET', `/devices?search=${encodeURIComponent(email)}`);
      const devices = data?.data ?? data?.devices ?? [];
      logger.info('ScaleFusion devices found', { email, count: devices.length });
      return { success: true, devices };
    } catch (err) {
      logger.warn('ScaleFusion device search failed', { email, error: err.message });
      return { success: false, devices: [], error: err.message };
    }
  },

  /**
   * Bloquea un dispositivo remotamente.
   * Muestra pantalla de bloqueo con mensaje opcional.
   * Usar en offboarding para bloquear el equipo del empleado saliente.
   */
  async lockDevice(deviceId, message = 'Dispositivo bloqueado por política de empresa') {
    if (!appConfig.scalefusion?.enabled) return { skipped: true, reason: 'ScaleFusion not configured' };
    try {
      const result = await apiRequest('POST', `/devices/${deviceId}/lock`, {
        message,
      });
      logger.info('ScaleFusion device locked', { deviceId });
      return { success: true, deviceId, action: 'locked' };
    } catch (err) {
      throw new IntegrationError('ScaleFusion', `Error bloqueando dispositivo ${deviceId}: ${err.message}`, { deviceId });
    }
  },

  /**
   * Desbloquea un dispositivo.
   * Usar en onboarding o si el bloqueo fue por error.
   */
  async unlockDevice(deviceId) {
    if (!appConfig.scalefusion?.enabled) return { skipped: true };
    try {
      await apiRequest('POST', `/devices/${deviceId}/unlock`);
      logger.info('ScaleFusion device unlocked', { deviceId });
      return { success: true, deviceId, action: 'unlocked' };
    } catch (err) {
      throw new IntegrationError('ScaleFusion', `Error desbloqueando dispositivo ${deviceId}: ${err.message}`, { deviceId });
    }
  },

  /**
   * Realiza un factory reset (wipe) del dispositivo.
   * ⚠️ DESTRUCTIVO — borra todos los datos. Solo usar en offboarding confirmado.
   */
  async wipeDevice(deviceId) {
    if (!appConfig.scalefusion?.enabled) return { skipped: true };
    try {
      await apiRequest('POST', `/devices/${deviceId}/wipe`);
      logger.info('ScaleFusion device wiped', { deviceId });
      return { success: true, deviceId, action: 'wiped' };
    } catch (err) {
      throw new IntegrationError('ScaleFusion', `Error en wipe del dispositivo ${deviceId}: ${err.message}`, { deviceId });
    }
  },

  /**
   * Unenroll (retira la gestión MDM) del dispositivo.
   * Menos destructivo que wipe — quita la política MDM pero no borra datos.
   */
  async unenrollDevice(deviceId) {
    if (!appConfig.scalefusion?.enabled) return { skipped: true };
    try {
      await apiRequest('POST', `/devices/${deviceId}/unenroll`);
      logger.info('ScaleFusion device unenrolled', { deviceId });
      return { success: true, deviceId, action: 'unenrolled' };
    } catch (err) {
      throw new IntegrationError('ScaleFusion', `Error en unenroll del dispositivo ${deviceId}: ${err.message}`, { deviceId });
    }
  },

  /**
   * Flujo completo de offboarding para un empleado:
   * 1. Busca sus dispositivos por email
   * 2. Bloquea cada uno
   * 3. Devuelve reporte de acciones realizadas
   */
  async offboardEmployee(email) {
    if (!appConfig.scalefusion?.enabled) return { skipped: true, reason: 'ScaleFusion not configured' };

    const { devices } = await scalefusion.findDevicesByEmail(email);

    if (!devices || devices.length === 0) {
      logger.info('No ScaleFusion devices found for employee', { email });
      return { success: true, devicesFound: 0, actions: [] };
    }

    const actions = [];
    for (const device of devices) {
      try {
        await scalefusion.lockDevice(device.id, `Offboarding: ${email}. Contacta a IT para más información.`);
        actions.push({ deviceId: device.id, deviceName: device.name, action: 'locked', success: true });
      } catch (err) {
        logger.warn('Failed to lock device during offboarding', { deviceId: device.id, error: err.message });
        actions.push({ deviceId: device.id, deviceName: device.name, action: 'lock_failed', success: false, error: err.message });
      }
    }

    logger.info('ScaleFusion offboarding complete', { email, devicesLocked: actions.filter(a => a.success).length });
    return { success: true, devicesFound: devices.length, actions };
  },

  /**
   * Enrollar un nuevo dispositivo enviando invitación por email.
   * Usar en onboarding cuando el empleado recibe su equipo.
   */
  async sendEnrollmentInvite(email, deviceType = 'android') {
    if (!appConfig.scalefusion?.enabled) return { skipped: true };
    try {
      const result = await apiRequest('POST', '/enrollment_invitations', {
        email,
        device_type: deviceType, // 'android', 'ios', 'windows', 'macos'
        enrollment_type: 'corporate',
      });
      logger.info('ScaleFusion enrollment invite sent', { email, deviceType });
      return { success: true, email, deviceType };
    } catch (err) {
      logger.warn('ScaleFusion enrollment invite failed', { email, error: err.message });
      return { success: false, error: err.message };
    }
  },
};
