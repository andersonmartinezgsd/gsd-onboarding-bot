/**
 * Time Doctor Integration
 * API Docs: https://api2.timedoctor.com/
 *
 * Authentication: Access token obtained via OAuth2 or API key.
 * Company ID is required for all user management endpoints.
 */

import { appConfig } from '../config/index.js';
import { logger } from '../utils/logger.js';
import { IntegrationError } from '../utils/errors.js';

const BASE_URL = 'https://api2.timedoctor.com/api/1.1';

async function apiRequest(method, path, body = null) {
  if (!appConfig.timedoctor?.enabled) {
    return { skipped: true, reason: 'Time Doctor not configured' };
  }

  const url = `${BASE_URL}${path}`;
  const headers = {
    'Authorization': `Bearer ${appConfig.timedoctor.accessToken}`,
    'Content-Type': 'application/json',
  };

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Time Doctor API error ${res.status}: ${errText}`);
  }

  return res.json();
}

export const timedoctor = {
  /**
   * Creates a new user in the Time Doctor company.
   * Role: 'user' (default) or 'manager'
   */
  async createUser({ name, email, roleTitle = null }) {
    if (!appConfig.timedoctor?.enabled) return { skipped: true, reason: 'Time Doctor not configured' };

    try {
      const data = await apiRequest('POST', `/users`, {
        company_id: appConfig.timedoctor.companyId,
        name,
        email,
        role: roleTitle?.toLowerCase().includes('manager') || roleTitle?.toLowerCase().includes('director')
          ? 'manager'
          : 'user',
        send_invite: true,
      });

      logger.info('Time Doctor user created', { email, userId: data.data?.id });
      return { success: true, userId: data.data?.id, email };
    } catch (err) {
      throw new IntegrationError('TimeDoctor', `Failed to create user ${email}: ${err.message}`, { email });
    }
  },

  /**
   * Deactivates (removes) a user from Time Doctor.
   */
  async deactivateUser(email) {
    if (!appConfig.timedoctor?.enabled) return { skipped: true, reason: 'Time Doctor not configured' };

    try {
      // First find the user by email
      const listData = await apiRequest('GET', `/users?company_id=${appConfig.timedoctor.companyId}`);
      const user = listData.data?.users?.find((u) => u.email === email);

      if (!user) {
        logger.warn('Time Doctor user not found for deactivation', { email });
        return { skipped: true, reason: 'User not found in Time Doctor' };
      }

      await apiRequest('DELETE', `/users/${user.id}?company_id=${appConfig.timedoctor.companyId}`);
      logger.info('Time Doctor user deactivated', { email, userId: user.id });
      return { success: true, userId: user.id, email };
    } catch (err) {
      throw new IntegrationError('TimeDoctor', `Failed to deactivate ${email}: ${err.message}`, { email });
    }
  },
};
