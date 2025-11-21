# 🚀 Auto Setup Script for Hotel Management System (Windows PowerShell)
# This script will setup the entire development environment

Write-Host "🏨 Hotel Management System - Auto Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Function to print colored output
function Write-Status {
    param($Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param($Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param($Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param($Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Check if Node.js is installed
function Test-Node {
    Write-Status "Checking Node.js installation..."
    try {
        $nodeVersion = node --version
        Write-Success "Node.js found: $nodeVersion"
        return $true
    }
    catch {
        Write-Error "Node.js is not installed. Please install Node.js >= 18.x"
        return $false
    }
}

# Check if npm is installed
function Test-Npm {
    Write-Status "Checking npm installation..."
    try {
        $npmVersion = npm --version
        Write-Success "npm found: $npmVersion"
        return $true
    }
    catch {
        Write-Error "npm is not installed. Please install npm"
        return $false
    }
}

# Install dependencies
function Install-Dependencies {
    Write-Status "Installing dependencies..."
    try {
        npm install
        Write-Success "Dependencies installed successfully"
        return $true
    }
    catch {
        Write-Error "Failed to install dependencies"
        return $false
    }
}

# Check environment file
function Test-Env {
    Write-Status "Checking environment configuration..."
    if (-not (Test-Path ".env")) {
        if (Test-Path ".env.example") {
            Write-Warning ".env file not found. Copying from .env.example"
            Copy-Item ".env.example" ".env"
            Write-Warning "Please edit .env file with your database credentials"
        }
        else {
            Write-Error ".env.example file not found"
            return $false
        }
    }
    else {
        Write-Success ".env file found"
    }
    return $true
}

# Setup database
function Setup-Database {
    Write-Status "Setting up database..."
    
    # Generate Prisma client
    try {
        npm run prisma:generate
        Write-Success "Prisma client generated"
    }
    catch {
        Write-Error "Failed to generate Prisma client"
        return $false
    }
    
    # Run migrations
    try {
        npm run prisma:migrate
        Write-Success "Database migrations completed"
        return $true
    }
    catch {
        Write-Error "Failed to run database migrations"
        Write-Warning "Please check your DATABASE_URL in .env file"
        return $false
    }
}

# Setup test data
function Setup-TestData {
    Write-Status "Setting up test data..."
    try {
        npm run test:setup
        Write-Success "Test data setup completed"
        return $true
    }
    catch {
        Write-Warning "Test data setup failed (this is optional)"
        return $false
    }
}

# Test API
function Test-Api {
    Write-Status "Running API tests..."
    try {
        npm run test:api
        Write-Success "API tests completed successfully"
        return $true
    }
    catch {
        Write-Warning "API tests failed (check server is running)"
        return $false
    }
}

# Main setup function
function Main {
    Write-Host ""
    Write-Status "Starting auto setup process..."
    Write-Host ""
    
    # Step 1: Check prerequisites
    if (-not (Test-Node)) { exit 1 }
    if (-not (Test-Npm)) { exit 1 }
    Write-Host ""
    
    # Step 2: Install dependencies
    if (-not (Install-Dependencies)) { exit 1 }
    Write-Host ""
    
    # Step 3: Check environment
    if (-not (Test-Env)) { exit 1 }
    Write-Host ""
    
    # Step 4: Setup database
    if (-not (Setup-Database)) { exit 1 }
    Write-Host ""
    
    # Step 5: Setup test data
    Setup-TestData
    Write-Host ""
    
    # Step 6: Test API (optional)
    $runTests = Read-Host "Do you want to run API tests? (y/n)"
    if ($runTests -eq "y" -or $runTests -eq "Y") {
        Test-Api
    }
    
    Write-Host ""
    Write-Success "Setup completed successfully! 🎉"
    Write-Host ""
    Write-Host "📋 Next steps:" -ForegroundColor Cyan
    Write-Host "1. Start the server: npm run dev"
    Write-Host "2. Open Prisma Studio: npm run prisma:studio"
    Write-Host "3. Test API: npm run test:api"
    Write-Host ""
    Write-Host "🔗 Useful URLs:" -ForegroundColor Cyan
    Write-Host "- Server: http://localhost:3001"
    Write-Host "- Health Check: http://localhost:3001/health"
    Write-Host "- Prisma Studio: http://localhost:5555"
    Write-Host ""
    Write-Host "📚 Documentation:" -ForegroundColor Cyan
    Write-Host "- HOW-TO-RUN-TEST.md - Detailed guide"
    Write-Host "- API-TEST-GUIDE.md - Testing guide"
    Write-Host "- TEST-RESULTS-SUMMARY.md - Test results"
    Write-Host ""
}

# Run main function
Main
