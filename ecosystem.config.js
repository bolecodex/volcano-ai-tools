module.exports = {
  apps: [
    {
      name: 'volcano-backend',
      cwd: '/var/www/volcano-ai-tools/backend',
      script: 'main.py',
      interpreter: '/var/www/volcano-ai-tools/backend/venv/bin/python',
      env: {
        NODE_ENV: 'production',
        DATABASE_URL: 'sqlite+aiosqlite:///./hs_adk.db',
        SECRET_KEY: 'your-production-secret-key-here-change-this',
        ALGORITHM: 'HS256',
        ACCESS_TOKEN_EXPIRE_MINUTES: '30'
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      error_file: '/var/log/volcano-ai-tools/backend-error.log',
      out_file: '/var/log/volcano-ai-tools/backend-out.log',
      log_file: '/var/log/volcano-ai-tools/backend-combined.log',
      time: true
    },
    {
      name: 'volcano-frontend',
      cwd: '/var/www/volcano-ai-tools/frontend',
      script: 'serve',
      args: '-s build -l 3000',
      env: {
        NODE_ENV: 'production'
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      error_file: '/var/log/volcano-ai-tools/frontend-error.log',
      out_file: '/var/log/volcano-ai-tools/frontend-out.log',
      log_file: '/var/log/volcano-ai-tools/frontend-combined.log',
      time: true
    }
  ]
};
