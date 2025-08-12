# GreenCart Logistics Deployment Script (PowerShell)
# This script handles Docker deployment for development and production

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("dev", "development", "prod", "production", "build", "start", "stop", "restart", "logs", "health", "test", "clean")]
    [string]$Command
)

# Colors for output
function Write-Status { param($Message) Write-Host "[INFO] $Message" -ForegroundColor Blue }
function Write-Success { param($Message) Write-Host "[SUCCESS] $Message" -ForegroundColor Green }
function Write-Warning { param($Message) Write-Host "[WARNING] $Message" -ForegroundColor Yellow }
function Write-Error { param($Message) Write-Host "[ERROR] $Message" -ForegroundColor Red }

Write-Host "🚀 GreenCart Logistics Docker Deployment Script" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan

# Function to check if Docker is running
function Test-Docker {
    Write-Status "Checking Docker installation..."
    try {
        $null = docker --version
        $null = docker info
        Write-Success "Docker is running"
        return $true
    }
    catch {
        Write-Error "Docker is not running. Please start Docker and try again."
        exit 1
    }
}

# Function to check if docker-compose is available
function Test-DockerCompose {
    Write-Status "Checking Docker Compose..."
    try {
        $null = docker-compose --version
        Write-Success "Docker Compose is available"
        return $true
    }
    catch {
        Write-Error "Docker Compose is not installed. Please install Docker Compose and try again."
        exit 1
    }
}

# Function to clean up existing containers
function Invoke-Cleanup {
    Write-Status "Cleaning up existing containers..."
    try {
        docker-compose down -v --remove-orphans 2>$null
        docker system prune -f 2>$null
        Write-Success "Cleanup completed"
    }
    catch {
        Write-Warning "Some cleanup operations failed, continuing..."
    }
}

# Function to build containers
function Invoke-Build {
    Write-Status "Building Docker containers..."
    docker-compose build --no-cache
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Build completed"
    } else {
        Write-Error "Build failed"
        exit 1
    }
}

# Function to start services
function Start-Services {
    Write-Status "Starting services..."
    docker-compose up -d
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Services started"
    } else {
        Write-Error "Failed to start services"
        exit 1
    }
}

# Function to check service health
function Test-ServiceHealth {
    Write-Status "Checking service health..."
    Start-Sleep -Seconds 30  # Wait for services to start
    
    # Check Backend
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5000/health" -UseBasicParsing -TimeoutSec 10
        if ($response.StatusCode -eq 200) {
            Write-Success "Backend is healthy"
        }
    }
    catch {
        Write-Warning "Backend health check failed"
    }
    
    # Check Frontend
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 10
        if ($response.StatusCode -eq 200) {
            Write-Success "Frontend is accessible"
        }
    }
    catch {
        Write-Warning "Frontend health check failed"
    }
}

# Function to show logs
function Show-Logs {
    Write-Status "Showing service logs..."
    docker-compose logs -f --tail=50
}

# Function to stop services
function Stop-Services {
    Write-Status "Stopping services..."
    docker-compose down
    Write-Success "Services stopped"
}

# Function to deploy production
function Deploy-Production {
    Write-Status "Deploying production environment..."
    
    if (-not (Test-Path ".env")) {
        Write-Warning "No .env file found. Creating from .env.example..."
        Copy-Item ".env.example" ".env"
        Write-Warning "Please edit .env file with your production values before continuing"
        exit 1
    }
    
    docker-compose -f docker-compose.prod.yml build --no-cache
    docker-compose -f docker-compose.prod.yml up -d
    Write-Success "Production deployment completed"
}

# Function to run tests
function Invoke-Tests {
    Write-Status "Running tests..."
    docker-compose exec backend npm test
    Write-Success "Tests completed"
}

# Main script logic
switch ($Command) {
    { $_ -in @("dev", "development") } {
        Write-Status "Starting development deployment..."
        Test-Docker
        Test-DockerCompose
        Invoke-Cleanup
        Invoke-Build
        Start-Services
        Test-ServiceHealth
        Write-Success "Development environment is ready!"
        Write-Host ""
        Write-Host "🌐 Services:" -ForegroundColor Cyan
        Write-Host "   Frontend: http://localhost:3000" -ForegroundColor White
        Write-Host "   Backend:  http://localhost:5000" -ForegroundColor White
        Write-Host "   MongoDB:  localhost:27017" -ForegroundColor White
        Write-Host ""
        Write-Host "📊 Health Check: http://localhost:5000/health" -ForegroundColor Cyan
        Write-Host "📝 Logs: .\deploy.ps1 logs" -ForegroundColor Cyan
    }
    { $_ -in @("prod", "production") } {
        Write-Status "Starting production deployment..."
        Test-Docker
        Test-DockerCompose
        Deploy-Production
    }
    "build" {
        Test-Docker
        Test-DockerCompose
        Invoke-Build
    }
    "start" { Start-Services }
    "stop" { Stop-Services }
    "restart" {
        Stop-Services
        Start-Services
    }
    "logs" { Show-Logs }
    "health" { Test-ServiceHealth }
    "test" { Invoke-Tests }
    "clean" { Invoke-Cleanup }
}
