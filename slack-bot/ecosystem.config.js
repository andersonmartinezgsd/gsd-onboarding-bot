export default {
  apps: [
    {
      name: 'onboarding-bot',
      script: 'src/server.js',
      interpreter: 'node',
      interpreter_args: '--experimental-vm-modules',
      instances: 1,
      autorestart: true,
      watch: false,
      max_restarts: 10,
      restart_delay: 5000,
      env: {
        NODE_ENV: 'development',
        USE_SOCKET_MODE: 'true',
      },
      env_production: {
        NODE_ENV: 'production',
        USE_SOCKET_MODE: 'false',
      },
      error_file: './storage/logs/err.log',
      out_file: './storage/logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    },
  ],
};
