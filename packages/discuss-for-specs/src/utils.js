/**
 * Utility functions for discuss-skills
 */

import { exec as execCallback } from 'child_process';
import { promisify } from 'util';
import { existsSync, mkdirSync, cpSync, rmSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const exec = promisify(execCallback);

/**
 * Get the home directory
 */
export function getHomeDir() {
  return homedir();
}

/**
 * Get the base directory path for discuss-for-specs
 * All data (hooks, logs, config) is stored under ~/.vibe-x/discuss-for-specs/
 */
export function getBaseDir() {
  return join(getHomeDir(), '.vibe-x', 'discuss-for-specs');
}

/**
 * Get the old base directory path (for migration)
 * @returns {string} Old base directory path (~/.discuss-for-specs)
 */
export function getOldBaseDir() {
  return join(getHomeDir(), '.discuss-for-specs');
}

/**
 * Get the config directory path (alias for getBaseDir for compatibility)
 */
export function getConfigDir() {
  return getBaseDir();
}

/**
 * Get the data directory path (alias for getBaseDir for compatibility)
 */
export function getDataDir() {
  return getBaseDir();
}

/**
 * Get the hooks installation path
 */
export function getHooksDir() {
  return join(getBaseDir(), 'hooks');
}

/**
 * Get the logs directory path
 */
export function getLogsDir() {
  return join(getBaseDir(), 'logs');
}

/**
 * Check Python environment and dependencies
 * 
 * Note: This function is silent (no console output) to work with ora spinners.
 * The caller should handle displaying the results.
 * 
 * @returns {Promise<{success: boolean, version?: string, errors: string[], warnings: string[], details: string[]}>}
 */
export async function checkPythonEnvironment() {
  const result = {
    success: true,
    version: null,
    errors: [],
    warnings: [],
    details: []  // Collected details for the caller to display
  };

  // Check Python 3
  try {
    const { stdout } = await exec('python3 --version');
    result.version = stdout.trim().replace('Python ', '');
    result.details.push(`Python ${result.version} detected`);
  } catch (error) {
    result.success = false;
    result.errors.push('Python 3 is not installed or not in PATH');
    return result;
  }

  // Check PyYAML
  try {
    await exec('python3 -c "import yaml"');
    result.details.push('PyYAML is installed');
  } catch (error) {
    result.warnings.push('PyYAML is not installed');
    result.details.push('PyYAML is not installed, attempting to install...');
    
    try {
      await exec('pip3 install pyyaml');
      result.details.push('PyYAML installed successfully');
    } catch (pipError) {
      result.success = false;
      result.errors.push('Failed to install PyYAML. Please install manually: pip3 install pyyaml');
    }
  }

  return result;
}

/**
 * Copy a directory recursively
 * 
 * @param {string} src - Source directory
 * @param {string} dest - Destination directory
 * @param {Object} options - Copy options
 */
export function copyDirectory(src, dest, options = {}) {
  const { overwrite = true } = options;

  if (!existsSync(src)) {
    throw new Error(`Source directory does not exist: ${src}`);
  }

  // Create destination directory
  if (!existsSync(dest)) {
    mkdirSync(dest, { recursive: true });
  }

  // Use cpSync for Node.js 16.7.0+
  try {
    cpSync(src, dest, { recursive: true, force: overwrite });
  } catch (error) {
    // Fallback for older Node.js versions
    copyDirectoryFallback(src, dest, overwrite);
  }
}

/**
 * Fallback copy for older Node.js versions
 */
function copyDirectoryFallback(src, dest, overwrite) {
  const entries = readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = join(src, entry.name);
    const destPath = join(dest, entry.name);

    if (entry.isDirectory()) {
      mkdirSync(destPath, { recursive: true });
      copyDirectoryFallback(srcPath, destPath, overwrite);
    } else {
      const { copyFileSync } = require('fs');
      if (overwrite || !existsSync(destPath)) {
        copyFileSync(srcPath, destPath);
      }
    }
  }
}

/**
 * Remove a directory recursively
 * 
 * @param {string} dir - Directory to remove
 */
export function removeDirectory(dir) {
  if (existsSync(dir)) {
    rmSync(dir, { recursive: true, force: true });
  }
}

/**
 * Ensure a directory exists
 * 
 * @param {string} dir - Directory path
 */
export function ensureDirectory(dir) {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

/**
 * Check if a directory exists and is not empty
 * 
 * @param {string} dir - Directory path
 * @returns {boolean}
 */
export function directoryExists(dir) {
  return existsSync(dir);
}

/**
 * Get the package root directory (where npm-package is)
 */
export function getPackageRoot() {
  // When installed via npm, __dirname will be in node_modules/discuss-skills/src
  // We need to go up to get the package root
  const url = new URL(import.meta.url);
  const currentDir = url.pathname.substring(0, url.pathname.lastIndexOf('/'));
  return join(currentDir, '..');
}
