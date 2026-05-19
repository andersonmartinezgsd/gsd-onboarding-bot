/**
 * HubSpot Integration
 * API Docs: https://developers.hubspot.com/docs/api/overview
 *
 * Uses the HubSpot Private App token (Settings → Integrations → Private Apps).
 * Required scopes: crm.objects.contacts.write, settings.users.write
 */

import { appConfig } from '../config/index.js';
import { logger } from '../utils/logger.js';
import { IntegrationError } from '../utils/errors.js';

const BASE_URL = 'https://api.hubapi.com';

async function apiRequest(method, path, body = null) {
  if (!appConfig.hubspot?.enabled) {
    return { skipped: true, reason: 'HubSpot not configured' };
  }

  const url = `${BASE_URL}${path}`;
  const headers = {
    'Authorization': `Bearer ${appConfig.hubspot.accessToken}`,
    'Content-Type': 'application/json',
  };

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`HubSpot API error ${res.status}: ${errText}`);
  }

  // 204 No Content
  if (res.status === 204) return { success: true };
  return res.json();
}

export const hubspot = {
  /**
   * Invites a new user to the HubSpot portal.
   * Role: SALES (default), MARKETING, SERVICE, CMS, REPORTING, ADMIN
   */
  async inviteUser({ firstName, lastName, email, roleTitle = null, department = null }) {
    if (!appConfig.hubspot?.enabled) return { skipped: true, reason: 'HubSpot not configured' };

    try {
      // Map department/role to HubSpot role
      const hubspotRole = resolveHubSpotRole(roleTitle, department);

      const data = await apiRequest('POST', '/settings/v3/users/', {
        email,
        roleId: hubspotRole,
        sendWelcomeEmail: true,
      });

      logger.info('HubSpot user invited', { email, role: hubspotRole });
      return { success: true, userId: data.id, email };
    } catch (err) {
      throw new IntegrationError('HubSpot', `Failed to invite user ${email}: ${err.message}`, { email });
    }
  },

  /**
   * Creates a contact record in HubSpot CRM for the new employee (internal tracking).
   * Optional — useful for companies that track internal contacts.
   */
  async createContact({ firstName, lastName, email, jobTitle, department }) {
    if (!appConfig.hubspot?.enabled) return { skipped: true, reason: 'HubSpot not configured' };

    try {
      const data = await apiRequest('POST', '/crm/v3/objects/contacts', {
        properties: {
          firstname: firstName,
          lastname: lastName,
          email,
          jobtitle: jobTitle,
          department,
          hs_lead_status: 'CONNECTED',
        },
      });

      logger.info('HubSpot contact created', { email, contactId: data.id });
      return { success: true, contactId: data.id, email };
    } catch (err) {
      // Non-fatal — contact creation is supplementary
      logger.warn('HubSpot contact creation failed (non-fatal)', { email, error: err.message });
      return { success: false, error: err.message };
    }
  },

  /**
   * Searches HubSpot companies by name for autocomplete.
   * Returns array of { id, name, domain } sorted by name.
   */
  async searchCompanies(query = '') {
    if (!appConfig.hubspot?.enabled) return [];
    try {
      const body = {
        filterGroups: query.trim()
          ? [{
              filters: [{
                propertyName: 'name',
                operator: 'CONTAINS_TOKEN',
                value: `*${query.trim()}*`,
              }],
            }]
          : [],
        properties: ['name', 'domain'],
        limit: 20,
        sorts: [{ propertyName: 'name', direction: 'ASCENDING' }],
      };
      const data = await apiRequest('POST', '/crm/v3/objects/companies/search', body);
      return (data.results ?? []).map((c) => ({
        id: c.id,
        name: c.properties?.name ?? 'Unknown',
        domain: c.properties?.domain ?? '',
      }));
    } catch (err) {
      logger.warn('HubSpot company search failed', { query, error: err.message });
      return [];
    }
  },

  /**
   * Deactivates a HubSpot user (removes portal access).
   */
  async deactivateUser(email) {
    if (!appConfig.hubspot?.enabled) return { skipped: true, reason: 'HubSpot not configured' };

    try {
      // Find user by email
      const listData = await apiRequest('GET', '/settings/v3/users/');
      const user = listData.results?.find((u) => u.email === email);

      if (!user) {
        return { skipped: true, reason: 'User not found in HubSpot' };
      }

      await apiRequest('DELETE', `/settings/v3/users/${user.id}`);
      logger.info('HubSpot user deactivated', { email, userId: user.id });
      return { success: true, userId: user.id };
    } catch (err) {
      throw new IntegrationError('HubSpot', `Failed to deactivate ${email}: ${err.message}`, { email });
    }
  },
};

function resolveHubSpotRole(roleTitle, department) {
  const role = roleTitle?.toLowerCase() ?? '';
  const dept = department?.toLowerCase() ?? '';

  if (role.includes('admin') || role.includes('ceo') || role.includes('cto')) return null; // Super admin — set manually
  if (role.includes('marketing') || dept === 'marketing') return 'MARKETING';
  if (role.includes('service') || role.includes('support') || role.includes('success')) return 'SERVICE';
  if (role.includes('sales') || dept === 'sales') return 'SALES';
  if (role.includes('report') || role.includes('analyst')) return 'REPORTING';

  return 'SALES'; // default
}
