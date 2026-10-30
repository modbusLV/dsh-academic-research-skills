# Academic Research Skills for DeepSeek Harness (DSH)

A repackaging of [**Academic Research Skills (ARS)**](https://github.com/Imbad0202/academic-research-skills) v3.24.0 so it loads as native skills in **DeepSeek Harness** — research → write → integrity check → peer review → revise → finalize, with 5 workflows and 35 modes.

ARS is built as a **Claude Code plugin**: it relies on `/ars-*` slash commands, `CLAUDE_PLUGIN_ROOT`, Claude Code hooks, named subagent types and the Workflow tool. DSH has none of those. This repository keeps ARS's methodology text byte-for-byte and replaces only the parts that cannot cross over.

**Status:** experimental port, ARS v3.24.0. Upstream content unchanged; the adaptation layer is new. See [NOTICE.md](NOTICE.md) for exactly what changed.

**中文简介**：把 ARS（学术研究/写作/审稿流水线）改造为 DeepSeek Harness 可直接加载的技能。方法论正文原样保留，Claude Code 专有的钩子、斜杠命令、子代理类型换成 DSH 的等价做法。安装后可直接 `/academic-research-skills` 或 `/deep-research 帮我做文献综述`。

---

## What you get

| Skill | Purpose | Modes |
|---|---|---|
| `academic-research-skills` | Router for the whole suite (start here) | — |
| `deep-research` | 13-agent research pipeline: full research, quick brief, paper review, lit-review, fact-check, three-way scan, Socratic guided research, systematic review / PRISMA | 8 |
| `academic-paper` | 12-agent paper writing: full, plan, outline, revision, revision-coach, abstract, lit-review paper, format-convert, citation-check, AI-disclosure, rebuttal-audit | 11 |
| `academic-paper-reviewer` | 7-agent review panel: full, quick, methodology-focus, guided, re-review, calibration | 6 |
| `academic-pipeline` | 10-stage research-to-publication orchestrator with Material Passport and mandatory integrity gates (stages 2.5 / 4.5) | 1 |
| `sr-screener` | Systematic-review screening with blinded dual reviewers, adjudication, PRISMA 2020 counts | 8 |

The full ARS snapshot (1032 files, ~16.5 MB: skill texts, references, templates, agent definitions and Python gate scripts) is vendored under `skills/academic-research-skills/`, so the suite works offline and needs no upstream checkout at run time.

## Install

Requirements: a DeepSeek Harness build with the filesystem skill provider (the default), and PowerShell 5+ or bash. Node.js is needed only if you want to rebuild the entry-point files.

**Project scope** — only sessions whose workspace/project root is that directory (DSH looks for `<project>/.dsh/skills` and `<project>/.agents/skills`):

```powershell
git clone https://github.com/modbusLV/dsh-academic-research-skills
cd dsh-academic-research-skills
powershell -ExecutionPolicy Bypass -File .\install.ps1 -ProjectRoot D:\papers\my-paper
```

```bash
./install.sh --project ~/papers/my-paper
```

**User scope** — every DSH session on the machine:

```powershell
powershell -ExecutionPolicy Bypass -File .\install.ps1 -Scope user
```

```bash
./install.sh --user
```

**Manual install** — copy `skills/academic-research-skills/` plus the five `skills/*.md` files into `.dsh/skills/` (or `~/.dsh/skills/`). Keep them as siblings; the five entry points resolve reference paths against `academic-research-skills/`.

No restart is needed: DSH watches the skills root and publishes a replacement catalog immediately. Uninstall with `-Uninstall` / `--uninstall`.

## Use

```
/academic-research-skills                     # router: picks a workflow, asks when ambiguous
/deep-research 帮我对"生成式 AI 对高教品保的影响"做文献综述
/academic-paper 把这份草稿改成 APA 7，并检查引用
/academic-paper-reviewer 以期刊审稿人视角评审这篇论文
/academic-pipeline 我要从零写一篇完整论文
/sr-screener 按这份纳入排除标准筛选这些文献
```

You can also just describe the task ("帮我做系统综述"、"审这篇稿子"); the skill descriptions carry English and Chinese trigger phrases. To stop a skill from auto-activating and keep it manual-only, add `disable-model-invocation: true` to its frontmatter (then `/name` still works).

## Compatibility: what survives, what does not

| ARS mechanism | On DSH |
|---|---|
| Methodology text, checklists, rubrics, templates, 10-stage pipeline, PRISMA logic (~85–90 % of the value) | **Works as-is** |
| `/ars-*` slash commands (16 files) | **Gone.** Use the DSH skill gesture (`/deep-research` …) or plain language; modes are selected from wording or by asking |
| Named subagents (`agents/*.md`, `tools:` frontmatter) | **Emulated.** DSH has no subagent-type registry: read the agent file and pass its text as the `subagent` prompt |
| Hooks: SessionStart announce, PreToolUse write-scope guard | **Not run.** Write-scope protection is advisory here (documented in every skill) |
| `${CLAUDE_PLUGIN_ROOT}` and `.claude/` paths | **Replaced** by the bundle directory / adaptation preamble |
| Workflow-tool scripts (`sr-screener/templates/workflows/*.js`) | **Not run.** Screen in batches through `subagent` |
| Claude tool names (`Read`, `Bash`, `WebSearch`, …) | **Mapped**: `read`, `pwsh`, `web_search`, `grep`, `glob`, `write`, `edit`, `subagent` |
| Python gate scripts (`scripts/*.py`, citation/claim audits, API clients) | **Runnable** if Python is present; some need network / API keys and otherwise must be skipped explicitly |
| DOCX / PDF rendering (Pandoc, tectonic, `apa7` class) | **Optional**; without them the suite delivers Markdown / LaTeX source |
| Cross-model verification (`ARS_CROSS_MODEL`) | **Unavailable** without a second model CLI; stays single-model |

Details, per-mechanism notes and limits: [docs/COMPATIBILITY.md](docs/COMPATIBILITY.md).

## Practical notes

- Each skill body is large (33–65 KB, roughly 9–16k tokens per load) because ARS is a full methodology. Load only the workflow you need; the router tells you which.
- DSH caps skill *descriptions* (not bodies) at 500 characters, so the upstream 3–6 KB multilingual trigger lists were rewritten into compact bilingual descriptions.
- The vendored `hooks/`, `commands/` and marketplace files are kept unmodified for provenance. They are inert in DSH; the skill preambles say so.
- ARS's integrity gates (citation existence, claim–source alignment, experiment provenance) are **prompt-level rules, not runtime guarantees** — the upstream project says the same in `POSITIONING.md`. Without hooks you get less enforcement still. Verify references yourself before submitting anything.

## Layout

```
skills/
  academic-research-skills/     vendored ARS snapshot + router SKILL.md
  deep-research.md              5 DSH entry-point skills (flat files)
  academic-paper.md
  academic-paper-reviewer.md
  academic-pipeline.md
  sr-screener.md
tools/build-flat-skills.mjs     regenerates the five flat skills from the bundle
install.ps1 / install.sh        project-scope or user-scope installer
docs/COMPATIBILITY.md           mechanism-by-mechanism port notes
```

## Updating from upstream

```bash
git clone --depth 1 https://github.com/Imbad0202/academic-research-skills /tmp/ars
# refresh the vendored bundle (keep the local SKILL.md router)
rsync -a --delete --exclude SKILL.md /tmp/ars/ skills/academic-research-skills/
node tools/build-flat-skills.mjs
git add -A && git commit -m "chore: sync ARS vX.Y.Z"
```

## Licence and attribution

- Upstream **Academic Research Skills** © Cheng-I Wu — https://github.com/Imbad0202/academic-research-skills — DOI [10.5281/zenodo.20696614](https://doi.org/10.5281/zenodo.20696614), licensed **CC BY-NC 4.0**.
- This adaptation (packaging, router, adaptation preamble, installers, docs) is released under the same **CC BY-NC 4.0**: attribution required, **no commercial use**.
- Unofficial adaptation. Not affiliated with or endorsed by the ARS author or by Anthropic.

## Disclaimer

This is research *assistance*, not authorship. You stay responsible for the question, the method, the data, the citations and every claim you submit. The suite can produce plausible text that is wrong; treat verification as your job, not the tool's.
