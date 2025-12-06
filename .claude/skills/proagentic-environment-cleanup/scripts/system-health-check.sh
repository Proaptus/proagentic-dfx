#!/bin/bash

# ProAgentic System Health Check Script
# Shows comprehensive system diagnostics and health status
# Usage: ./scripts/system-health-check.sh

set -e

echo "📊 ProAgentic System Health Check"
echo "===================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print status
print_status() {
    local name=$1
    local status=$2
    local value=$3

    if [ "$status" = "GREEN" ]; then
        printf "  ${GREEN}✅${NC} %-30s %s\n" "$name" "$value"
    elif [ "$status" = "YELLOW" ]; then
        printf "  ${YELLOW}⚠️${NC} %-30s %s\n" "$name" "$value"
    else
        printf "  ${RED}❌${NC} %-30s %s\n" "$name" "$value"
    fi
}

# Disk Usage Check
echo "💾 Disk Usage:"
disk_output=$(df -h | grep "/$")
disk_percent=$(echo "$disk_output" | awk '{print $5}' | sed 's/%//')
disk_used=$(echo "$disk_output" | awk '{print $3}')
disk_total=$(echo "$disk_output" | awk '{print $2}')

if [ "$disk_percent" -lt 50 ]; then
    print_status "Disk Usage" "GREEN" "$disk_used / $disk_total ($disk_percent%) - HEALTHY"
elif [ "$disk_percent" -lt 70 ]; then
    print_status "Disk Usage" "YELLOW" "$disk_used / $disk_total ($disk_percent%) - CAUTION"
else
    print_status "Disk Usage" "RED" "$disk_used / $disk_total ($disk_percent%) - URGENT"
fi

echo ""

# Memory Check
echo "🧠 Memory:"
mem_output=$(free -h | grep "^Mem:")
total_mem=$(echo "$mem_output" | awk '{print $2}')
used_mem=$(echo "$mem_output" | awk '{print $3}')
mem_percent=$(echo "scale=0; $(echo "$mem_output" | awk '{print $3}' | sed 's/Gi//' | sed 's/G//') / $(echo "$mem_output" | awk '{print $2}' | sed 's/Gi//' | sed 's/G//') * 100" | bc 2>/dev/null || echo "50")

if [ "$mem_percent" -lt 60 ]; then
    print_status "Memory Usage" "GREEN" "$used_mem / $total_mem (${mem_percent}%) - HEALTHY"
elif [ "$mem_percent" -lt 75 ]; then
    print_status "Memory Usage" "YELLOW" "$used_mem / $total_mem (${mem_percent}%) - CAUTION"
else
    print_status "Memory Usage" "RED" "$used_mem / $total_mem (${mem_percent}%) - CRITICAL"
fi

echo ""

# Port Checks
echo "🔌 Port Status:"
if timeout 2 lsof -i :5173 >/dev/null 2>&1; then
    print_status "Port 5173 (Vite)" "RED" "IN USE"
else
    print_status "Port 5173 (Vite)" "GREEN" "FREE"
fi

if timeout 2 lsof -i :8080 >/dev/null 2>&1; then
    print_status "Port 8080 (Backend)" "RED" "IN USE"
else
    print_status "Port 8080 (Backend)" "GREEN" "FREE"
fi

echo ""

# Docker Status
echo "🐳 Docker Status:"
if command -v docker &> /dev/null && docker ps &>/dev/null; then
    docker_status="RUNNING"
    status_color="GREEN"
    docker_version=$(docker --version | sed 's/Docker version //')
    docker_ram=$(ps aux | grep dockerd | grep -v grep | awk '{print $6}' | head -1)
    print_status "Docker Daemon" "$status_color" "$docker_status (${docker_ram}MB)"

    # Count images
    image_count=$(docker images -q | wc -l)
    image_size=$(docker system df --format="{{.Images}}" images 2>/dev/null | awk '{print $3}' | sed 's/B//' || echo "Unknown")
    print_status "Docker Images" "GREEN" "$image_count images"
else
    print_status "Docker Daemon" "RED" "NOT RUNNING"
fi

echo ""

# WSL Configuration
echo "⚙️  WSL Configuration:"
if [ -f "/mnt/c/Users/$(whoami)/.wslconfig" ]; then
    cpu_count=$(grep "processors=" "/mnt/c/Users/$(whoami)/.wslconfig" 2>/dev/null | cut -d'=' -f2 || echo "Unknown")
    mem_alloc=$(grep "memory=" "/mnt/c/Users/$(whoami)/.wslconfig" 2>/dev/null | cut -d'=' -f2 || echo "Unknown")
    print_status "CPU Allocation" "GREEN" "$cpu_count cores (of available)"
    print_status "Memory Allocation" "GREEN" "$mem_alloc (allocated to WSL)"
else
    echo "  ℹ️  WSL config file not found"
fi

echo ""

# Top Processes by Memory
echo "🔍 Top 5 Memory Consumers:"
ps aux --sort=-%mem 2>/dev/null | head -6 | tail -5 | awk '{printf "  %5.1f%% - %s\n", $4, $11}' | head -5

echo ""

# Overall Status
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ "$disk_percent" -lt 70 ] && [ "$mem_percent" -lt 75 ]; then
    printf "${GREEN}✅ READY FOR DEVELOPMENT${NC}\n"
    echo ""
    echo "Recommendations:"
    echo "  • Run ./start.sh to begin development"
    echo "  • Monitor with: ./scripts/monitor-memory.sh"
    [ "$disk_percent" -gt 50 ] && echo "  • Disk approaching 70%, plan cleanup"
elif [ "$disk_percent" -lt 80 ] && [ "$mem_percent" -lt 85 ]; then
    printf "${YELLOW}⚠️  CAUTION - MONITOR CLOSELY${NC}\n"
    echo ""
    echo "Recommendations:"
    [ "$disk_percent" -gt 70 ] && echo "  • Run: ./scripts/docker-cleanup.sh"
    [ "$mem_percent" -gt 75 ] && echo "  • Monitor: ./scripts/monitor-memory.sh"
else
    printf "${RED}❌ SYSTEM REQUIRES CLEANUP${NC}\n"
    echo ""
    echo "Required Actions:"
    [ "$disk_percent" -gt 70 ] && echo "  1. Run: ./scripts/docker-cleanup.sh"
    [ "$mem_percent" -gt 75 ] && echo "  1. Monitor: ./scripts/monitor-memory.sh"
    echo "  2. Restart development after cleanup"
fi

echo ""
