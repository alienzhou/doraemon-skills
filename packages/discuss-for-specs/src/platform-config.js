/**
 * Platform configuration management
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync, chmodSync } from 'fs';
import { join, dirname } from 'path';
import { getHomeDir, getHooksDir } from './utils.js';

/**
 * Supported platforms
 */
export const PLATFORMS = {
  'claude-code': {
    name: 'Claude Code',
    configDir: '.claude',
    skillsDir: 'skills',
    settingsFile: 'settings.json',
    hooksFormat: 'claude-code',
    level: 'L2'
  },
  'cursor': {
    name: 'Cursor',
    configDir: '.cursor',
    skillsDir: 'skills',
    settingsFile: 'hooks.json',
    hooksFormat: 'cursor',
    level: 'L2'
  },
  'cline': {
    name: 'Cline',
    configDir: '.cline',
    skillsDir: 'skills',
    settingsFile: null,  // Cline uses shell scripts in Hooks/ directory
    hooksFormat: 'cline',
    level: 'L2'
  },
  'kilocode': {
    name: 'Kilocode',
    configDir: '.kilocode',
    skillsDir: 'skills',
    settingsFile: null,
    hooksFormat: null,
    level: 'L1'
  },
  'opencode': {
    name: 'OpenCode',
    configDir: '.opencode',
    globalConfigDir: '.config/opencode',
    skillsDir: 'skills',
    settingsFile: null,
    hooksFormat: null,
    level: 'L1'
  },
  'codex': {
    name: 'Codex CLI',
    configDir: '.codex',
    skillsDir: 'skills',
    settingsFile: null,
    hooksFormat: null,
    level: 'L1'
  },
  'trae': {
    name: 'Trae',
    configDir: '.trae',
    skillsDir: 'skills',
    settingsFile: null,
    hooksFormat: null,
    level: 'L1'
  },
  'qoder': {
    name: 'Qoder',
    configDir: '.qoder',
    skillsDir: 'skills',
    settingsFile: null,
    hooksFormat: null,
    level: 'L1'
  },
  'roo-code': {
    name: 'Roo-Code',
    configDir: '.roo',
    skillsDir: 'skills',
    settingsFile: null,
    hooksFormat: null,
    level: 'L1'
  },
  'codeflicker': {
    name: 'CodeFlicker',
    configDir: '.codeflicker',
    skillsDir: 'skills',
    settingsFile: null,
    hooksFormat: null,
    level: 'L1'
  }
};

/**
 * Detect which platform(s) are installed
 * 
 * @returns {string[]} Array of detected platform IDs
 */
export function detectPlatform() {
  const detected = [];
  const home = getHomeDir();

  for (const [id, config] of Object.entries(PLATFORMS)) {
    const configPath = join(home, config.configDir);
    if (existsSync(configPath)) {
      detected.push(id);
    }
  }

  return detected;
}

/**
 * Get platform configuration
 * 
 * @param {string} platformId - Platform ID
 * @returns {Object} Platform configuration
 */
export function getPlatformConfig(platformId) {
  const config = PLATFORMS[platformId];
  if (!config) {
    throw new Error(`Unknown platform: ${platformId}. Supported: ${Object.keys(PLATFORMS).join(', ')}`);
  }
  return config;
}

/**
 * Get the skills directory for a platform
 * 
 * @param {string} platformId - Platform ID
 * @param {string} [targetDir] - Optional target project directory for local installation
 * @returns {string} Skills directory path
 */
export function getSkillsDir(platformId, targetDir = null) {
  const config = getPlatformConfig(platformId);
  
  if (targetDir) {
    // Project-level installation: install to target/.cursor/skills or target/.claude/skills
    return join(targetDir, config.configDir, config.skillsDir);
  }
  
  // Global installation: use globalConfigDir if specified, otherwise configDir
  // e.g., OpenCode uses ~/.config/opencode/skills instead of ~/.opencode/skills
  const globalDir = config.globalConfigDir || config.configDir;
  return join(getHomeDir(), globalDir, config.skillsDir);
}

/**
 * Get the settings file path for a platform
 * 
 * @param {string} platformId - Platform ID
 * @param {string} [targetDir] - Optional target project directory for project-level installation
 * @returns {string} Settings file path
 */
export function getSettingsPath(platformId, targetDir = null) {
  const config = getPlatformConfig(platformId);
  
  if (targetDir) {
    // Project-level: install to target/.{platform}/settings.json
    return join(targetDir, config.configDir, config.settingsFile);
  }
  
  // User-level: install to ~/.{platform}/settings.json
  return join(getHomeDir(), config.configDir, config.settingsFile);
}

/**
 * Check if platform supports stop hook (L2 capability)
 * 
 * L2 platforms (claude-code, cursor, cline) support stop hook.
 * L1 platforms (kilocode, opencode, codex, trae, qoder, roo-code, codeflicker) do not have hooks.
 * 
 * @param {string} platformId - Platform ID
 * @returns {boolean} True if platform supports stop hook
 */
export function platformSupportsStopHook(platformId) {
  const config = PLATFORMS[platformId];
  return config?.level === 'L2';
}

/**
 * Generate hooks configuration for Claude Code
 * 
 * @param {string} hooksDir - Hooks directory path
 */
function generateClaudeCodeHooksConfig(hooksDir) {
  return {
    Stop: [{
      matcher: "",
      hooks: [{
        type: "command",
        command: `python3 ${join(hooksDir, 'stop', 'check_precipitation.py')}`
      }]
    }]
  };
}

/**
 * Generate hooks configuration for Cursor
 * 
 * @param {string} hooksDir - Hooks directory path
 */
function generateCursorHooksConfig(hooksDir) {
  return {
    version: 1,
    hooks: {
      stop: [{
        command: `python3 ${join(hooksDir, 'stop', 'check_precipitation.py')}`
      }]
    }
  };
}

/**
 * Generate hooks script for Cline (TaskComplete hook)
 * 
 * Cline uses shell scripts in ~/Documents/Cline/Hooks/ directory
 * with naming convention: task_complete.sh
 * 
 * @param {string} hooksDir - Hooks directory path
 * @returns {string} Shell script content
 */
function generateClineHooksScript(hooksDir) {
  return `#!/bin/bash
# Cline TaskComplete hook for discuss-for-specs
# This script is called when Cline completes a task

python3 "${join(hooksDir, 'stop', 'check_precipitation.py')}"
`;
}

/**
 * Get project-level hooks directory
 * 
 * New structure: ${projectDir}/.vibe-x/discuss-for-specs/hooks/
 * 
 * @param {string} platformId - Platform ID (kept for API compatibility, not used in new structure)
 * @param {string} targetDir - Target project directory
 * @returns {string} Hooks directory path
 */
export function getProjectHooksDir(platformId, targetDir) {
  return join(targetDir, '.vibe-x', 'discuss-for-specs', 'hooks');
}

/**
 * Get old project-level hooks directory (for migration)
 * 
 * Old structure: ${projectDir}/.{platform}/hooks/
 * 
 * @param {string} platformId - Platform ID
 * @param {string} targetDir - Target project directory
 * @returns {string} Old hooks directory path
 */
export function getOldProjectHooksDir(platformId, targetDir) {
  const config = getPlatformConfig(platformId);
  return join(targetDir, config.configDir, 'hooks');
}

/**
 * Get old user-level hooks directory (for migration)
 * 
 * Old structure: ~/.discuss-for-specs/hooks/
 * 
 * @returns {string} Old hooks directory path
 */
export function getOldHooksDir() {
  return join(getHomeDir(), '.discuss-for-specs', 'hooks');
}

/**
 * Clean up old hooks configuration from platform settings
 * 
 * This removes hooks that reference the old path (~/.discuss-for-specs/hooks/)
 * to prevent duplicate hook triggers when upgrading to new version.
 * 
 * @param {string} platformId - Platform ID
 * @param {Object} [options] - Options
 * @param {string} [options.targetDir] - Target project directory for project-level cleanup
 * @returns {boolean} True if old config was found and cleaned
 */
export function cleanupOldHooksConfig(platformId, options = {}) {
  const config = getPlatformConfig(platformId);
  const { targetDir = null } = options;
  
  // L1 platforms don't have hooks support
  if (config.level === 'L1' || !config.hooksFormat) {
    return false;
  }
  
  const oldHooksPath = '.discuss-for-specs/hooks';
  let cleaned = false;
  
  if (config.hooksFormat === 'claude-code') {
    const settingsPath = getSettingsPath(platformId, targetDir);
    
    if (!existsSync(settingsPath)) {
      return false;
    }
    
    try {
      const settings = JSON.parse(readFileSync(settingsPath, 'utf-8'));
      
      if (settings.hooks?.Stop) {
        const originalLength = settings.hooks.Stop.length;
        // Remove hooks that reference old path
        settings.hooks.Stop = settings.hooks.Stop.filter(
          h => !JSON.stringify(h).includes(oldHooksPath)
        );
        
        if (settings.hooks.Stop.length < originalLength) {
          cleaned = true;
          if (settings.hooks.Stop.length === 0) {
            delete settings.hooks.Stop;
          }
          if (Object.keys(settings.hooks).length === 0) {
            delete settings.hooks;
          }
          writeFileSync(settingsPath, JSON.stringify(settings, null, 2), 'utf-8');
        }
      }
    } catch (e) {
      // Silent - old config may not exist or be invalid
    }
    
  } else if (config.hooksFormat === 'cursor') {
    const settingsPath = getSettingsPath(platformId, targetDir);
    
    if (!existsSync(settingsPath)) {
      return false;
    }
    
    try {
      const hooksConfig = JSON.parse(readFileSync(settingsPath, 'utf-8'));
      
      if (hooksConfig.hooks?.stop) {
        const originalLength = hooksConfig.hooks.stop.length;
        // Remove hooks that reference old path
        hooksConfig.hooks.stop = hooksConfig.hooks.stop.filter(
          h => !h.command?.includes(oldHooksPath)
        );
        
        if (hooksConfig.hooks.stop.length < originalLength) {
          cleaned = true;
          if (hooksConfig.hooks.stop.length === 0) {
            delete hooksConfig.hooks.stop;
          }
          writeFileSync(settingsPath, JSON.stringify(hooksConfig, null, 2), 'utf-8');
        }
      }
    } catch (e) {
      // Silent - old config may not exist or be invalid
    }
    
  } else if (config.hooksFormat === 'cline') {
    // Cline: check if old script references old path
    let clineHooksDir;
    if (targetDir) {
      clineHooksDir = join(targetDir, '.clinerules', 'hooks');
    } else {
      clineHooksDir = join(getHomeDir(), 'Documents', 'Cline', 'Hooks');
    }
    
    const scriptPath = join(clineHooksDir, 'task_complete.sh');
    
    if (existsSync(scriptPath)) {
      try {
        const content = readFileSync(scriptPath, 'utf-8');
        if (content.includes(oldHooksPath)) {
          // Remove the old script - will be replaced with new one
          const { unlinkSync } = require('fs');
          unlinkSync(scriptPath);
          cleaned = true;
        }
      } catch (e) {
        // Silent
      }
    }
  }
  
  return cleaned;
}

/**
 * Install hooks configuration for a platform
 * 
 * @param {string} platformId - Platform ID
 * @param {Object} [options] - Options
 * @param {string} [options.targetDir] - Target project directory for project-level installation
 * @param {string} [options.hooksDir] - Hooks directory path (absolute or relative)
 * @returns {string|null} Settings path if configured, null if L1 platform (no hooks)
 */
export function installHooksConfig(platformId, options = {}) {
  const config = getPlatformConfig(platformId);
  const { targetDir = null, hooksDir = null } = options;
  
  // L1 platforms don't have hooks support
  if (config.level === 'L1' || !config.hooksFormat) {
    return null;
  }
  
  // Determine the hooks script path to use in configuration
  const effectiveHooksDir = hooksDir || getHooksDir();

  if (config.hooksFormat === 'claude-code') {
    const settingsPath = getSettingsPath(platformId, targetDir);
    // Claude Code: merge into existing settings.json
    let settings = {};
    
    if (existsSync(settingsPath)) {
      try {
        settings = JSON.parse(readFileSync(settingsPath, 'utf-8'));
      } catch (e) {
        // Silent - will create new file
      }
    }

    // Merge hooks configuration
    settings.hooks = {
      ...settings.hooks,
      ...generateClaudeCodeHooksConfig(effectiveHooksDir)
    };

    // Ensure parent directory exists for project-level installation
    const parentDir = dirname(settingsPath);
    if (!existsSync(parentDir)) {
      mkdirSync(parentDir, { recursive: true });
    }

    writeFileSync(settingsPath, JSON.stringify(settings, null, 2), 'utf-8');
    // Note: caller handles the success message
    return settingsPath;
    
  } else if (config.hooksFormat === 'cursor') {
    // Cursor: create/update hooks.json
    const settingsPath = getSettingsPath(platformId, targetDir);
    let hooksConfig = { version: 1, hooks: {} };
    
    if (existsSync(settingsPath)) {
      try {
        hooksConfig = JSON.parse(readFileSync(settingsPath, 'utf-8'));
      } catch (e) {
        console.warn(`Warning: Could not parse ${settingsPath}, creating new file`);
      }
    }

    const newConfig = generateCursorHooksConfig(effectiveHooksDir);
    hooksConfig.hooks = {
      ...hooksConfig.hooks,
      ...newConfig.hooks
    };

    // Ensure parent directory exists for project-level installation
    const parentDir = dirname(settingsPath);
    if (!existsSync(parentDir)) {
      mkdirSync(parentDir, { recursive: true });
    }

    writeFileSync(settingsPath, JSON.stringify(hooksConfig, null, 2), 'utf-8');
    // Note: caller handles the success message
    return settingsPath;
  } else if (config.hooksFormat === 'cline') {
    // Cline: create shell script in Hooks directory
    // User-level: ~/Documents/Cline/Hooks/task_complete.sh
    // Project-level: .clinerules/hooks/task_complete.sh
    
    let clineHooksDir;
    if (targetDir) {
      // Project-level
      clineHooksDir = join(targetDir, '.clinerules', 'hooks');
    } else {
      // User-level (~/Documents/Cline/Hooks/)
      clineHooksDir = join(getHomeDir(), 'Documents', 'Cline', 'Hooks');
    }
    
    // Ensure hooks directory exists
    if (!existsSync(clineHooksDir)) {
      mkdirSync(clineHooksDir, { recursive: true });
    }
    
    const scriptPath = join(clineHooksDir, 'task_complete.sh');
    const scriptContent = generateClineHooksScript(effectiveHooksDir);
    
    writeFileSync(scriptPath, scriptContent, 'utf-8');
    
    // Make script executable
    try {
      chmodSync(scriptPath, 0o755);
    } catch (e) {
      console.warn(`Warning: Could not make ${scriptPath} executable`);
    }
    
    return scriptPath;
  }
  
  return null;
}

/**
 * Remove hooks configuration for a platform
 * 
 * @param {string} platformId - Platform ID
 * @param {string} [targetDir] - Optional target project directory for project-level installation
 * @returns {string|null} Settings path if configured, null if L1 platform (no hooks)
 */
export function removeHooksConfig(platformId, targetDir = null) {
  const config = getPlatformConfig(platformId);
  
  // L1 platforms don't have hooks support
  if (config.level === 'L1' || !config.hooksFormat) {
    return null;
  }
  
  const settingsPath = getSettingsPath(platformId, targetDir);

  if (!existsSync(settingsPath)) {
    return null;
  }

  try {
    if (config.hooksFormat === 'claude-code') {
      const settings = JSON.parse(readFileSync(settingsPath, 'utf-8'));
      
      if (settings.hooks) {
        // Remove our specific hooks (those containing discuss-for-specs)
        for (const hookType of ['Stop']) {
          if (settings.hooks[hookType]) {
            settings.hooks[hookType] = settings.hooks[hookType].filter(
              h => !JSON.stringify(h).includes('discuss-for-specs')
            );
            if (settings.hooks[hookType].length === 0) {
              delete settings.hooks[hookType];
            }
          }
        }
        
        if (Object.keys(settings.hooks).length === 0) {
          delete settings.hooks;
        }
      }

      writeFileSync(settingsPath, JSON.stringify(settings, null, 2), 'utf-8');
      // Note: caller handles the success message
      
    } else if (config.hooksFormat === 'cursor') {
      const hooksConfig = JSON.parse(readFileSync(settingsPath, 'utf-8'));
      
      if (hooksConfig.hooks) {
        for (const hookType of ['stop']) {
          if (hooksConfig.hooks[hookType]) {
            hooksConfig.hooks[hookType] = hooksConfig.hooks[hookType].filter(
              h => !h.command?.includes('discuss-for-specs')
            );
            if (hooksConfig.hooks[hookType].length === 0) {
              delete hooksConfig.hooks[hookType];
            }
          }
        }
      }

      writeFileSync(settingsPath, JSON.stringify(hooksConfig, null, 2), 'utf-8');
      // Note: caller handles the success message
    }
  } catch (e) {
    // Silent - caller handles errors
  }
  
  return settingsPath;
}
