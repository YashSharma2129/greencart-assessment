# 🐳 Docker Deployment Guide

## Overview
Complete Docker containerization for GreenCart Logistics application with production-ready configuration.

## 🚀 Quick Start

### Prerequisites
- Docker Engine 20.10+
- Docker Compose 2.0+
- At least 4GB RAM available for containers

### Development Deployment
```powershell
# Using PowerShell script (Windows)
.\deploy.ps1 dev

# Using Docker Compose directly
docker-compose up --build -d
```

### Production Deployment
```powershell
# Using PowerShell script
.\deploy.ps1 prod

# Using Docker Compose directly
docker-compose -f docker-compose.prod.yml up --build -d
```

## 📁 Container Architecture

### Services Overview
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │    MongoDB      │
│   (React TS)    │◄──►│  (Node.js)      │◄──►│   (Database)    │
│   Port: 3000    │    │   Port: 5000    │    │   Port: 27017   │
│   Nginx Alpine  │    │  Node 18 Alpine │    │   Mongo 7.0     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │     Redis       │
                       │   (Caching)     │
                       │   Port: 6379    │
                       │  Redis Alpine   │
                       └─────────────────┘
```

### Container Details

#### Frontend Container
- **Base Image**: `nginx:alpine`
- **Build Type**: Multi-stage (Node.js build → Nginx serve)
- **Port**: 3000 (development), 80/443 (production)
- **Features**: 
  - Optimized production build
  - Gzip compression
  - Security headers
  - Client-side routing support

#### Backend Container
- **Base Image**: `node:18-alpine`
- **Port**: 5000
- **Features**:
  - Non-root user execution
  - Health check endpoint
  - Production dependencies only
  - Environment-based configuration

#### Database Container
- **Base Image**: `mongo:7.0`
- **Port**: 27017
- **Features**:
  - Persistent volume storage
  - Initialization scripts
  - Health monitoring
  - Authentication enabled

#### Redis Container (Bonus)
- **Base Image**: `redis:7-alpine`
- **Port**: 6379
- **Features**:
  - Persistent storage
  - Memory optimization
  - Health monitoring

## 🔧 Configuration Files

### Environment Configuration
Copy `.env.example` to `.env` and configure:

```env
# MongoDB Configuration
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=your-secure-password
MONGODB_URI=mongodb://greencart_user:greencart123@mongodb:27017/greencart?authSource=greencart

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d

# URLs
FRONTEND_URL=http://localhost:3000
API_BASE_URL=http://localhost:5000/api
```

### Docker Compose Files
- `docker-compose.yml` - Development environment
- `docker-compose.prod.yml` - Production environment

### Health Checks
All services include comprehensive health monitoring:

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:5000/health"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

## 📊 Monitoring & Debugging

### Check Service Status
```powershell
# View all services
docker-compose ps

# Check logs
docker-compose logs -f [service-name]

# Execute commands in containers
docker-compose exec backend npm test
docker-compose exec mongodb mongosh
```

### Health Endpoints
- Backend Health: `http://localhost:5000/health`
- Frontend: `http://localhost:3000`
- API Base: `http://localhost:5000/api`

### Log Management
```powershell
# Follow logs
docker-compose logs -f

# View specific service logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs mongodb
```

## 🚀 Deployment Commands

### PowerShell Script Commands
```powershell
# Development
.\deploy.ps1 dev           # Full development setup
.\deploy.ps1 build         # Build containers only
.\deploy.ps1 start         # Start services
.\deploy.ps1 stop          # Stop services
.\deploy.ps1 restart       # Restart services

# Monitoring
.\deploy.ps1 logs          # Show logs
.\deploy.ps1 health        # Check health
.\deploy.ps1 test          # Run tests

# Maintenance
.\deploy.ps1 clean         # Clean up containers

# Production
.\deploy.ps1 prod          # Production deployment
```

### Manual Docker Commands
```powershell
# Build images
docker-compose build --no-cache

# Start services
docker-compose up -d

# Stop services
docker-compose down

# Clean up
docker-compose down -v --remove-orphans
docker system prune -a
```

## 🔒 Security Features

### Container Security
- Non-root user execution
- Minimal base images (Alpine Linux)
- Security headers in Nginx
- Environment variable secrets
- Network isolation

### Production Hardening
- Read-only root filesystem capability
- Resource limits configured
- Health check monitoring
- Proper secret management

## 📈 Performance Optimization

### Image Optimization
- Multi-stage builds for frontend
- Alpine Linux base images
- `.dockerignore` files configured
- Layer caching strategies

### Runtime Performance
- Gzip compression enabled
- Static asset caching
- Database connection pooling
- Redis caching layer

## 🛠 Troubleshooting

### Common Issues

#### Port Conflicts
```powershell
# Check port usage
netstat -an | findstr "3000\|5000\|27017"

# Kill processes on ports
Stop-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess
```

#### Container Build Failures
```powershell
# Clean build
docker-compose build --no-cache --pull

# View build logs
docker-compose build --progress=plain
```

#### Database Connection Issues
```powershell
# Check MongoDB logs
docker-compose logs mongodb

# Test database connection
docker-compose exec mongodb mongosh --eval "db.adminCommand('ping')"
```

#### Memory Issues
```powershell
# Check container resource usage
docker stats

# Free up space
docker system prune -a
docker volume prune
```

### Debug Mode
Enable verbose logging:
```powershell
$env:COMPOSE_LOG_LEVEL="DEBUG"
docker-compose up
```

## 📋 Production Checklist

Before deploying to production:

- [ ] Environment variables configured
- [ ] SSL certificates installed (for HTTPS)
- [ ] Database backup strategy implemented
- [ ] Log rotation configured
- [ ] Resource limits set
- [ ] Health monitoring enabled
- [ ] Security scanning completed

## 🔄 CI/CD Integration

The Docker setup integrates with GitHub Actions pipeline:
- Automated builds on push
- Security scanning with Trivy
- Multi-platform builds (AMD64/ARM64)
- Container registry deployment

## 📞 Support

For issues with Docker deployment:
1. Check service logs: `docker-compose logs [service]`
2. Verify health endpoints
3. Review environment configuration
4. Check resource availability

## 📊 Service URLs

| Service | Development | Production |
|---------|-------------|------------|
| Frontend | http://localhost:3000 | http://your-domain.com |
| Backend API | http://localhost:5000 | https://api.your-domain.com |
| Health Check | http://localhost:5000/health | https://api.your-domain.com/health |
| MongoDB | localhost:27017 | Internal network only |
| Redis | localhost:6379 | Internal network only |
