module.exports = {
  apps: [
    {
      name: 'backend',
      cwd: './backend', // ruta desde la raíz del proyecto
      script: 'npm',
      args: 'run start:prod',
      watch: false,
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        FRONTEND_URL: 'http://192.168.101.65:3000'
      }
    },
    {
      name: 'frontend',
      cwd: './frontend', // ruta desde la raíz del proyecto
      script: 'npx',
      args: 'serve -s build -l 3000',
      watch: false,
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        REACT_APP_API_URL: 'http://192.168.101.65:3001',
        HOST: '0.0.0.0',
        WDS_ALLOWED_HOSTS: 'all',
        DANGEROUSLY_DISABLE_HOST_CHECK: 'true'
      }
    }
  ]
};
