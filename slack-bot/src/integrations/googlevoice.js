/**
 * Google Voice Integration
 *
 * Google Voice (Google Workspace edition) provisioning uses:
 *   1. Admin SDK Directory API — assign Voice license to user
 *   2. Voice API (limited, mostly managed via Admin Console)
 *
 * License provisioning is handled via the Admin SDK by assigning the
 * "Google Voice Standard" or "Google Voice Starter" SKU.
 *
 * SKU IDs:
 *   - Google Voice Starter:  1010330003
 *   - Google Voice Standard: 1010330004
 *   - Google Voice Premier:  1010330002
 */

import { google } from 'googleapis';
import { appConfig } from '../config/index.js';
import { logger } from '../utils/logger.js';
import { IntegrationError } from '../utils/errors.js';

// Google Voice Standard SKU (adjust per your Workspace plan)
const VOICE_SKU_ID = '1010330004';

function getAuth() {
  if (!appConfig.google.enabled) return null;

  return new google.auth.JWT({
    email: appConfig.google.clientEmail,
    key: appConfig.google.privateKey,
    scopes: [
      'https://www.googleapis.com/auth/apps.licensing',
      'https://www.googleapis.com/auth/admin.directory.user',
    ],
    subject: appConfig.google.adminEmail,
  });
}

export const googleVoice = {
  /**
   * Assigns a Google Voice license to an existing Workspace user.
   * The user must already have a Workspace account before calling this.
   */
  async assignLicense(email) {
    const auth = getAuth();
    if (!auth) return { skipped: true, reason: 'Google Workspace not configured' };
    if (!appConfig.google.customerId) return { skipped: true, reason: 'GOOGLE_CUSTOMER_ID not set — required for Voice licensing' };

    const licensing = google.licensing({ version: 'v1', auth });

    try {
      await licensing.licenseAssignments.insert({
        productId: 'Google-Voice',
        skuId: VOICE_SKU_ID,
        requestBody: { userId: email },
      });

      logger.info('Google Voice license assigned', { email });
      return { success: true, email, skuId: VOICE_SKU_ID };
    } catch (err) {
      // 409 = already assigned (GaxiosError exposes status via err.status or err.response.status)
      const status = err.status ?? err.response?.status;
      if (status === 409) {
        logger.info('Google Voice license already assigned', { email });
        return { success: true, email, note: 'already_assigned' };
      }
      throw new IntegrationError('GoogleVoice', `Failed to assign Voice license to ${email}: ${err.message}`, { email });
    }
  },

  /**
   * Revokes a Google Voice license from a departing employee.
   */
  async revokeLicense(email) {
    const auth = getAuth();
    if (!auth) return { skipped: true, reason: 'Google Workspace not configured' };
    if (!appConfig.google.customerId) return { skipped: true };

    const licensing = google.licensing({ version: 'v1', auth });

    try {
      await licensing.licenseAssignments.delete({
        productId: 'Google-Voice',
        skuId: VOICE_SKU_ID,
        userId: email,
      });

      logger.info('Google Voice license revoked', { email });
      return { success: true, email };
    } catch (err) {
      logger.warn('Failed to revoke Google Voice license (may not have been assigned)', { email, error: err.message });
      return { success: false, error: err.message };
    }
  },
};
