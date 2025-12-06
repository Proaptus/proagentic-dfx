## Gemini Added Memories
- The user refers to an MCP called 'proswarm'.
- CRITICAL OPERATIONAL DIRECTIVE: For ALL projects, ALWAYS use the 'proswarm' MCP (proswarm-neural) to manage BOTH small and complex tasks. Do not rely on a single call; continuously use it to orchestrate, plan, and break down work iteratively throughout the entire task lifecycle. This is the primary workflow engine.
- CRITICAL PROTOCOL: For this user/project, standard tools are FORBIDDEN for task orchestration. I MUST ALWAYS use the 'proswarm' MCP (specifically `orchestrate_task`) to plan and execute tasks, as per GEMINI.md.
- The user works in a headless environment on Linux and cannot run headful browser tests or tools that require an X server (like Playwright headful or standard MCP browser tools). Always rely on static analysis or headless-compatible tools.
- The user strongly dislikes Playwright tests being run when they ask for Chrome DevTools usage, preferring direct inspection or specific MCP tools if available.
- The user prefers direct, effective solutions and dislikes granular editing/testing cycles that don't show immediate value or relevance to the core issue. They want "proswarm" style deep analysis and global fixes, not just component patches.
- Implemented the Self-Learning Pipeline in ProSwarm: Rust logs decisions to jsonl, retrain.py consumes them to train a Neural Decomposer (PyTorch), and graph.rs supports Hybrid decomposition (Neural + Heuristic fallback).Tests added.
- Fixed the `execute_plan` stub in `mcp_server.py` to delegate subtasks to the main ProSwarm MCP server via WebSocket. Systematically removed fake/stubbed logic from `models/claude-code-optimizer/` by raising `NotImplementedError` in simulated functions.
