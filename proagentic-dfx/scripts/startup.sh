#!/bin/bash

# ProAgentic-DFX Startup Script
# Ensures clean environment and proper initialization

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR"

echo "🧹 Cleaning up old processes and lock files..."
# Kill any existing Next.js processes
kill $(lsof -t -i :3000) 2>/dev/null || true
kill $(lsof -t -i :3001) 2>/dev/null || true
kill $(lsof -t -i :3002) 2>/dev/null || true

# Clean Next.js cache
rm -rf .next .turbo

echo "📦 Verifying dependencies..."
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install --legacy-peer-deps
fi

echo "🚀 Starting development server..."
npm run dev &
DEV_PID=$!

echo "⏳ Waiting for server to be ready (max 30 seconds)..."
for i in {1..30}; do
  if curl -s http://localhost:3000 >/dev/null 2>&1 || curl -s http://localhost:3002 >/dev/null 2>&1; then
    echo "✅ Server is ready!"
    PORT=$(curl -s http://localhost:3000 >/dev/null 2>&1 && echo "3000" || echo "3002")
    echo "📍 Application running on port $PORT"
    echo "PID: $DEV_PID"
    wait
    break
  fi

  if [ $i -eq 30 ]; then
    echo "❌ Server failed to start within 30 seconds"
    kill $DEV_PID 2>/dev/null || true
    exit 1
  fi

  echo "   Attempt $i/30..."
  sleep 1
done
