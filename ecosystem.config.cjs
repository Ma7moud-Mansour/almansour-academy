module.exports = {
  apps: [{
    name: "almansour-academy",
    script: "node_modules/next/dist/bin/next",
    args: `start -H 127.0.0.1 -p ${process.env.PORT || 3000}`,
    cwd: __dirname,
    instances: 1,
    exec_mode: "fork",
    autorestart: true,
    max_memory_restart: "600M",
    env: { NODE_ENV: "production", PORT: process.env.PORT || 3000 },
  }],
};
