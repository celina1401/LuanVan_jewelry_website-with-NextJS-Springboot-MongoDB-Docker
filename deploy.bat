@echo off
REM B2110941 Project Deployment Script for Windows

echo 🚀 Starting B2110941 Project Deployment...

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not running. Please start Docker Desktop first.
    pause
    exit /b 1
)

REM Check if docker-compose is available
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ docker-compose is not installed. Please install Docker Compose.
    pause
    exit /b 1
)

REM Function to display usage
:show_usage
if "%1"=="help" goto usage
if "%1"=="--help" goto usage
if "%1"=="-h" goto usage
if "%1"=="" goto usage
goto :eof

:usage
echo Usage: %0 [OPTION]
echo.
echo Options:
echo   build     Build all services
echo   start     Start all services
echo   stop      Stop all services
echo   restart   Restart all services
echo   logs      Show logs for all services
echo   clean     Clean up containers and images
echo   status    Show status of all services
echo   help      Show this help message
echo.
echo Examples:
echo   %0 build    # Build all services
echo   %0 start    # Start all services
echo   %0 logs     # Show logs
goto :eof

REM Function to build services
:build_services
echo 🔨 Building all services...
docker-compose build --no-cache
if %errorlevel% equ 0 (
    echo ✅ Build completed!
) else (
    echo ❌ Build failed!
)
goto :eof

REM Function to start services
:start_services
echo 🚀 Starting all services...
docker-compose up -d
if %errorlevel% equ 0 (
    echo ✅ Services started!
    echo.
    echo 📋 Service URLs:
    echo   Frontend: http://localhost:3000
    echo   API Gateway: http://localhost:8080
    echo   Eureka Discovery: http://localhost:8761
    echo   MongoDB: localhost:27017
    echo.
    echo 🔍 Check service status: %0 status
    echo 📝 View logs: %0 logs
) else (
    echo ❌ Failed to start services!
)
goto :eof

REM Function to stop services
:stop_services
echo 🛑 Stopping all services...
docker-compose down
if %errorlevel% equ 0 (
    echo ✅ Services stopped!
) else (
    echo ❌ Failed to stop services!
)
goto :eof

REM Function to restart services
:restart_services
echo 🔄 Restarting all services...
docker-compose down
docker-compose up -d
if %errorlevel% equ 0 (
    echo ✅ Services restarted!
) else (
    echo ❌ Failed to restart services!
)
goto :eof

REM Function to show logs
:show_logs
echo 📝 Showing logs for all services...
docker-compose logs -f
goto :eof

REM Function to clean up
:clean_up
echo 🧹 Cleaning up containers and images...
docker-compose down -v
docker system prune -f
if %errorlevel% equ 0 (
    echo ✅ Cleanup completed!
) else (
    echo ❌ Cleanup failed!
)
goto :eof

REM Function to show status
:show_status
echo 📊 Service Status:
docker-compose ps
goto :eof

REM Main script logic
if "%1"=="build" goto build_services
if "%1"=="start" goto start_services
if "%1"=="stop" goto stop_services
if "%1"=="restart" goto restart_services
if "%1"=="logs" goto show_logs
if "%1"=="clean" goto clean_up
if "%1"=="status" goto show_status
if "%1"=="help" goto usage
if "%1"=="--help" goto usage
if "%1"=="-h" goto usage
if "%1"=="" goto usage

echo ❌ Unknown option: %1
goto usage
