import { google } from 'googleapis';
import { appConfig } from '../config/index.js';
import { logger } from '../utils/logger.js';
import { IntegrationError } from '../utils/errors.js';

function getAdminAuth() {
  if (!appConfig.google.enabled) return null;

  return new google.auth.JWT({
    email: appConfig.google.clientEmail,
    key:   appConfig.google.privateKey,
    scopes: [
      'https://www.googleapis.com/auth/admin.directory.user',
      'https://www.googleapis.com/auth/admin.directory.customer.readonly',
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/apps.licensing',
    ],
    subject: appConfig.google.adminEmail,
  });
}

export const googleWorkspace = {
  async createUser({ firstName, lastName, email, department, title }) {
    const auth = getAdminAuth();
    if (!auth) return { skipped: true, reason: 'Google Workspace no configurado' };

    const admin = google.admin({ version: 'directory_v1', auth });

    try {
      const { data } = await admin.users.insert({
        requestBody: {
          name: { givenName: firstName, familyName: lastName },
          primaryEmail: email,
          password: generateTempPassword(),
          changePasswordAtNextLogin: true,
          orgUnitPath: '/',
          organizations: department
            ? [{ name: appConfig.google.domain, title, department, primary: true }]
            : undefined,
        },
      });
      logger.info('Google Workspace user created', { email });
      return { success: true, email: data.primaryEmail, userId: data.id };
    } catch (err) {
      throw new IntegrationError('Google', `No se pudo crear el usuario ${email}: ${err.message}`, { email });
    }
  },

  async suspendUser(email) {
    const auth = getAdminAuth();
    if (!auth) return { skipped: true, reason: 'Google Workspace no configurado' };

    const admin = google.admin({ version: 'directory_v1', auth });

    try {
      await admin.users.update({ userKey: email, requestBody: { suspended: true } });
      logger.info('Google Workspace user suspended', { email });
      return { success: true, email };
    } catch (err) {
      throw new IntegrationError('Google', `No se pudo suspender ${email}: ${err.message}`, { email });
    }
  },

  /**
   * Assigns a Google Workspace license to the user right after account creation.
   * Requires GOOGLE_WORKSPACE_SKU_ID and GOOGLE_CUSTOMER_ID in config.
   *
   * Common SKU IDs:
   *   Business Starter:  1010020028
   *   Business Standard: 1010020025
   *   Business Plus:     1010020026
   */
  async assignWorkspaceLicense(email) {
    const auth = getAdminAuth();
    if (!auth) return { skipped: true, reason: 'Google Workspace no configurado' };

    const skuId = appConfig.google.workspaceSkuId;
    if (!skuId) return { skipped: true, reason: 'GOOGLE_WORKSPACE_SKU_ID no configurado' };
    if (!appConfig.google.customerId) return { skipped: true, reason: 'GOOGLE_CUSTOMER_ID no configurado' };

    const licensing = google.licensing({ version: 'v1', auth });

    try {
      await licensing.licenseAssignments.insert({
        productId: 'Google-Apps',
        skuId,
        requestBody: { userId: email },
      });
      logger.info('Google Workspace license assigned', { email, skuId });
      return { success: true, email, skuId };
    } catch (err) {
      const status = err.status ?? err.response?.status;
      if (status === 409) {
        logger.info('Google Workspace license already assigned', { email });
        return { success: true, email, note: 'already_assigned' };
      }
      throw new IntegrationError('Google', `No se pudo asignar licencia Workspace a ${email}: ${err.message}`, { email });
    }
  },

  /**
   * Changes the password of an existing Google Workspace user.
   * Used by the /gsdaccount self-service command.
   *
   * @param {string} email    - The user's primary corporate email
   * @param {string} password - New plaintext password (min 8 chars)
   */
  async changeUserPassword(email, password) {
    const auth = getAdminAuth();
    if (!auth) return { skipped: true, reason: 'Google Workspace not configured' };

    const admin = google.admin({ version: 'directory_v1', auth });

    try {
      await admin.users.update({
        userKey: email,
        requestBody: {
          password,
          changePasswordAtNextLogin: false,
        },
      });
      logger.info('Google Workspace password changed', { email });
      return { success: true, email };
    } catch (err) {
      throw new IntegrationError(
        'Google',
        `Failed to change password for ${email}: ${err.message}`,
        { email },
      );
    }
  },

  async transferDriveFiles(fromEmail, toEmail) {
    const auth = getAdminAuth();
    if (!auth || !fromEmail || !toEmail) return { skipped: true };

    const driveAdmin = google.admin({ version: 'datatransfer_v1', auth });

    try {
      await driveAdmin.transfers.insert({
        requestBody: {
          oldOwnerUserId: fromEmail,
          newOwnerUserId: toEmail,
          applicationDataTransfers: [
            {
              applicationId: '55656082996', // Google Drive app ID
              applicationTransferParams: [
                { key: 'PRIVACY_LEVEL', value: ['PRIVATE', 'SHARED'] },
              ],
            },
          ],
        },
      });
      logger.info('Google Drive transfer initiated', { from: fromEmail, to: toEmail });
      return { success: true, from: fromEmail, to: toEmail };
    } catch (err) {
      logger.warn('Google Drive transfer failed', { error: err.message });
      return { success: false, error: err.message };
    }
  },

  /**
   * Creates a folder inside the GSD Onboarding Drive folder.
   * parentFolderId defaults to GOOGLE_ONBOARDING_DRIVE_FOLDER_ID from config.
   * The target parent is: https://drive.google.com/drive/u/0/folders/0AFXARejfds2BUk9PVA
   */
  async createDriveFolder(folderName, parentFolderId = null) {
    const auth = getAdminAuth();
    if (!auth) return { skipped: true, reason: 'Google Workspace no configurado' };

    const drive = google.drive({ version: 'v3', auth });
    const parent = parentFolderId ?? appConfig.google.onboardingDriveFolderId ?? null;

    try {
      const requestBody = {
        name:     folderName,
        mimeType: 'application/vnd.google-apps.folder',
      };

      if (parent) {
        requestBody.parents = [parent];
      }

      const { data } = await drive.files.create({
        requestBody,
        fields: 'id, name, webViewLink',
        // Required to write into a shared drive (supportsAllDrives)
        supportsAllDrives: true,
      });
      logger.info('Google Drive folder created', { name: folderName, id: data.id, parent });
      return { success: true, folderId: data.id, folderUrl: data.webViewLink };
    } catch (err) {
      logger.warn('Google Drive folder creation failed', { error: err.message });
      return { success: false, error: err.message };
    }
  },
};

function generateTempPassword() {
  return Math.random().toString(36).slice(2, 10).toUpperCase() +
    Math.random().toString(36).slice(2, 6) + '!9';
}
