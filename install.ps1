<#
.SYNOPSIS
  Install the DSH-adapted Academic Research Skills (ARS) into a DeepSeek Harness skills root.

.DESCRIPTION
  Copies the vendored ARS bundle (skills/academic-research-skills) and the five flat
  entry-point skills (skills/*.md) into a skills root that DeepSeek Harness discovers:
    project scope -> <ProjectRoot>/.dsh/skills
    user scope    -> $env:DSH_HOME/skills, or ~/.dsh/skills
  DSH watchers hot-refresh the skill catalog, so no restart is needed after install.

.PARAMETER Scope
  project (default) or user.

.PARAMETER ProjectRoot
  Project directory used by -Scope project. Defaults to the current directory.

.PARAMETER Dest
  Explicit skills root. Overrides -Scope.

.PARAMETER Uninstall
  Remove the ARS bundle and the five entry-point skills from the resolved skills root.

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File .\install.ps1 -Scope user

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File .\install.ps1 -ProjectRoot D:\papers\my-paper
#>
param(
  [ValidateSet('project', 'user')]
  [string]$Scope = 'project',
  [string]$ProjectRoot = (Get-Location).Path,
  [string]$Dest,
  [switch]$Uninstall
)

$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$srcSkills = Join-Path $repoRoot 'skills'
$bundleName = 'academic-research-skills'
$flatSkills = @(
  'deep-research.md',
  'academic-paper.md',
  'academic-paper-reviewer.md',
  'academic-pipeline.md',
  'sr-screener.md'
)

if (-not (Test-Path -LiteralPath (Join-Path $srcSkills "$bundleName\SKILL.md"))) {
  throw "Repository is incomplete: missing $srcSkills\$bundleName\SKILL.md"
}

if ($Dest) {
  $skillsRoot = $Dest
} elseif ($Scope -eq 'user') {
  $dshHome = if ($env:DSH_HOME) { $env:DSH_HOME } else { Join-Path $HOME '.dsh' }
  $skillsRoot = Join-Path $dshHome 'skills'
} else {
  $skillsRoot = Join-Path $ProjectRoot '.dsh\skills'
}

New-Item -ItemType Directory -Force -Path $skillsRoot | Out-Null
$bundleTarget = Join-Path $skillsRoot $bundleName

if ($Uninstall) {
  if (Test-Path -LiteralPath $bundleTarget) {
    Remove-Item -LiteralPath $bundleTarget -Recurse -Force
    Write-Host "removed   $bundleTarget"
  }
  foreach ($name in $flatSkills) {
    $p = Join-Path $skillsRoot $name
    if (Test-Path -LiteralPath $p) {
      Remove-Item -LiteralPath $p -Force
      Write-Host "removed   $p"
    }
  }
  Write-Host "Done. Skills root: $skillsRoot"
  return
}

if (Test-Path -LiteralPath $bundleTarget) {
  Remove-Item -LiteralPath $bundleTarget -Recurse -Force
}
Copy-Item -LiteralPath (Join-Path $srcSkills $bundleName) -Destination $bundleTarget -Recurse -Force
Write-Host "installed $bundleTarget"

foreach ($name in $flatSkills) {
  $from = Join-Path $srcSkills $name
  if (-not (Test-Path -LiteralPath $from)) { throw "Missing $from" }
  Copy-Item -LiteralPath $from -Destination (Join-Path $skillsRoot $name) -Force
  Write-Host "installed $(Join-Path $skillsRoot $name)"
}

$count = @(Get-ChildItem -LiteralPath $bundleTarget -Recurse -File).Count
Write-Host ""
Write-Host "ARS installed: 1 bundle ($count files) + 5 entry-point skills."
Write-Host "Skills root:  $skillsRoot"
Write-Host "DSH picks these up live (no restart). Try:  /academic-research-skills  or  /deep-research <your topic>"
Write-Host "Note: Pandoc/LaTeX are optional; DOCX/PDF rendering is skipped when they are absent."
