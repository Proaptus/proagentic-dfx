---
id: FEAT-YYYY-MM-unique-slug
doc_type: feature
title: "Feature Name Here"
status: draft
last_verified_at: YYYY-MM-DD
owner: "@team-name"
supersedes: []
superseded_by: []
code_refs:
  - path: "src/path/to/file.ts#L10-L50"
  - symbol: "ClassName.methodName"
test_refs:
  - path: "tests/path/to/test.test.ts::test_name"
  - ci_run: "gh-actions://runs/12345678"
evidence:
  tests_passed: true
  coverage_delta: "+X.X%"
sources_of_truth: ["ADR-XXXX"]
search:
  boost: 2
  exclude: false
keywords: ["keyword1", "keyword2", "keyword3"]
---

# Feature Name Here

## TL;DR

One-sentence description that agents can quote. Be specific about what this feature does.

## Behavior

### Input Format(s)

- **Format 1**: Description (e.g., JSON with schema `{ field: type }`)
- **Format 2**: Description (e.g., CSV with columns X, Y, Z)

### Output / Side Effects

- **Output**: What the feature produces
- **Side Effects**: Database changes, API calls, file writes, etc.

### Idempotency

- ✅ **Idempotent**: Running multiple times produces same result
- ❌ **Not Idempotent**: Explain what changes on repeated calls

### Error Modes

1. **Error Condition 1**: What triggers this error, what's returned
2. **Error Condition 2**: What triggers this error, what's returned
3. **Edge Cases**: Describe edge case behaviors

## Configuration & Flags

| Variable / Flag | Type | Default | Description |
|-----------------|------|---------|-------------|
| `ENV_VAR_NAME` | string | `"default"` | What this configures |
| `--flag-name` | boolean | `false` | What this flag does |
| `MAX_ITEMS` | integer | `1000` | Max items to process |

### Examples

```bash
# Example 1: Basic usage
FEATURE_ENABLED=true npm start

# Example 2: With custom config
MAX_ITEMS=5000 npm start --flag-name
```

## File & Symbol Map

Precise locations where this feature is implemented:

### Frontend
- `src/components/FeatureComponent/FeatureComponent.tsx#L15-L89`
- `src/hooks/useFeatureData.ts`

### Backend
- `server/routes/feature-endpoint.js#L10-L85`
- `server/services/featureService.js`

### Utilities
- `src/utils/featureHelpers.ts`

### Key Symbols
- `FeatureComponent.render` - Main render method
- `featureService.processData` - Core business logic

## Evidence

### Tests

All tests passing (verify with links):

- **Unit Tests**:
  - `tests/components/FeatureComponent.test.tsx::test_renders_correctly`
  - `tests/services/featureService.test.js::test_processes_data`

- **Integration Tests**:
  - `tests/integration/feature-flow.test.js::test_end_to_end_flow`

- **E2E Tests**:
  - `tests/e2e/feature.spec.ts::test_user_can_use_feature`

### CI Runs

- **Latest Run**: [GitHub Actions Run #12345678](gh-actions://runs/12345678)
- **Coverage Impact**: +X.X% (from AA.A% to BB.B%)

### ADRs

Related architectural decisions:

- [ADR-XXXX: Decision Title](../adr/ADR-XXXX-title.md)

### Related Documentation

- [How-To: Using This Feature](../howto/using-feature-name.md)
- [API Reference: Feature Endpoint](../reference/api-feature-endpoint.md)

## Limitations

Be explicit about what this feature does NOT do:

1. **Limitation 1**: Specific constraint or boundary
2. **Limitation 2**: Known limitation or trade-off
3. **Limitation 3**: Future enhancement needed

### Known Issues

- **Issue #123**: Brief description (link to GitHub issue)
- **Performance**: Known performance limitation under specific conditions

## Security Considerations

- **Authentication**: Required / Not Required
- **Authorization**: Who can use this feature (roles/permissions)
- **Data Privacy**: Any PII or sensitive data handling
- **Rate Limiting**: Any rate limits or throttling

## Performance Characteristics

- **Typical Response Time**: X ms / Y seconds
- **Throughput**: Z requests/second
- **Resource Usage**: Memory, CPU, etc.
- **Scalability**: How it scales with load/data size

## Dependencies

### External Dependencies

- Library/Service 1: Version, purpose
- Library/Service 2: Version, purpose

### Internal Dependencies

- Feature X: How this depends on Feature X
- Service Y: How this depends on Service Y

## Migration Notes

If this feature replaces an older implementation:

### What Changed

- Change 1: Old behavior → New behavior
- Change 2: Old API → New API

### Upgrade Path

Steps to migrate from old to new:

1. Step 1
2. Step 2
3. Step 3

### Deprecation Timeline

- **Old Feature Deprecated**: YYYY-MM-DD
- **Old Feature Removed**: YYYY-MM-DD

## Examples

### Example 1: Basic Usage

```typescript
// Import the feature
import { useFeature } from './hooks/useFeature';

// Use in component
const MyComponent = () => {
  const { data, loading, error } = useFeature();

  if (loading) return <Spinner />;
  if (error) return <ErrorState error={error} />;

  return <FeatureView data={data} />;
};
```

### Example 2: Advanced Usage

```typescript
// Advanced configuration
const MyAdvancedComponent = () => {
  const { data } = useFeature({
    maxItems: 100,
    enableCaching: true,
    retryAttempts: 3
  });

  return <AdvancedFeatureView data={data} />;
};
```

### Example 3: Error Handling

```typescript
// Proper error handling
const MyRobustComponent = () => {
  const { data, error } = useFeature();

  if (error?.code === 'RATE_LIMIT_EXCEEDED') {
    return <RateLimitError retryAfter={error.retryAfter} />;
  }

  if (error?.code === 'INVALID_INPUT') {
    return <ValidationError details={error.details} />;
  }

  return <FeatureView data={data} />;
};
```

## Troubleshooting

### Problem: Feature doesn't work

**Symptoms**: Describe what user sees

**Diagnosis**:
1. Check X
2. Verify Y
3. Look at logs for Z

**Solution**: How to fix

### Problem: Performance is slow

**Symptoms**: Describe slowness

**Diagnosis**:
1. Check data volume
2. Check network latency
3. Check server load

**Solution**: How to optimize

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 2.0.0 | 2025-10-25 | Complete rewrite with new architecture |
| 1.5.0 | 2025-09-15 | Added caching support |
| 1.0.0 | 2025-08-01 | Initial release |

## Future Enhancements

Planned improvements (link to issues/roadmap):

- [ ] Enhancement 1: Description (Issue #456)
- [ ] Enhancement 2: Description (Issue #789)
- [ ] Enhancement 3: Description (Roadmap item)

---

**Last Updated**: YYYY-MM-DD
**Maintained By**: @team-name
**Status**: Draft / Proposed / Accepted / Deprecated / Superseded
