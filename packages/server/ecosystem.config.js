module.exports = {
  apps: [
    {
      name: 'lingo-server',
      script: './dist/main.js',
      cwd: __dirname,
      instances: 'max',
      autorestart: true,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
