/**
 * PM2 Ecosystem Config (CommonJS — requerido cuando package.json tiene "type":"module")
 * Uso:
 *   pm2 start ecosystem.config.cjs --env production
 *   pm2 restart onboarding-bot --env production
 */
module.exports = {
  apps: [
    {
      name: 'onboarding-bot',
      script: 'src/server.js',
      interpreter: 'node',
      instances: 1,
      autorestart: true,
      watch: false,
      max_restarts: 10,
      restart_delay: 5000,
      min_uptime: '10s',

      // Logs
      error_file: './storage/logs/err.log',
      out_file:   './storage/logs/out.log',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',

      // Producción
      env_production: {
        NODE_ENV: 'production',
        USE_SOCKET_MODE: 'false',
        PORT: '3000',
        LOG_LEVEL: 'warn',
      },

      // Desarrollo local con Socket Mode
      env_development: {
        NODE_ENV: 'development',
        USE_SOCKET_MODE: 'true',
        PORT: '3000',
        LOG_LEVEL: 'info',
      },
    },
  ],
};
