#!/bin/bash

# Weather App Crash Fix and Recovery Script
echo "🔧 Starting Weather App Crash Fix and Recovery..."

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -ti :$port > /dev/null 2>&1; then
        echo "Port $port is in use"
        return 0
    else
        echo "Port $port is free"
        return 1
    fi
}

# Function to kill processes on port
kill_port() {
    local port=$1
    echo "🛑 Killing processes on port $port..."
    lsof -ti :$port | xargs kill -9 2>/dev/null || true
    sleep 2
}

# Function to check if service is responsive
check_service() {
    local url=$1
    local service_name=$2
    
    echo "🏥 Checking $service_name health..."
    if curl -s --max-time 5 "$url" > /dev/null 2>&1; then
        echo "✅ $service_name is responsive"
        return 0
    else
        echo "❌ $service_name is not responsive"
        return 1
    fi
}

# Clean up any crashed or hanging processes
echo "🧹 Cleaning up crashed processes..."

# Kill any hanging Node.js processes related to the weather app
pkill -f "weather.*app" 2>/dev/null || true
pkill -f "folio.*weather" 2>/dev/null || true

# Clean up specific ports
kill_port 8000  # Backend
kill_port 3000  # Frontend
kill_port 3001  # Alt frontend
kill_port 3002  # Alt frontend

echo "⏳ Waiting for ports to be released..."
sleep 3

# Check Node.js and npm health
echo "🔍 Checking Node.js environment..."
node --version || { echo "❌ Node.js not found"; exit 1; }
npm --version || { echo "❌ npm not found"; exit 1; }

# Navigate to project directory
cd "$(dirname "$0")"
PROJECT_DIR="$(pwd)"
echo "📁 Project directory: $PROJECT_DIR"

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found in current directory"
    exit 1
fi

# Install/update dependencies with error handling
echo "📦 Checking and updating dependencies..."
npm ci --silent || {
    echo "⚠️ npm ci failed, trying npm install..."
    npm install --silent || {
        echo "❌ Failed to install dependencies"
        exit 1
    }
}

# Check backend dependencies
if [ -d "backend" ]; then
    echo "📦 Checking backend dependencies..."
    cd backend
    npm ci --silent || npm install --silent || {
        echo "❌ Failed to install backend dependencies"
        exit 1
    }
    cd ..
fi

# Check frontend dependencies
if [ -d "frontend" ]; then
    echo "📦 Checking frontend dependencies..."
    cd frontend
    npm ci --silent || npm install --silent || {
        echo "❌ Failed to install frontend dependencies"
        exit 1
    }
    cd ..
fi

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "🔑 Creating .env file..."
    cat > .env << EOF
# OpenWeather API Configuration
OPENWEATHER_API_KEY=b12265d01881b865932694e3950ffd1f
OPENWEATHER_BASE_URL=https://api.openweathermap.org/data/2.5

# Server Configuration
PORT=8000
NODE_ENV=development

# Frontend Configuration
FRONTEND_URL=http://localhost:3000

# Database Configuration (optional)
MONGODB_URI=mongodb://localhost:27017/weather-app
EOF
    echo "✅ Default .env file created"
fi

# Start backend server
echo "🚀 Starting backend server..."
cd backend
nohup npm start > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
cd ..

echo "⏳ Waiting for backend to start..."
sleep 5

# Check if backend is running
if ! check_service "http://localhost:8000/api/health" "Backend"; then
    echo "❌ Backend failed to start. Check logs/backend.log for details."
    tail -20 logs/backend.log 2>/dev/null || echo "No backend log found"
    exit 1
fi

# Start frontend server
echo "🎨 Starting frontend server..."
cd frontend
nohup npm run dev > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

echo "⏳ Waiting for frontend to start..."
sleep 8

# Check if frontend is running
if check_port 3000; then
    echo "✅ Frontend server is running on port 3000"
else
    echo "⚠️ Frontend may not be fully started yet, check logs/frontend.log if issues persist"
fi

# Create logs directory if it doesn't exist
mkdir -p logs

echo "📊 Service Status Summary:"
echo "========================="

# Check backend health
if check_service "http://localhost:8000/api/health" "Backend API"; then
    echo "✅ Backend: http://localhost:8000"
else
    echo "❌ Backend: FAILED"
fi

# Check frontend
if check_port 3000; then
    echo "✅ Frontend: http://localhost:3000"
else
    echo "❌ Frontend: FAILED"
fi

# Test weather API
echo "🌤️ Testing Weather API..."
if check_service "http://localhost:8000/api/weather/current/city/London?units=metric" "Weather API"; then
    echo "✅ Weather API is functional"
else
    echo "⚠️ Weather API test failed - check API key and connectivity"
fi

echo ""
echo "🎉 Crash fix and recovery complete!"
echo ""
echo "📋 Useful Commands:"
echo "- View backend logs: tail -f logs/backend.log"
echo "- View frontend logs: tail -f logs/frontend.log"
echo "- Stop all services: pkill -f 'node.*weather' && pkill -f 'vite'"
echo "- Check running processes: lsof -ti :8000 && lsof -ti :3000"
echo ""
echo "🌐 Access the app:"
echo "- Frontend: http://localhost:3000"
echo "- Backend API: http://localhost:8000/api"
echo "- API Health: http://localhost:8000/api/health"
