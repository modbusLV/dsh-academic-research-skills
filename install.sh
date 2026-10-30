#!/usr/bin/env bash
# Install the DSH-adapted Academic Research Skills (ARS) into a DeepSeek Harness skills root.
#
#   ./install.sh                 # project scope: <cwd>/.dsh/skills
#   ./install.sh --user          # user scope:    $DSH_HOME/skills (or ~/.dsh/skills)
#   ./install.sh --project DIR   # project scope with an explicit project dir
#   ./install.sh --dest DIR      # explicit skills root
#   ./install.sh --uninstall     # remove from the resolved skills root
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
src="${repo_root}/skills"
bundle="academic-research-skills"
flat_skills=(deep-research.md academic-paper.md academic-paper-reviewer.md academic-pipeline.md sr-screener.md)

scope="project"
project_dir="$(pwd)"
dest=""
uninstall=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --user) scope="user"; shift ;;
    --project) project_dir="$2"; shift 2 ;;
    --dest) dest="$2"; shift 2 ;;
    --uninstall) uninstall=1; shift ;;
    -h|--help) sed -n '2,9p' "$0"; exit 0 ;;
    *) echo "unknown argument: $1" >&2; exit 2 ;;
  esac
done

[[ -f "${src}/${bundle}/SKILL.md" ]] || { echo "repository incomplete: missing ${src}/${bundle}/SKILL.md" >&2; exit 1; }

if [[ -n "$dest" ]]; then
  skills_root="$dest"
elif [[ "$scope" == "user" ]]; then
  skills_root="${DSH_HOME:-$HOME/.dsh}/skills"
else
  skills_root="${project_dir}/.dsh/skills"
fi

mkdir -p "$skills_root"

if [[ "$uninstall" == "1" ]]; then
  rm -rf "${skills_root:?}/${bundle}"
  echo "removed   ${skills_root}/${bundle}"
  for name in "${flat_skills[@]}"; do
    rm -f "${skills_root}/${name}"
    echo "removed   ${skills_root}/${name}"
  done
  echo "Done. Skills root: ${skills_root}"
  exit 0
fi

rm -rf "${skills_root:?}/${bundle}"
cp -R "${src}/${bundle}" "${skills_root}/${bundle}"
echo "installed ${skills_root}/${bundle}"

for name in "${flat_skills[@]}"; do
  [[ -f "${src}/${name}" ]] || { echo "missing ${src}/${name}" >&2; exit 1; }
  cp "${src}/${name}" "${skills_root}/${name}"
  echo "installed ${skills_root}/${name}"
done

count="$(find "${skills_root}/${bundle}" -type f | wc -l | tr -d ' ')"
echo
echo "ARS installed: 1 bundle (${count} files) + 5 entry-point skills."
echo "Skills root:  ${skills_root}"
echo "DSH picks these up live (no restart). Try:  /academic-research-skills  or  /deep-research <your topic>"
echo "Note: Pandoc/LaTeX are optional; DOCX/PDF rendering is skipped when they are absent."
