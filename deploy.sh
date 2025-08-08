#!/bin/bash

# B2110941 Project Deployment Script

echo "🚀 Starting B2110941 Project Deployment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop first."
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose is not installed. Please install Docker Compose."
    exit 1
fi

# Function to display usage
show_usage() {
    echo "Usage: $0 [OPTION]"
    echo ""
    echo "Options:"
    echo "  build     Build all services"
    echo "  start     Start all services"
    echo "  stop      Stop all services"
    echo "  restart   Restart all services"
    echo "  logs      Show logs for all services"
    echo "  clean     Clean up containers and images"
    echo "  status    Show status of all services"
    echo "  help      Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 build    # Build all services"
    echo "  $0 start    # Start all services"
    echo "  $0 logs     # Show logs"
}

# Function to build services
build_services() {
    echo "🔨 Building all services..."
    docker-compose build --no-cache
    echo "✅ Build completed!"
}

# Function to start services
start_services() {
    echo "🚀 Starting all services..."
    docker-compose up -d
    echo "✅ Services started!"
    echo ""
    echo "📋 Service URLs:"
    echo "  Frontend: http://localhost:3000"
    echo "  API Gateway: http://localhost:8080"
    echo "  Eureka Discovery: http://localhost:8761"
    echo "  MongoDB: localhost:27017"
    echo ""
    echo "🔍 Check service status: $0 status"
    echo "📝 View logs: $0 logs"
}

# Function to stop services
stop_services() {
    echo "🛑 Stopping all services..."
    docker-compose down
    echo "✅ Services stopped!"
}

# Function to restart services
restart_services() {
    echo "🔄 Restarting all services..."
    docker-compose down
    docker-compose up -d
    echo "✅ Services restarted!"
}

# Function to show logs
show_logs() {
    echo "📝 Showing logs for all services..."
    docker-compose logs -f
}

# Function to clean up
clean_up() {
    echo "🧹 Cleaning up containers and images..."
    docker-compose down -v
    docker system prune -f
    echo "✅ Cleanup completed!"
}

# Function to show status
show_status() {
    echo "📊 Service Status:"
    docker-compose ps
}

# Main script logic
case "${1:-help}" in
    build)
        build_services
        ;;
    start)
        start_services
        ;;
    stop)
        stop_services
        ;;
    restart)
        restart_services
        ;;
    logs)
        show_logs
        ;;
    clean)
        clean_up
        ;;
    status)
        show_status
        ;;
    help|--help|-h)
        show_usage
        ;;
    *)
        echo "❌ Unknown option: $1"
        show_usage
        exit 1
        ;;
esac
