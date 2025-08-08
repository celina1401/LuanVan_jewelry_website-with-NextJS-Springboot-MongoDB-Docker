# B2110941 Project - Docker Deployment Guide

This guide will help you deploy the entire B2110941 project using Docker.

## Project Structure

```
B2110941/
├── FrontEnd/                 # Next.js Frontend Application
│   ├── Dockerfile           # Frontend Docker configuration
│   ├── docker-compose.yml   # Frontend-specific compose
│   └── .dockerignore        # Frontend Docker ignore
├── BackEnd/                 # Spring Boot Microservices
│   ├── apigateway/         # API Gateway Service
│   ├── discoveryserver/    # Eureka Discovery Server
│   ├── userservice/        # User Management Service
│   ├── orderservice/       # Order Management Service
│   ├── productservice/     # Product Management Service
│   ├── cartservice/        # Cart Management Service
│   ├── notificationservice/ # Notification Service
│   ├── paymentservice/     # Payment Service
│   ├── chatservice/        # Chat Service
│   ├── reviewservice/      # Review Service
│   └── data/              # MongoDB data persistence
└── docker-compose.yml      # Root-level compose for entire project
```

## Prerequisites

- Docker Desktop installed and running
- Docker Compose v3.8 or higher
- At least 8GB RAM available for Docker
- Ports 3000, 8080, 8761, 9001-9008, 27017 available

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Clerk Authentication (Frontend)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/register
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXT_PUBLIC_BACKEND_API_URL=http://localhost:8080/api
NEXT_PUBLIC_JWKS_URL=your_jwks_url
NEXT_PUBLIC_JWKS_PUBLIC_KEY=your_jwks_public_key
```

## Quick Start

### 1. Clone and Navigate to Project

```bash
cd B2110941
```

### 2. Build and Start All Services

```bash
# Build and start all services
docker-compose up --build

# Or run in detached mode
docker-compose up -d --build
```

### 3. Access the Application

- **Frontend**: http://localhost:3000
- **API Gateway**: http://localhost:8080
- **Eureka Discovery**: http://localhost:8761
- **MongoDB**: localhost:27017

## Service Ports

| Service | Port | Description |
|---------|------|-------------|
| Frontend | 3000 | Next.js Application |
| API Gateway | 8080 | Spring Cloud Gateway |
| Discovery Server | 8761 | Eureka Discovery |
| User Service | 9001 | User Management |
| Notification Service | 9002 | Notifications |
| Order Service | 9003 | Order Management |
| Product Service | 9004 | Product Management |
| Cart Service | 9005 | Cart Management |
| Payment Service | 9006 | Payment Processing |
| Chat Service | 9007 | Real-time Chat |
| Review Service | 9008 | Product Reviews |
| MongoDB | 27017 | Database |

## Individual Service Management

### Start Specific Services

```bash
# Start only frontend and API gateway
docker-compose up frontend apigateway

# Start only backend services
docker-compose up discoveryserver apigateway userservice orderservice
```

### Stop Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### View Logs

```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs frontend
docker-compose logs apigateway
docker-compose logs userservice
```

## Development Mode

For development, you can run services individually:

### Frontend Development

```bash
cd FrontEnd
npm install
npm run dev
```

### Backend Services

Each service can be run individually using their respective Dockerfiles:

```bash
# Example: Run only user service
cd BackEnd/userservice
docker build -t userservice .
docker run -p 9001:9001 userservice
```

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Check what's using the port
   netstat -ano | findstr :3000
   
   # Kill the process or change port in docker-compose.yml
   ```

2. **MongoDB Connection Issues**
   ```bash
   # Check MongoDB container status
   docker-compose logs mongodb
   
   # Restart MongoDB
   docker-compose restart mongodb
   ```

3. **Service Discovery Issues**
   ```bash
   # Check Eureka discovery server
   docker-compose logs discoveryserver
   
   # Restart discovery server
   docker-compose restart discoveryserver
   ```

4. **Frontend Build Issues**
   ```bash
   # Clean and rebuild frontend
   docker-compose build --no-cache frontend
   ```

### Memory Issues

If you encounter memory issues:

1. Increase Docker Desktop memory limit (recommended: 8GB+)
2. Stop unnecessary containers: `docker system prune`
3. Use `docker-compose up --scale service=1` to limit service instances

## Production Deployment

For production deployment:

1. **Environment Variables**: Ensure all production environment variables are set
2. **SSL/TLS**: Configure reverse proxy (nginx) for HTTPS
3. **Database**: Use external MongoDB instance
4. **Monitoring**: Add health checks and monitoring
5. **Backup**: Configure database backups

### Production Docker Compose

Create a `docker-compose.prod.yml`:

```yaml
version: '3.8'
services:
  frontend:
    build:
      context: ./FrontEnd
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
    # Add production-specific configurations
```

## Maintenance

### Update Services

```bash
# Pull latest changes
git pull

# Rebuild and restart services
docker-compose down
docker-compose up --build -d
```

### Clean Up

```bash
# Remove unused containers, networks, images
docker system prune

# Remove all containers and images
docker system prune -a
```

## Support

For issues and questions:
1. Check the service logs: `docker-compose logs [service-name]`
2. Verify environment variables are set correctly
3. Ensure all required ports are available
4. Check Docker Desktop is running and has sufficient resources

## Notes

- The frontend uses Next.js 15 with standalone output for optimal Docker deployment
- Backend services use Spring Boot with Eureka for service discovery
- MongoDB data is persisted in `./BackEnd/data/db`
- All services are configured to restart automatically unless stopped manually
