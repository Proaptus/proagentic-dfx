#!/bin/bash
# One-time sandbox setup for safe test execution
#
# Usage: ./sandbox-setup.sh

set -e

echo "Setting up TDD test sandbox..."
echo ""

# Check test framework installed
echo "1. Checking test framework..."
if command -v npm &> /dev/null; then
    if npm test -- --version &> /dev/null; then
        echo "   ✅ Test framework installed"
    else
        echo "   ⚠️  Test framework not configured"
        echo "   Install Vitest: npm install --save-dev vitest"
    fi
else
    echo "   ❌ npm not found"
    exit 1
fi

# Make scripts executable
echo ""
echo "2. Making TDD scripts executable..."
chmod +x .claude/skills/tdd/scripts/safety/*.sh
chmod +x .claude/skills/tdd/scripts/safety/*.py
chmod +x .claude/skills/tdd/scripts/quality/*.sh
chmod +x .claude/skills/tdd/scripts/helpers/*.sh
echo "   ✅ Scripts executable"

# Check Python for test quality validator
echo ""
echo "3. Checking Python (for test quality validator)..."
if command -v python3 &> /dev/null; then
    echo "   ✅ Python 3 installed"
else
    echo "   ⚠️  Python 3 not found (test quality validator requires Python)"
fi

# Verify git for change detection
echo ""
echo "4. Checking git..."
if command -v git &> /dev/null; then
    echo "   ✅ Git installed"
else
    echo "   ⚠️  Git not found (mutation testing requires git)"
fi

# Check for coverage tools
echo ""
echo "5. Checking coverage configuration..."
if grep -q "coverage" package.json 2>/dev/null; then
    echo "   ✅ Coverage configured"
else
    echo "   ⚠️  Coverage not configured"
    echo "   Add to package.json scripts: \"test:coverage\": \"vitest --coverage\""
fi

# Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ TDD Sandbox Setup Complete"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Next steps:"
echo "  1. Run tests: npm test"
echo "  2. Run single test: ./scripts/helpers/run-single-test.sh <test-file>"
echo "  3. Validate test quality: ./scripts/safety/validate-test-quality.py <test-file>"
echo "  4. Check coverage: ./scripts/quality/coverage-gate.sh"
echo ""
echo "TDD workflow ready! 🚀"
