module.exports = {
  apps: [{
    name: "almansour-academy",
    script: "node_modules/next/dist/bin/next",
    args: `start -p ${process.env.PORT || 3000}`,
    cwd: __dirname,
    instances: 1,
    exec_mode: "fork",
    autorestart: true,
    max_memory_restart: "1G",
    env: { NODE_ENV: "production", PORT: process.env.PORT || 3000 },
  }],
};
