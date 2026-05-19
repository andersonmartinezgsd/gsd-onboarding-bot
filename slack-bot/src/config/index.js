import { z } from 'zod';
import { config } from 'dotenv';

config();

const envSchema = z.object({
  // Slack
  SLACK_BOT_TOKEN: z.string().min(1, 'SLACK_BOT_TOKEN is required'),
  SLACK_SIGNING_SECRET: z.string().min(1, 'SLACK_SIGNING_SECRET is required'),
  SLACK_APP_TOKEN: z.string().optional(),
  USE_SOCKET_MODE: z.enum(['true', 'false']).default('true'),

  // App
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3000'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),

  // Database type
  DB_TYPE: z.enum(['sqlite', 'mysql']).default('sqlite'),

  // SQLite
  DB_PATH: z.string().default('./storage/db/onboarding.sqlite'),

  // MySQL (requerido si DB_TYPE=mysql)
  MYSQL_HOST:     z.string().default('127.0.0.1'),
  MYSQL_PORT:     z.string().default('3306'),
  MYSQL_USER:     z.string().optional(),
  MYSQL_PASSWORD: z.string().optional(),
  MYSQL_DATABASE: z.string().optional(),

  // GitHub (optional — steps skipped if not configured)
  GITHUB_TOKEN: z.string().optional(),
  GITHUB_ORG: z.string().optional(),

  // Google Workspace (optional)
  GOOGLE_CLIENT_EMAIL: z.string().optional(),
  GOOGLE_PRIVATE_KEY: z.string().optional(),
  GOOGLE_ADMIN_EMAIL: z.string().optional(),
  GOOGLE_DOMAIN: z.string().optional(),
  GOOGLE_CUSTOMER_ID: z.string().optional(),

  // Google Drive — parent folder for all onboarding folders
  GOOGLE_ONBOARDING_DRIVE_FOLDER_ID: z.string().optional(),

  // Google Workspace license SKU to assign after account creation
  // Business Starter: 1010020028 | Standard: 1010020025 | Plus: 1010020026
  GOOGLE_WORKSPACE_SKU_ID: z.string().optional(),

  // Milliseconds to wait between account creation and license assignments
  // Google needs time to propagate a newly created user
  GOOGLE_LICENSE_DELAY_MS: z.string().default('5000'),

  // Notification channels
  HR_CHANNEL_ID: z.string().optional(),
  IT_CHANNEL_ID: z.string().optional(),
  FINANCE_CHANNEL_ID: z.string().optional(),
  ACCOUNT_MANAGER_CHANNEL_ID: z.string().optional(),

  // Time Doctor
  TIMEDOCTOR_ACCESS_TOKEN: z.string().optional(),
  TIMEDOCTOR_COMPANY_ID: z.string().optional(),

  // ScaleFusion MDM
  SCALEFUSION_API_KEY: z.string().optional(),

  // HubSpot
  HUBSPOT_ACCESS_TOKEN: z.string().optional(),

  // BUK HR Platform
  BUK_API_URL: z.string().url().optional().or(z.literal('')),
  BUK_API_TOKEN: z.string().optional(),
  BUK_COMPANY_SLUG: z.string().optional(),  // slug visible en la URL de BUK

  // Client data source: 'db' uses the local clients table, 'hubspot' queries HubSpot, 'api' uses CLIENT_API_URL
  CLIENT_DATA_SOURCE: z.enum(['db', 'hubspot', 'api']).default('db'),
  CLIENT_API_URL: z.string().url().optional().or(z.literal('')),
  CLIENT_API_TOKEN: z.string().optional(),

  // Vendor notification (for equipment quotes when no inventory)
  VENDOR_CHANNEL_ID: z.string().optional(),        // Slack channel to notify vendor
  VENDOR_EMAIL: z.string().email().optional().or(z.literal('')),

  // Access control
  AUTHORIZED_USER_IDS: z.string().optional(),
  AUTHORIZED_CHANNEL_ID: z.string().optional(),

  // External webhooks
  HUB_WEBHOOK_URL: z.string().url().optional().or(z.literal('')),
  HUB_WEBHOOK_SECRET: z.string().optional(),

  // Bot language
  BOT_LANGUAGE: z.enum(['es', 'en']).default('es'),

  // Company defaults
  COMPANY_NAME: z.string().default('GSD'),
  COMPANY_EMAIL_DOMAIN: z.string().default('gsdoutsources.com'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment configuration:');
  parsed.error.issues.forEach((issue) => {
    console.error(`  ${issue.path.join('.')}: ${issue.message}`);
  });
  process.exit(1);
}

const env = parsed.data;

export const appConfig = {
  env: env.NODE_ENV,
  isDev: env.NODE_ENV === 'development',
  port: parseInt(env.PORT, 10),
  logLevel: env.LOG_LEVEL,

  companyName: env.COMPANY_NAME,
  companyEmailDomain: env.COMPANY_EMAIL_DOMAIN,

  slack: {
    botToken: env.SLACK_BOT_TOKEN,
    signingSecret: env.SLACK_SIGNING_SECRET,
    appToken: env.SLACK_APP_TOKEN,
    useSocketMode: env.USE_SOCKET_MODE === 'true',
  },

  db: {
    type:   env.DB_TYPE,
    path:   env.DB_PATH,
    mysql: {
      host:     env.MYSQL_HOST,
      port:     parseInt(env.MYSQL_PORT, 10),
      user:     env.MYSQL_USER     ?? '',
      password: env.MYSQL_PASSWORD ?? '',
      database: env.MYSQL_DATABASE ?? '',
    },
  },

  github: {
    token: env.GITHUB_TOKEN,
    org: env.GITHUB_ORG,
    enabled: Boolean(env.GITHUB_TOKEN && env.GITHUB_ORG),
  },

  google: {
    clientEmail: env.GOOGLE_CLIENT_EMAIL,
    privateKey: env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    adminEmail: env.GOOGLE_ADMIN_EMAIL,
    domain: env.GOOGLE_DOMAIN,
    customerId: env.GOOGLE_CUSTOMER_ID,
    onboardingDriveFolderId: env.GOOGLE_ONBOARDING_DRIVE_FOLDER_ID,
    workspaceSkuId: env.GOOGLE_WORKSPACE_SKU_ID || null,
    licenseDelayMs: parseInt(env.GOOGLE_LICENSE_DELAY_MS, 10),
    enabled: Boolean(env.GOOGLE_CLIENT_EMAIL && env.GOOGLE_PRIVATE_KEY),
  },

  timedoctor: {
    accessToken: env.TIMEDOCTOR_ACCESS_TOKEN,
    companyId: env.TIMEDOCTOR_COMPANY_ID,
    enabled: Boolean(env.TIMEDOCTOR_ACCESS_TOKEN && env.TIMEDOCTOR_COMPANY_ID),
  },

  scalefusion: {
    apiKey: env.SCALEFUSION_API_KEY,
    enabled: Boolean(env.SCALEFUSION_API_KEY),
  },

  hubspot: {
    accessToken: env.HUBSPOT_ACCESS_TOKEN,
    enabled: Boolean(env.HUBSPOT_ACCESS_TOKEN),
  },

  buk: {
    apiUrl: env.BUK_API_URL || null,
    apiToken: env.BUK_API_TOKEN || null,
    companySlug: env.BUK_COMPANY_SLUG || null,
    enabled: Boolean(env.BUK_API_URL && env.BUK_API_TOKEN),
  },

  clients: {
    dataSource: env.CLIENT_DATA_SOURCE,
    apiUrl: env.CLIENT_API_URL || null,
    apiToken: env.CLIENT_API_TOKEN || null,
  },

  channels: {
    hr: env.HR_CHANNEL_ID,
    it: env.IT_CHANNEL_ID,
    finance: env.FINANCE_CHANNEL_ID,
    accountManager: env.ACCOUNT_MANAGER_CHANNEL_ID,
    vendor: env.VENDOR_CHANNEL_ID,
  },

  vendor: {
    channelId: env.VENDOR_CHANNEL_ID || null,
    email: env.VENDOR_EMAIL || null,
  },

  webhook: {
    url: env.HUB_WEBHOOK_URL || null,
    secret: env.HUB_WEBHOOK_SECRET || null,
    enabled: Boolean(env.HUB_WEBHOOK_URL),
  },

  access: {
    authorizedUserIds: env.AUTHORIZED_USER_IDS
      ? env.AUTHORIZED_USER_IDS.split(',').map((s) => s.trim()).filter(Boolean)
      : [],
    authorizedChannelId: env.AUTHORIZED_CHANNEL_ID || null,
  },

  lang: env.BOT_LANGUAGE,
};
