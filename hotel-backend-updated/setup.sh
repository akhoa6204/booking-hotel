#!/bin/bash

# 🚀 Auto Setup Script for Hotel Management System
# This script will setup the entire development environment

echo "🏨 Hotel Management System - Auto Setup"
echo "========================================"

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

# Check if Node.js is installed
check_node() {
    print_status "Checking Node.js installation..."
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_success "Node.js found: $NODE_VERSION"
    else
        print_error "Node.js is not installed. Please install Node.js >= 18.x"
        exit 1
    fi
}

# Check if npm is installed
check_npm() {
    print_status "Checking npm installation..."
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm --version)
        print_success "npm found: $NPM_VERSION"
    else
        print_error "npm is not installed. Please install npm"
        exit 1
    fi
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    if npm install; then
        print_success "Dependencies installed successfully"
    else
        print_error "Failed to install dependencies"
        exit 1
    fi
}

# Check environment file
check_env() {
    print_status "Checking environment configuration..."
    if [ ! -f ".env" ]; then
        if [ -f ".env.example" ]; then
            print_warning ".env file not found. Copying from .env.example"
            cp .env.example .env
            print_warning "Please edit .env file with your database credentials"
        else
            print_error ".env.example file not found"
            exit 1
        fi
    else
        print_success ".env file found"
    fi
}

# Setup database
setup_database() {
    print_status "Setting up database..."
    
    # Generate Prisma client
    if npm run prisma:generate; then
        print_success "Prisma client generated"
    else
        print_error "Failed to generate Prisma client"
        exit 1
    fi
    
    # Run migrations
    if npm run prisma:migrate; then
        print_success "Database migrations completed"
    else
        print_error "Failed to run database migrations"
        print_warning "Please check your DATABASE_URL in .env file"
        exit 1
    fi
}

# Setup test data
setup_test_data() {
    print_status "Setting up test data..."
    if npm run test:setup; then
        print_success "Test data setup completed"
    else
        print_warning "Test data setup failed (this is optional)"
    fi
}

# Test API
test_api() {
    print_status "Running API tests..."
    if npm run test:api; then
        print_success "API tests completed successfully"
    else
        print_warning "API tests failed (check server is running)"
    fi
}

# Main setup function
main() {
    echo ""
    print_status "Starting auto setup process..."
    echo ""
    
    # Step 1: Check prerequisites
    check_node
    check_npm
    echo ""
    
    # Step 2: Install dependencies
    install_dependencies
    echo ""
    
    # Step 3: Check environment
    check_env
    echo ""
    
    # Step 4: Setup database
    setup_database
    echo ""
    
    # Step 5: Setup test data
    setup_test_data
    echo ""
    
    # Step 6: Test API (optional)
    read -p "Do you want to run API tests? (y/n): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        test_api
    fi
    
    echo ""
    print_success "Setup completed successfully! 🎉"
    echo ""
    echo "📋 Next steps:"
    echo "1. Start the server: npm run dev"
    echo "2. Open Prisma Studio: npm run prisma:studio"
    echo "3. Test API: npm run test:api"
    echo ""
    echo "🔗 Useful URLs:"
    echo "- Server: http://localhost:3001"
    echo "- Health Check: http://localhost:3001/health"
    echo "- Prisma Studio: http://localhost:5555"
    echo ""
    echo "📚 Documentation:"
    echo "- HOW-TO-RUN-TEST.md - Detailed guide"
    echo "- API-TEST-GUIDE.md - Testing guide"
    echo "- TEST-RESULTS-SUMMARY.md - Test results"
    echo ""
}

# Run main function
main "$@"
