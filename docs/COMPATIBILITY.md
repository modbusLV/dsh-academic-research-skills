# Compatibility notes: ARS → DeepSeek Harness

Source: Academic Research Skills v3.24.0 (`https://github.com/Imbad0202/academic-research-skills`).
Target: DeepSeek Harness (DSH) skill system, filesystem provider.

DSH discovers `<skills-root>/<name>/SKILL.md` (directory bundle) or `<skills-root>/<name>.md` (flat file), requires `name` + `description` in YAML frontmatter, and ignores unknown frontmatter keys. Both ARS shapes are therefore installable without touching the body text. Everything below is about the *rest* of the plugin.

## 1. Skills — direct fit

| ARS | DSH | Notes |
|---|---|---|
| `/<name>/SKILL.md` with `name`, `description`, `metadata` | Same shape | ARS uses no `allowed-tools`, `model` or `hooks` frontmatter keys, so nothing is dropped by the loader |
| 3–6 KB multilingual `description` | Capped at 500 chars in the catalog | Rewritten into compact bilingual descriptions in the five flat entry points; the vendored originals are untouched |
| Progressive disclosure: `references/`, `templates/`, `examples/` loaded on demand | Same idea: `skill_resources` base directory + `read` | Requires resolving paths against the bundle root; the preambles state it explicitly |
| User gesture `/skill-name` | DSH injects a skill when the message contains a `/name` token | `/academic-research-skills`, `/deep-research`, … all work |

## 2. Slash commands — not portable

ARS ships 16 `commands/ars-*.md` (14–20 lines each) with `disable-model-invocation: true`; they are thin dispatchers that tell Claude Code to invoke a skill with a mode and `$ARGUMENTS`. DSH has no custom slash commands.

**Replacement.** Invoke the skill directly and put the mode in words (`/deep-research 做系统综述，主题……`), or start from the router skill `academic-research-skills`, which asks which workflow to run. `MODE_REGISTRY.md` in the bundle still documents every mode.

## 3. Subagents — emulated, not native

ARS's agent definitions live in each workflow's `agents/` directory (14 + 12 + 7 + 5 + 3 files) with frontmatter `name / description / model: inherit / tools: Read, Write, Edit, Grep, Glob`. Claude Code dispatches them as typed subagents; DSH's `subagent` tool takes a free-form prompt and a session model.

**Replacement recipe** (also stated in every skill preamble):

1. `read` the agent file, e.g. `academic-research-skills/academic-paper/agents/draft_writer_agent.md`.
2. Pass its full text plus the concrete task inputs as the `prompt` of `subagent`.
3. Use `subagent_fork` when the child needs the current conversation; plain `subagent` otherwise.
4. Tool restrictions in the agent frontmatter are advisory here — DSH subagents get the harness tool set, so state the restriction in the prompt instead of relying on `tools:`.

## 4. Hooks — unavailable

`hooks/hooks.json` registers:

- `SessionStart` → ARS announce script (update notice, routing core).
- `PreToolUse` on `Write|Edit|MultiEdit|Bash` → `scripts/ars_write_scope_guard.py` (write-scope fencing: agents only write inside the run's scope).

DSH has no hook bus, so **both are inert**. Consequences:

- The routing core that hooks would inject at session start is instead delivered only when a skill loads (it is duplicated inside each SKILL.md).
- The write-scope guard does not run. Nothing mechanically prevents a subagent from writing outside the run's directory. If you rely on that, keep runs in a scratch directory and review diffs.
- Every skill preamble says this, so the model should not claim a guard ran.

## 5. Tool names

ARS prose is mostly tool-agnostic, but agent frontmatter and a handful of passages assume Claude Code tool names. Mapping used throughout:

| Claude Code | DSH |
|---|---|
| `Read` / `Write` / `Edit` | `read` / `write` / `edit` |
| `Grep` / `Glob` | `grep` / `glob` |
| `Bash` | `pwsh` (PowerShell) |
| `WebSearch` / `WebFetch` | `web_search` / `web_fetch` |
| `TodoWrite` | `todo_write` |
| `AskUserQuestion` | `ask_user_question` |
| Task / typed subagent | `subagent` / `subagent_fork` |
| Workflow tool | none (use `subagent` batches or the `workflow` tool) |

## 6. Workflow-tool scripts

`sr-screener/SKILL.md` and `sr-screener/templates/workflows/*.template.js` assume Claude Code's Workflow tool for batched blinded screening. DSH cannot run those templates.

**Replacement.** Screen in batches: one `subagent` per batch with the screening reviewer prompt (from `sr-screener/agents/screening_reviewer_agent.md`) and the protocol; keep the dual-reviewer/blind/adjudication structure in prose; keep the scripts in `sr-screener/scripts/` for parsing RIS/NBIB/CSV exports and computing PRISMA counts.

## 7. Python gates

The bundle ships ~650 Python files. Most are repository CI (`check_*.py` lints, tests, evals) and are irrelevant at run time. The runtime-relevant ones are the citation/claim gates, the write-scope guard (inert, see §4), and the bibliographic clients (`semantic_scholar`, `crossref`, `openalex`, `arxiv`).

- Python 3.11+ works; run scripts from the bundle root so relative imports resolve.
- Network-dependent gates fail closed or are skipped with an explicit "check did not run" line — ARS asks for that honesty; keep it.
- No API keys needed for basic use; Semantic Scholar / OpenAlex rate limits apply.

## 8. Rendering

`academic-paper` can emit DOCX (Pandoc) and PDF (tectonic + `apa7`). Both are optional. On a machine without them, deliver Markdown/LaTeX and say rendering was not performed.

## 9. Cross-model verification

`shared/cross_model_verification.md` is consent-gated and needs a second provider CLI (Codex CLI / Gemini / OpenAI-compatible endpoint, driven by `scripts/*.sh`). DSH does not provide one. Without it, integrity checks stay single-model; say so rather than implying a cross-check happened.

## 10. Known limits of this port

- One vendored snapshot (v3.24.0) — updates are manual (`README.md` §Updating from upstream).
- Skill bodies are not cached or compressed; each load costs ~9–16k tokens.
- `hooks/`, `commands/`, `.claude-plugin/` files are shipped inert for provenance; do not expect them to act.
- The adaptation was validated by loading the skills in DSH (catalog refresh + tool load), not by running a full paper pipeline end to end. Treat it as a working port with untested long-run behaviour.
