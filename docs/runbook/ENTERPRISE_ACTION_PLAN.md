---
doc_type: runbook
title: "Enterprise Readiness Action Plan"
version: 1.0.0
date: 2025-12-09
owner: "@h2-tank-team"
status: accepted
last_verified_at: 2025-12-09
---
# Enterprise Readiness Action Plan
## H2 Tank Designer - Priority Implementation Guide

---

## Immediate Actions (P0 - CRITICAL)

These must be fixed before any user demonstration or pilot:

### 1. Application Header (ENT-001, ENT-002)
**Files to modify**: `Layout.tsx`, `layout.tsx`
**Effort**: 2-4 hours

```typescript
// Add header component with:
// - Logo/branding (correct app name)
// - User menu (placeholder for now)
// - Help button (triggers HelpPanel)
// - Global search (can be non-functional initially)
```

### 2. Data Persistence (ENT-003, ENT-004)
**Files to modify**: `app-store.ts`, new `persistence.ts`
**Effort**: 4-8 hours

```typescript
// Implement:
// - localStorage persistence for app state
// - Auto-save on state change (debounced 2s)
// - Session recovery prompt on load
// - Clear storage option in settings
```

### 3. Help System Integration (ENT-006)
**Files to modify**: `Layout.tsx` or root layout
**Effort**: 1-2 hours

```typescript
// Mount in Layout.tsx:
import { HelpProvider } from '@/components/help/HelpProvider';
import { HelpPanel } from '@/components/help/HelpPanel';

// Wrap app in HelpProvider
// Add HelpPanel at root level
// Add Help button to header
```

### 4. Undo/Redo System (ENT-005)
**Files to create**: `lib/history.ts`, hook `useHistory.ts`
**Effort**: 8-16 hours

```typescript
// Command pattern implementation:
// - Record each state-changing action
// - Maintain undo/redo stacks
// - Keyboard shortcuts (Ctrl+Z, Ctrl+Y)
// - Integrate with app-store
```

### 5. Chat Scroll Fix (ENT-017)
**Files to modify**: `RequirementsScreen.tsx`
**Effort**: 2-4 hours

```typescript
// Fix chat container:
// - Set fixed/max height on chat container
// - overflow-y: auto on messages container
// - Auto-scroll to bottom on new message
// - Add resize handle if expandable
```

### 6. Error Boundaries (ENT-011)
**Files to create**: `components/ui/ErrorBoundary.tsx`
**Effort**: 2-4 hours

```typescript
// Wrap each screen in ErrorBoundary:
// - Catch JavaScript errors
// - Display friendly message
// - Offer reload/report options
// - Log to console/analytics
```

### 7. Keyboard Navigation (ENT-008)
**Files to modify**: All interactive components
**Effort**: 8-16 hours

```typescript
// For each button/input:
// - Ensure tabIndex is set
// - Add focus-visible styles
// - Handle Enter key
// - Ensure Escape closes modals
```

### 8. Measurement Tools (ENT-028)
**Files to modify**: `CADTankViewer.tsx`, viewer toolbar
**Effort**: 8-16 hours

```typescript
// Implement actual measurement:
// - Distance: click two points, show line + value
// - Angle: click three points, show arc + value
// - Store measurements as annotations
```

---

## High Priority Actions (P1)

### 9. Context Help Icons (ENT-007)
**Files to modify**: All form screens
**Effort**: 4-8 hours

Add `<HelpIcon topicId="..." />` next to each input field.

### 10. Loading Skeletons (ENT-013, ENT-014)
**Files to create**: `components/ui/Skeleton.tsx`
**Effort**: 4-8 hours

Replace "Loading..." text with skeleton components.

### 11. Standard Views (ENT-031, ENT-032)
**Files to modify**: `CADTankViewer.tsx`
**Effort**: 4-8 hours

Add view toolbar with front/top/right/iso buttons.

### 12. Requirements Versioning (ENT-018)
**Files to modify**: `RequirementsScreen.tsx`, `app-store.ts`
**Effort**: 8-16 hours

Add version save/compare/restore functionality.

### 13. Compliance Clause View (ENT-045)
**Files to modify**: `ComplianceScreen.tsx`
**Effort**: 8-16 hours

Implement expandable clause tree with pass/fail per clause.

### 14. Tsai-Wu Failure Display (ENT-040)
**Files to modify**: Analysis tabs
**Effort**: 8-16 hours

Add failure index visualization to 3D model.

---

## Medium Priority Actions (P2)

### 15. Dark Mode (ENT-015)
### 16. Responsive Design (ENT-016)
### 17. 3D Pareto (ENT-024)
### 18. Export Customization (ENT-053)
### 19. Historical Trending (ENT-056)

---

## Implementation Order

### Sprint 1 (Week 1-2): Critical Foundation
1. Application header + branding
2. Data persistence + auto-save
3. Help system integration
4. Error boundaries
5. Chat scroll fix

### Sprint 2 (Week 3-4): Core UX
6. Undo/redo system
7. Keyboard navigation
8. Loading skeletons
9. Standard views in 3D viewer
10. Context help icons

### Sprint 3 (Week 5-6): Content Depth
11. Measurement tools
12. Requirements versioning
13. Compliance clause view
14. Tsai-Wu failure display

### Sprint 4 (Week 7-8): Polish
15. Dark mode
16. Responsive design
17. 3D Pareto
18. Export customization

---

## Files to Create

| File | Purpose |
|------|---------|
| `components/layout/Header.tsx` | Application header |
| `components/ui/ErrorBoundary.tsx` | Error containment |
| `components/ui/Skeleton.tsx` | Loading placeholders |
| `lib/persistence.ts` | localStorage management |
| `lib/history.ts` | Undo/redo system |
| `hooks/useHistory.ts` | History hook |
| `hooks/usePersistence.ts` | Persistence hook |

## Files to Modify

| File | Changes |
|------|---------|
| `Layout.tsx` | Add header, wrap with HelpProvider |
| `layout.tsx` | Fix title/metadata |
| `app-store.ts` | Add persistence, history integration |
| `RequirementsScreen.tsx` | Fix chat scroll, add help icons |
| `CADTankViewer.tsx` | Add measurement tools, standard views |
| `ComplianceScreen.tsx` | Add clause-by-clause view |
| All screens | Add error boundaries, loading states |

---

## Success Criteria

| Criterion | Metric | Target |
|-----------|--------|--------|
| Data Loss | Sessions lost due to refresh | 0% |
| Accessibility | WCAG 2.1 AA compliance | 100% |
| Error Recovery | Crashes requiring reload | < 1% |
| Help Coverage | Fields with help icons | 100% |
| Keyboard Navigation | Actions accessible via keyboard | 100% |
| Loading Feedback | Screens with skeleton loaders | 100% |

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Undo/redo complexity | Start with simple state replacement, not granular |
| Measurement accuracy | Use Three.js raycaster, validate with known dimensions |
| Persistence storage limits | Implement data compression, warn user of limits |
| Help content completeness | Start with critical topics, expand over time |

---

*Generated as part of Enterprise Gap Analysis*

