/**
 * Tests for src/utils.js
 */

import { test, describe, before, after, beforeEach, afterEach, mock } from 'node:test';
import assert from 'node:assert';
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

import {
  getHomeDir,
  getConfigDir,
  getDataDir,
  getHooksDir,
  getLogsDir,
  copyDirectory,
  removeDirectory,
  ensureDirectory,
  directoryExists,
} from '../src/utils.js';


describe('Directory Path Functions', () => {
  test('getHomeDir returns a string', () => {
    const result = getHomeDir();
    assert.strictEqual(typeof result, 'string');
    assert.ok(result.length > 0);
  });

  test('getConfigDir returns correct path', () => {
    const home = getHomeDir();
    const result = getConfigDir();
    assert.strictEqual(result, join(home, '.vibe-x', 'discuss-for-specs'));
  });

  test('getDataDir returns correct path', () => {
    const home = getHomeDir();
    const result = getDataDir();
    assert.strictEqual(result, join(home, '.vibe-x', 'discuss-for-specs'));
  });

  test('getHooksDir returns correct path', () => {
    const result = getHooksDir();
    assert.ok(result.includes('.vibe-x'));
    assert.ok(result.includes('discuss-for-specs'));
    assert.ok(result.endsWith('hooks'));
  });

  test('getLogsDir returns correct path', () => {
    const result = getLogsDir();
    assert.ok(result.includes('.vibe-x'));
    assert.ok(result.includes('discuss-for-specs'));
    assert.ok(result.endsWith('logs'));
  });
});


describe('Directory Operations', () => {
  let testDir;

  beforeEach(() => {
    testDir = join(tmpdir(), `test-utils-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('ensureDirectory', () => {
    test('creates new directory', () => {
      const newDir = join(testDir, 'new', 'nested', 'dir');
      assert.strictEqual(existsSync(newDir), false);
      
      ensureDirectory(newDir);
      
      assert.strictEqual(existsSync(newDir), true);
    });

    test('does not fail on existing directory', () => {
      const existingDir = join(testDir, 'existing');
      mkdirSync(existingDir);
      
      assert.doesNotThrow(() => {
        ensureDirectory(existingDir);
      });
    });
  });

  describe('directoryExists', () => {
    test('returns true for existing directory', () => {
      assert.strictEqual(directoryExists(testDir), true);
    });

    test('returns false for non-existing directory', () => {
      assert.strictEqual(directoryExists(join(testDir, 'nonexistent')), false);
    });
  });

  describe('removeDirectory', () => {
    test('removes directory and contents', () => {
      const dirToRemove = join(testDir, 'to-remove');
      mkdirSync(dirToRemove);
      writeFileSync(join(dirToRemove, 'file.txt'), 'content');
      
      removeDirectory(dirToRemove);
      
      assert.strictEqual(existsSync(dirToRemove), false);
    });

    test('does not fail on non-existing directory', () => {
      const nonExistent = join(testDir, 'nonexistent');
      
      assert.doesNotThrow(() => {
        removeDirectory(nonExistent);
      });
    });
  });

  describe('copyDirectory', () => {
    test('copies directory with contents', () => {
      const srcDir = join(testDir, 'src');
      const destDir = join(testDir, 'dest');
      
      mkdirSync(srcDir);
      writeFileSync(join(srcDir, 'file.txt'), 'hello');
      mkdirSync(join(srcDir, 'subdir'));
      writeFileSync(join(srcDir, 'subdir', 'nested.txt'), 'world');
      
      copyDirectory(srcDir, destDir);
      
      assert.strictEqual(existsSync(destDir), true);
      assert.strictEqual(existsSync(join(destDir, 'file.txt')), true);
      assert.strictEqual(existsSync(join(destDir, 'subdir', 'nested.txt')), true);
    });

    test('throws error for non-existing source', () => {
      const srcDir = join(testDir, 'nonexistent');
      const destDir = join(testDir, 'dest');
      
      assert.throws(() => {
        copyDirectory(srcDir, destDir);
      }, /does not exist/);
    });
  });
});
