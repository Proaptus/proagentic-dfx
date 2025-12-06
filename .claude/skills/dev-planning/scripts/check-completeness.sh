#!/bin/bash
# TDD Handover Spec Completeness Checker
#
# Performs quick sanity checks on handover spec files
# Usage: ./check-completeness.sh [path/to/TDD_HANDOVER_SPEC.json]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default paths
SPEC_JSON="${1:-TDD_HANDOVER_SPEC.json}"
SPEC_MD="${SPEC_JSON%.json}.md"

echo "======================================================================"
echo "TDD HANDOVER SPEC COMPLETENESS CHECK"
echo "======================================================================"
echo ""

# Check if files exist
echo "Checking files..."
if [ ! -f "$SPEC_JSON" ]; then
    echo -e "${RED}❌ JSON spec not found: $SPEC_JSON${NC}"
    exit 1
fi
echo -e "${GREEN}✅ JSON spec found: $SPEC_JSON${NC}"

if [ ! -f "$SPEC_MD" ]; then
    echo -e "${YELLOW}⚠️  Markdown briefing not found: $SPEC_MD${NC}"
else
    echo -e "${GREEN}✅ Markdown briefing found: $SPEC_MD${NC}"
fi
echo ""

# Check JSON is valid
echo "Validating JSON syntax..."
if python3 -m json.tool "$SPEC_JSON" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ JSON syntax valid${NC}"
else
    echo -e "${RED}❌ JSON syntax invalid${NC}"
    exit 1
fi
echo ""

# Check required top-level fields
echo "Checking required fields..."
REQUIRED_FIELDS=("meta" "goal" "context" "tdd_plan" "steps" "tooling" "done_definition")

for field in "${REQUIRED_FIELDS[@]}"; do
    if python3 -c "import json; data=json.load(open('$SPEC_JSON')); exit(0 if '$field' in data else 1)" 2>/dev/null; then
        echo -e "${GREEN}  ✅ $field${NC}"
    else
        echo -e "${RED}  ❌ $field (missing)${NC}"
        exit 1
    fi
done
echo ""

# Check steps array is not empty
echo "Checking implementation steps..."
STEP_COUNT=$(python3 -c "import json; print(len(json.load(open('$SPEC_JSON'))['steps']))" 2>/dev/null)
if [ "$STEP_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✅ Found $STEP_COUNT implementation steps${NC}"
else
    echo -e "${RED}❌ No implementation steps defined${NC}"
    exit 1
fi
echo ""

# Check acceptance criteria
echo "Checking acceptance criteria..."
AC_COUNT=$(python3 -c "import json; print(len(json.load(open('$SPEC_JSON')).get('tdd_plan', {}).get('acceptance_criteria', [])))" 2>/dev/null)
if [ "$AC_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✅ Found $AC_COUNT acceptance criteria${NC}"
else
    echo -e "${YELLOW}⚠️  No acceptance criteria defined${NC}"
fi
echo ""

# Check unit tests
echo "Checking test specifications..."
UNIT_TEST_COUNT=$(python3 -c "import json; print(len(json.load(open('$SPEC_JSON')).get('tdd_plan', {}).get('unit_tests', [])))" 2>/dev/null)
if [ "$UNIT_TEST_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✅ Found $UNIT_TEST_COUNT unit test specifications${NC}"
else
    echo -e "${YELLOW}⚠️  No unit tests defined${NC}"
fi
echo ""

# Check done_definition is not empty
echo "Checking completion criteria..."
DONE_COUNT=$(python3 -c "import json; print(len(json.load(open('$SPEC_JSON')).get('done_definition', [])))" 2>/dev/null)
if [ "$DONE_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✅ Found $DONE_COUNT done criteria${NC}"
else
    echo -e "${RED}❌ No done criteria defined${NC}"
    exit 1
fi
echo ""

# Check briefing length (if exists)
if [ -f "$SPEC_MD" ]; then
    echo "Checking briefing length..."
    CHAR_COUNT=$(wc -c < "$SPEC_MD")
    TOKEN_ESTIMATE=$((CHAR_COUNT / 4))  # Rough estimate: 1 token ≈ 4 chars
    MAX_TOKENS=2000

    if [ "$TOKEN_ESTIMATE" -le "$MAX_TOKENS" ]; then
        echo -e "${GREEN}✅ Briefing within budget: ~$TOKEN_ESTIMATE tokens (max $MAX_TOKENS)${NC}"
    else
        echo -e "${RED}❌ Briefing exceeds budget: ~$TOKEN_ESTIMATE tokens (max $MAX_TOKENS)${NC}"
        exit 1
    fi
    echo ""
fi

# Summary
echo "======================================================================"
echo -e "${GREEN}✅ COMPLETENESS CHECK PASSED${NC}"
echo "======================================================================"
echo ""
echo "Next steps:"
echo "  1. Run full validation: python3 scripts/validate-handover-spec.py $SPEC_JSON"
echo "  2. Review briefing: cat $SPEC_MD"
echo "  3. Hand off to TDD agent or implement manually"
echo ""

exit 0
