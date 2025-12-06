# NOVAE Completion Checklist

Use this checklist to verify that all NOVAE loop steps have been completed for your task.

## Planning & Analysis
- [ ] Initial plan written (Sequential Thinking)
- [ ] Context7 baseline captured (libs to touch + patterns)
- [ ] User flow documented (trigger → actions → outcome)

## Execution
- [ ] Parallel tasks launched (frontend/backend/tests)
- [ ] Synthesis written (gaps, contracts, next steps)
- [ ] Code updated & validated against Context7 guidance

## Integration
- [ ] Types aligned across frontend/backend
- [ ] Schemas validated (Zod/TypeScript)
- [ ] Error paths consistent
- [ ] No mock data in functional code

## Testing
- [ ] Unit/integration tests pass (`npm run test`)
- [ ] Playwright user flow passes (`npm run test:e2e`)
- [ ] Lint + type checks pass (`npm run lint`)
- [ ] Manual verification in browser if UI changed

## Documentation
- [ ] Final verification notes (Sequential Thinking)
- [ ] User flow validation summary
- [ ] Any breaking changes documented
- [ ] PR description complete (if applicable)

## Safety Checks
- [ ] No `kill`/`pkill`/`killall` commands used
- [ ] No hardcoded secrets or API keys
- [ ] Error boundaries present for UI components
- [ ] Async error handling proper in backend

---

**Status Indicators:**
- ✅ Complete
- ⚠️ Needs attention
- ❌ Not done
- 🔄 In progress
