#!/bin/bash

# Docker Cleanup Script for ProAgentic
# Removes unused images, containers, and reclaims disk space
# Usage: ./scripts/docker-cleanup.sh

set -e

echo "🐳 Docker Cleanup Script"
echo "========================"
echo ""

# Check if Docker is running
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed"
    exit 1
fi

if ! docker ps &> /dev/null; then
    echo "❌ Docker daemon is not running"
    exit 1
fi

echo "✅ Docker is available"
echo ""

# Show current disk usage
echo "📊 Current Docker Disk Usage:"
docker system df
echo ""

# Step 1: Remove unused containers
echo "🗑️  Step 1: Removing unused containers..."
removed_containers=$(docker container prune -f --filter "until=24h" 2>/dev/null | tail -1 || echo "No containers removed")
echo "  $removed_containers"
echo ""

# Step 2: Remove unused images
echo "🗑️  Step 2: Removing unused images..."
removed_images=$(docker image prune -f --filter "until=72h" 2>/dev/null | tail -1 || echo "No images removed")
echo "  $removed_images"
echo ""

# Step 3: Remove dangling images (untagged)
echo "🗑️  Step 3: Removing dangling (untagged) images..."
dangling_count=$(docker images -q -f "dangling=true" | wc -l)
if [ "$dangling_count" -gt 0 ]; then
    docker images -q -f "dangling=true" | xargs -r docker rmi -f
    echo "  Removed $dangling_count dangling images"
else
    echo "  No dangling images found"
fi
echo ""

# Step 4: Remove old proagentic-server images (keep 2 most recent)
echo "🗑️  Step 4: Removing old proagentic-server versions..."
proagentic_count=$(docker images | grep proagentic-server | wc -l)
if [ "$proagentic_count" -gt 2 ]; then
    # Keep 2 most recent, remove the rest
    to_remove=$((proagentic_count - 2))
    docker images | grep proagentic-server | awk '{print $3}' | tail -n +3 | xargs -r docker rmi -f 2>/dev/null || true
    echo "  Removed old versions (kept 2 most recent)"
else
    echo "  Keeping all $proagentic_count versions"
fi
echo ""

# Step 5: Remove unused build cache
echo "🗑️  Step 5: Cleaning build cache..."
cache_removed=$(docker buildx prune -a --force -q 2>/dev/null || echo "0B")
echo "  Build cache cleaned"
echo ""

# Full system cleanup (aggressive)
echo "🗑️  Step 6: Running full system prune (aggressive)..."
prune_output=$(docker system prune -a --force -q 2>/dev/null | tail -1 || echo "Done")
echo "  $prune_output"
echo ""

# Step 7: Cleanup Docker volumes (optional - only unused)
echo "💾 Step 7: Cleaning unused volumes..."
volume_count=$(docker volume ls -q -f "dangling=true" | wc -l)
if [ "$volume_count" -gt 0 ]; then
    docker volume ls -q -f "dangling=true" | xargs -r docker volume rm
    echo "  Removed $volume_count unused volumes"
else
    echo "  No unused volumes found"
fi
echo ""

# Final stats
echo "📊 Final Docker Disk Usage:"
docker system df
echo ""

# Show space saved estimate
echo "✅ Docker cleanup complete!"
echo ""
echo "💡 Next steps:"
echo "  1. Rebuild any Docker images you need"
echo "  2. Run 'docker images' to see remaining images"
echo "  3. Monitor disk usage with 'df -h'"
echo ""
