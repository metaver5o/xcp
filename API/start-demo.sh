#!/bin/bash

echo "🚀 Starting Counterparty Asset Management Demo"
echo "=============================================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Start all services
echo "📡 Starting all services (API + Frontend)..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check if API is responding
if curl -s http://localhost:4000/health > /dev/null; then
    echo "✅ API is running on http://localhost:4000"
else
    echo "❌ API failed to start. Check Docker logs."
    exit 1
fi

# Check if Frontend is responding
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Frontend is running on http://localhost:3000"
else
    echo "⏳ Frontend is still starting up..."
fi

echo ""
echo "🎉 Demo is starting up!"
echo "📡 API: http://localhost:4000"
echo "🎨 Frontend: http://localhost:3000"
echo ""
echo "To view logs: docker-compose logs -f"
echo "To stop: docker-compose down"
echo ""

# Show logs
echo "📋 Showing logs (Press Ctrl+C to stop):"
# docker-compose logs -f
