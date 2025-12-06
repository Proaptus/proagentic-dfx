# Per-Bug Fix Checklist

Use this checklist for each bug within a batch.

## Bug: [Test Name]

**File**: `[test-file-path]`
**Component**: `[implementation-file-path]`
**Priority**: CRITICAL / HIGH / MEDIUM / LOW

---

### Step 1: Read Test

- [ ] Read test file
- [ ] Identify failing assertion
- [ ] Understand expected behavior

**Failing Assertion**:
```javascript
expect([something]).to[assertion]
// Example: expect(result.projects).toHaveLength(2)
```

**Expected Behavior**: [Describe what should happen]

---

### Step 2: Read Implementation

- [ ] Read implementation file
- [ ] Locate relevant code section
- [ ] Identify why test is failing

**Current Code**:
```javascript
// Paste current implementation
```

**Issue**: [Why does this fail the test?]

---

### Step 3: Plan Fix

- [ ] Identify MINIMAL change needed
- [ ] Verify fix won't break other tests
- [ ] Plan exact edit

**Planned Fix**:
```javascript
// Paste planned fix
```

**Rationale**: [Why this fix works]

---

### Step 4: Apply Fix

- [ ] Make the edit
- [ ] Verify syntax
- [ ] NO test run yet (save for batch validation)

**Edit Applied**:
```javascript
// OLD:
[old code]

// NEW:
[new code]
```

---

### Step 5: Move to Next Bug

- [ ] Bug fix documented
- [ ] Ready for next bug in batch
- [ ] Still NO test runs

---

## After Batch Complete

This bug will be validated when full test suite runs for the batch.

**Expected Result**: Test should now pass ✅
