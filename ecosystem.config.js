module.exports = {
  apps: [
    {
      name: 'lingo-server',
      script: './dist/main.js',
      cwd: __dirname,
      instances: 1,
      autorestart: true,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
