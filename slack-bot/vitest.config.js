import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    env: {
      SLACK_BOT_TOKEN: 'xoxb-test-token',
      SLACK_SIGNING_SECRET: 'test-signing-secret',
      NODE_ENV: 'test',
      DB_PATH: ':memory:',
      LOG_LEVEL: 'error',
    },
  },
});
