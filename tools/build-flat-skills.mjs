// Regenerates the five flat DSH entry-point skills from the vendored ARS bundle.
//
//   node tools/build-flat-skills.mjs [--bundle <dir>] [--out <dir>]
//
// Defaults: bundle = <repo>/skills/academic-research-skills, out = <repo>/skills
//
// Each generated file is a flat DSH skill: <skills-root>/<name>.md. Its body is the
// original upstream SKILL.md body, unchanged, preceded by a short DSH adaptation
// preamble. The preamble points repo-relative paths at the sibling bundle directory
// (academic-research-skills/), so no absolute path is baked in and the files stay
// portable to any machine.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '..');

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 && process.argv[i + 1] ? resolve(process.argv[i + 1]) : fallback;
}

const BUNDLE = arg('bundle', join(repoRoot, 'skills', 'academic-research-skills'));
const OUT = arg('out', join(repoRoot, 'skills'));

const skills = [
  {
    dir: 'deep-research',
    name: 'deep-research',
    desc: 'ARS academic deep research: 13-agent team, 8 modes (full research, quick brief, paper review, literature review, fact-check, three-way scan, Socratic guided research, systematic review/PRISMA). Use for literature search, evidence synthesis, research-question design, fact-checking. 研究/深度研究/文献回顾/文献综述/系统性回顾/事实查核. Not for writing the paper (academic-paper) or peer review (academic-paper-reviewer).',
  },
  {
    dir: 'academic-paper',
    name: 'academic-paper',
    desc: 'ARS academic paper writing: 12-agent pipeline, modes full/plan/outline/revision/revision-coach/abstract-only/lit-review/format-convert/citation-check/AI-disclosure/rebuttal-audit. APA 7, Chicago, MLA, IEEE, Vancouver; Markdown, DOCX and LaTeX output; human confirmation at every stage. 写论文/论文写作/撰写/摘要/大纲/改稿/引用格式/AI 声明.',
  },
  {
    dir: 'academic-paper-reviewer',
    name: 'academic-paper-reviewer',
    desc: 'ARS peer review: 7-agent panel (journal-fit reviewer + 3 reviewers + devils advocate), criterion-bound evidence-anchored judgements, modes full/quick/methodology-focus/guided/re-review/calibration. Use to review, critique or re-review a manuscript and map reviewer concerns to revisions. 审稿/同行评审/审稿意见/评审报告. Read-only: never edits the manuscript.',
  },
  {
    dir: 'academic-pipeline',
    name: 'academic-pipeline',
    desc: 'ARS 10-stage research-to-publication pipeline orchestrator: research, write, integrity gate, review, revise, finalize, process summary, with Material Passport, mandatory integrity checks at stages 2.5 and 4.5, R&R traceability and confirmation checkpoints. Use for a whole paper project end to end. 完整论文流程/论文流水线/从研究到发表.',
  },
  {
    dir: 'sr-screener',
    name: 'sr-screener',
    desc: 'ARS systematic-review screening: protocol design, blinded dual-reviewer screening plus adjudicator, title/abstract and full-text screening of RIS/NBIB/Web of Science/CSV exports, conflict adjudication, exclusion audit, PRISMA 2020 counts. Use to screen records against eligibility criteria; not to write the review. 系统综述筛选/PRISMA/文献筛选/纳排标准.',
  },
];

function preamble(name, workflowDir) {
  return `# DSH adaptation layer - read this before the ARS instructions

This is a **DeepSeek Harness entry point** for **Academic Research Skills (ARS) v3.24.0** by Cheng-I Wu (https://github.com/Imbad0202/academic-research-skills, CC BY-NC 4.0). The instructions below are the original ARS \`${workflowDir}/SKILL.md\` text, unchanged.

Operating notes:

- **Path root.** The full ARS snapshot is vendored in the sibling directory \`academic-research-skills/\` inside this skills root. Resolve every repo-relative path against it: \`academic-research-skills/shared/...\`, \`academic-research-skills/scripts/...\`, \`academic-research-skills/agents/...\`, \`academic-research-skills/${workflowDir}/references/...\`, \`academic-research-skills/MODE_REGISTRY.md\`. Do NOT resolve them against this file's own directory.
- **Tool-name map.** Read -> \`read\`, Grep -> \`grep\`, Glob -> \`glob\`, Write -> \`write\`, Edit -> \`edit\`, Bash -> \`pwsh\`, WebSearch -> \`web_search\`, WebFetch -> \`web_fetch\`, TodoWrite -> \`todo_write\`, AskUserQuestion -> \`ask_user_question\`.
- **Subagent dispatch.** ARS says "dispatch agent X", where X has a definition file under \`agents/\`. DSH has no subagent-type registry: read that agent file and pass its full text, plus the task inputs, as the \`prompt\` of the \`subagent\` tool (use \`subagent_fork\` only when the child needs the current conversation).
- **Missing Claude Code machinery.** No \`/ars-*\` slash commands, no \`CLAUDE_PLUGIN_ROOT\`, no hooks. The write-scope guard and session-start announce in \`hooks/\` do NOT run, and the Workflow-tool scripts do not run: treat those protections as advisory only and say so instead of claiming a guard ran.
- **Mode selection.** Modes are chosen from the user's wording (the ARS trigger keywords still apply) or by asking the user.
- **User gesture.** A DSH user can invoke this skill by writing \`/${name}\` in a message; the skill text is then injected directly.
- **Runtime.** Python 3.11 and Node are expected to be available; Pandoc and LaTeX/tectonic usually are not, so DOCX/PDF rendering steps fail - say so and deliver Markdown or LaTeX source instead. Gates that need network access (Semantic Scholar, Crossref, OpenAlex, arXiv) may have to be skipped explicitly.
- **Keep the checkpoints.** ARS stops for user confirmation at every stage and at integrity gates; do not collapse them into one shot.
- **Licence.** CC BY-NC 4.0 - non-commercial use, attribution to Cheng-I Wu required. Unofficial adaptation, not affiliated with or endorsed by the ARS author.

---

`;
}

function splitFrontmatter(raw) {
  const nl = raw.indexOf('\n');
  if (nl < 0 || raw.slice(0, nl).replace(/\r$/, '') !== '---') {
    throw new Error('missing frontmatter');
  }
  let pos = nl + 1;
  while (pos <= raw.length) {
    const next = raw.indexOf('\n', pos);
    const end = next < 0 ? raw.length : next;
    if (raw.slice(pos, end).replace(/\r$/, '') === '---') {
      return { body: raw.slice(next < 0 ? raw.length : next + 1) };
    }
    if (next < 0) break;
    pos = next + 1;
  }
  throw new Error('unterminated frontmatter');
}

mkdirSync(OUT, { recursive: true });
const written = [];
for (const skill of skills) {
  if (skill.desc.length > 480) {
    throw new Error(`description too long for ${skill.name}: ${skill.desc.length}`);
  }
  const raw = readFileSync(join(BUNDLE, skill.dir, 'SKILL.md'), 'utf8');
  const { body } = splitFrontmatter(raw);
  const out = [
    '---',
    `name: ${skill.name}`,
    `description: "${skill.desc}"`,
    '---',
    '',
    preamble(skill.name, skill.dir),
    body.trim(),
    '',
  ].join('\n');
  const target = join(OUT, `${skill.name}.md`);
  writeFileSync(target, out, 'utf8');
  written.push(`${skill.name}.md -> ${out.length} chars (body ${body.trim().split('\n').length} lines)`);
}
console.log(written.join('\n'));
