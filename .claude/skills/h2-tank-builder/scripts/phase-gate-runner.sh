#!/bin/bash
# phase-gate-runner.sh
# Runs validation checks for a specific build phase

set -e

PHASE="${1:-1}"
MOCK_SERVER_URL="${MOCK_SERVER_URL:-http://localhost:3001}"
FRONTEND_URL="${FRONTEND_URL:-http://localhost:3000}"

echo "╔════════════════════════════════════════════════════════════╗"
echo "║           PHASE $PHASE GATE VALIDATION                           ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

PASS_COUNT=0
FAIL_COUNT=0

check() {
  local name="$1"
  local result="$2"
  local expected="$3"
  
  if [ "$result" = "$expected" ]; then
    echo "✅ PASS: $name"
    ((PASS_COUNT++))
  else
    echo "❌ FAIL: $name (got: $result, expected: $expected)"
    ((FAIL_COUNT++))
  fi
}

check_http() {
  local name="$1"
  local url="$2"
  local jq_filter="$3"
  local expected="$4"
  
  local result=$(curl -sf "$url" 2>/dev/null | jq -r "$jq_filter" 2>/dev/null || echo "ERROR")
  check "$name" "$result" "$expected"
}

check_http_exists() {
  local name="$1"
  local url="$2"
  
  if curl -sf "$url" > /dev/null 2>&1; then
    echo "✅ PASS: $name"
    ((PASS_COUNT++))
  else
    echo "❌ FAIL: $name (endpoint not responding)"
    ((FAIL_COUNT++))
  fi
}

# Phase 1: Mock Server Foundation
run_phase_1() {
  echo "─────────────────────────────────────────────────────────────"
  echo "Phase 1: Mock Server Foundation"
  echo "─────────────────────────────────────────────────────────────"
  echo ""
  
  echo "Checking mock server is running..."
  check_http_exists "Mock server responding" "$MOCK_SERVER_URL/api/standards"
  
  echo ""
  echo "Checking core endpoints..."
  
  # Standards
  check_http "Standards endpoint returns data" \
    "$MOCK_SERVER_URL/api/standards" \
    '.standards | length > 0' \
    'true'
  
  # Materials
  check_http "Materials endpoint returns fibers" \
    "$MOCK_SERVER_URL/api/materials" \
    '.fibers | length > 0' \
    'true'
  
  # Requirements parse
  local parse_result=$(curl -sf -X POST "$MOCK_SERVER_URL/api/requirements/parse" \
    -H "Content-Type: application/json" \
    -d '{"input_mode":"natural_language","raw_text":"700 bar 150L tank"}' 2>/dev/null \
    | jq -r '.confidence > 0.9' 2>/dev/null || echo "false")
  check "Requirements parse works" "$parse_result" "true"
  
  # Design C
  check_http "Design C exists" \
    "$MOCK_SERVER_URL/api/designs/C" \
    '.summary.weight_kg > 0' \
    'true'
  
  # Geometry
  check_http "Geometry endpoint works" \
    "$MOCK_SERVER_URL/api/designs/C/geometry" \
    '.inner_radius_mm' \
    '175'
  
  echo ""
}

# Phase 2: Mock Server Completion
run_phase_2() {
  echo "─────────────────────────────────────────────────────────────"
  echo "Phase 2: Mock Server Completion"
  echo "─────────────────────────────────────────────────────────────"
  echo ""
  
  # Run Phase 1 first
  run_phase_1
  
  echo "Checking analysis endpoints..."
  
  # Stress
  check_http "Stress endpoint returns data" \
    "$MOCK_SERVER_URL/api/designs/C/stress" \
    '.max_stress_mpa > 0' \
    'true'
  
  # Failure
  check_http "Failure endpoint returns mode" \
    "$MOCK_SERVER_URL/api/designs/C/failure" \
    '.predicted_mode' \
    'fiber_breakage'
  
  # Thermal
  check_http "Thermal endpoint returns data" \
    "$MOCK_SERVER_URL/api/designs/C/thermal" \
    '.fast_fill.peak_gas_temp_c > 0' \
    'true'
  
  # Reliability
  check_http "Reliability endpoint returns data" \
    "$MOCK_SERVER_URL/api/designs/C/reliability" \
    '.p_failure != null' \
    'true'
  
  # Cost
  check_http "Cost endpoint returns total" \
    "$MOCK_SERVER_URL/api/designs/C/cost" \
    '.total_eur > 0' \
    'true'
  
  # Compliance
  check_http "Compliance endpoint returns status" \
    "$MOCK_SERVER_URL/api/designs/C/compliance" \
    '.overall_status' \
    'pass'
  
  # Sentry
  check_http "Sentry endpoint returns points" \
    "$MOCK_SERVER_URL/api/designs/C/sentry" \
    '.critical_points | length > 0' \
    'true'
  
  echo ""
  echo "Checking SSE streaming..."
  
  # Test SSE (brief check)
  local sse_check=$(timeout 3 curl -sN "$MOCK_SERVER_URL/api/optimization/test/stream" 2>/dev/null | head -5 | grep -c "event: progress" || echo "0")
  if [ "$sse_check" -gt "0" ]; then
    echo "✅ PASS: SSE streaming works"
    ((PASS_COUNT++))
  else
    echo "❌ FAIL: SSE streaming not working"
    ((FAIL_COUNT++))
  fi
  
  echo ""
}

# Phase 3: Frontend Foundation
run_phase_3() {
  echo "─────────────────────────────────────────────────────────────"
  echo "Phase 3: Frontend Foundation"
  echo "─────────────────────────────────────────────────────────────"
  echo ""
  
  # Run Phase 2 first (depends on mock server)
  run_phase_2
  
  echo "Checking frontend is running..."
  check_http_exists "Frontend responding" "$FRONTEND_URL"
  
  echo ""
  echo "Note: Manual checks required for Phase 3:"
  echo "  - Navigate to http://localhost:3000"
  echo "  - Verify Screens 1-4 render"
  echo "  - Verify no console errors"
  echo "  - Verify navigation works"
  echo ""
}

# Phase 4: Frontend Analysis
run_phase_4() {
  echo "─────────────────────────────────────────────────────────────"
  echo "Phase 4: Frontend Analysis"
  echo "─────────────────────────────────────────────────────────────"
  echo ""
  
  # Run Phase 3 first
  run_phase_3
  
  echo "Note: Manual checks required for Phase 4:"
  echo "  - Navigate to http://localhost:3000/analysis/C"
  echo "  - Verify all 6 tabs render"
  echo "  - Verify 3D model displays"
  echo "  - Verify charts render"
  echo ""
}

# Phase 5: Frontend Completion
run_phase_5() {
  echo "─────────────────────────────────────────────────────────────"
  echo "Phase 5: Frontend Completion (Full)"
  echo "─────────────────────────────────────────────────────────────"
  echo ""
  
  # Run Phase 4 first
  run_phase_4
  
  echo "Note: Manual checks required for Phase 5:"
  echo "  - Complete full demo flow"
  echo "  - Verify Screens 6-8 work"
  echo "  - Verify export downloads"
  echo "  - Time demo (<60 seconds target)"
  echo ""
}

# Run the appropriate phase
case $PHASE in
  1) run_phase_1 ;;
  2) run_phase_2 ;;
  3) run_phase_3 ;;
  4) run_phase_4 ;;
  5) run_phase_5 ;;
  *) echo "Unknown phase: $PHASE. Use 1-5."; exit 1 ;;
esac

# Summary
echo "═════════════════════════════════════════════════════════════"
echo "GATE SUMMARY"
echo "═════════════════════════════════════════════════════════════"
echo "Passed: $PASS_COUNT"
echo "Failed: $FAIL_COUNT"
echo ""

if [ "$FAIL_COUNT" -eq 0 ]; then
  echo "✅ PHASE $PHASE GATE: PASSED"
  echo "   Ready to proceed to Phase $((PHASE + 1))"
  exit 0
else
  echo "❌ PHASE $PHASE GATE: FAILED"
  echo "   Fix $FAIL_COUNT failing checks before proceeding"
  exit 1
fi
