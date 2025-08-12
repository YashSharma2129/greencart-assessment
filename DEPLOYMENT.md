# Deployment Guide - GreenCart Logistics

## 🚀 Quick Deployment Steps

### 1. Database Setup (MongoDB Atlas)

1. **Create MongoDB Atlas Account**
   - Go to https://cloud.mongodb.com/
   - Create a new account or login
   - Create a new cluster (free tier is sufficient)

2. **Configure Database**
   ```bash
   # Create a new database user
   Username: greencart_user
   Password: [Generate secure password]
   
   # Set up network access
   IP Whitelist: 0.0.0.0/0 (allow from anywhere)
   ```

3. **Get Connection String**
   ```
   mongodb+srv://greencart_user:[password]@cluster0.xxxxx.mongodb.net/greencart?retryWrites=true&w=majority
   ```

### 2. Backend Deployment (Railway)

1. **Prepare Backend for Deployment**
   ```bash
   cd backend
   
   # Add production scripts to package.json
   npm run build # if needed
   ```

2. **Deploy to Railway**
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli
   
   # Login to Railway
   railway login
   
   # Initialize project
   railway init
   
   # Set environment variables
   railway variables set MONGODB_URI=your-mongodb-connection-string
   railway variables set JWT_SECRET=your-super-secret-jwt-key
   railway variables set NODE_ENV=production
   railway variables set PORT=5000
   
   # Deploy
   railway up
   ```

3. **Alternative: Deploy to Render**
   - Connect your GitHub repository to Render
   - Set environment variables in Render dashboard
   - Deploy with automatic builds

### 3. Frontend Deployment (Vercel)

1. **Prepare Frontend**
   ```bash
   cd frontend-ts
   
   # Create production build
   npm run build
   ```

2. **Deploy to Vercel**
   ```bash
   # Install Vercel CLI
   npm install -g vercel
   
   # Login to Vercel
   vercel login
   
   # Deploy
   vercel
   
   # Set environment variables
   vercel env add VITE_API_URL
   # Enter your Railway backend URL: https://your-app.railway.app
   ```

3. **Alternative: Deploy to Netlify**
   ```bash
   # Build command: npm run build
   # Publish directory: dist
   # Environment variables:
   VITE_API_URL=https://your-backend-url.railway.app
   ```

### 4. Environment Variables Summary

#### Backend (.env)
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/greencart
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters
JWT_EXPIRE=7d
NODE_ENV=production
PORT=5000
```

#### Frontend (.env)
```env
VITE_API_URL=https://your-backend-url.railway.app
```

## 🔧 Production Optimization

### Backend Optimizations

1. **Update CORS Settings**
   ```javascript
   // In server.js
   app.use(cors({
     origin: ['https://your-frontend-domain.vercel.app'],
     credentials: true
   }));
   ```

2. **Add Compression**
   ```bash
   npm install compression
   ```
   
   ```javascript
   const compression = require('compression');
   app.use(compression());
   ```

3. **Security Headers**
   ```bash
   npm install helmet
   ```
   
   ```javascript
   const helmet = require('helmet');
   app.use(helmet());
   ```

### Frontend Optimizations

1. **Update API Base URL**
   ```typescript
   // In src/services/api.ts
   const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
   ```

2. **Production Build Optimization**
   ```json
   // In vite.config.ts
   export default defineConfig({
     plugins: [react()],
     build: {
       rollupOptions: {
         output: {
           manualChunks: {
             vendor: ['react', 'react-dom'],
             charts: ['recharts']
           }
         }
       }
     }
   });
   ```

## 🧪 Testing Deployment

### Backend Testing
```bash
# Test API endpoints
curl https://your-backend-url.railway.app/api/health

# Test authentication
curl -X POST https://your-backend-url.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
```

### Frontend Testing
```bash
# Test frontend loads
curl https://your-frontend-domain.vercel.app

# Check if API calls work
# Open browser dev tools and check network tab
```

## 📊 Monitoring & Maintenance

### Database Monitoring
- Monitor MongoDB Atlas metrics
- Set up alerts for high usage
- Regular backup verification

### Application Monitoring
- Railway/Render deployment logs
- Vercel/Netlify build logs
- Performance metrics tracking

### Security Checklist
- [ ] Environment variables secured
- [ ] CORS properly configured
- [ ] HTTPS enabled on all endpoints
- [ ] JWT secrets are strong
- [ ] Database user has minimal permissions
- [ ] IP whitelisting configured

## 🚨 Troubleshooting

### Common Issues

1. **CORS Errors**
   ```javascript
   // Update CORS settings in backend
   app.use(cors({
     origin: process.env.FRONTEND_URL || 'http://localhost:5173',
     credentials: true
   }));
   ```

2. **Environment Variables Not Loading**
   ```bash
   # Check if variables are set correctly
   railway variables list
   vercel env ls
   ```

3. **Database Connection Issues**
   ```javascript
   // Check MongoDB connection string format
   // Ensure IP whitelist includes deployment server IPs
   ```

4. **Build Failures**
   ```bash
   # Clear node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

## 📋 Post-Deployment Checklist

### Immediate Testing
- [ ] Frontend loads correctly
- [ ] User registration works
- [ ] User login works
- [ ] Dashboard displays data
- [ ] Simulation runs successfully
- [ ] CRUD operations work
- [ ] Charts render properly

### Performance Testing
- [ ] Page load times under 3 seconds
- [ ] API response times under 500ms
- [ ] Database queries optimized
- [ ] Image assets optimized

### Security Testing
- [ ] HTTPS enabled everywhere
- [ ] No sensitive data in client
- [ ] JWT tokens expire properly
- [ ] Protected routes work correctly

## 🎯 Success Metrics

### Application Performance
- Frontend load time: < 3 seconds
- API response time: < 500ms
- Database query time: < 100ms
- Uptime: > 99.9%

### User Experience
- Simulation completes in < 10 seconds
- Dashboard updates in real-time
- Mobile responsive design works
- Error messages are user-friendly

---

**Deployment completed successfully! 🎉**

Your GreenCart Logistics application is now live and ready for the Purple Merit Technologies assessment.
