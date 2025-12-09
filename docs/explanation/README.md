---
doc_type: reference
title: "Explanations & Architecture Documentation Index"
version: 1.0.0
date: 2025-12-09
owner: "@doc-manager"
---

# Explanations & Architecture Documentation

This directory contains **conceptual explanations, architecture documentation, and design rationale** following the Diátaxis framework.

## Purpose (Explanations in Diátaxis)

Explanations clarify and illuminate:
- Why the system is designed this way
- How different parts relate to each other
- Key architectural decisions and trade-offs
- Domain concepts and terminology

## Documents in This Directory

### Platform & Architecture
- [PROAGENTIC_DFX_PLATFORM.md](./PROAGENTIC_DFX_PLATFORM.md) - ProAgentic DfX platform overview
- [README_PROAGENTIC_DFX.md](./README_PROAGENTIC_DFX.md) - Platform explanation and vision
- [MULTI-DOMAIN-ARCHITECTURE.md](./MULTI-DOMAIN-ARCHITECTURE.md) - Multi-domain architecture design
- [DOMAIN_INTEGRATION.md](./DOMAIN_INTEGRATION.md) - Domain integration patterns

### Module Explanations
- [FRONTEND_README.md](./FRONTEND_README.md) - Frontend module architecture
- [MOCK_SERVER_ARCHITECTURE_REVIEW.md](./MOCK_SERVER_ARCHITECTURE_REVIEW.md) - Mock server architecture
- [MOCK_SERVER_SUMMARY.md](./MOCK_SERVER_SUMMARY.md) - Mock server overview

### Integration & Planning
- [OPENCASCADE_INTEGRATION_PLAN.md](./OPENCASCADE_INTEGRATION_PLAN.md) - OpenCascade integration approach

### Requirements Traceability Matrix (RTM) Analysis
- [rtm/](./rtm/) - RTM analysis subdirectory
  - [DUPLICATE_ACTION_PLAN.md](./rtm/DUPLICATE_ACTION_PLAN.md) - Duplicate requirements action plan
  - [DUPLICATE_REQUIREMENTS_REPORT.md](./rtm/DUPLICATE_REQUIREMENTS_REPORT.md) - Duplicate requirements analysis

## Explanation vs. Other Doc Types

| Type | Purpose | Example |
|------|---------|---------|
| **Explanation** | Understanding concepts & architecture | "How multi-domain architecture works" |
| **How-to** | Achieving specific tasks | "How to add a new domain" |
| **Reference** | Technical details & API specs | "Domain configuration API reference" |
| **Test Report** | Implementation verification | "Multi-domain implementation test results" |

## Related Documentation

- **How-to Guides**: [../howto/](../howto/) - Practical implementation guides
- **References**: [../reference/](../reference/) - API and configuration specs
- **Test Reports**: [../test-report/](../test-report/) - Implementation verification
- **ADRs**: [../adr/](../adr/) - Architectural decision records

## Usage for AI Agents

When you need to understand:
- **"Why was it built this way?"** → Read explanations
- **"How do I implement X?"** → See how-to guides
- **"What are the API parameters?"** → Check references
- **"Has this been implemented?"** → Review test reports

## Maintenance

- Explanations should be updated when architecture changes
- Link to related ADRs for decision rationale
- Include diagrams and visual aids where helpful
- Mark outdated explanations as superseded in manifest
