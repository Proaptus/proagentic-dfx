---
doc_type: reference
title: "Help System Documentation"
version: 1.0.0
date: 2025-12-09
owner: "@h2-tank-team"
status: accepted
last_verified_at: 2025-12-09
---
# Help System Documentation

Comprehensive enterprise help system for H2 Tank Designer with contextual help, glossary, and onboarding tour.

## Features

- **Contextual Help Icons** - Place help icons throughout the UI that open relevant topics
- **Searchable Help Panel** - Slide-out panel with full-text search
- **Engineering Glossary** - A-Z navigation with formulas and cross-references
- **Onboarding Tour** - First-time user walkthrough
- **Category Organization** - Topics organized by requirements, tank types, analysis, standards, physics, workflow, and troubleshooting
- **Related Topics** - Navigate between related help content
- **History Navigation** - Back/forward buttons
- **Recently Viewed** - Quick access to recent topics
- **Local Storage** - Remembers recent topics and tour dismissal

## Installation

The help system is already integrated. Dependencies installed:
- `react-markdown` - For rendering help content
- UI components (Button, Input, ScrollArea, Accordion, etc.)

## Usage

### 1. Wrap your app with HelpProvider

```tsx
import { HelpProvider, HelpPanel, OnboardingTour } from '@/components/help';

function App() {
  return (
    <HelpProvider>
      {/* Your app content */}
      <YourApp />

      {/* Help panel (controlled by context) */}
      <HelpPanel />

      {/* Optional: Onboarding tour */}
      <OnboardingTour />
    </HelpProvider>
  );
}
```

### 2. Add help icons throughout your UI

```tsx
import { HelpIcon } from '@/components/help';

function RequirementsForm() {
  return (
    <div>
      <label>
        Working Pressure (MPa)
        <HelpIcon topicId="working-pressure" />
      </label>
      <input type="number" />
    </div>
  );
}
```

### 3. Use inline help icons in text

```tsx
import { InlineHelpIcon } from '@/components/help';

function Description() {
  return (
    <p>
      The burst ratio <InlineHelpIcon topicId="burst-ratio" /> must be at least 2.25.
    </p>
  );
}
```

### 4. Show glossary panel

```tsx
import { useState } from 'react';
import { GlossaryPanel } from '@/components/help';
import { Button } from '@/components/ui/button';

function Toolbar() {
  const [showGlossary, setShowGlossary] = useState(false);

  return (
    <>
      <Button onClick={() => setShowGlossary(true)}>
        Glossary
      </Button>
      <GlossaryPanel isOpen={showGlossary} onClose={() => setShowGlossary(false)} />
    </>
  );
}
```

### 5. Programmatically open help topics

```tsx
import { useHelp } from '@/components/help';

function AnalysisResults() {
  const { openTopic } = useHelp();

  return (
    <div>
      <h3>Von Mises Stress: 450 MPa</h3>
      <button onClick={() => openTopic('von-mises-stress')}>
        Learn more about Von Mises stress
      </button>
    </div>
  );
}
```

## Available Help Topics

### Requirements (6 topics)
- `working-pressure` - Working Pressure vs Burst Pressure
- `burst-ratio` - Burst Ratio Explained (2.25)
- `permeation-rate` - Permeation Rate Limits (46 NmL/hr/L)
- `fatigue-cycles` - Fatigue Cycle Requirements (11,000 cycles)
- `temperature-range` - Temperature Range Considerations

### Tank Types (4 topics)
- `tank-type-comparison` - Type I-V Comparison
- `type-iv-advantages` - Type IV Advantages for Automotive
- `liner-materials` - Liner Material Selection (HDPE vs PA6)
- `carbon-fiber-vs-glass` - Carbon Fiber vs Glass Fiber

### Analysis (5 topics)
- `von-mises-stress` - Von Mises Stress Explained
- `tsai-wu-criterion` - Tsai-Wu Failure Criterion
- `first-ply-failure` - First Ply Failure vs Ultimate Failure
- `monte-carlo-reliability` - Monte Carlo Reliability Analysis
- `stress-concentration` - Stress Concentration Factors

### Standards (4 topics)
- `iso-11119-3` - ISO 11119-3 Overview
- `un-r134` - UN R134 Requirements
- `ec-79` - EC 79 Compliance (Europe)
- `sae-j2579` - SAE J2579 Reference (USA)

### Physics (5 topics)
- `hoop-stress-formula` - Hoop Stress Formula (Ïƒ = PR/t)
- `netting-theory` - Netting Theory (54.74Â° Angle)
- `isotensoid-dome` - Isotensoid Dome Profile
- `composite-lamination-theory` - Composite Lamination Theory (CLT)

### Workflow (1 topic)
- `design-workflow` - Design Workflow Overview

### Troubleshooting (1 topic)
- `common-analysis-errors` - Common Analysis Errors

## Glossary Terms

70+ engineering terms with:
- Definitions
- Formulas (where applicable)
- Units
- Related terms
- Category tags

Example terms:
- Burst Pressure, Burst Ratio
- Carbon Fiber (T700, T800)
- HDPE, PA6 (liner materials)
- Hoop Stress, Von Mises Stress
- Tsai-Wu Criterion
- Type I-V tanks
- Permeation, Creep, Fatigue
- And many more...

## Adding New Help Content

### Add a new help topic:

Edit `src/lib/help/topics.ts`:

```typescript
export const HELP_TOPICS: HelpTopic[] = [
  // ... existing topics
  {
    id: 'your-new-topic',
    title: 'Your Topic Title',
    category: 'analysis', // or other category
    keywords: ['keyword1', 'keyword2'],
    content: `
# Your Topic Title

## Section 1
Content here...

## Section 2
More content...
    `,
    relatedTopics: ['related-topic-id'],
  },
];
```

### Add a glossary term:

Edit `src/lib/help/glossary.ts`:

```typescript
export const GLOSSARY_TERMS: GlossaryTerm[] = [
  // ... existing terms
  {
    term: 'Your Term',
    category: 'physics',
    definition: 'Definition of the term...',
    formula: 'E = mcÂ²', // optional
    units: 'J (Joules)', // optional
    relatedTerms: ['Related Term 1', 'Related Term 2'], // optional
  },
];
```

## Keyboard Shortcuts

- **Escape** - Close help panel or glossary
- **Tab** - Navigate within panel
- **Enter** - Open selected topic

## Accessibility

- ARIA labels on all interactive elements
- Keyboard navigation support
- Focus management
- Screen reader friendly
- High contrast support (dark theme)

## Customization

### Styling

All components use Tailwind CSS classes and can be customized via:
- Tailwind configuration
- CSS variables for theme colors
- Component className props

### Content

- Help content uses Markdown (via react-markdown)
- Supports headings, lists, code blocks, tables
- Math formulas in backticks
- Links to related topics

## Performance

- Lazy loading of help content
- Search is client-side (no API calls)
- Local storage for preferences
- Minimal bundle size (~50KB with content)

## Testing

```bash
# Test help system
npm run test -- help

# Manual testing checklist
- [ ] Open help panel
- [ ] Search for topics
- [ ] Navigate between topics
- [ ] Click related topics
- [ ] Test back/forward buttons
- [ ] Open glossary
- [ ] Search glossary
- [ ] Navigate A-Z
- [ ] Test onboarding tour
- [ ] Test keyboard navigation
```

## RTM Requirements Coverage

- **REQ-126 to REQ-129**: Explainer and transparency features
  - Contextual help on all engineering concepts
  - Glossary with engineering terms
  - Formula explanations
  - Standard references

## Future Enhancements

- [ ] Video tutorials embedded in help topics
- [ ] Interactive diagrams
- [ ] PDF export of help content
- [ ] Multi-language support
- [ ] Server-side help content (CMS)
- [ ] Analytics on help usage
- [ ] AI-powered help search
- [ ] Context-aware suggestions

