#!/usr/bin/env node

/**
 * agent-better-checkpoint installer (Node.js)
 *
 * One-click install via npx: checkpoint scripts, stop hook, and SKILL.md to user env.
 * Deploys platform-specific scripts (macOS/Linux vs Windows).
 *
 * Usage:
 *   npx @vibe-x/agent-better-checkpoint
 *   npx @vibe-x/agent-better-checkpoint --platform cursor
 *   npx @vibe-x/agent-better-checkpoint --uninstall
 */

import { existsSync, mkdirSync, copyFileSync, readFileSync, writeFileSync, chmodSync, rmSync, statSync, readdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { homedir, platform } from 'node:os';
import { fileURLToPath } from 'node:url';

// ============================================================
// Path constants
// ============================================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PKG_ROOT = resolve(__dirname, '..');

const INSTALL_BASE = join(homedir(), '.vibe-x', 'agent-better-checkpoint');
const SKILL_NAME = 'agent-better-checkpoint';

// In-package source paths
const PLATFORM_DIR = join(PKG_ROOT, 'platform');
const SKILL_SRC = join(PKG_ROOT, 'skill', 'SKILL.md');
const CONFIG_TEMPLATE = join(PLATFORM_DIR, 'config.template.yml');

// ============================================================
// Argument parsing
// ============================================================

function parseArgs(argv) {
  const args = { platform: null, uninstall: false, target: null, activate: false };
  for (let i = 2; i < argv.length; i++) {
    switch (argv[i]) {
      case '--platform':
        args.platform = argv[++i];
        if (!['cursor', 'claude'].includes(args.platform)) {
          console.error(`Error: unsupported platform "${args.platform}". Use "cursor" or "claude".`);
          process.exit(1);
        }
        break;
      case '--target':
        args.target = argv[++i];
        if (!args.target) {
          console.error('Error: --target requires a path argument');
          process.exit(1);
        }
        break;
      case '--uninstall':
        args.uninstall = true;
        break;
      case '--activate':
        args.activate = true;
        break;
      case '--help':
      case '-h':
        printHelp();
        process.exit(0);
        break;
      default:
        console.error(`Unknown option: ${argv[i]}`);
        printHelp();
        process.exit(1);
    }
  }
  return args;
}

function printHelp() {
  console.log(`
agent-better-checkpoint — Semantic Git Checkpoint Installer

Usage:
  npx @vibe-x/agent-better-checkpoint [options]

Options:
  --platform <cursor|claude>  Target AI platform (auto-detected if omitted)
  --target <path>             Project-only install (no global). Use . for cwd
  --activate                  Activate checkpoint rules in current project (AGENTS.md only)
  --uninstall                 Remove installed files and hook registrations
  -h, --help                  Show this help message
`);
}

// ============================================================
// Platform detection
// ============================================================

function detectAIPlatform() {
  const home = homedir();
  // Prefer Claude (if both exist, user can override with --platform)
  if (existsSync(join(home, '.claude'))) return 'claude';
  if (existsSync(join(home, '.cursor'))) return 'cursor';
  return null;
}

function getOSType() {
  const p = platform();
  if (p === 'win32') return 'win';
  return 'unix'; // darwin, linux, freebsd, etc.
}

// ============================================================
// File operation helpers
// ============================================================

function ensureDir(dir) {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

function copyFileSafe(src, dest) {
  ensureDir(dirname(dest));
  copyFileSync(src, dest);
}

function setExecutable(filepath) {
  try {
    const st = statSync(filepath);
    chmodSync(filepath, st.mode | 0o111);
  } catch {
    // chmod may be ineffective on Windows, ignore
  }
}

function readJsonFile(filepath) {
  try {
    return JSON.parse(readFileSync(filepath, 'utf-8'));
  } catch {
    return null;
  }
}

function writeJsonFile(filepath, data) {
  ensureDir(dirname(filepath));
  writeFileSync(filepath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
}

// ============================================================
// AGENTS.md block management
// ============================================================

const AGENTS_BLOCK_START = '<!-- [ABC:agent-better-checkpoint:start] -->';
const AGENTS_BLOCK_END = '<!-- [ABC:agent-better-checkpoint:end] -->';

const AGENTS_BLOCK_CONTENT = `${AGENTS_BLOCK_START}
## Checkpoint Commit Rule

After completing any file edit (write_to_file, replace_in_file, multi_replace_in_file, or similar),
you MUST:

1. Load the "agent-better-checkpoint" skill (if not already loaded)
2. Follow its instructions to create a checkpoint commit
3. Do NOT proceed to the next task until the commit is done

This ensures every meaningful code change is tracked with a semantic Git commit.
${AGENTS_BLOCK_END}`;

function injectAgentsMdBlock(targetDir) {
  const agentsMdPath = join(targetDir, 'AGENTS.md');
  let content = '';
  
  if (existsSync(agentsMdPath)) {
    content = readFileSync(agentsMdPath, 'utf-8');
    // Check if block already exists
    if (content.includes(AGENTS_BLOCK_START)) {
      console.log(`  AGENTS.md → block already exists (skipped)`);
      return;
    }
  }
  
  // Append block to end of file (or create new file)
  const newContent = content
    ? content.trimEnd() + '\n\n' + AGENTS_BLOCK_CONTENT + '\n'
    : AGENTS_BLOCK_CONTENT + '\n';
  
  writeFileSync(agentsMdPath, newContent, 'utf-8');
  console.log(`  AGENTS.md → ${agentsMdPath}`);
}

function removeAgentsMdBlock(targetDir) {
  const agentsMdPath = join(targetDir, 'AGENTS.md');
  
  if (!existsSync(agentsMdPath)) {
    return;
  }
  
  const content = readFileSync(agentsMdPath, 'utf-8');
  
  if (!content.includes(AGENTS_BLOCK_START)) {
    return;
  }
  
  // Remove the block (including surrounding newlines)
  const blockRegex = new RegExp(
    `\\n*${AGENTS_BLOCK_START.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]*?${AGENTS_BLOCK_END.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\n*`,
    'g'
  );
  
  let newContent = content.replace(blockRegex, '\n');
  newContent = newContent.trim();
  
  if (newContent === '') {
    // If file is empty after removal, delete it
    rmSync(agentsMdPath, { force: true });
    console.log(`  Removed ${agentsMdPath} (empty after cleanup)`);
  } else {
    writeFileSync(agentsMdPath, newContent + '\n', 'utf-8');
    console.log(`  Cleaned ${agentsMdPath}`);
  }
}

// ============================================================
// Install logic
// ============================================================

function installScripts(osType) {
  const scriptsDir = join(INSTALL_BASE, 'scripts');
  const hooksDir = join(INSTALL_BASE, 'hooks', 'stop');

  ensureDir(scriptsDir);
  ensureDir(hooksDir);

  // 双端脚本都安装，方便跨平台使用
  copyFileSafe(join(PLATFORM_DIR, 'unix', 'checkpoint.sh'), join(scriptsDir, 'checkpoint.sh'));
  copyFileSafe(join(PLATFORM_DIR, 'unix', 'alloc_patch.sh'), join(scriptsDir, 'alloc_patch.sh'));
  copyFileSafe(join(PLATFORM_DIR, 'unix', 'check_uncommitted.sh'), join(hooksDir, 'check_uncommitted.sh'));
  setExecutable(join(scriptsDir, 'checkpoint.sh'));
  setExecutable(join(scriptsDir, 'alloc_patch.sh'));
  setExecutable(join(hooksDir, 'check_uncommitted.sh'));

  copyFileSafe(join(PLATFORM_DIR, 'win', 'checkpoint.ps1'), join(scriptsDir, 'checkpoint.ps1'));
  copyFileSafe(join(PLATFORM_DIR, 'win', 'alloc_patch.ps1'), join(scriptsDir, 'alloc_patch.ps1'));
  copyFileSafe(join(PLATFORM_DIR, 'win', 'check_uncommitted.ps1'), join(hooksDir, 'check_uncommitted.ps1'));

  console.log(`  Scripts → ${scriptsDir}/`);
  console.log(`  Hooks   → ${hooksDir}/`);
}

function installSkill(aiPlatform) {
  let skillDir;
  let skillDest;

  if (aiPlatform === 'cursor') {
    // Check skills.sh install path
    const skillsShPath = join(homedir(), '.cursor', 'skills', SKILL_NAME, 'SKILL.md');
    if (existsSync(skillsShPath)) {
      console.log(`  Skill   → already installed at ${skillsShPath} (skipped)`);
      return;
    }

    skillDir = join(homedir(), '.cursor', 'skills', SKILL_NAME);
    skillDest = join(skillDir, 'SKILL.md');
  } else if (aiPlatform === 'claude') {
    // Claude Code: install to standard skills directory
    const skillsRootDir = join(homedir(), '.claude', 'skills');
    skillDir = join(skillsRootDir, SKILL_NAME);
    skillDest = join(skillDir, 'SKILL.md');

    if (existsSync(skillDest)) {
      console.log(`  Skill   → already installed at ${skillDest} (skipped)`);
      return;
    }
  }

  copyFileSafe(SKILL_SRC, skillDest);
  console.log(`  Skill   → ${skillDest}`);
}

function registerCursorHook(osType) {
  const hooksPath = join(homedir(), '.cursor', 'hooks.json');
  let config = readJsonFile(hooksPath) || { version: 1, hooks: {} };

  if (!config.hooks) config.hooks = {};
  if (!config.hooks.stop) config.hooks.stop = [];

  // Build hook command
  let hookCmd;
  if (osType === 'unix') {
    hookCmd = `bash ${INSTALL_BASE}/hooks/stop/check_uncommitted.sh`;
  } else {
    hookCmd = `powershell -File "${INSTALL_BASE}\\hooks\\stop\\check_uncommitted.ps1"`;
  }

  const registered = config.hooks.stop.some(
    h => typeof h === 'object' && h.command && h.command.includes('agent-better-checkpoint')
  );

  if (!registered) {
    config.hooks.stop.push({ command: hookCmd });
  }

  writeJsonFile(hooksPath, config);
  console.log(`  Config  → ${hooksPath}`);
}

// 项目级安装：仅写入 target 目录，不触碰全局
function installProjectOnly(targetDir, aiPlatform, osType) {
  const root = resolve(targetDir);

  // .vibe-x/agent-better-checkpoint: checkpoint 脚本 + helper + config
  const vibeXBase = join(root, '.vibe-x', 'agent-better-checkpoint');
  ensureDir(vibeXBase);
  copyFileSafe(join(PLATFORM_DIR, 'unix', 'checkpoint.sh'), join(vibeXBase, 'checkpoint.sh'));
  copyFileSafe(join(PLATFORM_DIR, 'unix', 'alloc_patch.sh'), join(vibeXBase, 'alloc_patch.sh'));
  copyFileSafe(join(PLATFORM_DIR, 'unix', 'check_uncommitted.sh'), join(vibeXBase, 'check_uncommitted.sh'));
  copyFileSafe(join(PLATFORM_DIR, 'win', 'checkpoint.ps1'), join(vibeXBase, 'checkpoint.ps1'));
  copyFileSafe(join(PLATFORM_DIR, 'win', 'alloc_patch.ps1'), join(vibeXBase, 'alloc_patch.ps1'));
  copyFileSafe(join(PLATFORM_DIR, 'win', 'check_uncommitted.ps1'), join(vibeXBase, 'check_uncommitted.ps1'));
  setExecutable(join(vibeXBase, 'checkpoint.sh'));
  setExecutable(join(vibeXBase, 'alloc_patch.sh'));
  setExecutable(join(vibeXBase, 'check_uncommitted.sh'));
  const configDest = join(vibeXBase, 'config.yml');
  if (!existsSync(configDest) && existsSync(CONFIG_TEMPLATE)) {
    copyFileSafe(CONFIG_TEMPLATE, configDest);
  }
  console.log(`  Config  → ${vibeXBase}/`);

  // Skill: .cursor/skills/ 或 .claude/skills/
  const skillRoot = aiPlatform === 'cursor' ? '.cursor' : '.claude';
  const skillDir = join(root, skillRoot, 'skills', SKILL_NAME);
  copyFileSafe(SKILL_SRC, join(skillDir, 'SKILL.md'));
  console.log(`  Skill   → ${skillDir}/`);

  if (aiPlatform === 'cursor') {
    // Cursor 支持项目级 hooks: .cursor/hooks.json + .cursor/hooks/
    const hooksDir = join(root, '.cursor', 'hooks');
    ensureDir(hooksDir);
    copyFileSafe(join(PLATFORM_DIR, 'unix', 'check_uncommitted.sh'), join(hooksDir, 'check_uncommitted.sh'));
    setExecutable(join(hooksDir, 'check_uncommitted.sh'));
    copyFileSafe(join(PLATFORM_DIR, 'win', 'check_uncommitted.ps1'), join(hooksDir, 'check_uncommitted.ps1'));
    const hookCmd = osType === 'unix'
      ? 'bash .cursor/hooks/check_uncommitted.sh'
      : `powershell -File ".cursor\\hooks\\check_uncommitted.ps1"`;
    const hooksPath = join(root, '.cursor', 'hooks.json');
    let config = readJsonFile(hooksPath) || { version: 1, hooks: {} };
    if (!config.hooks) config.hooks = {};
    if (!config.hooks.stop) config.hooks.stop = [];
    const registered = config.hooks.stop.some(
      h => typeof h === 'object' && h.command && h.command.includes('check_uncommitted')
    );
    if (!registered) {
      config.hooks.stop.push({ command: hookCmd });
    }
    writeJsonFile(hooksPath, config);
    console.log(`  Hooks   → ${hooksPath}`);
  } else {
    // Claude Code: settings.json 为全局，无项目级 hooks，仅安装 skill 和脚本
    console.log(`  Hooks   → (Claude stop hook is global-only, skipped for project install)`);
  }

  // Inject AGENTS.md block (project-only)
  injectAgentsMdBlock(root);
}

function uninstallProjectOnly(targetDir, aiPlatform) {
  const root = resolve(targetDir);

  const vibeXBase = join(root, '.vibe-x', 'agent-better-checkpoint');
  const skillRoot = aiPlatform === 'cursor' ? '.cursor' : '.claude';
  const skillDir = join(root, skillRoot, 'skills', SKILL_NAME);
  const checkpointShPath = join(vibeXBase, 'checkpoint.sh');
  const checkpointPs1Path = join(vibeXBase, 'checkpoint.ps1');
  const allocPatchShPath = join(vibeXBase, 'alloc_patch.sh');
  const allocPatchPs1Path = join(vibeXBase, 'alloc_patch.ps1');
  const checkUncommittedShPath = join(vibeXBase, 'check_uncommitted.sh');
  const checkUncommittedPs1Path = join(vibeXBase, 'check_uncommitted.ps1');
  for (const filePath of [
    checkpointShPath,
    checkpointPs1Path,
    allocPatchShPath,
    allocPatchPs1Path,
    checkUncommittedShPath,
    checkUncommittedPs1Path,
    join(vibeXBase, 'config.yml'),
  ]) {
    if (existsSync(filePath)) rmSync(filePath, { force: true });
  }

  if (existsSync(skillDir)) {
    rmSync(skillDir, { recursive: true, force: true });
    console.log(`  Removed ${skillDir}`);
  }
  // 移除空的 .cursor/skills 或 .claude/skills 父目录
  const skillsParent = join(root, skillRoot, 'skills');
  if (existsSync(skillsParent)) {
    try {
      if (readdirSync(skillsParent).length === 0) {
        rmSync(skillsParent, { recursive: true, force: true });
      }
    } catch {
      // ignore
    }
  }

  if (aiPlatform === 'cursor') {
    const hooksPath = join(root, '.cursor', 'hooks.json');
    if (existsSync(hooksPath)) {
      const config = readJsonFile(hooksPath);
      if (config?.hooks?.stop) {
        config.hooks.stop = config.hooks.stop.filter(
          h => !(typeof h === 'object' && h.command && h.command.includes('check_uncommitted'))
        );
        if (config.hooks.stop.length === 0) delete config.hooks.stop;
        if (Object.keys(config.hooks || {}).length === 0) {
          rmSync(hooksPath, { force: true });
        } else {
          writeJsonFile(hooksPath, config);
        }
        console.log(`  Cleaned ${hooksPath}`);
      }
    }
    const hooksDir = join(root, '.cursor', 'hooks');
    const shPath = join(hooksDir, 'check_uncommitted.sh');
    const ps1Path = join(hooksDir, 'check_uncommitted.ps1');
    if (existsSync(shPath)) rmSync(shPath, { force: true });
    if (existsSync(ps1Path)) rmSync(ps1Path, { force: true });
    if (existsSync(hooksDir) && readdirSync(hooksDir).length === 0) {
      rmSync(hooksDir, { recursive: true, force: true });
    }
  }

  // Remove AGENTS.md block
  removeAgentsMdBlock(root);
}

function registerClaudeHook(osType) {
  const settingsPath = join(homedir(), '.claude', 'settings.json');
  let settings = readJsonFile(settingsPath) || {};

  if (!settings.hooks) settings.hooks = {};
  if (!settings.hooks.Stop) settings.hooks.Stop = [];

  let hookCmd;
  if (osType === 'unix') {
    hookCmd = `bash ${INSTALL_BASE}/hooks/stop/check_uncommitted.sh`;
  } else {
    hookCmd = `powershell -File "${INSTALL_BASE}\\hooks\\stop\\check_uncommitted.ps1"`;
  }

  const registered = settings.hooks.Stop.some(
    h => typeof h === 'object' &&
         JSON.stringify(h).includes('agent-better-checkpoint')
  );

  if (!registered) {
    settings.hooks.Stop.push({
      matcher: '',
      hooks: [{ type: 'command', command: hookCmd }]
    });
  }

  writeJsonFile(settingsPath, settings);
  console.log(`  Config  → ${settingsPath}`);
}

// ============================================================
// Uninstall logic
// ============================================================

function hasInstallation(platform) {
  const home = homedir();
  const skillDir = join(home, platform === 'cursor' ? '.cursor' : '.claude', 'skills', SKILL_NAME);
  return existsSync(skillDir);
}

function uninstallScripts() {
  if (existsSync(INSTALL_BASE)) {
    rmSync(INSTALL_BASE, { recursive: true, force: true });
    console.log(`  Removed ${INSTALL_BASE}`);
  } else {
    console.log(`  ${INSTALL_BASE} not found, nothing to remove`);
  }
}

function uninstallCursorSkill() {
  const skillDir = join(homedir(), '.cursor', 'skills', SKILL_NAME);
  if (existsSync(skillDir)) {
    rmSync(skillDir, { recursive: true, force: true });
    console.log(`  Removed skill: ${skillDir}`);
  }
}

function uninstallClaudeSkill() {
  const skillDir = join(homedir(), '.claude', 'skills', SKILL_NAME);
  if (existsSync(skillDir)) {
    rmSync(skillDir, { recursive: true, force: true });
    console.log(`  Removed skill: ${skillDir}`);
  }
}

function unregisterCursorHook() {
  const hooksPath = join(homedir(), '.cursor', 'hooks.json');
  if (!existsSync(hooksPath)) return;

  const config = readJsonFile(hooksPath);
  if (!config || !config.hooks || !config.hooks.stop) return;

  config.hooks.stop = config.hooks.stop.filter(
    h => !(typeof h === 'object' && h.command && h.command.includes('agent-better-checkpoint'))
  );

  writeJsonFile(hooksPath, config);
  console.log(`  Cleaned config: ${hooksPath}`);
}

function unregisterClaudeHook() {
  const settingsPath = join(homedir(), '.claude', 'settings.json');
  if (!existsSync(settingsPath)) return;

  const settings = readJsonFile(settingsPath);
  if (!settings || !settings.hooks || !settings.hooks.Stop) return;

  settings.hooks.Stop = settings.hooks.Stop.filter(
    h => !JSON.stringify(h).includes('agent-better-checkpoint')
  );

  writeJsonFile(settingsPath, settings);
  console.log(`  Cleaned config: ${settingsPath}`);
}

// ============================================================
// Activate logic (AGENTS.md only, with installation check)
// ============================================================

const SUPPORTED_PLATFORMS = ['cursor', 'claude'];

function checkGlobalInstallation() {
  const home = homedir();
  const results = {
    hasScripts: existsSync(join(INSTALL_BASE, 'scripts', 'checkpoint.sh')) ||
                existsSync(join(INSTALL_BASE, 'scripts', 'checkpoint.ps1')),
    platforms: {}
  };
  
  for (const p of SUPPORTED_PLATFORMS) {
    const skillDir = p === 'cursor' ? '.cursor' : '.claude';
    results.platforms[p] = {
      hasSkill: existsSync(join(home, skillDir, 'skills', SKILL_NAME, 'SKILL.md'))
    };
  }
  
  results.hasAnySkill = SUPPORTED_PLATFORMS.some(p => results.platforms[p].hasSkill);
  results.isFullyInstalled = results.hasScripts && results.hasAnySkill;
  return results;
}

function checkProjectInstallation(targetDir) {
  const root = resolve(targetDir);
  const results = {
    hasScripts: existsSync(join(root, '.vibe-x', 'agent-better-checkpoint', 'checkpoint.sh')) ||
                existsSync(join(root, '.vibe-x', 'agent-better-checkpoint', 'checkpoint.ps1')),
    platforms: {}
  };
  
  for (const p of SUPPORTED_PLATFORMS) {
    const skillDir = p === 'cursor' ? '.cursor' : '.claude';
    results.platforms[p] = {
      hasSkill: existsSync(join(root, skillDir, 'skills', SKILL_NAME, 'SKILL.md'))
    };
  }
  
  results.hasAnySkill = SUPPORTED_PLATFORMS.some(p => results.platforms[p].hasSkill);
  results.isFullyInstalled = results.hasScripts && results.hasAnySkill;
  return results;
}

function activateProject(targetDir) {
  const root = resolve(targetDir);
  
  // Check if already has AGENTS.md block
  const agentsMdPath = join(root, 'AGENTS.md');
  if (existsSync(agentsMdPath)) {
    const content = readFileSync(agentsMdPath, 'utf-8');
    if (content.includes(AGENTS_BLOCK_START)) {
      console.log(`\n⚠️  AGENTS.md already contains checkpoint rules. Nothing to do.`);
      return;
    }
  }

  // Step 1: Check project-level installation (all platforms)
  const projectStatus = checkProjectInstallation(root);
  if (projectStatus.isFullyInstalled) {
    // Project has both scripts and skill for at least one platform
    console.log(`\n[Activate] Adding checkpoint rules to ${root}...`);
    injectAgentsMdBlock(root);
    console.log(`\n✅ Activation complete!`);
    console.log(`\nThe AI agent will now follow checkpoint commit rules in this project.`);
    return;
  }

  // Step 2: Check global installation (all platforms)
  const globalStatus = checkGlobalInstallation();
  if (globalStatus.isFullyInstalled) {
    // Global has both scripts and skill for at least one platform
    console.log(`\n[Activate] Adding checkpoint rules to ${root}...`);
    injectAgentsMdBlock(root);
    console.log(`\n✅ Activation complete!`);
    console.log(`\nThe AI agent will now follow checkpoint commit rules in this project.`);
    return;
  }

  // Step 3: Neither project nor global is fully installed - provide detailed diagnosis
  const hasAnyProjectSkill = projectStatus.hasAnySkill;
  const hasAnyGlobalSkill = globalStatus.hasAnySkill;
  const hasAnyProjectScripts = projectStatus.hasScripts;
  const hasAnyGlobalScripts = globalStatus.hasScripts;

  const hasAnySkill = hasAnyProjectSkill || hasAnyGlobalSkill;
  const hasAnyScripts = hasAnyProjectScripts || hasAnyGlobalScripts;

  if (!hasAnySkill && !hasAnyScripts) {
    console.log(`\n⚠️  No agent-better-checkpoint installation detected.`);
    console.log(`\nChecked locations:`);
    console.log(`  Project: ${root}`);
    console.log(`  Global:  ${INSTALL_BASE}`);
    console.log(`\nPlease install first:`);
    console.log(`  Global:        npx @vibe-x/agent-better-checkpoint`);
    console.log(`  Project-only:  npx @vibe-x/agent-better-checkpoint --target . --platform cursor|claude`);
    console.log(`\nThen run --activate again.`);
    process.exit(1);
  }

  if (!hasAnySkill) {
    console.log(`\n⚠️  Checkpoint scripts found, but skill (SKILL.md) is missing.`);
    console.log(`\nThe AI agent needs the skill to know how to commit. Please run:`);
    console.log(`  npx @vibe-x/agent-better-checkpoint --platform cursor|claude`);
    process.exit(1);
  }

  if (!hasAnyScripts) {
    console.log(`\n⚠️  Skill found, but checkpoint scripts are missing.`);
    console.log(`\nPlease reinstall to get the scripts:`);
    console.log(`  npx @vibe-x/agent-better-checkpoint`);
    process.exit(1);
  }
}

// ============================================================
// Main entry
// ============================================================

function main() {
  const args = parseArgs(process.argv);
  const osType = getOSType();
  const aiPlatform = args.platform || detectAIPlatform();
  const projectTargetDir = args.target ? resolve(args.target) : null;

  if (!aiPlatform && !projectTargetDir && !args.uninstall && !args.activate) {
    console.error(
      'Error: could not detect AI platform.\n' +
      'Please specify: npx @vibe-x/agent-better-checkpoint --platform cursor|claude'
    );
    process.exit(1);
  }

  if (args.uninstall) {
    if (projectTargetDir) {
      // 优先从项目目录检测平台（与安装时一致），否则用 --platform 或全局检测
      let platform = args.platform;
      if (!platform) {
        const cursorSkill = join(projectTargetDir, '.cursor', 'skills', SKILL_NAME);
        const claudeSkill = join(projectTargetDir, '.claude', 'skills', SKILL_NAME);
        if (existsSync(cursorSkill)) platform = 'cursor';
        else if (existsSync(claudeSkill)) platform = 'claude';
      }
      if (!platform) platform = aiPlatform;
      if (!platform) {
        console.error('Error: --target uninstall requires --platform cursor|claude (or project must have skill installed)');
        process.exit(1);
      }
      console.log(`\n[Project-local] Uninstalling from ${projectTargetDir}...`);
      uninstallProjectOnly(projectTargetDir, platform);
    } else {
      const platforms = args.platform
        ? [args.platform]
        : ['cursor', 'claude'].filter(p => hasInstallation(p));
      for (const p of platforms) {
        console.log(`\n[${p === 'cursor' ? 'Cursor' : 'Claude Code'}] Uninstalling...`);
        if (p === 'cursor') {
          uninstallCursorSkill();
          unregisterCursorHook();
        } else {
          uninstallClaudeSkill();
          unregisterClaudeHook();
        }
      }
      if (platforms.length > 0) uninstallScripts();
      if (platforms.length === 0) console.log('\nNo global installation found.');
    }
    console.log('\n✅ Uninstallation complete!');
  } else if (args.activate) {
    // Activate: only inject AGENTS.md, check installation first
    const targetDir = projectTargetDir || process.cwd();
    activateProject(targetDir);
  } else {
    if (projectTargetDir) {
      if (!aiPlatform) {
        console.error('Error: --target requires --platform cursor|claude');
        process.exit(1);
      }
      console.log(`\n[Project-local] Installing to ${projectTargetDir}... (OS: ${osType})`);
      installProjectOnly(projectTargetDir, aiPlatform, osType);
      console.log('\n✅ Installation complete! (project-only, no global changes)');
    } else {
      console.log(`\n[${aiPlatform === 'cursor' ? 'Cursor' : 'Claude Code'}] Installing... (OS: ${osType})`);
      installScripts(osType);
      installSkill(aiPlatform);
      if (aiPlatform === 'cursor') {
        registerCursorHook(osType);
      } else {
        registerClaudeHook(osType);
      }
      console.log('\n✅ Installation complete!');
      console.log('\nInstalled components:');
      console.log(`  📜 Checkpoint script → ~/.vibe-x/agent-better-checkpoint/scripts/ (.sh + .ps1)`);
      console.log(`  🔒 Stop hook         → ~/.vibe-x/agent-better-checkpoint/hooks/stop/ (.sh + .ps1)`);
      console.log(`  📖 SKILL.md          → ${aiPlatform === 'cursor' ? '~/.cursor/skills/' : '~/.claude/skills/'}${SKILL_NAME}/`);
    }
    console.log('\nThe AI agent will now auto-commit with semantic messages. Happy coding! 🎉');
  }
}

main();
