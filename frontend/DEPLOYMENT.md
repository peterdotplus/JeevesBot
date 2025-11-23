# JeevesBot Frontend Deployment Guide

## 🚀 Production Deployment

This guide covers how to deploy the JeevesBot frontend to production environments.

## 📋 Prerequisites

- Node.js 18+ installed
- Backend API server running
- Web server (Apache, Nginx, etc.)

## 🔧 Environment Configuration

### 1. Production Environment Variables

Create or update `.env.production` file:

```env
# Production Environment Configuration
NEXT_PUBLIC_BACKEND_URL=https://api.yourdomain.com
NEXT_PUBLIC_APP_NAME=JeevesBot Calendar
NEXT_PUBLIC_BACKEND_USERNAME=admin
NEXT_PUBLIC_BACKEND_PASSWORD=your-production-password
NODE_ENV=production
```

**Important**: Replace placeholder values with your actual production configuration.

### 2. Verify Backend Configuration

Ensure your backend `config.json` matches the frontend credentials:

```json
{
  "auth": {
    "username": "admin",
    "password": "your-production-password"
  }
}
```

## 🏗️ Build Process

### Option 1: Standard Production Build
```bash
npm run build:prod
```

### Option 2: Development Build (for testing)
```bash
npm run build:dev
```

### Option 3: Default Build (uses current environment)
```bash
npm run build
```

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
   pm2 start npm --name "jeevesbot-frontend" -- start:prod
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
   CMD ["npm", "start:prod"]
   ```

2. **Build and run:**
   ```bash
   docker build -t jeevesbot-frontend .
   docker run -p 3000:3000 jeevesbot-frontend
   ```

## 🔒 Security Considerations

### 1. Environment Variables
- Never commit `.env.production` to version control
- Use secure passwords in production
- Consider using environment variable management in your deployment platform

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
   - Verify `NEXT_PUBLIC_BACKEND_URL` is correct
   - Check backend server is running
   - Verify CORS configuration

2. **Authentication Failures**
   - Ensure frontend and backend credentials match
   - Check password encoding/decoding

3. **Static Export Issues**
   - Clear `.next` and `out` folders
   - Run `npm run build:prod` again
   - Check for client-side only code

4. **Routing Problems**
   - Configure URL rewriting properly
   - Ensure all routes have corresponding HTML files

## 📞 Support

For deployment issues:
1. Check the browser console for errors
2. Verify backend API is accessible
3. Review Next.js build logs
4. Check server error logs

## 🎯 Best Practices

- Use environment-specific configurations
- Implement proper error boundaries
- Set up monitoring and alerting
- Regular security audits
- Automated deployment pipelines

---

**Next Steps:**
1. Update `.env.production` with your actual values
2. Run `npm run build:prod`
3. Deploy the `out/` folder to your web server
4. Test all functionality in production