# ProSWARM Skill Installation Checklist

## ✅ Pre-Installation

- [ ] ProSWARM MCP server installed (`npm install -g pro-swarm` or `npx pro-swarm --version`)
- [ ] MCP server is running (`ps aux | grep pro-swarm`)
- [ ] Project has `.claude/` directory structure
- [ ] Claude Code is configured to load skills from `.claude/skills/`

## ✅ Core Files

### Skill Files
- [ ] `.claude/skills/proswarm/SKILL.md` exists with valid YAML frontmatter
- [ ] `.claude/skills/proswarm/README.md` exists with documentation
- [ ] `.claude/skills/proswarm/QUICK_REFERENCE.md` exists with quick lookup
- [ ] `.claude/skills/proswarm/USAGE_EXAMPLES.md` exists with examples
- [ ] `.claude/skills/proswarm/CHECKLIST.md` exists (this file)

### Templates
- [ ] `.claude/skills/proswarm/templates/ORCHESTRATION_PLAN.md` exists
- [ ] `.claude/skills/proswarm/templates/MODEL_SELECTION_GUIDE.md` exists

### Subagents
- [ ] `.claude/agents/proswarm-orchestrator.md` exists with YAML frontmatter
- [ ] `.claude/agents/proswarm-executor.md` exists with YAML frontmatter
- [ ] `.claude/agents/proswarm-memory-manager.md` exists with YAML frontmatter
- [ ] `.claude/agents/proswarm-model-selector.md` exists with YAML frontmatter

## ✅ Configuration

### MCP Configuration (.mcp.json)
```json
{
  "mcpServers": {
    "proswarm-neural": {
      "command": "npx",
      "args": ["pro-swarm", "mcp", "start"],
      "env": {
        "PROSWARM_WORKSPACE": "${HOME}/projects"
      }
    }
  }
}
```
- [ ] MCP server configured in `.mcp.json`
- [ ] Environment variables set correctly
- [ ] MCP server starts without errors

## ✅ Validation Tests

### Basic Functionality
- [ ] Can list available models: `mcp__proswarm-neural__list_available_models()`
- [ ] Can orchestrate a task: `mcp__proswarm-neural__orchestrate_task("Test task")`
- [ ] Can store memory: `mcp__proswarm-neural__memory_store("test", "value")`
- [ ] Can retrieve memory: `mcp__proswarm-neural__memory_get("test")`

### Model Availability (Spot Check)
- [ ] `test_optimizer` model available
- [ ] `bug_router` model available
- [ ] `api_builder` model available
- [ ] `performance_bug_analyzer` model available
- [ ] Total of 70+ models available

### Skill Discovery
- [ ] Skill appears when asking "What skills are available?"
- [ ] Skill activates on complex task descriptions
- [ ] Subagents are accessible via Task tool

## ✅ Integration Tests

### Simple Bug Fix
```javascript
// Test: "Fix the authentication timeout bug"
// Expected: bug_router and crash_analyzer models selected
// Expected: Task orchestrated and decomposed
```
- [ ] Bug properly classified
- [ ] Appropriate models selected
- [ ] Task decomposed into subtasks
- [ ] Memory keys created

### Feature Implementation
```javascript
// Test: "Build a user profile API"
// Expected: api_builder and related models selected
// Expected: Parallel subtasks created
```
- [ ] API endpoints planned
- [ ] Models selected correctly
- [ ] Parallel execution planned
- [ ] Results stored in memory

### Performance Optimization
```javascript
// Test: "Optimize the dashboard loading time"
// Expected: performance_bug_analyzer selected
// Expected: Multiple optimization subtasks
```
- [ ] Performance models selected
- [ ] Baseline metrics stored
- [ ] Optimization tasks created
- [ ] Results measurable

## ✅ Performance Benchmarks

- [ ] Model selection: <1ms
- [ ] Task orchestration: <10ms
- [ ] Memory operations: <5ms
- [ ] Parallel execution shows speedup

## ✅ Documentation

- [ ] README is comprehensive
- [ ] Usage examples are practical
- [ ] Quick reference is accurate
- [ ] Templates are usable

## ✅ Troubleshooting

If issues occur:

### ProSWARM not responding
```bash
# Check server status
ps aux | grep pro-swarm

# Restart server
pkill -f "pro-swarm"
npx pro-swarm mcp start
```

### Models not loading
```bash
# Check models directory
ls /home/chine/projects/proswarm/ml-training/models/

# Verify model count
npx pro-swarm models list | wc -l
```

### Memory not persisting
```javascript
// Test with explicit JSON operations
await memory_store("test", JSON.stringify({data: "test"}));
const result = JSON.parse(await memory_get("test"));
console.log(result); // Should show {data: "test"}
```

## ✅ Success Criteria

The ProSWARM skill is successfully installed when:
- [ ] All files are in place
- [ ] MCP server is running
- [ ] Models are accessible
- [ ] Basic operations work
- [ ] Skill auto-activates on complex tasks
- [ ] Subagents are functional
- [ ] Memory system works
- [ ] Performance meets benchmarks

## 📝 Notes

- This skill is project-agnostic and can be copied to any project
- The skill will auto-activate on complex task descriptions
- All 70+ neural models should be accessible
- Memory persists throughout task execution
- Parallel execution should show measurable speedup

## 🎉 Installation Complete!

Once all checkboxes are marked, the ProSWARM Neural Orchestration skill is ready for use. Test with:

```
"Build a complete authentication system with tests"
```

This should trigger:
1. Orchestration initialization
2. Neural decomposition
3. Model selection
4. Parallel execution planning
5. Memory coordination
6. Result aggregation

---

*If any issues persist, consult the README.md troubleshooting section or check ProSWARM documentation.*