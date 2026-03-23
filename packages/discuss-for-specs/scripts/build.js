/**
 * Build script for discuss-skills npm package
 * 
 * This script:
 * 1. Copies hooks from project root to npm-package/hooks/
 * 2. Builds Skills for each platform from skills/ and platforms/ directories
 */

import { existsSync, mkdirSync, cpSync, readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';

// Read version from package.json (single source of truth)
const packageJson = JSON.parse(
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), '..', 'package.json'), 'utf-8')
);
const VERSION = packageJson.version;

/**
 * Inject template variables into content
 * Currently only supports {{version}}
 * @param {string} content - Content with template variables
 * @returns {string} - Content with variables replaced
 */
function injectVersion(content) {
  return content.replace(/\{\{version\}\}/g, VERSION);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Paths
const PROJECT_ROOT = join(__dirname, '..');  // npm-package directory
const REPO_ROOT = join(__dirname, '..', '..');  // Repository root
const SKILLS_SRC = join(REPO_ROOT, 'skills');
const PLATFORMS_DIR = join(REPO_ROOT, 'platforms');
const HOOKS_SRC = join(REPO_ROOT, 'hooks');
const HOOKS_DEST = join(PROJECT_ROOT, 'hooks');
const DIST_DIR = join(PROJECT_ROOT, 'dist');

// Platforms to build for
const PLATFORMS = ['claude-code', 'cursor', 'cline', 'kilocode', 'opencode', 'codex', 'trae', 'qoder', 'roo-code', 'codeflicker'];

// L1 platforms (Skills only, need L1 guidance appended)
const L1_PLATFORMS = ['kilocode', 'opencode', 'codex', 'trae', 'qoder', 'roo-code', 'codeflicker'];

// L2 platforms (Skills + Hooks, full support)
const L2_PLATFORMS = ['claude-code', 'cursor', 'cline'];

// Skills to build (merged into single discuss-for-specs as per D7)
const SKILLS = ['discuss-for-specs'];

/**
 * Copy hooks from repository to npm package
 */
function copyHooks() {
  console.log('📁 Copying hooks...');
  
  if (!existsSync(HOOKS_SRC)) {
    console.error(`  ❌ Hooks source not found: ${HOOKS_SRC}`);
    process.exit(1);
  }
  
  // Copy entire hooks directory
  cpSync(HOOKS_SRC, HOOKS_DEST, { recursive: true, force: true });
  
  // Remove old post-response hooks if present (we use new structure now)
  const oldHooksDir = join(HOOKS_DEST, 'post-response');
  if (existsSync(oldHooksDir)) {
    console.log('  Skipping old post-response hooks (keeping for reference)');
  }
  
  console.log(`  ✓ Copied hooks to ${HOOKS_DEST}`);
}

/**
 * Build a single skill for a platform
 * 
 * @param {string} skillName - Skill name
 * @param {string} platform - Platform name
 */
function buildSkill(skillName, platform) {
  const skillSrc = join(SKILLS_SRC, skillName);
  const headerFile = join(skillSrc, 'headers', `${platform}.yaml`);
  const skillMd = join(skillSrc, 'SKILL.md');
  const l1GuidanceFile = join(skillSrc, 'references', 'l1-guidance.md');
  
  if (!existsSync(skillMd)) {
    console.error(`  ❌ SKILL.md not found: ${skillMd}`);
    return false;
  }
  
  // Read SKILL.md content
  let skillContent = readFileSync(skillMd, 'utf-8');
  
  // Read header if exists
  let header = '';
  if (existsSync(headerFile)) {
    let headerYaml = readFileSync(headerFile, 'utf-8').trim();
    // Inject version template variable
    headerYaml = injectVersion(headerYaml);
    // Check if header already has frontmatter delimiters
    if (headerYaml.startsWith('---')) {
      // Header already has frontmatter, use as-is
      header = headerYaml + '\n\n';
    } else {
      // Add frontmatter delimiters
      header = `---\n${headerYaml}\n---\n\n`;
    }
  }
  
  // Combine header and content
  let finalContent = header + skillContent;
  
  // For L1 platforms, append L1 guidance (no hooks, user must self-check)
  if (L1_PLATFORMS.includes(platform) && existsSync(l1GuidanceFile)) {
    const l1Guidance = readFileSync(l1GuidanceFile, 'utf-8');
    finalContent += '\n\n---\n\n' + l1Guidance;
  }
  
  // Create output directory
  const outputDir = join(DIST_DIR, platform, skillName);
  mkdirSync(outputDir, { recursive: true });
  
  // Write final SKILL.md
  const outputFile = join(outputDir, 'SKILL.md');
  writeFileSync(outputFile, finalContent, 'utf-8');
  
  // Copy references directory if exists
  const refsDir = join(skillSrc, 'references');
  if (existsSync(refsDir)) {
    const refsDestDir = join(outputDir, 'references');
    mkdirSync(refsDestDir, { recursive: true });
    
    // Copy reference files
    // - L2 platforms: exclude l1-guidance.md (not needed, have hooks)
    // - L1 platforms: exclude l1-guidance.md (already appended to SKILL.md)
    const refFiles = readdirSync(refsDir);
    for (const file of refFiles) {
      if (file !== 'l1-guidance.md') {
        cpSync(join(refsDir, file), join(refsDestDir, file), { recursive: true });
      }
    }
  }
  
  return true;
}

/**
 * Build all skills for all platforms
 */
function buildSkills() {
  console.log('\n📦 Building skills...');
  
  // Create dist directory
  mkdirSync(DIST_DIR, { recursive: true });
  
  // L2 platforms
  console.log('\n  ═══ L2 Platforms (Skills + Hooks) ═══');
  for (const platform of PLATFORMS.filter(p => !L1_PLATFORMS.includes(p))) {
    console.log(`\n  Building for ${platform}...`);
    
    for (const skill of SKILLS) {
      const success = buildSkill(skill, platform);
      if (success) {
        console.log(`    ✓ ${skill}`);
      } else {
        console.log(`    ✗ ${skill} (failed)`);
      }
    }
  }
  
  // L1 platforms
  console.log('\n  ═══ L1 Platforms (Skills only) ═══');
  for (const platform of L1_PLATFORMS) {
    console.log(`\n  Building for ${platform}...`);
    
    for (const skill of SKILLS) {
      const success = buildSkill(skill, platform);
      if (success) {
        console.log(`    ✓ ${skill} (with L1 guidance)`);
      } else {
        console.log(`    ✗ ${skill} (failed)`);
      }
    }
  }
}

/**
 * Copy config files
 */
function copyConfig() {
  console.log('\n📋 Copying config...');
  
  const configSrc = join(REPO_ROOT, 'config');
  const configDest = join(PROJECT_ROOT, 'config');
  
  if (existsSync(configSrc)) {
    // Create destination directory
    mkdirSync(configDest, { recursive: true });
    
    // Copy and process each file
    const configFiles = readdirSync(configSrc);
    for (const file of configFiles) {
      const srcPath = join(configSrc, file);
      const destPath = join(configDest, file);
      
      if (file.endsWith('.yaml') || file.endsWith('.yml')) {
        // Inject version for YAML files
        let content = readFileSync(srcPath, 'utf-8');
        content = injectVersion(content);
        writeFileSync(destPath, content, 'utf-8');
        console.log(`  ✓ Processed ${file} (version: ${VERSION})`);
      } else {
        // Copy other files as-is
        cpSync(srcPath, destPath);
        console.log(`  ✓ Copied ${file}`);
      }
    }
  }
}

/**
 * Copy shared assets to assets/ directory for export command
 * 
 * Creates a clean source of skills without platform-specific modifications:
 * - Base SKILL.md (no L1 guidance appended)
 * - references/ directory
 * - l1-guidance.md (for optional injection)
 */
function copyAssets() {
  console.log('\n📁 Copying assets for export...');
  
  const assetsDir = join(PROJECT_ROOT, 'assets');
  mkdirSync(assetsDir, { recursive: true });
  
  // Copy l1-guidance.md
  const l1GuidanceSrc = join(SKILLS_SRC, 'discuss-for-specs', 'references', 'l1-guidance.md');
  const l1GuidanceDest = join(assetsDir, 'l1-guidance.md');
  
  if (existsSync(l1GuidanceSrc)) {
    cpSync(l1GuidanceSrc, l1GuidanceDest);
    console.log('  ✓ l1-guidance.md');
  }
  
  // Copy clean skill source (without L1 guidance injection)
  for (const skill of SKILLS) {
    const skillSrc = join(SKILLS_SRC, skill);
    const skillDest = join(assetsDir, skill);
    
    if (!existsSync(skillSrc)) continue;
    
    mkdirSync(skillDest, { recursive: true });
    
    // Copy SKILL.md with base header (use claude-code header as the base)
    const skillMd = join(skillSrc, 'SKILL.md');
    const headerFile = join(skillSrc, 'headers', 'claude-code.yaml');
    
    if (existsSync(skillMd)) {
      let skillContent = readFileSync(skillMd, 'utf-8');
      let header = '';
      
      if (existsSync(headerFile)) {
        let headerYaml = readFileSync(headerFile, 'utf-8').trim();
        headerYaml = injectVersion(headerYaml);
        if (headerYaml.startsWith('---')) {
          header = headerYaml + '\n\n';
        } else {
          header = `---\n${headerYaml}\n---\n\n`;
        }
      }
      
      const finalContent = header + skillContent;
      writeFileSync(join(skillDest, 'SKILL.md'), finalContent, 'utf-8');
      console.log(`  ✓ ${skill}/SKILL.md`);
    }
    
    // Copy references directory (excluding l1-guidance.md, it's at assets root)
    const refsDir = join(skillSrc, 'references');
    if (existsSync(refsDir)) {
      const refsDestDir = join(skillDest, 'references');
      mkdirSync(refsDestDir, { recursive: true });
      
      const refFiles = readdirSync(refsDir);
      for (const file of refFiles) {
        if (file !== 'l1-guidance.md') {
          cpSync(join(refsDir, file), join(refsDestDir, file), { recursive: true });
        }
      }
      console.log(`  ✓ ${skill}/references/`);
    }
  }
}

/**
 * Copy README.md from repository root to npm-package for NPM publishing.
 * Rewrites relative paths to absolute GitHub URLs so images and links
 * render correctly on npmjs.com.
 */
function copyReadme() {
  console.log('\n📄 Copying README...');
  
  const readmeSrc = join(REPO_ROOT, 'README.md');
  const readmeDest = join(PROJECT_ROOT, 'README.md');
  
  if (!existsSync(readmeSrc)) {
    console.warn('  ⚠ README.md not found at repository root');
    return;
  }

  const repoUrl = packageJson.repository?.url?.replace(/^git\+/, '').replace(/\.git$/, '') 
    || 'https://github.com/alienzhou/skill-discuss-for-specs';
  const branch = 'main';
  const rawBase = repoUrl.replace('github.com', 'raw.githubusercontent.com') + `/${branch}/`;
  const blobBase = `${repoUrl}/blob/${branch}/`;

  let content = readFileSync(readmeSrc, 'utf-8');

  // ![alt](./path) or ![alt](path) -> absolute raw URL (for images)
  content = content.replace(
    /!\[([^\]]*)\]\((?!https?:\/\/)\.?\/?([^)]+)\)/g,
    (_, alt, path) => `![${alt}](${rawBase}${path})`
  );

  // [text](./path) or [text](path) that are not images and not anchors -> absolute blob URL
  content = content.replace(
    /(?<!!)\[([^\]]*)\]\((?!https?:\/\/)(?!#)\.?\/?([^)]+)\)/g,
    (_, text, path) => `[${text}](${blobBase}${path})`
  );

  writeFileSync(readmeDest, content, 'utf-8');
  console.log('  ✓ README.md (with absolute URLs for npmjs.com)');
}

/**
 * Main build function
 */
function main() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  Building discuss-skills npm package');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  copyHooks();
  buildSkills();
  copyConfig();
  copyAssets();
  copyReadme();
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  ✅ Build complete!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main();
