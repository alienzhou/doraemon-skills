/**
 * Tests for src/platform-config.js
 */

import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import { existsSync, mkdirSync, rmSync, writeFileSync, readFileSync } from 'fs';
import { join } from 'path';
import { tmpdir, homedir } from 'os';

import {
  PLATFORMS,
  detectPlatform,
  getPlatformConfig,
  getSkillsDir,
  getSettingsPath,
  getProjectHooksDir,
  platformSupportsStopHook,
} from '../src/platform-config.js';


describe('PLATFORMS constant', () => {
  test('contains claude-code configuration', () => {
    assert.ok(PLATFORMS['claude-code']);
    assert.strictEqual(PLATFORMS['claude-code'].name, 'Claude Code');
    assert.strictEqual(PLATFORMS['claude-code'].configDir, '.claude');
    assert.strictEqual(PLATFORMS['claude-code'].hooksFormat, 'claude-code');
  });

  test('contains cursor configuration', () => {
    assert.ok(PLATFORMS['cursor']);
    assert.strictEqual(PLATFORMS['cursor'].name, 'Cursor');
    assert.strictEqual(PLATFORMS['cursor'].configDir, '.cursor');
    assert.strictEqual(PLATFORMS['cursor'].hooksFormat, 'cursor');
  });

  test('contains cline configuration (L2)', () => {
    assert.ok(PLATFORMS['cline']);
    assert.strictEqual(PLATFORMS['cline'].name, 'Cline');
    assert.strictEqual(PLATFORMS['cline'].configDir, '.cline');
    assert.strictEqual(PLATFORMS['cline'].hooksFormat, 'cline');
    assert.strictEqual(PLATFORMS['cline'].level, 'L2');
  });

  test('contains new L1 platforms', () => {
    // Trae
    assert.ok(PLATFORMS['trae']);
    assert.strictEqual(PLATFORMS['trae'].name, 'Trae');
    assert.strictEqual(PLATFORMS['trae'].configDir, '.trae');
    assert.strictEqual(PLATFORMS['trae'].level, 'L1');
    
    // Qoder
    assert.ok(PLATFORMS['qoder']);
    assert.strictEqual(PLATFORMS['qoder'].name, 'Qoder');
    assert.strictEqual(PLATFORMS['qoder'].configDir, '.qoder');
    assert.strictEqual(PLATFORMS['qoder'].level, 'L1');
    
    // Roo-Code
    assert.ok(PLATFORMS['roo-code']);
    assert.strictEqual(PLATFORMS['roo-code'].name, 'Roo-Code');
    assert.strictEqual(PLATFORMS['roo-code'].configDir, '.roo');
    assert.strictEqual(PLATFORMS['roo-code'].level, 'L1');
    
    // CodeFlicker
    assert.ok(PLATFORMS['codeflicker']);
    assert.strictEqual(PLATFORMS['codeflicker'].name, 'CodeFlicker');
    assert.strictEqual(PLATFORMS['codeflicker'].configDir, '.codeflicker');
    assert.strictEqual(PLATFORMS['codeflicker'].level, 'L1');
  });

  test('L2 platforms have hooks support', () => {
    const l2Platforms = ['claude-code', 'cursor', 'cline'];
    for (const id of l2Platforms) {
      assert.strictEqual(PLATFORMS[id].level, 'L2', `${id} should be L2`);
      assert.ok(PLATFORMS[id].hooksFormat, `${id} should have hooksFormat`);
    }
  });

  test('L1 platforms do not have hooks support', () => {
    const l1Platforms = ['kilocode', 'opencode', 'codex', 'trae', 'qoder', 'roo-code', 'codeflicker'];
    for (const id of l1Platforms) {
      assert.strictEqual(PLATFORMS[id].level, 'L1', `${id} should be L1`);
      assert.strictEqual(PLATFORMS[id].hooksFormat, null, `${id} should not have hooksFormat`);
    }
  });
});


describe('getPlatformConfig', () => {
  test('returns config for valid platform', () => {
    const config = getPlatformConfig('claude-code');
    assert.strictEqual(config.name, 'Claude Code');
  });

  test('throws error for unknown platform', () => {
    assert.throws(() => {
      getPlatformConfig('unknown-platform');
    }, /Unknown platform/);
  });
});


describe('detectPlatform', () => {
  // Note: This test depends on actual home directory state
  // In a real test environment, we would mock the home directory
  
  test('returns array of detected platforms', () => {
    const detected = detectPlatform();
    assert.ok(Array.isArray(detected));
  });
});


describe('getSkillsDir', () => {
  test('returns global skills path for claude-code', () => {
    const result = getSkillsDir('claude-code');
    const home = homedir();
    assert.strictEqual(result, join(home, '.claude', 'skills'));
  });

  test('returns global skills path for cursor', () => {
    const result = getSkillsDir('cursor');
    const home = homedir();
    assert.strictEqual(result, join(home, '.cursor', 'skills'));
  });

  test('returns global skills path for opencode with .config prefix', () => {
    const result = getSkillsDir('opencode');
    const home = homedir();
    assert.strictEqual(result, join(home, '.config', 'opencode', 'skills'));
  });

  test('returns project-level skills path when target provided', () => {
    const targetDir = '/my/project';
    const result = getSkillsDir('claude-code', targetDir);
    assert.strictEqual(result, join(targetDir, '.claude', 'skills'));
  });

  test('returns project-level skills path for opencode (no .config prefix)', () => {
    const targetDir = '/my/project';
    const result = getSkillsDir('opencode', targetDir);
    assert.strictEqual(result, join(targetDir, '.opencode', 'skills'));
  });
});


describe('getSettingsPath', () => {
  test('returns correct path for claude-code', () => {
    const result = getSettingsPath('claude-code');
    const home = homedir();
    assert.strictEqual(result, join(home, '.claude', 'settings.json'));
  });

  test('returns correct path for cursor', () => {
    const result = getSettingsPath('cursor');
    const home = homedir();
    assert.strictEqual(result, join(home, '.cursor', 'hooks.json'));
  });

  test('returns project-level path when targetDir provided for claude-code', () => {
    const targetDir = '/my/project';
    const result = getSettingsPath('claude-code', targetDir);
    assert.strictEqual(result, join(targetDir, '.claude', 'settings.json'));
  });

  test('returns project-level path when targetDir provided for cursor', () => {
    const targetDir = '/my/project';
    const result = getSettingsPath('cursor', targetDir);
    assert.strictEqual(result, join(targetDir, '.cursor', 'hooks.json'));
  });
});


describe('getProjectHooksDir', () => {
  test('returns project-level hooks path with new structure', () => {
    const targetDir = '/my/project';
    // New structure: ${projectDir}/.vibe-x/discuss-for-specs/hooks/
    const result = getProjectHooksDir('claude-code', targetDir);
    assert.strictEqual(result, join(targetDir, '.vibe-x', 'discuss-for-specs', 'hooks'));
  });

  test('returns same path for all platforms (unified structure)', () => {
    const targetDir = '/my/project';
    // All platforms now use the same hooks directory structure
    const claudeResult = getProjectHooksDir('claude-code', targetDir);
    const cursorResult = getProjectHooksDir('cursor', targetDir);
    const kilocodeResult = getProjectHooksDir('kilocode', targetDir);
    
    const expectedPath = join(targetDir, '.vibe-x', 'discuss-for-specs', 'hooks');
    assert.strictEqual(claudeResult, expectedPath);
    assert.strictEqual(cursorResult, expectedPath);
    assert.strictEqual(kilocodeResult, expectedPath);
  });
});


describe('platformSupportsStopHook', () => {
  test('returns true for claude-code (L2 platform)', () => {
    assert.strictEqual(platformSupportsStopHook('claude-code'), true);
  });

  test('returns true for cursor (L2 platform)', () => {
    assert.strictEqual(platformSupportsStopHook('cursor'), true);
  });

  test('returns false for unknown platform (assumed L1)', () => {
    // Unknown platforms should be treated as L1 (no stop hook support)
    assert.strictEqual(platformSupportsStopHook('kilocode'), false);
    assert.strictEqual(platformSupportsStopHook('codex-cli'), false);
  });
});
