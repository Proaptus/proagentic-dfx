#!/bin/bash

# Memory Monitoring Script for ProAgentic Development
# Shows real-time memory usage and warns when thresholds are exceeded
# Usage: ./scripts/monitor-memory.sh

set -e

# Configuration
WARNING_THRESHOLD=75  # Warn at 75% memory usage
CRITICAL_THRESHOLD=85 # Critical at 85%
SAMPLE_INTERVAL=5    # Check every 5 seconds

echo "📊 ProAgentic Memory Monitor"
echo "=================================="
echo "Sampling every ${SAMPLE_INTERVAL} seconds"
echo "⚠️  Warning threshold: ${WARNING_THRESHOLD}%"
echo "🔴 Critical threshold: ${CRITICAL_THRESHOLD}%"
echo ""
echo "Press Ctrl+C to stop monitoring"
echo ""

get_memory_stats() {
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        free | grep "^Mem:"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        vm_stat | grep "Pages free" | awk '{print $3}' | tr -d '.'
    fi
}

get_memory_percentage() {
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        free | awk 'NR==2{printf("%.0f", $3/$2 * 100)}'
    fi
}

get_process_memory() {
    # Get memory usage of key processes
    ps aux --sort=-%mem | head -6 | tail -5 | awk '{printf "  %5.1f%% - %s\n", $4, $11}'
}

# Main monitoring loop
iteration=0
while true; do
    iteration=$((iteration + 1))
    clear

    # Get current stats
    timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    mem_line=$(get_memory_stats)
    mem_percent=$(get_memory_percentage)

    # Parse memory info
    read -r _ total used free <<< $(echo "$mem_line" | awk '{print $1, $2, $3, $4}')

    echo "📊 ProAgentic Memory Monitor - Iteration $iteration"
    echo "=================================="
    echo "Timestamp: $timestamp"
    echo ""
    echo "📈 Memory Usage:"
    echo "  Total:  $total"
    echo "  Used:   $used"
    echo "  Free:   $free"
    echo "  Usage:  ${mem_percent}%"
    echo ""

    # Visual bar
    printf "  ["
    filled=$((mem_percent / 5))
    for ((i=0; i<filled; i++)); do printf "█"; done
    for ((i=filled; i<20; i++)); do printf "░"; done
    printf "] %3d%%\n" "$mem_percent"
    echo ""

    # Status indicator
    if [ "$mem_percent" -ge "$CRITICAL_THRESHOLD" ]; then
        echo "🔴 CRITICAL: Memory usage at ${mem_percent}%!"
        echo "   Actions: Stop heavy processes, reduce concurrent tasks"
    elif [ "$mem_percent" -ge "$WARNING_THRESHOLD" ]; then
        echo "⚠️  WARNING: Memory usage at ${mem_percent}%"
        echo "   Consider: Stopping tests, closing extra windows"
    else
        echo "✅ NORMAL: Memory usage at ${mem_percent}%"
    fi

    echo ""
    echo "🔍 Top Memory Consumers (by %):"
    get_process_memory

    echo ""
    echo "💡 Tips:"
    echo "  - Watch memory growth over time"
    echo "  - If steadily rising, there may be a memory leak"
    echo "  - Stop concurrent processes to reduce memory use"
    echo "  - Press Ctrl+C to exit"
    echo ""

    sleep "$SAMPLE_INTERVAL"
done
