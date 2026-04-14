<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->
# Everything Claude Code (ECC) â€” Agent Instructions

This is a **production-ready AI coding plugin** providing 47 specialized agents, 181 skills, 79 commands, and automated hook workflows for software development.

**Version:** 1.10.0

## Core Principles

1. **Agent-First** â€” Delegate to specialized agents for domain tasks
2. **Test-Driven** â€” Write tests before implementation, 80%+ coverage required
3. **Security-First** â€” Never compromise on security; validate all inputs
4. **Immutability** â€” Always create new objects, never mutate existing ones
5. **Plan Before Execute** â€” Plan complex features before writing code

## Available Agents

| Agent | Purpose | When to Use |
|-------|---------|-------------|
| planner | Implementation planning | Complex features, refactoring |
| architect | System design and scalability | Architectural decisions |
| tdd-guide | Test-driven development | New features, bug fixes |
| code-reviewer | Code quality and maintainability | After writing/modifying code |
| security-reviewer | Vulnerability detection | Before commits, sensitive code |
| build-error-resolver | Fix build/type errors | When build fails |
| e2e-runner | End-to-end Playwright testing | Critical user flows |
| refactor-cleaner | Dead code cleanup | Code maintenance |
| doc-updater | Documentation and codemaps | Updating docs |
| cpp-reviewer | C/C++ code review | C and C++ projects |
| cpp-build-resolver | C/C++ build errors | C and C++ build failures |
| docs-lookup | Documentation lookup via Context7 | API/docs questions |
| go-reviewer | Go code review | Go projects |
| go-build-resolver | Go build errors | Go build failures |
| kotlin-reviewer | Kotlin code review | Kotlin/Android/KMP projects |
| kotlin-build-resolver | Kotlin/Gradle build errors | Kotlin build failures |
| database-reviewer | PostgreSQL/Supabase specialist | Schema design, query optimization |
| python-reviewer | Python code review | Python projects |
| java-reviewer | Java and Spring Boot code review | Java/Spring Boot projects |
| java-build-resolver | Java/Maven/Gradle build errors | Java build failures |
| loop-operator | Autonomous loop execution | Run loops safely, monitor stalls, intervene |
| harness-optimizer | Harness config tuning | Reliability, cost, throughput |
| rust-reviewer | Rust code review | Rust projects |
| rust-build-resolver | Rust build errors | Rust build failures |
| pytorch-build-resolver | PyTorch runtime/CUDA/training errors | PyTorch build/training failures |
| typescript-reviewer | TypeScript/JavaScript code review | TypeScript/JavaScript projects |

## Agent Orchestration

Use agents proactively without user prompt:
- Complex feature requests â†’ **planner**
- Code just written/modified â†’ **code-reviewer**
- Bug fix or new feature â†’ **tdd-guide**
- Architectural decision â†’ **architect**
- Security-sensitive code â†’ **security-reviewer**
- Autonomous loops / loop monitoring â†’ **loop-operator**
- Harness config reliability and cost â†’ **harness-optimizer**

Use parallel execution for independent operations â€” launch multiple agents simultaneously.

## Security Guidelines

**Before ANY commit:**
- No hardcoded secrets (API keys, passwords, tokens)
- All user inputs validated
- SQL injection prevention (parameterized queries)
- XSS prevention (sanitized HTML)
- CSRF protection enabled
- Authentication/authorization verified
- Rate limiting on all endpoints
- Error messages don't leak sensitive data

**Secret management:** NEVER hardcode secrets. Use environment variables or a secret manager. Validate required secrets at startup. Rotate any exposed secrets immediately.

**If security issue found:** STOP â†’ use security-reviewer agent â†’ fix CRITICAL issues â†’ rotate exposed secrets â†’ review codebase for similar issues.

## Coding Style

**Immutability (CRITICAL):** Always create new objects, never mutate. Return new copies with changes applied.

**File organization:** Many small files over few large ones. 200-400 lines typical, 800 max. Organize by feature/domain, not by type. High cohesion, low coupling.

**Error handling:** Handle errors at every level. Provide user-friendly messages in UI code. Log detailed context server-side. Never silently swallow errors.

**Input validation:** Validate all user input at system boundaries. Use schema-based validation. Fail fast with clear messages. Never trust external data.

**Code quality checklist:**
- Functions small (<50 lines), files focused (<800 lines)
- No deep nesting (>4 levels)
- Proper error handling, no hardcoded values
- Readable, well-named identifiers

## Testing Requirements

**Minimum coverage: 80%**

Test types (all required):
1. **Unit tests** â€” Individual functions, utilities, components
2. **Integration tests** â€” API endpoints, database operations
3. **E2E tests** â€” Critical user flows

**TDD workflow (mandatory):**
1. Write test first (RED) â€” test should FAIL
2. Write minimal implementation (GREEN) â€” test should PASS
3. Refactor (IMPROVE) â€” verify coverage 80%+

Troubleshoot failures: check test isolation â†’ verify mocks â†’ fix implementation (not tests, unless tests are wrong).

## Development Workflow

1. **Plan** â€” Use planner agent, identify dependencies and risks, break into phases
2. **TDD** â€” Use tdd-guide agent, write tests first, implement, refactor
3. **Review** â€” Use code-reviewer agent immediately, address CRITICAL/HIGH issues
4. **Capture knowledge in the right place**
   - Personal debugging notes, preferences, and temporary context â†’ auto memory
   - Team/project knowledge (architecture decisions, API changes, runbooks) â†’ the project's existing docs structure
   - If the current task already produces the relevant docs or code comments, do not duplicate the same information elsewhere
   - If there is no obvious project doc location, ask before creating a new top-level file
5. **Commit** â€” Conventional commits format, comprehensive PR summaries

## Workflow Surface Policy

- `skills/` is the canonical workflow surface.
- New workflow contributions should land in `skills/` first.
- `commands/` is a legacy slash-entry compatibility surface and should only be added or updated when a shim is still required for migration or cross-harness parity.

## Git Workflow

**Commit format:** `<type>: <description>` â€” Types: feat, fix, refactor, docs, test, chore, perf, ci

**PR workflow:** Analyze full commit history â†’ draft comprehensive summary â†’ include test plan â†’ push with `-u` flag.

## Architecture Patterns

**API response format:** Consistent envelope with success indicator, data payload, error message, and pagination metadata.

**Repository pattern:** Encapsulate data access behind standard interface (findAll, findById, create, update, delete). Business logic depends on abstract interface, not storage mechanism.

**Skeleton projects:** Search for battle-tested templates, evaluate with parallel agents (security, extensibility, relevance), clone best match, iterate within proven structure.

## Performance

**Context management:** Avoid last 20% of context window for large refactoring and multi-file features. Lower-sensitivity tasks (single edits, docs, simple fixes) tolerate higher utilization.

**Build troubleshooting:** Use build-error-resolver agent â†’ analyze errors â†’ fix incrementally â†’ verify after each fix.

## Project Structure

```
agents/          â€” 47 specialized subagents
skills/          â€” 181 workflow skills and domain knowledge
commands/        â€” 79 slash commands
hooks/           â€” Trigger-based automations
rules/           â€” Always-follow guidelines (common + per-language)
scripts/         â€” Cross-platform Node.js utilities
mcp-configs/     â€” 14 MCP server configurations
tests/           â€” Test suite
```

`commands/` remains in the repo for compatibility, but the long-term direction is skills-first.

## Design System — Impeccable

This project uses the **Impeccable** design skill (`skills/impeccable/`) for all frontend UI work.

**Key commands:**
- `/impeccable teach` — One-time setup: gather design context and write `.impeccable.md`
- `/impeccable craft [feature]` — Shape + build a feature with full design quality
- `/impeccable extract [target]` — Extract reusable components/tokens into the design system
- `/audit` — Run quality checks, get a report (no edits)
- `/polish` — Final design pass before shipping
- `/critique` — UX design review
- `/distill` — Remove visual complexity
- `/animate` — Add purposeful motion
- `/colorize` — Improve color palette
- `/bolder` / `/quieter` — Shift visual weight
- `/typeset` — Improve typography
- `/layout` — Fix layout/spacing issues

**Design rules** (always active when building UI):
- Use OKLCH color functions, not HSL
- Tint neutrals toward brand hue
- Use 4pt spacing scale with semantic tokens
- Avoid gradient text, side-stripe borders, nested cards, glassmorphism everywhere
- Choose distinctive fonts — avoid the reflex list in the skill
- Always handle all 8 interactive states (default, hover, focus, active, disabled, loading, error, success)
- Respect `prefers-reduced-motion`

**Reference files** in `skills/impeccable/reference/`:
- `color-and-contrast.md`, `typography.md`, `spatial-design.md`
- `motion-design.md`, `interaction-design.md`, `responsive-design.md`, `ux-writing.md`
- `craft.md`, `extract.md`

## Design Context (Monolith)

### Users
- **Target Audience**: Casual readers seeking inspiration and social media creators looking for high-quality content to share.
- **Use Cases**: Reading and exploring quotes, copying text for sharing, and generating/downloading cinematic quote cards/posters for social media.

### Brand Personality
- **Voice**: Sophisticated, authoritative, yet experimental.
- **Tone**: Cinematic and immersive.
- **Personality**: Minimalist, bespoke, and "anti-generic."
- **Emotional Goals**: Inspiration, focus, and a sense of high-end curation.

### Aesthetic Direction
- **Visual Tone**: "High-fashion editorial" meets "Cinematic posters." 
- **Palette**: Primarily monochrome but utilizing **subtle brand tints** (via OKLCH) to add depth and avoid "AI default" flatness.
- **Form**: Strict **sharp-cornered** aesthetic (0px radius) across all containers, cards, and buttons.
- **Anti-References**: Generic quote aggregator sites (colorful gradients, bubbly buttons, soft shadows).

### Design Principles
1. **Cinematic Immersion**: Prioritize large-scale typography and high-contrast, grayscale photography that feels like a film still.
2. **Structural Rigidity**: Use strict grids and 0px border-radii to maintain a sense of architectural precision and bespoke craft.
3. **Intentional Tinting**: Use OKLCH to tint neutrals (blacks and greys) toward a specific brand hue to create subconscious cohesion.
4. **Utility as Art**: Sharing and downloading tools should feel like part of the design, using smooth transitions and high-quality "poster" generation.
5. **Bold Hierarchy**: Use the modular type scale to create extreme contrast between huge headings and tiny, wide-tracked metadata labels.

## Success Metrics

- All tests pass with 80%+ coverage
- No security vulnerabilities
- Code is readable and maintainable
- Performance is acceptable
- User requirements are met
