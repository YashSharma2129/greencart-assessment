#!/bin/bash

# GreenCart Logistics Deployment Script
# This script handles Docker deployment for development and production

set -e

echo "🚀 GreenCart Logistics Docker Deployment Script"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if Docker is running
check_docker() {
    print_status "Checking Docker installation..."
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker and try again."
        exit 1
    fi

    if ! docker info &> /dev/null; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi

    print_success "Docker is running"
}

# Function to check if docker-compose is available
check_docker_compose() {
    print_status "Checking Docker Compose..."
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose and try again."
        exit 1
    fi
    print_success "Docker Compose is available"
}

# Function to clean up existing containers
cleanup() {
    print_status "Cleaning up existing containers..."
    docker-compose down -v --remove-orphans 2>/dev/null || true
    docker system prune -f 2>/dev/null || true
    print_success "Cleanup completed"
}

# Function to build containers
build() {
    print_status "Building Docker containers..."
    docker-compose build --no-cache
    print_success "Build completed"
}

# Function to start services
start() {
    print_status "Starting services..."
    docker-compose up -d
    print_success "Services started"
}

# Function to check service health
check_health() {
    print_status "Checking service health..."
    sleep 30  # Wait for services to start
    
    # Check MongoDB
    if docker-compose exec -T mongodb mongosh --eval "db.adminCommand('ping')" &> /dev/null; then
        print_success "MongoDB is healthy"
    else
        print_warning "MongoDB health check failed"
    fi
    
    # Check Backend
    if curl -f http://localhost:5000/health &> /dev/null; then
        print_success "Backend is healthy"
    else
        print_warning "Backend health check failed"
    fi
    
    # Check Frontend
    if curl -f http://localhost:3000 &> /dev/null; then
        print_success "Frontend is accessible"
    else
        print_warning "Frontend health check failed"
    fi
}

# Function to show logs
show_logs() {
    print_status "Showing service logs..."
    docker-compose logs -f --tail=50
}

# Function to stop services
stop() {
    print_status "Stopping services..."
    docker-compose down
    print_success "Services stopped"
}

# Function to deploy production
deploy_production() {
    print_status "Deploying production environment..."
    
    if [ ! -f .env ]; then
        print_warning "No .env file found. Creating from .env.example..."
        cp .env.example .env
        print_warning "Please edit .env file with your production values before continuing"
        exit 1
    fi
    
    docker-compose -f docker-compose.prod.yml build --no-cache
    docker-compose -f docker-compose.prod.yml up -d
    print_success "Production deployment completed"
}

# Function to run tests
run_tests() {
    print_status "Running tests..."
    docker-compose exec backend npm test
    print_success "Tests completed"
}

# Main script logic
case "$1" in
    "dev"|"development")
        print_status "Starting development deployment..."
        check_docker
        check_docker_compose
        cleanup
        build
        start
        check_health
        print_success "Development environment is ready!"
        echo ""
        echo "🌐 Services:"
        echo "   Frontend: http://localhost:3000"
        echo "   Backend:  http://localhost:5000"
        echo "   MongoDB:  localhost:27017"
        echo ""
        echo "📊 Health Check: http://localhost:5000/health"
        echo "📝 Logs: $0 logs"
        ;;
    "prod"|"production")
        print_status "Starting production deployment..."
        check_docker
        check_docker_compose
        deploy_production
        ;;
    "build")
        check_docker
        check_docker_compose
        build
        ;;
    "start")
        start
        ;;
    "stop")
        stop
        ;;
    "restart")
        stop
        start
        ;;
    "logs")
        show_logs
        ;;
    "health")
        check_health
        ;;
    "test")
        run_tests
        ;;
    "clean")
        cleanup
        ;;
    *)
        echo "Usage: $0 {dev|prod|build|start|stop|restart|logs|health|test|clean}"
        echo ""
        echo "Commands:"
        echo "  dev        - Start development environment"
        echo "  prod       - Start production environment"
        echo "  build      - Build Docker images"
        echo "  start      - Start services"
        echo "  stop       - Stop services"
        echo "  restart    - Restart services"
        echo "  logs       - Show service logs"
        echo "  health     - Check service health"
        echo "  test       - Run tests"
        echo "  clean      - Clean up containers and images"
        exit 1
        ;;
esac
