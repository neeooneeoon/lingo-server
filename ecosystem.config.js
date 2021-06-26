module.exports = {
  apps: [
    {
      name: 'lingo-server',
      script: './dist/main.js',
      cwd: __dirname, // path-to-project
      instances: 2, // default 1
      autorestart: true,
      exec_mode: 'cluster', // allow scale up app
      env: {
        NODE_ENV: 'production',
      },
    },
  ],

  deploy: {
    production: {
      host: 'xx.yy.zz.vv',
      user: 'deploy',
      ssh_options: [
        'ForwardAgent=yes',
      ],
      ref: 'origin/master',
      repo: 'git@github:repo/repo.git',
      path: '/path/to/project',
      'post-deploy': 'cd /path/to/project && NODE_ENV=production yarn --production=false;yarn build;pm2 startOrReload ecosystem.config.js',
      env: {
        NODE_ENV: 'production',
      },
    },

    staging: {
      user: 'deploy',
      host: 'xx.yy.zz.vv',
      ref: 'origin/develop',
      repo: 'git@github.com:repo/repo.git',
      path: '/path/to/project',
      ssh_options: ['PasswordAuthentication=no', 'StrictHostKeyChecking=no'],
      'post-deploy': 'cd /path/to/project && yarn --production=false;yarn build;pm2 startOrReload ecosystem.config.js',
      env: {
        NODE_ENV: 'production',
      },
    },
  },
};
