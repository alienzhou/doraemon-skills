/**
 * Config management for .discuss/.snapshot.yaml
 *
 * Updates config section in snapshot file used by hooks.
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, resolve } from 'path';
import yaml from 'js-yaml';

const SNAPSHOT_FILE = '.snapshot.yaml';

/**
 * Get path to .discuss directory
 * @param {string} projectRoot - Project root (default: cwd)
 * @returns {string}
 */
export function getDiscussDir(projectRoot = process.cwd()) {
  return join(projectRoot.replace(/^~/, process.env.HOME || ''), '.discuss');
}

/**
 * Get path to snapshot file
 * @param {string} projectRoot
 * @returns {string}
 */
export function getSnapshotPath(projectRoot) {
  return join(getDiscussDir(projectRoot), SNAPSHOT_FILE);
}

/**
 * Load snapshot from .discuss/.snapshot.yaml
 * @param {string} projectRoot
 * @returns {Object}
 */
export function loadSnapshot(projectRoot) {
  const path = getSnapshotPath(projectRoot);
  if (!existsSync(path)) {
    return { version: 1, config: {}, discussions: {} };
  }
  try {
    const content = readFileSync(path, 'utf-8');
    const snapshot = yaml.load(content) || {};
    return {
      version: snapshot.version ?? 1,
      config: snapshot.config ?? {},
      discussions: snapshot.discussions ?? {}
    };
  } catch (e) {
    throw new Error(`Failed to load snapshot: ${e.message}`);
  }
}

/**
 * Save snapshot to .discuss/.snapshot.yaml
 * @param {string} projectRoot
 * @param {Object} snapshot
 */
export function saveSnapshot(projectRoot, snapshot) {
  const discussDir = getDiscussDir(projectRoot);
  const path = getSnapshotPath(projectRoot);
  if (!existsSync(discussDir)) {
    mkdirSync(discussDir, { recursive: true });
  }
  const content = yaml.dump(snapshot, { lineWidth: -1 });
  writeFileSync(path, content, 'utf-8');
}

/**
 * Set config value in snapshot
 * @param {string} projectRoot
 * @param {string} key - Config key (e.g. 'stale_threshold')
 * @param {string|number|boolean} value
 */
export function setConfig(projectRoot, key, value) {
  const snapshot = loadSnapshot(projectRoot);
  if (!snapshot.config) snapshot.config = {};
  snapshot.config[key] = value;
  saveSnapshot(projectRoot, snapshot);
}

/**
 * Get config value from snapshot
 * @param {string} projectRoot
 * @param {string} key
 * @returns {string|number|boolean|undefined}
 */
export function getConfig(projectRoot, key) {
  const snapshot = loadSnapshot(projectRoot);
  return snapshot.config?.[key];
}

/**
 * Run config command - set or show config
 * @param {Object} options - { target, staleThreshold, show }
 */
export function runConfigCommand(options = {}) {
  const projectRoot = options.target
    ? resolve(options.target.replace(/^~/, process.env.HOME || ''))
    : process.cwd();

  const snapshotPath = getSnapshotPath(projectRoot);

  if (options.staleThreshold !== undefined) {
    const val = Number(options.staleThreshold);
    if (!Number.isInteger(val) || val < 0) {
      throw new Error('stale_threshold must be a non-negative integer (0 = disabled)');
    }
    setConfig(projectRoot, 'stale_threshold', val);
    return { action: 'set', key: 'stale_threshold', value: val, path: snapshotPath };
  }

  // Show current config
  const snapshot = loadSnapshot(projectRoot);
  return { action: 'show', config: snapshot.config ?? {}, path: snapshotPath };
}
