#!/bin/bash

# Aggressive Port Cleanup Script for WSL2
# Handles stale processes that prevent app startup
# Usage: ./scripts/aggressive-port-cleanup.sh

set -e

echo "🔍 Aggressive Port Cleanup Starting..."
echo ""

kill_and_verify_port() {
    local port=$1
    local port_name=$2

    echo "🔎 Cleaning port $port ($port_name)..."

    # Step 1: Try lsof (fastest if available)
    local pids=""
    if command -v lsof &> /dev/null; then
        pids=$(timeout 2 lsof -ti:$port 2>/dev/null || true)
    fi

    # Step 2: Fallback to netstat if lsof didn't work
    if [ -z "$pids" ] && command -v netstat &> /dev/null; then
        pids=$(netstat -tulpn 2>/dev/null | grep ":$port " | awk '{print $7}' | cut -d'/' -f1 | sort -u || true)
    fi

    # Step 3: Fallback to ss (modern alternative)
    if [ -z "$pids" ] && command -v ss &> /dev/null; then
        pids=$(ss -tulpn 2>/dev/null | grep ":$port " | awk '{print $(NF)}' | cut -d'=' -f2 | sort -u || true)
    fi

    # Kill found processes
    if [ -n "$pids" ]; then
        echo "  📍 Found processes: $pids"
        for pid in $pids; do
            if [ -n "$pid" ] && [ "$pid" != "-" ]; then
                echo "    Killing PID $pid..."
                kill -9 "$pid" 2>/dev/null || true
            fi
        done
        sleep 1
    else
        echo "  ✅ No processes found initially"
    fi

    # Step 4: Use fuser as final attempt if process still exists
    if timeout 2 lsof -i:$port >/dev/null 2>&1; then
        echo "    ⚠️  Port still in use, using fuser..."
        if command -v fuser &> /dev/null; then
            fuser -k $port/tcp 2>/dev/null || true
            sleep 1
        fi
    fi

    # Step 5: Verify port is actually free
    local max_attempts=3
    local attempt=0
    while [ $attempt -lt $max_attempts ]; do
        if ! timeout 2 lsof -i:$port >/dev/null 2>&1; then
            echo "  ✅ Port $port is now clean"
            return 0
        fi

        attempt=$((attempt + 1))
        if [ $attempt -lt $max_attempts ]; then
            echo "    Waiting for port $port to free up... (attempt $attempt/$max_attempts)"
            sleep 1
        fi
    done

    echo "  ⚠️  Port $port may still have processes - continuing anyway"
    return 0
}

# Clean the main development ports
kill_and_verify_port 5173 "Frontend (Vite)"
kill_and_verify_port 8080 "Backend (Node)"

# Also clean +1 variants (Vite auto-increments when port is in use)
kill_and_verify_port 5174 "Frontend +1"
kill_and_verify_port 8081 "Backend +1"

echo ""
echo "✅ Port cleanup complete!"
echo ""

# Optional: Show current port usage
if command -v lsof &> /dev/null; then
    echo "🔍 Current processes on ports 5173-5175, 8080-8082:"
    lsof -i :5173-5175 -i :8080-8082 2>/dev/null || echo "  (None)"
fi

echo ""
