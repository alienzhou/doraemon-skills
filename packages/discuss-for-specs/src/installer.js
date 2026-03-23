/**
 * Installation and uninstallation logic
 */

import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

import {
  checkPythonEnvironment,
  copyDirectory,
  removeDirectory,
  ensureDirectory,
  getHooksDir,
  getLogsDir,
  getPackageRoot
} from './utils.js';

import {
  PLATFORMS,
  detectPlatform,
  getPlatformConfig,
  getSkillsDir,
  getProjectHooksDir,
  installHooksConfig,
  removeHooksConfig,
  platformSupportsStopHook,
  cleanupOldHooksConfig
} from './platform-config.js';

import {
  showBanner,
  createSpinner,
  success,
  error,
  info,
  warning,
  newline,
  showCompletionBox,
  showUninstallBox,
  colors
} from './ui.js';

/**
 * List supported platforms
 * @param {Object} options - Options
 * @param {boolean} options.showStatus - Show detailed installation status
 */
export function listPlatforms(options = {}) {
  newline();
  console.log(colors.bold('Supported Platforms'));
  newline();
  
  const detected = detectPlatform();
  
  // Table header
  console.log(colors.dim('  Level  Platform      Description                    Status'));
  console.log(colors.dim('  ─────  ────────────  ─────────────────────────────  ──────────'));
  
  // Group platforms by level
  const l2Platforms = Object.entries(PLATFORMS).filter(([, config]) => config.level === 'L2');
  const l1Platforms = Object.entries(PLATFORMS).filter(([, config]) => config.level === 'L1');
  
  // L2 Platforms
  for (const [id, config] of l2Platforms) {
    const isDetected = detected.includes(id);
    const status = isDetected 
      ? colors.success('● detected') 
      : colors.dim('○ not found');
    const level = colors.primary('L2');
    const platformId = colors.bold(id.padEnd(12));
    const description = config.name.padEnd(29);
    
    console.log(`  ${level}     ${platformId}  ${description}  ${status}`);
  }
  
  // L1 Platforms
  for (const [id, config] of l1Platforms) {
    const isDetected = detected.includes(id);
    const status = isDetected 
      ? colors.success('● detected') 
      : colors.dim('○ not found');
    const level = colors.dim('L1');
    const platformId = colors.bold(id.padEnd(12));
    const description = config.name.padEnd(29);
    
    console.log(`  ${level}     ${platformId}  ${description}  ${status}`);
  }
  
  newline();
  
  // Legend
  console.log(colors.dim('  L2 = Skills + Hooks (auto-reminder support)'));
  console.log(colors.dim('  L1 = Skills only (manual precipitation)'));
  
  newline();
  
  // Summary
  if (detected.length > 0) {
    console.log(colors.success(`  ${detected.length} platform(s) detected: `) + 
      detected.map(id => colors.bold(id)).join(', '));
  } else {
    console.log(colors.warning('  No platforms detected'));
    console.log(colors.dim('  Install a supported AI assistant first, or use --platform flag'));
  }
  
  newline();
  console.log(colors.dim('  Usage: discuss-for-specs install -p <platform>'));
  newline();
}

/**
 * Install skills and hooks
 * 
 * @param {Object} options - Install options
 */
export async function install(options = {}) {
  // Show banner
  showBanner();

  // 1. Check Python environment
  let spinner = createSpinner('Checking Python environment...');
  spinner.start();
  
  const pythonCheck = await checkPythonEnvironment();
  
  if (!pythonCheck.success) {
    spinner.fail('Python environment check failed');
    error(
      'Python 3 is required but was not found',
      'brew install python3  # macOS\nsudo apt install python3  # Ubuntu'
    );
    throw new Error('Python environment check failed. Please install Python 3 and PyYAML.');
  }
  spinner.succeed('Python environment OK');

  // 2. Validate platform (now required)
  const targetPlatform = options.platform;
  const platformConfig = getPlatformConfig(targetPlatform);
  
  // 3. Handle target directory for project-level installation
  let targetDir = null;
  let isProjectLevel = false;
  
  if (options.target) {
    const { resolve } = await import('path');
    targetDir = resolve(options.target.replace(/^~/, process.env.HOME || ''));
    isProjectLevel = true;
    
    if (!existsSync(targetDir)) {
      error(`Target directory does not exist: ${targetDir}`);
      throw new Error(`Target directory does not exist: ${targetDir}`);
    }
  }
  
  if (isProjectLevel) {
    newline();
    info(`Installing for ${colors.bold(platformConfig.name)} (project-level)`);
    console.log(colors.dim(`  Target: ${targetDir}`));
  } else {
    newline();
    info(`Installing for ${colors.bold(platformConfig.name)} (user-level)`);
  }

  // 4. Clean up old hooks configuration (migration from old path)
  // This prevents duplicate hook triggers when upgrading from old version
  const isL2Platform = platformSupportsStopHook(targetPlatform);
  if (isL2Platform) {
    const oldConfigCleaned = cleanupOldHooksConfig(targetPlatform, { targetDir: isProjectLevel ? targetDir : null });
    if (oldConfigCleaned) {
      newline();
      info('Cleaned up old hooks configuration (migrating to new path)');
    }
  }

  // 5. Get package root (where dist/ and hooks/ are)
  const packageRoot = getPackageRoot();
  
  // 6. Install Skills (unless skipped)
  if (!options.skipSkills) {
    newline();
    spinner = createSpinner('Installing Skills...');
    spinner.start();
    
    const distDir = join(packageRoot, 'dist', targetPlatform);
    const skillsDir = getSkillsDir(targetPlatform, targetDir);
    
    if (!existsSync(distDir)) {
      spinner.warn(`No pre-built skills found for ${targetPlatform}`);
    } else {
      ensureDirectory(skillsDir);
      
      // Copy each skill (merged into single discuss-for-specs as per D7)
      const skills = ['discuss-for-specs'];
      const installedSkills = [];
      
      for (const skill of skills) {
        const srcSkill = join(distDir, skill);
        const destSkill = join(skillsDir, skill);
        
        if (existsSync(srcSkill)) {
          copyDirectory(srcSkill, destSkill);
          installedSkills.push(skill);
          
          // Inject L1 guidance if platform doesn't support stop hook
          if (!platformSupportsStopHook(targetPlatform)) {
            const skillMdPath = join(destSkill, 'SKILL.md');
            const l1GuidancePath = join(srcSkill, 'references', 'l1-guidance.md');
            
            if (existsSync(skillMdPath) && existsSync(l1GuidancePath)) {
              try {
                const skillContent = readFileSync(skillMdPath, 'utf-8');
                const l1Guidance = readFileSync(l1GuidancePath, 'utf-8');
                
                // Extract content layer (skip metadata comments)
                const guidanceLines = l1Guidance.split('\n');
                const contentStart = guidanceLines.findIndex(line => 
                  line.trim().startsWith('##') && !line.trim().startsWith('## 📝')
                );
                const contentEnd = guidanceLines.findIndex((line, idx) => 
                  idx > contentStart && line.trim().startsWith('##') && !line.trim().startsWith('## 📝')
                );
                
                let guidanceContent = '';
                if (contentStart >= 0) {
                  const startIdx = guidanceLines.findIndex((line, idx) => 
                    idx >= contentStart && line.trim().startsWith('## 📝')
                  );
                  const endIdx = contentEnd >= 0 ? contentEnd : guidanceLines.length;
                  guidanceContent = guidanceLines.slice(startIdx, endIdx).join('\n').trim();
                } else {
                  // Fallback: use everything after first ##
                  const firstHeader = guidanceLines.findIndex(line => line.trim().startsWith('##'));
                  if (firstHeader >= 0) {
                    guidanceContent = guidanceLines.slice(firstHeader).join('\n').trim();
                  }
                }
                
                // Find injection point: after "Your Responsibilities" section
                const responsibilitiesMarker = '## 🎯 Your Responsibilities';
                const responsibilitiesIndex = skillContent.indexOf(responsibilitiesMarker);
                
                if (responsibilitiesIndex >= 0 && guidanceContent) {
                  // Find the end of "Your Responsibilities" section (next ## or ---)
                  const afterMarker = skillContent.substring(responsibilitiesIndex);
                  const nextSectionMatch = afterMarker.match(/\n(## |---)/);
                  const injectionPoint = nextSectionMatch 
                    ? responsibilitiesIndex + nextSectionMatch.index + 1
                    : responsibilitiesIndex + afterMarker.length;
                  
                  // Inject guidance
                  const before = skillContent.substring(0, injectionPoint);
                  const after = skillContent.substring(injectionPoint);
                  const updatedContent = before + '\n\n' + guidanceContent + '\n\n' + after;
                  
                  writeFileSync(skillMdPath, updatedContent, 'utf-8');
                  // L1 guidance injected successfully
                }
              } catch (e) {
                // Silent - L1 guidance injection is optional, continue on error
              }
            }
          }
        }
      }
      
      spinner.succeed('Skills installed');
      installedSkills.forEach(skill => success(skill, true));
    }
  }

  // 7. Install Hooks (unless skipped)
  // For project-level: install hooks to ${projectDir}/.vibe-x/discuss-for-specs/hooks/
  // For user-level: install hooks to ~/.vibe-x/discuss-for-specs/hooks/
  // Note: L1 platforms don't have hooks support, skip for them
  
  if (!options.skipHooks && isL2Platform) {
    newline();
    spinner = createSpinner('Installing Hooks...');
    spinner.start();
    
    const srcHooks = join(packageRoot, 'hooks');
    
    // Determine hooks destination based on installation mode
    let destHooks;
    if (isProjectLevel) {
      // Project-level: install hooks to ${projectDir}/.vibe-x/discuss-for-specs/hooks/
      destHooks = getProjectHooksDir(targetPlatform, targetDir);
      spinner.text = 'Installing Hooks (project-level)...';
    } else {
      // User-level: install hooks to ~/.vibe-x/discuss-for-specs/hooks/
      destHooks = getHooksDir();
      spinner.text = 'Installing Hooks (user-level)...';
    }
    
    if (!existsSync(srcHooks)) {
      spinner.fail('Hooks source not found');
      throw new Error(`Hooks source not found: ${srcHooks}`);
    }
    
    // Copy hooks to destination directory
    copyDirectory(srcHooks, destHooks);
    
    // Apply stale_threshold if specified
    if (options.staleThreshold !== undefined) {
      const threshold = options.staleThreshold;
      
      // Validate threshold (must be non-negative integer)
      if (!Number.isInteger(threshold) || threshold < 0) {
        spinner.fail('Invalid stale-threshold value');
        throw new Error('--stale-threshold must be a non-negative integer (0 = disabled)');
      }
      
      // Update snapshot_manager.py DEFAULT_STALE_THRESHOLD
      const snapshotManagerPath = join(destHooks, 'common', 'snapshot_manager.py');
      if (existsSync(snapshotManagerPath)) {
        let content = readFileSync(snapshotManagerPath, 'utf-8');
        content = content.replace(
          /DEFAULT_STALE_THRESHOLD\s*=\s*\d+/,
          `DEFAULT_STALE_THRESHOLD = ${threshold}`
        );
        writeFileSync(snapshotManagerPath, content, 'utf-8');
      }
    }
    
    // Create logs directory
    const logsDir = getLogsDir();
    ensureDirectory(logsDir);
    
    spinner.succeed('Hooks installed');
    success(`Copied to ${destHooks}`, true);
    if (options.staleThreshold !== undefined) {
      success(`Stale threshold: ${options.staleThreshold}${options.staleThreshold === 0 ? ' (disabled)' : ' rounds'}`, true);
    }
    success(`Logs directory: ${logsDir}`, true);
    
    // Configure platform hooks
    newline();
    spinner = createSpinner('Configuring platform hooks...');
    spinner.start();
    installHooksConfig(targetPlatform, { targetDir: isProjectLevel ? targetDir : null, hooksDir: destHooks });
    spinner.succeed('Platform hooks configured');
  } else if (!options.skipHooks && !isL2Platform) {
    // L1 platform - inform user that hooks are not applicable
    newline();
    info(`${colors.dim('Hooks not applicable for L1 platform (no auto-reminder)')}`);
    info(`${colors.dim('Use "Precipitation Discipline" section in SKILL.md for manual reminders')}`);
  }

  // 8. Done - show completion box
  const components = [];
  if (!options.skipSkills) {
    components.push(`Skills: ${getSkillsDir(targetPlatform, targetDir)}`);
  }
  if (!options.skipHooks && isL2Platform) {
    if (isProjectLevel) {
      components.push(`Hooks: ${getProjectHooksDir(targetPlatform, targetDir)}`);
    } else {
      components.push(`Hooks: ${getHooksDir()}`);
      components.push(`Logs: ${getLogsDir()}`);
    }
  }
  
  const nextSteps = [`Open ${platformConfig.name}`];
  if (targetDir) {
    nextSteps.push(`Open project: ${targetDir}`);
  }
  nextSteps.push('Start a discussion with your AI assistant');
  if (isL2Platform) {
    nextSteps.push('The hooks will automatically track your progress');
  } else {
    nextSteps.push('Remember to document decisions (L1 platform - no auto-reminder)');
  }
  
  showCompletionBox({ components, nextSteps });
}

/**
 * Uninstall skills and hooks
 * 
 * @param {Object} options - Uninstall options
 */
export async function uninstall(options = {}) {
  // Show banner
  showBanner();

  // 1. Validate platform (now required)
  const targetPlatform = options.platform;
  const platformConfig = getPlatformConfig(targetPlatform);

  // Show banner
  showBanner();
  newline();
  info(`Uninstalling from ${colors.bold(platformConfig.name)}`);
  
  // Handle target directory for project-level uninstallation
  let targetDir = null;
  let isProjectLevel = false;
  
  if (options.target) {
    const { resolve } = await import('path');
    targetDir = resolve(options.target.replace(/^~/, process.env.HOME || ''));
    isProjectLevel = true;
    console.log(colors.dim(`  Target: ${targetDir}`));
  }

  // 2. Remove Skills
  if (!options.keepSkills) {
    newline();
    let spinner = createSpinner('Removing Skills...');
    spinner.start();
    
    const skillsDir = getSkillsDir(targetPlatform, targetDir);
    const skills = ['discuss-for-specs'];
    const removedSkills = [];
    
    for (const skill of skills) {
      const skillPath = join(skillsDir, skill);
      if (existsSync(skillPath)) {
        removeDirectory(skillPath);
        removedSkills.push(skill);
      }
    }
    
    if (removedSkills.length > 0) {
      spinner.succeed('Skills removed');
      removedSkills.forEach(skill => success(skill, true));
    } else {
      spinner.info('No skills to remove');
    }
  }

  // 3. Remove Hooks
  if (!options.keepHooks) {
    newline();
    let spinner = createSpinner('Removing Hooks...');
    spinner.start();
    
    let hooksDir;
    if (isProjectLevel) {
      hooksDir = getProjectHooksDir(targetPlatform, targetDir);
    } else {
      hooksDir = getHooksDir();
    }
    
    if (existsSync(hooksDir)) {
      removeDirectory(hooksDir);
      spinner.succeed('Hooks removed');
      success(hooksDir, true);
    } else {
      spinner.info('No hooks to remove');
    }
    
    // Remove hooks from platform config
    newline();
    spinner = createSpinner('Removing platform hooks configuration...');
    spinner.start();
    removeHooksConfig(targetPlatform, targetDir);
    spinner.succeed('Platform hooks configuration removed');
  }

  // 4. Done
  const noteMessage = isProjectLevel 
    ? 'Project-level installation removed.'
    : 'Note: Logs directory was preserved at ~/.vibe-x/discuss-for-specs/logs/\nDelete it manually if you want to remove all data.';
  
  showUninstallBox(
    'Uninstallation complete!',
    noteMessage
  );
}

/**
 * Export skills to a raw directory (without platform structure)
 * 
 * This function exports skills directly to the specified directory,
 * without creating the .{platform}/skills/ structure. Useful for:
 * - Unsupported platforms where user manages integration manually
 * - Custom deployment scenarios
 * - Testing and development
 * 
 * @param {string} targetDir - Target directory for export
 * @param {Object} options - Export options
 * @param {boolean} options.includeL1Guidance - Include L1 platform guidance in SKILL.md
 */
export async function exportSkills(targetDir, options = {}) {
  // Show banner
  showBanner();
  
  const { resolve } = await import('path');
  const resolvedDir = resolve(targetDir.replace(/^~/, process.env.HOME || ''));
  
  newline();
  info(`Exporting skills to: ${colors.bold(resolvedDir)}`);
  
  // Ensure target directory exists
  if (!existsSync(resolvedDir)) {
    ensureDirectory(resolvedDir);
    info(`Created directory: ${resolvedDir}`);
  }
  
  // Get package root
  const packageRoot = getPackageRoot();
  
  // Use assets directory as the clean source (no platform-specific modifications)
  const assetsDir = join(packageRoot, 'assets');
  
  if (!existsSync(assetsDir)) {
    error('Assets directory not found', `Expected at: ${assetsDir}`);
    throw new Error(`Assets directory not found: ${assetsDir}`);
  }
  
  // Copy skills directly to target directory
  newline();
  let spinner = createSpinner('Exporting skills...');
  spinner.start();
  
  const skills = ['discuss-for-specs'];
  const exportedSkills = [];
  
  for (const skill of skills) {
    const srcSkill = join(assetsDir, skill);
    const destSkill = join(resolvedDir, skill);
    
    if (existsSync(srcSkill)) {
      copyDirectory(srcSkill, destSkill);
      exportedSkills.push(skill);
      
      // Inject L1 guidance if requested
      if (options.includeL1Guidance) {
        const skillMdPath = join(destSkill, 'SKILL.md');
        // L1 guidance is in assets/ directory (copied during build)
        const l1GuidancePath = join(packageRoot, 'assets', 'l1-guidance.md');
        
        if (existsSync(skillMdPath) && existsSync(l1GuidancePath)) {
          try {
            const skillContent = readFileSync(skillMdPath, 'utf-8');
            const l1Guidance = readFileSync(l1GuidancePath, 'utf-8');
            
            // Use entire l1-guidance.md content (it's already clean)
            const guidanceContent = l1Guidance.trim();
            
            // Find injection point: after "Your Responsibilities" section
            const responsibilitiesMarker = '## 🎯 Your Responsibilities';
            const responsibilitiesIndex = skillContent.indexOf(responsibilitiesMarker);
            
            if (responsibilitiesIndex >= 0 && guidanceContent) {
              // Find the end of "Your Responsibilities" section (next ## or ---)
              const afterMarker = skillContent.substring(responsibilitiesIndex);
              const nextSectionMatch = afterMarker.match(/\n(## |---)/);
              const injectionPoint = nextSectionMatch 
                ? responsibilitiesIndex + nextSectionMatch.index + 1
                : responsibilitiesIndex + afterMarker.length;
              
              // Inject guidance
              const before = skillContent.substring(0, injectionPoint);
              const after = skillContent.substring(injectionPoint);
              const updatedContent = before + '\n\n' + guidanceContent + '\n\n' + after;
              
              writeFileSync(skillMdPath, updatedContent, 'utf-8');
            }
          } catch (e) {
            // Silent - L1 guidance injection is optional
          }
        }
      }
    }
  }
  
  spinner.succeed('Skills exported');
  exportedSkills.forEach(skill => success(skill, true));
  
  if (options.includeL1Guidance) {
    success('L1 guidance included', true);
  }
  
  // Show completion message
  newline();
  console.log(colors.success('✔') + colors.bold(' Export complete!'));
  newline();
  console.log(colors.dim('  Exported to: ') + resolvedDir);
  console.log(colors.dim('  Skills: ') + exportedSkills.join(', '));
  newline();
  console.log(colors.dim('  Note: No hooks installed. For auto-reminder support,'));
  console.log(colors.dim('  use "install" command with a supported platform.'));
  newline();
}
