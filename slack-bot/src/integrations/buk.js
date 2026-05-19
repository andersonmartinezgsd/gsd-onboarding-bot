import { appConfig } from '../config/index.js';
import { logger } from '../utils/logger.js';

/**
 * BUK HR Platform integration.
 * Validates that a newly onboarded employee has been created in BUK.
 * Docs: https://developers.buk.cl/docs
 */
export const buk = {
  async validateEmployee(email) {
    if (!appConfig.buk.enabled) {
      return { skipped: true, reason: 'BUK no configurado (BUK_API_URL / BUK_API_TOKEN)' };
    }

    const { apiUrl, apiToken, companySlug } = appConfig.buk;
    const baseUrl = apiUrl.replace(/\/$/, '');
    const slugPath = companySlug ? `/${companySlug}` : '';

    try {
      const { default: axios } = await import('axios');

      // Search employee by work_email in BUK
      const { data } = await axios.get(`${baseUrl}${slugPath}/api/v2/employees`, {
        params: { work_email: email, per_page: 1 },
        headers: {
          Authorization: `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        timeout: 10000,
      });

      const employees = data?.data ?? data?.employees ?? [];
      if (employees.length === 0) {
        logger.warn('BUK: employee not found', { email });
        return { success: false, found: false, email };
      }

      const emp = employees[0];
      logger.info('BUK: employee validated', { email, bukId: emp.id });
      return {
        success: true,
        found: true,
        bukId: emp.id,
        email,
        status: emp.status ?? 'unknown',
      };
    } catch (err) {
      logger.error('BUK validation failed', { email, error: err.message });
      // Non-fatal: we log but don't throw so the workflow continues
      return { success: false, error: err.message, email };
    }
  },

  async getEmployee(email) {
    if (!appConfig.buk.enabled) return null;

    const { apiUrl, apiToken, companySlug } = appConfig.buk;
    const baseUrl = apiUrl.replace(/\/$/, '');
    const slugPath = companySlug ? `/${companySlug}` : '';

    try {
      const { default: axios } = await import('axios');
      const { data } = await axios.get(`${baseUrl}${slugPath}/api/v2/employees`, {
        params: { work_email: email, per_page: 1 },
        headers: { Authorization: `Bearer ${apiToken}`, Accept: 'application/json' },
        timeout: 10000,
      });
      const employees = data?.data ?? data?.employees ?? [];
      return employees[0] ?? null;
    } catch (err) {
      logger.warn('BUK getEmployee failed', { email, error: err.message });
      return null;
    }
  },
};
