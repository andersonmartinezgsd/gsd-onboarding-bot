#!/bin/bash
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
export SLACK_BOT_TOKEN="xoxb-preview"
export SLACK_SIGNING_SECRET="preview-secret"
cd "/Users/andersonmartinezrestrepo/GSD/onboarding-offboarding/slack-bot"
exec /opt/homebrew/bin/node preview/server.js
