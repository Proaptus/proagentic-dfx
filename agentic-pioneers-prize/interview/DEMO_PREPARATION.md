# Interview Demo Preparation

## Interview Format

| Aspect | Requirement |
|--------|-------------|
| **Location** | Central London (venue TBC) |
| **Dates** | 16-18 March 2026 |
| **Presentation** | 30 minutes (including LIVE DEMO) |
| **Q&A** | 20 minutes |
| **Max Attendees** | 3 people |

---

## Critical Constraints

### What You CANNOT Do
- Include videos or embedded web links
- Change presentation after submission
- Bring additional materials on day
- Rely on external services (may be blocked/unreliable)

### What You MUST Do
- Include LIVE DEMONSTRATION within 30 minutes
- Bring everything needed (laptop, pre-loaded data, test cases)
- Use realistic scenario reflecting challenge statement
- Show how agents, models and data interact
- Make clear what is running live vs pre-configured
- Illustrate how typical user would interact

---

## Primary Demo Scenario

### Sensor Mounting Bracket for Offshore Wind Turbine

**Input (Natural Language)**:
> Design a sensor mounting bracket for offshore wind turbine nacelle. Sensor mass: 35kg. Vibration environment: 0-50Hz, 1g RMS. Salt spray environment (C5-M corrosivity). Must bolt to existing M12 hole pattern (4x, 150mm PCD). Avoid resonance in operating range. Design life: 25 years. Minimise weight without exceeding £200 unit cost at qty 100.

**Demo Flow** (Target: 3 minutes):
| Step | Action | Output Shown | Time |
|------|--------|--------------|------|
| 1 | Enter requirements | NL input field | 15 sec |
| 2 | Parse requirements | Structured JSON displayed | 15 sec |
| 3 | Standards identified | EN 1993, ISO 12944, DNV cited | 15 sec |
| 4 | Generate concepts | 3 options appear | 30 sec |
| 5 | Show CAD | 3D models in viewer | 30 sec |
| 6 | Run FEA | Stress contours displayed | 45 sec |
| 7 | Compare options | Trade-off table shown | 15 sec |
| 8 | Select recommended | Welded plate chosen | 15 sec |

**Expected Output**:
| Design | Weight | Cost | 1st Mode | Max Stress | Margin | Result |
|--------|--------|------|----------|------------|--------|--------|
| Welded plate | 2.8 kg | £145 | 68 Hz | 89 MPa | 2.1 | RECOMMENDED |
| Machined billet | 3.4 kg | £210 | 72 Hz | 76 MPa | 2.5 | Exceeds cost |
| Sheet metal | 2.1 kg | £95 | 52 Hz | 112 MPa | 1.7 | Fails frequency |

---

## Backup Scenarios

### Simple L-Bracket (Low Complexity)
- Purpose: Quick demo if time constrained
- Runtime: ~1.5 minutes
- Shows: Basic end-to-end flow

### Equipment Mounting Frame (High Complexity)
- Purpose: Show capability for complex parts
- Runtime: ~4 minutes
- Shows: Multi-component, multiple constraints

---

## Technical Checklist

### Hardware
- [ ] Primary laptop with full environment
- [ ] Backup laptop/device with same setup
- [ ] Power adapters and cables
- [ ] USB backup of everything
- [ ] Mobile hotspot (emergency only)

### Software
- [ ] Application works fully offline
- [ ] All dependencies bundled
- [ ] Test data pre-loaded
- [ ] Demo scenarios cached
- [ ] No external API calls required

### Data
- [ ] Material database pre-loaded
- [ ] Test cases validated
- [ ] Sample outputs ready
- [ ] Fallback results cached

---

## Presentation Structure (30 minutes)

| Section | Duration | Content |
|---------|----------|---------|
| Introduction | 2 min | Team, challenge, solution overview |
| Technical Architecture | 5 min | Agent pipeline, how it works |
| **LIVE DEMO** | 10 min | Primary scenario + backup if time |
| MVP & Readiness | 5 min | What's working, deployment model |
| Commercial & Future | 5 min | Market, UK benefits, roadmap |
| Summary | 3 min | Key differentiators, ask |

---

## Panel Focus Areas (Be Ready For)

From assessor guidance, panel will focus on:
1. How clearly demo connects to problem and users described
2. Evidence of performance, reliability and workflow fit
3. How risks are managed and outputs explained to users
4. Supports claims made in written application

---

## Attendee Preparation

### Suggested Roles (3 people max)
| Person | Role | Responsibilities |
|--------|------|------------------|
| 1 | Presenter/Demo Lead | Runs demo, presents slides |
| 2 | Technical Expert | Answers deep technical questions |
| 3 | Commercial/Domain | Answers market, user, domain questions |

### Practice Schedule
- [ ] Week -3: Demo dry run (internal)
- [ ] Week -2: Full rehearsal with timing
- [ ] Week -1: Dress rehearsal with Q&A practice
- [ ] Day -1: Final equipment check

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Demo crashes | Pre-cached results, restart script |
| Slow performance | Optimised demo mode, smaller models |
| Network needed | 100% offline capability |
| Laptop fails | Backup laptop ready |
| Time overrun | Practiced timing, cut points identified |
| Tough questions | FAQ prepared, practice sessions |

---

## Pre-Interview Submissions

Required before interview (deadline in invitation email):
- [ ] List of attendees
- [ ] Presentation slides

Optional:
- [ ] Written response to assessors' feedback

---

## Reasonable Adjustments

Contact: support@iuk.ukri.org
Deadline: Within 3 days of receiving invitation
