---
doc_type: explanation
title: "Multi-Domain Architecture Integration Guide"
version: 1.0.0
date: 2025-12-09
owner: "@h2-tank-team"
status: accepted
last_verified_at: 2025-12-09
---
# Multi-Domain Architecture Integration Guide

## Overview

The H2 Tank Designer now has a multi-domain architecture foundation that supports different engineering domains (H2 tanks, pressure vessels, brackets, seals, heat exchangers, etc.).

## Architecture Components

### 1. Domain Types (`src/lib/domains/types.ts`)
Defines the core domain configuration interface:
- `DomainConfiguration`: Main configuration structure
- `RequirementField`: Dynamic field definitions
- `ObjectiveDefinition`: Optimization objectives
- `AnalysisModule`: Analysis capabilities per domain
- `Standard`: Applicable standards/compliance
- `VisualizationConfig`: 3D viewer configuration
- `DomainEndpoints`: API endpoint mappings

### 2. Domain Configurations

#### H2 Tank Domain (`src/lib/domains/h2-tank.ts`)
- **ID**: `h2-tank`
- **Fields**: Volume, pressure, weight, cost, burst ratio, fatigue cycles, certification
- **Standards**: ISO 11119-3, UN R134, SAE J2579
- **Analysis Modules**: Geometry, Stress, Failure, Thermal, Reliability, Cost

#### Pressure Vessel Domain (`src/lib/domains/pressure-vessel.ts`)
- **ID**: `pressure-vessel`
- **Fields**: Design pressure/temp, diameter, length, material, head type, ASME code year
- **Standards**: ASME VIII-1, PED 2014/68/EU
- **Analysis Modules**: Shell, Heads, Nozzles, Supports

### 3. Domain Registry (`src/lib/domains/index.ts`)
Provides domain lookup functions:
```typescript
import { getDomain, listDomains } from '@/lib/domains';

const domain = getDomain('h2-tank');
const allDomains = listDomains();
```

### 4. Domain Store (`src/lib/stores/domain-store.ts`)
Zustand store with persistence for current domain:
```typescript
import { useDomainStore } from '@/lib/stores/domain-store';

const { currentDomain, setDomain } = useDomainStore();
```

### 5. Dynamic Requirements Form (`src/components/screens/DynamicRequirementsForm.tsx`)
Automatically renders form fields based on domain configuration:
- Number inputs with units
- Select dropdowns
- Text inputs
- Range sliders
- Automatic validation
- Shows applicable standards

## Integration with Layout

The `Layout.tsx` component now includes a domain selector dropdown in the sidebar:
```tsx
<select value={currentDomain.id} onChange={(e) => setDomain(e.target.value)}>
  {availableDomains.map((domain) => (
    <option key={domain.id} value={domain.id}>
      {domain.name}
    </option>
  ))}
</select>
```

## Usage Example: Integrating with RequirementsScreen

To use the dynamic form in your RequirementsScreen:

```tsx
import { DynamicRequirementsForm } from './DynamicRequirementsForm';
import { useDomainStore } from '@/lib/stores/domain-store';

export function RequirementsScreen() {
  const { currentDomain } = useDomainStore();

  const handleFormSubmit = (requirements: Record<string, unknown>) => {
    console.log('Requirements submitted:', requirements);
    // Process requirements based on domain
    // Call appropriate API endpoints from currentDomain.endpoints
  };

  return (
    <div>
      <h2>Requirements - {currentDomain.name}</h2>
      <DynamicRequirementsForm onSubmit={handleFormSubmit} />
    </div>
  );
}
```

## Adding New Domains

To add a new domain (e.g., brackets, heat exchangers):

1. Create domain config file: `src/lib/domains/bracket.ts`
```typescript
import type { DomainConfiguration } from './types';

export const bracketDomain: DomainConfiguration = {
  id: 'bracket',
  name: 'Structural Bracket',
  description: 'Mounting brackets and structural supports',
  icon: 'Triangle',
  requirements: {
    fields: [
      {
        key: 'max_load_n',
        label: 'Maximum Load',
        type: 'number',
        unit: 'N',
        required: true,
      },
      // ... more fields
    ],
    defaults: { max_load_n: 5000 },
    validations: {},
  },
  // ... rest of configuration
};
```

2. Register in `src/lib/domains/index.ts`:
```typescript
import { bracketDomain } from './bracket';

export const domains: Record<string, DomainConfiguration> = {
  'h2-tank': h2TankDomain,
  'pressure-vessel': pressureVesselDomain,
  'bracket': bracketDomain, // Add here
};
```

3. Domain is now available in the selector!

## API Integration Pattern

Each domain can point to different backend endpoints:

```typescript
// In your API client
import { useDomainStore } from '@/lib/stores/domain-store';

const { currentDomain } = useDomainStore();

// Dynamic API calls based on domain
await fetch(currentDomain.endpoints.optimize, {
  method: 'POST',
  body: JSON.stringify(requirements),
});
```

## Benefits

1. **Single Codebase**: One frontend serves multiple engineering domains
2. **Easy Expansion**: Add new domains without touching existing screens
3. **Domain-Specific Features**: Each domain can have unique fields, standards, and analysis modules
4. **Centralized Configuration**: All domain logic in one place
5. **Type Safety**: Full TypeScript support for all domain configurations

## Future Enhancements

- [ ] Domain-specific validation rules
- [ ] Custom field components per domain
- [ ] Domain migration/switching warnings
- [ ] Domain-specific themes/branding
- [ ] Multi-domain project comparison
- [ ] Domain capability matrix

