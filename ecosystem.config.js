module.exports = {
  apps: [
    {
      name: 'lingo-server',
      script: './dist/main.js',
      cwd: __dirname,
      instances: 2,
      autorestart: true,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],

  deploy: {
    production: {
      host: '192.168.31.111',
      user: 'deploy',
      ssh_options: [
        'ForwardAgent=yes',
      ],
      ref: 'origin/master',
      repo: 'git@github.com:Nguyen-Van-Manh/lingo-server.git',
      path: '‪C:\Dev\lingo-server',
      'post-deploy': '‪C:\Dev\lingo-server && NODE_ENV=production yarn --production=false;yarn build;pm2 startOrReload ecosystem.config.js',
      env: {
        NODE_ENV: 'production',
      },
    },

    staging: {
      user: 'deploy',
      host: '192.168.31.111',
      ref: 'origin/master',
      repo: 'git@github.com:Nguyen-Van-Manh/lingo-server.git',
      path: '/path/to/project',
      ssh_options: ['PasswordAuthentication=no', 'StrictHostKeyChecking=no'],
      'post-deploy': 'cd /path/to/project && yarn --production=false;yarn build;pm2 startOrReload ecosystem.config.js',
      env: {
        NODE_ENV: 'production',
      },
    },
  },
};
