# NOTICE

## Upstream work

**Academic Research Skills (ARS) v3.24.0**
Author: Cheng-I Wu (吳政宜)
Source: https://github.com/Imbad0202/academic-research-skills
DOI: [10.5281/zenodo.20696614](https://doi.org/10.5281/zenodo.20696614)
Licence: **CC BY-NC 4.0** — https://creativecommons.org/licenses/by-nc/4.0/

The snapshot under `skills/academic-research-skills/` is upstream content. It is unmodified **except** for the added `skills/academic-research-skills/SKILL.md` (the DSH router entry point), which does not exist upstream.

## Changes made by this adaptation

1. Repackaged the five ARS skills, their references, templates, agent definitions, shared protocols and Python scripts into one directory bundle so a DSH skill can resolve repo-relative paths against a single base directory.
2. Added `skills/academic-research-skills/SKILL.md`: routing table plus DSH operating notes (tool-name map, subagent dispatch rule, missing hooks).
3. Added five flat entry-point skills, `skills/deep-research.md`, `skills/academic-paper.md`, `skills/academic-paper-reviewer.md`, `skills/academic-pipeline.md`, `skills/sr-screener.md`. Each is: DSH frontmatter with a compact bilingual description, a short DSH adaptation preamble, then the original `SKILL.md` body verbatim.
4. Added `tools/build-flat-skills.mjs` (regenerates item 3 from the bundle), `install.ps1`, `install.sh`, `README.md`, `docs/COMPATIBILITY.md`.

No upstream file other than the new router `SKILL.md` was edited. `hooks/`, `commands/`, scripts and the marketplace manifest are retained unmodified but are inert in DeepSeek Harness (no hook bus, no custom slash commands).

## Not vendored

Repository-only trees from upstream (`.github/`, `tests/`, `evals/`, `docs/`, `examples/`, `pi/`, `audits/`) are not included; they are not needed at run time. Get them from upstream if you want the full development repository.

## Licence of this adaptation

This adaptation is distributed under **CC BY-NC 4.0**, the same licence as upstream. You must give appropriate credit to Cheng-I Wu, and you may not use the material for commercial purposes. See [LICENSE](LICENSE).

## Affiliation

Unofficial, community-style adaptation. Not affiliated with, reviewed by, or endorsed by the ARS author, Anthropic, or DeepSeek.
