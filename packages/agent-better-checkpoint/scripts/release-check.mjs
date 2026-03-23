#!/usr/bin/env node
/**
 * Release Gate for agent-better-checkpoint.
 * Fails fast when common release omissions are detected.
 */

import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';

function fail(msg) {
  console.error(`\n[release:check] ${msg}`);
  process.exit(1);
}

function ok(msg) {
  console.log(`[release:check] OK: ${msg}`);
}

function fileExists(path) {
  try {
    readFileSync(path);
    return true;
  } catch {
    return false;
  }
}

function sha256(text) {
  return createHash('sha256').update(text, 'utf8').digest('hex');
}

function readText(path) {
  return readFileSync(path, 'utf8');
}

function git(args) {
  return execFileSync('git', args, { encoding: 'utf8' }).trim();
}

function ensureCleanWorktree() {
  const out = git(['status', '--porcelain']);
  if (out.length !== 0) fail('Working tree is not clean. Commit or stash changes before release.');
  ok('working tree clean');
}

function ensureChangelogHasVersion(version) {
  const changelog = readText('CHANGELOG.md');
  if (!changelog.includes(`## [${version}]`)) {
    fail(`CHANGELOG.md does not contain an entry for version ${version}.`);
  }
  ok(`CHANGELOG contains ${version}`);
}

function ensureFilesInSync(sourcePath, mirrorPath, label) {
  if (!fileExists(mirrorPath)) {
    console.warn(`[release:check] WARN: ${mirrorPath} not found; skipping sync check for ${label}.`);
    return;
  }

  const sourceText = readText(sourcePath).replace(/\r\n/g, '\n');
  const mirrorText = readText(mirrorPath).replace(/\r\n/g, '\n');

  if (sha256(sourceText) !== sha256(mirrorText)) {
    fail(`${label} out of sync:\n- ${sourcePath}\n- ${mirrorPath}\nPlease update both or regenerate project-local copy.`);
  }

  ok(`${label} copies are in sync`);
}

function ensureProjectLocalScriptsInSync() {
  const pairs = [
    {
      sourcePath: 'platform/unix/checkpoint.sh',
      mirrorPath: '.vibe-x/agent-better-checkpoint/checkpoint.sh',
      label: 'unix checkpoint.sh',
    },
    {
      sourcePath: 'platform/unix/check_uncommitted.sh',
      mirrorPath: '.vibe-x/agent-better-checkpoint/check_uncommitted.sh',
      label: 'unix check_uncommitted.sh',
    },
    {
      sourcePath: 'platform/win/checkpoint.ps1',
      mirrorPath: '.vibe-x/agent-better-checkpoint/checkpoint.ps1',
      label: 'windows checkpoint.ps1',
    },
    {
      sourcePath: 'platform/win/check_uncommitted.ps1',
      mirrorPath: '.vibe-x/agent-better-checkpoint/check_uncommitted.ps1',
      label: 'windows check_uncommitted.ps1',
    },
    {
      sourcePath: 'platform/unix/alloc_patch.sh',
      mirrorPath: '.vibe-x/agent-better-checkpoint/alloc_patch.sh',
      label: 'unix alloc_patch.sh',
    },
    {
      sourcePath: 'platform/win/alloc_patch.ps1',
      mirrorPath: '.vibe-x/agent-better-checkpoint/alloc_patch.ps1',
      label: 'windows alloc_patch.ps1',
    },
  ];

  for (const pair of pairs) {
    ensureFilesInSync(pair.sourcePath, pair.mirrorPath, pair.label);
  }
}

function ensureSkillVersionMatches(version) {
  const skill = readText('skill/SKILL.md');
  const requiredSnippets = [
    `version: "${version}"`,
    `@vibe-x/agent-better-checkpoint@${version}`,
    `**Version**: ${version}`,
  ];

  const missing = requiredSnippets.filter((snippet) => !skill.includes(snippet));
  if (missing.length > 0) {
    fail(`skill/SKILL.md is missing current version references for ${version}:\n- ${missing.join('\n- ')}`);
  }

  ok(`skill/SKILL.md references ${version}`);
}

function main() {
  if (!fileExists('package.json')) fail('package.json not found (run from repo root).');
  if (!fileExists('CHANGELOG.md')) fail('CHANGELOG.md not found.');
  if (!fileExists('platform/unix/checkpoint.sh')) fail('platform/unix/checkpoint.sh not found.');

  const pkg = JSON.parse(readText('package.json'));
  const version = pkg.version;
  if (!version) fail('package.json missing version field.');

  ensureCleanWorktree();
  ensureProjectLocalScriptsInSync();
  ensureChangelogHasVersion(version);
  ensureSkillVersionMatches(version);

  ok(`release checks passed for ${pkg.name}@${version}`);
}

main();
