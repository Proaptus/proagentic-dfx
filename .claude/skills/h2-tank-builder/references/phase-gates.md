# Phase Gate Validation Reference

## Overview

Phase gates are mandatory validation checkpoints. **Never proceed to the next phase without passing all gate checks.**

## Phase 1: Mock Server Foundation

### Gate Criteria

| Check | Command | Expected Result |
|-------|---------|-----------------|
| Server starts | `npm run dev` | Runs on port 3001 |
| Standards endpoint | `curl localhost:3001/api/standards` | Returns 3+ standards |
| Materials endpoint | `curl localhost:3001/api/materials` | Returns fibers, matrices, liners |
| Parse endpoint | `POST /api/requirements/parse` | Returns parsed + derived |
| Design C exists | `GET /api/designs/C` | Returns full design object |
| Geometry endpoint | `GET /api/designs/C/geometry` | Returns dimensions + layup |
| CORS headers | Check response headers | Allow-Origin: localhost:3000 |

### Automated Gate Script

```bash
#!/bin/bash
# phase1-gate.sh

echo "=== Phase 1 Gate Check ==="

# Check server is running
if ! curl -s http://localhost:3001/api/standards > /dev/null; then
  echo "❌ FAIL: Server not responding"
  exit 1
fi

# Check standards
STANDARDS_COUNT=$(curl -s http://localhost:3001/api/standards | jq '.standards | length')
if [ "$STANDARDS_COUNT" -lt 3 ]; then
  echo "❌ FAIL: Standards count $STANDARDS_COUNT < 3"
  exit 1
fi
echo "✅ Standards: $STANDARDS_COUNT"

# Check materials
FIBERS_COUNT=$(curl -s http://localhost:3001/api/materials | jq '.fibers | length')
if [ "$FIBERS_COUNT" -lt 2 ]; then
  echo "❌ FAIL: Fibers count $FIBERS_COUNT < 2"
  exit 1
fi
echo "✅ Materials: $FIBERS_COUNT fibers"

# Check parse
CONFIDENCE=$(curl -s -X POST http://localhost:3001/api/requirements/parse \
  -H "Content-Type: application/json" \
  -d '{"input_mode":"natural_language","raw_text":"700 bar 150L"}' | jq '.confidence')
if [ "$(echo "$CONFIDENCE < 0.9" | bc)" -eq 1 ]; then
  echo "❌ FAIL: Parse confidence $CONFIDENCE < 0.9"
  exit 1
fi
echo "✅ Parse: confidence $CONFIDENCE"

# Check design C
WEIGHT=$(curl -s http://localhost:3001/api/designs/C | jq '.summary.weight_kg')
if [ "$(echo "$WEIGHT < 70" | bc)" -eq 1 ]; then
  echo "❌ FAIL: Design C weight $WEIGHT unexpected"
  exit 1
fi
echo "✅ Design C: weight $WEIGHT kg"

# Check geometry
RADIUS=$(curl -s http://localhost:3001/api/designs/C/geometry | jq '.inner_radius_mm')
if [ "$RADIUS" != "175" ]; then
  echo "❌ FAIL: Geometry radius $RADIUS != 175"
  exit 1
fi
echo "✅ Geometry: radius $RADIUS mm"

echo ""
echo "=== PHASE 1 GATE: PASSED ==="
```

### RTM Coverage Required

- REQ-001 to REQ-006: Input parsing
- REQ-007 to REQ-015: Tank type and materials
- REQ-016 to REQ-036: Geometry data
- REQ-143 to REQ-149: Mock server architecture

---

## Phase 2: Mock Server Completion

### Gate Criteria

| Check | Command | Expected Result |
|-------|---------|-----------------|
| SSE streaming | `curl -N localhost:3001/api/optimization/test/stream` | Events stream |
| Stress endpoint | `GET /api/designs/C/stress` | Stress field data |
| Failure endpoint | `GET /api/designs/C/failure` | Failure analysis |
| Thermal endpoint | `GET /api/designs/C/thermal` | Thermal data |
| Reliability endpoint | `GET /api/designs/C/reliability` | Monte Carlo results |
| Cost endpoint | `GET /api/designs/C/cost` | Cost breakdown |
| Compliance endpoint | `GET /api/designs/C/compliance` | Pass status |
| Sentry endpoint | `GET /api/designs/C/sentry` | Critical points |
| Compare endpoint | `POST /api/compare` | Comparison data |
| Export endpoint | `POST /api/export` | Export job ID |

### Automated Gate Script

```bash
#!/bin/bash
# phase2-gate.sh

echo "=== Phase 2 Gate Check ==="

# Check SSE streaming
echo "Testing SSE stream (5 seconds)..."
timeout 5 curl -sN http://localhost:3001/api/optimization/test/stream > /tmp/sse.txt
if ! grep -q "event: progress" /tmp/sse.txt; then
  echo "❌ FAIL: SSE not streaming progress events"
  exit 1
fi
echo "✅ SSE: streaming"

# Check analysis endpoints
ENDPOINTS=(
  "/api/designs/C/stress:max_stress_mpa"
  "/api/designs/C/failure:predicted_mode"
  "/api/designs/C/thermal:fast_fill.peak_gas_temp_c"
  "/api/designs/C/reliability:p_failure"
  "/api/designs/C/cost:total_eur"
  "/api/designs/C/compliance:overall_status"
  "/api/designs/C/sentry:critical_points"
)

for ENDPOINT_CHECK in "${ENDPOINTS[@]}"; do
  ENDPOINT=$(echo $ENDPOINT_CHECK | cut -d: -f1)
  FIELD=$(echo $ENDPOINT_CHECK | cut -d: -f2)
  
  VALUE=$(curl -s "http://localhost:3001$ENDPOINT" | jq ".$FIELD")
  if [ "$VALUE" = "null" ]; then
    echo "❌ FAIL: $ENDPOINT.$FIELD is null"
    exit 1
  fi
  echo "✅ $ENDPOINT: $FIELD = $VALUE"
done

# Check compare
COMPARE_RESULT=$(curl -s -X POST http://localhost:3001/api/compare \
  -H "Content-Type: application/json" \
  -d '{"design_ids":["A","B","C"]}' | jq '.comparison | length')
if [ "$COMPARE_RESULT" -lt 3 ]; then
  echo "❌ FAIL: Compare not returning 3 designs"
  exit 1
fi
echo "✅ Compare: $COMPARE_RESULT designs"

echo ""
echo "=== PHASE 2 GATE: PASSED ==="
```

### RTM Coverage Required

- REQ-041 to REQ-057: FEA results
- REQ-076 to REQ-089: Reliability
- REQ-090 to REQ-102: Validation
- REQ-150 to REQ-162: Simulators and streaming
- REQ-167 to REQ-180: Data schemas

---

## Phase 3: Frontend Foundation

### Gate Criteria

| Check | Method | Expected Result |
|-------|--------|-----------------|
| Server starts | `npm run dev` | Runs on port 3000 |
| Home redirects | Navigate to / | Redirects to /requirements |
| Progress bar | Visual check | 8 steps visible |
| Screen 1 | Navigate | Input field, parse button |
| Screen 2 | Navigate | Materials displayed |
| Screen 3 | Navigate | Start button visible |
| Screen 4 | Navigate | Design cards display |
| No console errors | DevTools | No red errors |
| API calls succeed | Network tab | 200 responses |

### Manual Gate Checklist

```markdown
## Phase 3 Gate Checklist

### Server
- [ ] `npm run dev` starts without errors
- [ ] Accessible at http://localhost:3000

### Navigation
- [ ] Home (/) redirects to /requirements
- [ ] Progress bar shows 8 steps
- [ ] Can click between steps
- [ ] Current step highlighted

### Screen 1: Requirements
- [ ] Text input visible
- [ ] "Parse Requirements" button works
- [ ] Parsed results display
- [ ] "Continue" button navigates to Screen 2

### Screen 2: Configuration
- [ ] Tank type recommendation loads
- [ ] Materials list displays
- [ ] "Continue" button navigates to Screen 3

### Screen 3: Optimization
- [ ] "Start Optimization" button visible
- [ ] Progress bar appears when started
- [ ] SSE connection established (Network tab)
- [ ] Completion triggers navigation

### Screen 4: Results
- [ ] Pareto designs load
- [ ] Design cards render (A, B, C, D, E)
- [ ] Can click to select design
- [ ] "View Analysis" button works

### DevTools
- [ ] No JavaScript errors in Console
- [ ] All API calls return 200 (Network tab)
- [ ] No CORS errors
```

### RTM Coverage Required

- REQ-121 to REQ-123: Navigation
- REQ-142: Workflow step indicator
- REQ-163 to REQ-166: Frontend integration

---

## Phase 4: Frontend Analysis (Screen 5)

### Gate Criteria

| Check | Method | Expected Result |
|-------|--------|-----------------|
| URL works | /analysis/C | Page loads |
| 6 tabs visible | Visual | Geometry, Stress, etc. |
| Tab switching | Click each | Content changes |
| 3D model | Geometry tab | Tank renders |
| Section view | Toggle button | Model cuts |
| Stress contours | Stress tab | Colors on model |
| Load case switch | Dropdown | Data updates |
| Charts render | Multiple tabs | No errors |

### Manual Gate Checklist

```markdown
## Phase 4 Gate Checklist

### Tab 1: Geometry
- [ ] 3D tank model renders
- [ ] Can rotate with mouse
- [ ] Can zoom with scroll
- [ ] Section view toggle works
- [ ] Layer toggles visible
- [ ] Dome profile 2D curve displays
- [ ] Layup table displays (42 layers)
- [ ] Thickness distribution shows

### Tab 2: Stress
- [ ] Stress contours on 3D model
- [ ] Color legend visible
- [ ] Load case selector works (test/burst)
- [ ] Stress type selector works (vonMises/hoop/axial)
- [ ] Max stress panel shows location
- [ ] Per-layer stress table displays

### Tab 3: Failure
- [ ] Predicted mode displays (fiber_breakage)
- [ ] Is_preferred indicator (green checkmark)
- [ ] Progressive sequence timeline
- [ ] First ply failure info
- [ ] Tsai-Wu indices visible

### Tab 4: Thermal
- [ ] Fast-fill results display
- [ ] Peak temperatures shown
- [ ] Status indicator (pass)
- [ ] Extreme conditions table
- [ ] Temperature chart (if applicable)

### Tab 5: Reliability
- [ ] P(failure) displayed
- [ ] Interpretation text
- [ ] Burst distribution histogram
- [ ] Uncertainty sources table
- [ ] Sensitivity tornado chart

### Tab 6: Physics & Cost
- [ ] Cost pie chart renders
- [ ] Cost breakdown table
- [ ] Percentage column
- [ ] Total cost displayed
```

### RTM Coverage Required

- REQ-016 to REQ-036: Geometry visualization
- REQ-041 to REQ-057: Stress, failure, thermal
- REQ-076 to REQ-083: Reliability
- REQ-132 to REQ-139: Cost and physics

---

## Phase 5: Frontend Completion

### Gate Criteria

| Check | Method | Expected Result |
|-------|--------|-----------------|
| Screen 6 | /comparison | Multi-select works |
| Screen 7 | /validation/C | Confidence table |
| Screen 8 | /export/C | Download works |
| E2E demo | Full flow | <60 seconds |
| No errors | All screens | Console clean |
| Responsive | Tablet/mobile | Basic function |

### End-to-End Demo Script

```markdown
## Phase 5 Final Demo Checklist

### Pre-Demo
- [ ] Both servers running (3000, 3001)
- [ ] Browser DevTools closed
- [ ] Network tab cleared

### Demo Flow (Target: <60 seconds)

START TIMER

1. **Requirements (0:00-0:10)**
   - [ ] Enter: "700 bar, 150L hydrogen tank for heavy-duty truck"
   - [ ] Click "Parse Requirements"
   - [ ] Verify parsed + derived requirements display
   - [ ] Click "Continue"

2. **Configuration (0:10-0:15)**
   - [ ] Verify Type IV recommended
   - [ ] See T700S carbon fiber selected
   - [ ] Click "Continue"

3. **Optimization (0:15-0:45)**
   - [ ] Click "Start Optimization"
   - [ ] Watch progress bar fill
   - [ ] Wait for completion

4. **Results (0:45-0:50)**
   - [ ] See 50 Pareto designs
   - [ ] See Design C recommended
   - [ ] Click Design C

5. **Analysis (0:50-1:00)**
   - [ ] Switch through all 6 tabs
   - [ ] 3D model renders
   - [ ] Stress contours visible
   - [ ] Navigate to Comparison

6. **Comparison**
   - [ ] Select A, B, C
   - [ ] Click Compare
   - [ ] Radar chart displays

7. **Validation**
   - [ ] Navigate to /validation/C
   - [ ] See confidence scores
   - [ ] See test plan

8. **Export**
   - [ ] Navigate to /export/C
   - [ ] Select options
   - [ ] Click Generate
   - [ ] Download ZIP

STOP TIMER

### Post-Demo
- [ ] Total time recorded: _____ seconds
- [ ] No console errors during demo
- [ ] All screens rendered correctly
```

### RTM Coverage Required

- REQ-071 to REQ-075: Comparison
- REQ-090 to REQ-102: Validation
- REQ-103 to REQ-120: Export
- ALL requirements addressed or deferred

---

## Gate Failure Protocol

If a gate fails:

1. **Stop** - Do not proceed to next phase
2. **Identify** - Which specific check failed?
3. **Trace** - What RTM requirement is affected?
4. **Fix** - Implement the fix
5. **Retest** - Run gate checks again
6. **Document** - Note the fix in commit message

```bash
# Example: Gate 2 fails on stress endpoint
# 1. Stop - don't start Phase 3
# 2. Identify - /api/designs/C/stress returns null
# 3. Trace - REQ-041 (Stress contour plot)
# 4. Fix - Implement StressSimulator
# 5. Retest - Run phase2-gate.sh
# 6. Document - git commit -m "fix(mock): implement stress endpoint REQ-041"
```
