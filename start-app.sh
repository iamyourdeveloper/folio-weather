#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting Weather App Services${NC}"

# Kill any existing processes on our ports
echo -e "${YELLOW}🔄 Cleaning up existing processes...${NC}"
lsof -ti:8001 | xargs kill -9 2>/dev/null || true
lsof -ti:3003 | xargs kill -9 2>/dev/null || true

# Function to start backend
start_backend() {
    echo -e "${GREEN}🔧 Starting Backend Server...${NC}"
    cd backend
    PORT=8001 node server.js &
    BACKEND_PID=$!
    echo "Backend PID: $BACKEND_PID"
    cd ..
    
    # Wait a moment for backend to start
    sleep 3
    
    # Test if backend is running
    if curl -s "http://localhost:8001/api/health" > /dev/null; then
        echo -e "${GREEN}✅ Backend server is running on port 8001${NC}"
    else
        echo -e "${RED}❌ Backend server failed to start${NC}"
        return 1
    fi
}

# Function to start frontend
start_frontend() {
    echo -e "${GREEN}🌐 Starting Frontend Server...${NC}"
    cd frontend
    npm run dev &
    FRONTEND_PID=$!
    echo "Frontend PID: $FRONTEND_PID"
    cd ..
    
    sleep 5
    echo -e "${GREEN}✅ Frontend server should be running on http://localhost:3003${NC}"
}

# Cleanup function
cleanup() {
    echo -e "\n${YELLOW}🛑 Shutting down servers...${NC}"
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
    fi
    lsof -ti:8001 | xargs kill -9 2>/dev/null || true
    lsof -ti:3003 | xargs kill -9 2>/dev/null || true
    echo -e "${GREEN}✅ Cleanup complete${NC}"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Start services
start_backend
if [ $? -eq 0 ]; then
    start_frontend
    
    echo -e "\n${GREEN}🎉 Both services are running!${NC}"
    echo -e "${GREEN}🔗 Frontend: http://localhost:3003${NC}"
    echo -e "${GREEN}🔗 Backend: http://localhost:8001${NC}"
    echo -e "\n${YELLOW}Press Ctrl+C to stop both servers${NC}"
    
    # Keep script running
    wait
else
    echo -e "${RED}❌ Failed to start backend server${NC}"
    exit 1
fi
