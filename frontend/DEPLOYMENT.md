# JeevesBot Frontend Deployment Guide

## 🚀 Production Deployment

This guide covers how to deploy the JeevesBot frontend to production environments.

## 📋 Prerequisites

- Node.js 18+ installed
- Backend API server running
- Web server (Apache, Nginx, etc.)

## 🔧 Configuration

### 1. Configuration File Setup

The application uses `config.json` for all configuration settings. Update the `config.json` file with your production values:

**Important**: The `frontend/config.json` file is excluded from version control in `.gitignore` to protect sensitive credentials.

```json
{
  "environment": {
    "production": {
      "BACKEND_URL": "https://api.yourdomain.com",
      "APP_NAME": "JeevesBot Calendar",
      "NODE_ENV": "production"
    }
  },
  "authentication": {
    "backendCredentials": {
      "username": "admin",
      "password": "your-secure-production-password"
    }
  }
}
```

### 2. Verify Backend Configuration

Ensure your backend `config.json` matches the frontend credentials exactly:

```json
{
  "auth": {
    "username": "admin",
    "password": "your-secure-production-password"
  }
}
```

**Critical**: The username and password in the backend config must match exactly what you set in the frontend `config.json`.

### 3. Environment Detection

The application automatically detects the environment based on:
- **Development**: `localhost` or `127.0.0.1`
- **Staging**: Hostname contains "staging"
- **Production**: All other hostnames

## 🏗️ Build Process

### Build Options

#### Production Build (Recommended)
```bash
npm run build:prod
```

The production build:
- Uses configuration from `config.json`
- Automatically detects environment based on deployment URL
- Generates static files in the `out/` folder
- **Optimized for production** with better minification and smaller bundle sizes

#### Standard Build
```bash
npm run build
```

The standard build:
- Uses configuration from `config.json`
- Automatically detects environment based on deployment URL
- Generates static files in the `out/` folder

## 📦 Deployment Methods

### Method 1: Static Export (Recommended for Apache)

1. **Build the application:**
   ```bash
   npm run build:prod
   ```

2. **Deploy static files:**
   - Copy the entire `out/` folder to your web server
   - Configure Apache to serve from this directory

3. **Apache Configuration Example:**
   ```apache
   <VirtualHost *:80>
       ServerName yourdomain.com
       DocumentRoot /path/to/frontend/out
       
       # Enable URL rewriting for client-side routing
       RewriteEngine On
       RewriteRule ^/login/?$ /login/index.html [L]
       RewriteCond %{REQUEST_FILENAME} !-f
       RewriteCond %{REQUEST_FILENAME} !-d
       RewriteRule . /index.html [L]
   </VirtualHost>
   ```

### Method 2: Node.js Server with PM2

1. **Install PM2 globally:**
   ```bash
   npm install -g pm2
   ```

2. **Start with PM2:**
   ```bash
   npm run build:prod
   pm2 start npm --name "jeevesbot-frontend" -- start
   ```

3. **Save PM2 configuration:**
   ```bash
   pm2 save
   pm2 startup
   ```

### Method 3: Docker Deployment

1. **Create Dockerfile:**
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY . .
   RUN npm run build:prod
   EXPOSE 3000
   CMD ["npm", "start"]
   ```

2. **Build and run:**
   ```bash
   docker build -t jeevesbot-frontend .
   docker run -p 3000:3000 jeevesbot-frontend
   ```

## 🔒 Security Considerations

### 1. Configuration Security
- Never commit sensitive passwords to version control
- **The `frontend/config.json` file is automatically excluded from Git in `.gitignore`**
- Use secure passwords in production
- Consider using different config files for different environments
- **Important**: Configuration is embedded at build time and cannot be changed without rebuilding

### 2. Backend Security
- Ensure backend API has proper CORS configuration
- Use HTTPS in production
- Implement rate limiting on backend API

### 3. Frontend Security
- Static export reduces attack surface
- No server-side code execution
- Regular dependency updates

## 📊 Monitoring and Maintenance

### 1. Health Checks
- Monitor backend API connectivity
- Set up uptime monitoring
- Log errors and performance metrics

### 2. Updates
- Regularly update dependencies: `npm update`
- Rebuild and redeploy after updates
- Test thoroughly in staging environment

### 3. Backup
- Backup your backend data regularly
- Keep deployment configurations version controlled

## 🐛 Troubleshooting

### Common Issues:

1. **API Connection Errors**
   - Verify `BACKEND_URL` in `config.json` is correct
   - Check backend server is running
   - Verify CORS configuration

2. **Authentication Failures**
   - Ensure frontend and backend credentials match exactly
   - Verify `config.json` credentials match backend `config.json`
   - Check that environment detection is working correctly
   - Rebuild if credentials were changed

3. **Static Export Issues**
   - Clear `.next` and `out` folders
   - Run `npm run build:prod` again
   - Check for client-side only code

4. **Routing Problems**
   - Configure URL rewriting properly
   - Ensure all routes have corresponding HTML files

5. **Configuration Issues**
   - Verify `config.json` syntax is valid JSON
   - Check that all required fields are present
   - Ensure environment detection logic matches your deployment

## 📞 Support

For deployment issues:
1. Check the browser console for errors
2. Verify backend API is accessible
3. Review Next.js build logs
4. Check server error logs
5. Verify configuration file syntax

## 🎯 Best Practices

- Use different configuration sections for different environments
- Implement proper error boundaries
- Set up monitoring and alerting
- Regular security audits
- Automated deployment pipelines

---

**Next Steps:**
1. Update `config.json` with your actual production values
2. Ensure backend `config.json` matches the frontend credentials
3. Run `npm run build:prod`
4. Deploy the `out/` folder to your web server
5. Test authentication and API functionality in production

**Important Notes**:
- `frontend/config.json` is excluded from Git to protect credentials
- If you change credentials or configuration, you must rebuild and redeploy the application
- Keep your production `config.json` file secure and backed up separately