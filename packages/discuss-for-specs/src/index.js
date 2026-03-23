/**
 * discuss-skills main entry
 * 
 * Exports install, uninstall, and utility functions.
 */

export { install, uninstall, listPlatforms, exportSkills } from './installer.js';
export { runConfigCommand } from './config.js';
export { detectPlatform, getPlatformConfig } from './platform-config.js';
export { checkPythonEnvironment, copyDirectory } from './utils.js';
