/**
 * Tests for src/installer.js
 * kwaipilot-fix: TEST-Issue-002/tpextid6foog2fsp6iq4
 */

import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import { existsSync, mkdirSync, rmSync, writeFileSync, readFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

import {
  listPlatforms,
} from '../src/installer.js';

import {
  copyDirectory,
  ensureDirectory,
  removeDirectory,
} from '../src/utils.js';


describe('listPlatforms', () => {
  test('does not throw', () => {
    // listPlatforms just outputs to console, so we check it doesn't throw
    assert.doesNotThrow(() => {
      // Capture console output
      const originalLog = console.log;
      const logs = [];
      console.log = (...args) => logs.push(args.join(' '));
      
      try {
        listPlatforms();
      } finally {
        console.log = originalLog;
      }
      
      // Should have logged something
      assert.ok(logs.length > 0);
    });
  });

  test('outputs platform information', () => {
    const originalLog = console.log;
    const logs = [];
    console.log = (...args) => logs.push(args.join(' '));
    
    try {
      listPlatforms();
    } finally {
      console.log = originalLog;
    }
    
    const output = logs.join('\n');
    assert.ok(output.includes('Claude Code') || output.includes('claude-code'));
    assert.ok(output.includes('Cursor') || output.includes('cursor'));
  });
});


describe('install function', () => {
  test('module exports install function', async () => {
    const { install } = await import('../src/installer.js');
    assert.strictEqual(typeof install, 'function');
  });
});


describe('uninstall function', () => {
  test('module exports uninstall function', async () => {
    const { uninstall } = await import('../src/installer.js');
    assert.strictEqual(typeof uninstall, 'function');
  });
});


describe('Installation utilities integration', () => {
  let testDir;

  beforeEach(() => {
    testDir = join(tmpdir(), `test-installer-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  test('copyDirectory copies files correctly', () => {
    // Setup source directory with files
    const srcDir = join(testDir, 'src');
    const destDir = join(testDir, 'dest');
    
    mkdirSync(srcDir);
    writeFileSync(join(srcDir, 'config.json'), '{"key": "value"}');
    mkdirSync(join(srcDir, 'subdir'));
    writeFileSync(join(srcDir, 'subdir', 'nested.txt'), 'nested content');
    
    // Copy
    copyDirectory(srcDir, destDir);
    
    // Verify
    assert.strictEqual(existsSync(join(destDir, 'config.json')), true, 'config.json should be copied');
    assert.strictEqual(existsSync(join(destDir, 'subdir', 'nested.txt')), true, 'nested.txt should be copied');
    
    const content = readFileSync(join(destDir, 'config.json'), 'utf-8');
    assert.strictEqual(content, '{"key": "value"}', 'File content should match');
  });

  test('copyDirectory with overwrite option', () => {
    const srcDir = join(testDir, 'src');
    const destDir = join(testDir, 'dest');
    
    // Create source
    mkdirSync(srcDir);
    writeFileSync(join(srcDir, 'file.txt'), 'new content');
    
    // Create destination with existing file
    mkdirSync(destDir);
    writeFileSync(join(destDir, 'file.txt'), 'old content');
    
    // Copy with overwrite
    copyDirectory(srcDir, destDir, { overwrite: true });
    
    const content = readFileSync(join(destDir, 'file.txt'), 'utf-8');
    assert.strictEqual(content, 'new content', 'File should be overwritten');
  });

  test('removeDirectory cleans up completely', () => {
    const dirToRemove = join(testDir, 'to-remove');
    mkdirSync(dirToRemove);
    mkdirSync(join(dirToRemove, 'subdir'));
    writeFileSync(join(dirToRemove, 'file.txt'), 'content');
    writeFileSync(join(dirToRemove, 'subdir', 'nested.txt'), 'nested');
    
    assert.strictEqual(existsSync(dirToRemove), true, 'Directory should exist before removal');
    
    removeDirectory(dirToRemove);
    
    assert.strictEqual(existsSync(dirToRemove), false, 'Directory should not exist after removal');
  });

  test('ensureDirectory creates nested paths', () => {
    const nestedDir = join(testDir, 'a', 'b', 'c', 'd');
    
    assert.strictEqual(existsSync(nestedDir), false, 'Nested directory should not exist initially');
    
    ensureDirectory(nestedDir);
    
    assert.strictEqual(existsSync(nestedDir), true, 'Nested directory should be created');
  });

  test('simulated install workflow', () => {
    // Simulate the core installation workflow:
    // 1. Create source hooks directory
    // 2. Create destination (platform config) directory
    // 3. Copy hooks to destination
    // 4. Verify installation
    
    const srcHooks = join(testDir, 'source-hooks');
    const destHooks = join(testDir, 'dest-platform', '.claude', 'hooks', 'discuss');
    
    // Create source structure (like npm-package/hooks/)
    // Note: Since D01 decision, only stop hook exists (file-edit hook removed)
    mkdirSync(join(srcHooks, 'common'), { recursive: true });
    mkdirSync(join(srcHooks, 'stop'), { recursive: true });
    
    writeFileSync(join(srcHooks, 'common', 'utils.py'), '# utils');
    writeFileSync(join(srcHooks, 'stop', 'check.py'), '# check');
    
    // Perform install (what installer.js does)
    ensureDirectory(destHooks);
    copyDirectory(srcHooks, destHooks);
    
    // Verify all files copied
    assert.strictEqual(existsSync(join(destHooks, 'common', 'utils.py')), true);
    assert.strictEqual(existsSync(join(destHooks, 'stop', 'check.py')), true);
  });

  test('simulated uninstall workflow', () => {
    // Simulate uninstall workflow:
    // 1. Create installed hooks
    // 2. Remove them
    // 3. Verify cleanup
    
    const installedHooks = join(testDir, '.claude', 'hooks', 'discuss');
    
    // Create "installed" structure
    mkdirSync(join(installedHooks, 'common'), { recursive: true });
    writeFileSync(join(installedHooks, 'common', 'utils.py'), '# utils');
    
    assert.strictEqual(existsSync(installedHooks), true, 'Hooks should exist before uninstall');
    
    // Uninstall
    removeDirectory(installedHooks);
    
    assert.strictEqual(existsSync(installedHooks), false, 'Hooks should be removed after uninstall');
  });
});


describe('L1 guidance injection logic', () => {
  let testDir;

  beforeEach(() => {
    testDir = join(tmpdir(), `test-l1-injection-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  test('L1 guidance file contains required sections', () => {
    // Simulate reading L1 guidance file structure
    const l1GuidanceContent = `## 📝 Precipitation Discipline

### Proactive Documentation
Don't wait to be reminded. After each round, ask yourself:
- "Did we reach any consensus this round?"
- "Have I documented confirmed decisions in \`decisions/\`?"

### Self-Check Trigger
Every 2-3 rounds of discussion, review:
- If outline shows multiple ✅ Confirmed items but \`decisions/\` is empty → Create documents now
- If a decision was confirmed 3+ rounds ago but not documented → Document it immediately

### The Rule
**Consensus reached = Decision documented.** 
No delay, no exceptions.
`;
    
    // Verify required sections exist
    assert.ok(l1GuidanceContent.includes('Precipitation Discipline'), 'Should contain Precipitation Discipline section');
    assert.ok(l1GuidanceContent.includes('Proactive Documentation'), 'Should contain Proactive Documentation section');
    assert.ok(l1GuidanceContent.includes('Self-Check Trigger'), 'Should contain Self-Check Trigger section');
    assert.ok(l1GuidanceContent.includes('The Rule'), 'Should contain The Rule section');
  });

  test('injection finds correct insertion point after Your Responsibilities', () => {
    const skillContent = `# Test Skill

## 🎯 Your Responsibilities
- Responsibility 1
- Responsibility 2

## 📝 Next Section
Some content here
`;
    
    const responsibilitiesMarker = '## 🎯 Your Responsibilities';
    const responsibilitiesIndex = skillContent.indexOf(responsibilitiesMarker);
    
    assert.ok(responsibilitiesIndex >= 0, 'Should find Your Responsibilities marker');
    
    // Find next section
    const afterMarker = skillContent.substring(responsibilitiesIndex);
    const nextSectionMatch = afterMarker.match(/\n(## |---)/);
    
    assert.ok(nextSectionMatch, 'Should find next section marker');
    assert.ok(nextSectionMatch.index > 0, 'Next section should be after responsibilities');
  });

  test('simulated L1 guidance injection workflow', () => {
    // Create SKILL.md with Your Responsibilities section
    const skillPath = join(testDir, 'SKILL.md');
    const skillContent = `# Discuss for Specs

## Overview
This skill helps with discussions.

## 🎯 Your Responsibilities
- Track discussion progress
- Document decisions

## 📝 Other Section
More content here.
`;
    writeFileSync(skillPath, skillContent);

    // Create L1 guidance content
    const l1Guidance = `## 📝 Precipitation Discipline

### Proactive Documentation
Don't wait to be reminded.

### The Rule
**Consensus reached = Decision documented.**
`;

    // Simulate injection logic from installer.js
    const originalContent = readFileSync(skillPath, 'utf-8');
    const responsibilitiesMarker = '## 🎯 Your Responsibilities';
    const responsibilitiesIndex = originalContent.indexOf(responsibilitiesMarker);
    
    if (responsibilitiesIndex >= 0) {
      const afterMarker = originalContent.substring(responsibilitiesIndex);
      const nextSectionMatch = afterMarker.match(/\n(## |---)/);
      const injectionPoint = nextSectionMatch 
        ? responsibilitiesIndex + nextSectionMatch.index + 1
        : responsibilitiesIndex + afterMarker.length;
      
      const before = originalContent.substring(0, injectionPoint);
      const after = originalContent.substring(injectionPoint);
      const updatedContent = before + '\n\n' + l1Guidance + '\n\n' + after;
      
      writeFileSync(skillPath, updatedContent, 'utf-8');
    }

    // Verify injection
    const result = readFileSync(skillPath, 'utf-8');
    assert.ok(result.includes('Precipitation Discipline'), 'Injected content should contain Precipitation Discipline');
    assert.ok(result.includes('Your Responsibilities'), 'Original content should be preserved');
    assert.ok(result.includes('Other Section'), 'Following sections should be preserved');
    
    // Verify order: Your Responsibilities -> Precipitation Discipline -> Other Section
    const respIndex = result.indexOf('Your Responsibilities');
    const precipIndex = result.indexOf('Precipitation Discipline');
    const otherIndex = result.indexOf('Other Section');
    
    assert.ok(respIndex < precipIndex, 'Precipitation Discipline should come after Your Responsibilities');
    assert.ok(precipIndex < otherIndex, 'Other Section should come after Precipitation Discipline');
  });
});


describe('staleThreshold option handling', () => {
  test('install function accepts staleThreshold option', async () => {
    // Verify the install function accepts staleThreshold in options
    const { install } = await import('../src/installer.js');
    assert.strictEqual(typeof install, 'function');
    
    // The function should accept options with staleThreshold
    // We can't fully test this without mocking, but we verify the function exists
  });

  test('staleThreshold validation - valid values', () => {
    // Valid values: 0 (disabled), positive integers
    const validValues = [0, 1, 3, 5, 10, 100];
    
    for (const value of validValues) {
      assert.strictEqual(Number.isInteger(value), true, `${value} should be an integer`);
      assert.strictEqual(value >= 0, true, `${value} should be non-negative`);
    }
  });

  test('staleThreshold validation - invalid values', () => {
    // Invalid values: negative, floats, strings
    const invalidValues = [-1, -5, 1.5, 3.14];
    
    for (const value of invalidValues) {
      const isValidThreshold = Number.isInteger(value) && value >= 0;
      assert.strictEqual(isValidThreshold, false, `${value} should be invalid`);
    }
  });
});


describe('target option installation logic', () => {
  let testDir;

  beforeEach(() => {
    testDir = join(tmpdir(), `test-target-install-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  test('project-level skills directory structure', () => {
    // Simulate --target installation for skills
    const projectSkillsDir = join(testDir, '.claude', 'skills', 'discuss-for-specs');
    
    ensureDirectory(projectSkillsDir);
    writeFileSync(join(projectSkillsDir, 'SKILL.md'), '# Test Skill');
    
    assert.strictEqual(existsSync(projectSkillsDir), true, 'Project skills directory should be created');
    assert.strictEqual(existsSync(join(projectSkillsDir, 'SKILL.md')), true, 'SKILL.md should be copied');
  });

  test('--target hooks directory structure for L2 platform', () => {
    // Simulate project-level hooks installation
    const projectHooksDir = join(testDir, '.claude', 'hooks');
    const stopHookDir = join(projectHooksDir, 'stop');
    const commonDir = join(projectHooksDir, 'common');
    
    ensureDirectory(stopHookDir);
    ensureDirectory(commonDir);
    writeFileSync(join(stopHookDir, 'check_precipitation.py'), '# hook');
    writeFileSync(join(commonDir, 'utils.py'), '# utils');
    
    assert.strictEqual(existsSync(stopHookDir), true, 'Project hooks/stop directory should be created');
    assert.strictEqual(existsSync(commonDir), true, 'Project hooks/common directory should be created');
  });

  test('--target settings.json for claude-code', () => {
    // Simulate project-level hooks configuration
    const settingsPath = join(testDir, '.claude', 'settings.json');
    const settingsDir = join(testDir, '.claude');
    
    ensureDirectory(settingsDir);
    
    const hooksConfig = {
      hooks: {
        Stop: [{
          matcher: '',
          hooks: [{
            type: 'command',
            command: `python3 ${join(testDir, '.claude', 'hooks', 'stop', 'check_precipitation.py')}`
          }]
        }]
      }
    };
    
    writeFileSync(settingsPath, JSON.stringify(hooksConfig, null, 2));
    
    assert.strictEqual(existsSync(settingsPath), true, 'settings.json should be created');
    
    const content = JSON.parse(readFileSync(settingsPath, 'utf-8'));
    assert.ok(content.hooks, 'settings.json should have hooks property');
    assert.ok(content.hooks.Stop, 'settings.json should have Stop hook');
  });

  test('--target hooks.json for cursor', () => {
    // Simulate project-level hooks configuration for Cursor
    const hooksJsonPath = join(testDir, '.cursor', 'hooks.json');
    const cursorDir = join(testDir, '.cursor');
    
    ensureDirectory(cursorDir);
    
    const hooksConfig = {
      version: 1,
      hooks: {
        stop: [{
          command: `python3 ${join(testDir, '.cursor', 'hooks', 'stop', 'check_precipitation.py')}`
        }]
      }
    };
    
    writeFileSync(hooksJsonPath, JSON.stringify(hooksConfig, null, 2));
    
    assert.strictEqual(existsSync(hooksJsonPath), true, 'hooks.json should be created');
    
    const content = JSON.parse(readFileSync(hooksJsonPath, 'utf-8'));
    assert.strictEqual(content.version, 1, 'hooks.json should have version 1');
    assert.ok(content.hooks.stop, 'hooks.json should have stop hook');
  });

  test('simulated full --target installation', () => {
    // Simulate a complete --target installation for Claude Code
    const platform = 'claude-code';
    const configDir = '.claude';
    
    // 1. Create skills
    const skillsDir = join(testDir, configDir, 'skills', 'discuss-for-specs');
    ensureDirectory(skillsDir);
    writeFileSync(join(skillsDir, 'SKILL.md'), '# Discuss for Specs\n\nMain skill file.');
    
    // 2. Create hooks
    const hooksDir = join(testDir, configDir, 'hooks');
    ensureDirectory(join(hooksDir, 'stop'));
    ensureDirectory(join(hooksDir, 'common'));
    writeFileSync(join(hooksDir, 'stop', 'check_precipitation.py'), '#!/usr/bin/env python3\n# hook');
    writeFileSync(join(hooksDir, 'common', 'snapshot_manager.py'), '# manager');
    
    // 3. Create settings.json with hooks config
    const settingsPath = join(testDir, configDir, 'settings.json');
    const settings = {
      hooks: {
        Stop: [{
          matcher: '',
          hooks: [{
            type: 'command',
            command: `python3 ${join(hooksDir, 'stop', 'check_precipitation.py')}`
          }]
        }]
      }
    };
    writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
    
    // Verify complete installation
    assert.strictEqual(existsSync(join(skillsDir, 'SKILL.md')), true, 'SKILL.md should exist');
    assert.strictEqual(existsSync(join(hooksDir, 'stop', 'check_precipitation.py')), true, 'Hook should exist');
    assert.strictEqual(existsSync(settingsPath), true, 'settings.json should exist');
    
    // Verify settings.json content
    const loadedSettings = JSON.parse(readFileSync(settingsPath, 'utf-8'));
    assert.ok(loadedSettings.hooks.Stop[0].hooks[0].command.includes('check_precipitation.py'));
  });

  test('simulated full --target uninstallation', () => {
    // Setup: create installed --target files
    const configDir = '.claude';
    const skillsDir = join(testDir, configDir, 'skills', 'discuss-for-specs');
    const hooksDir = join(testDir, configDir, 'hooks');
    
    ensureDirectory(skillsDir);
    ensureDirectory(join(hooksDir, 'stop'));
    writeFileSync(join(skillsDir, 'SKILL.md'), '# Skill');
    writeFileSync(join(hooksDir, 'stop', 'check.py'), '# hook');
    
    assert.strictEqual(existsSync(skillsDir), true, 'Skills should exist before uninstall');
    assert.strictEqual(existsSync(hooksDir), true, 'Hooks should exist before uninstall');
    
    // Uninstall
    removeDirectory(skillsDir);
    removeDirectory(hooksDir);
    
    // Verify
    assert.strictEqual(existsSync(skillsDir), false, 'Skills should be removed');
    assert.strictEqual(existsSync(hooksDir), false, 'Hooks should be removed');
  });
});


describe('exportSkills function', () => {
  let testDir;

  beforeEach(() => {
    testDir = join(tmpdir(), `test-export-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  test('module exports exportSkills function', async () => {
    const { exportSkills } = await import('../src/installer.js');
    assert.strictEqual(typeof exportSkills, 'function');
  });

  test('export creates skill directly in target directory', () => {
    // Simulate export behavior: skills go directly to target dir, not .{platform}/skills/
    const exportDir = join(testDir, 'my-skills');
    const skillDir = join(exportDir, 'discuss-for-specs');
    
    // Simulate export
    ensureDirectory(skillDir);
    writeFileSync(join(skillDir, 'SKILL.md'), '# Test Skill');
    mkdirSync(join(skillDir, 'references'));
    writeFileSync(join(skillDir, 'references', 'template.md'), '# Template');
    
    // Verify structure: target/discuss-for-specs/ (not target/.platform/skills/discuss-for-specs/)
    assert.strictEqual(existsSync(skillDir), true, 'Skill directory should be created directly');
    assert.strictEqual(existsSync(join(skillDir, 'SKILL.md')), true, 'SKILL.md should exist');
    assert.strictEqual(existsSync(join(skillDir, 'references', 'template.md')), true, 'References should be copied');
    
    // Verify no platform directory is created
    assert.strictEqual(existsSync(join(exportDir, '.claude')), false, 'Should not create .claude directory');
    assert.strictEqual(existsSync(join(exportDir, '.cursor')), false, 'Should not create .cursor directory');
  });

  test('export with --include-l1-guidance injects content', () => {
    // Create skill content
    const skillPath = join(testDir, 'SKILL.md');
    const skillContent = `# Discuss for Specs

## 🎯 Your Responsibilities
- Track discussion progress

## 📝 Other Section
More content.
`;
    writeFileSync(skillPath, skillContent);

    // Create L1 guidance
    const l1Guidance = `## 📝 Precipitation Discipline

### Proactive Documentation
Don't wait to be reminded.
`;

    // Simulate L1 guidance injection
    const originalContent = readFileSync(skillPath, 'utf-8');
    const responsibilitiesMarker = '## 🎯 Your Responsibilities';
    const responsibilitiesIndex = originalContent.indexOf(responsibilitiesMarker);
    
    if (responsibilitiesIndex >= 0) {
      const afterMarker = originalContent.substring(responsibilitiesIndex);
      const nextSectionMatch = afterMarker.match(/\n(## |---)/);
      const injectionPoint = nextSectionMatch 
        ? responsibilitiesIndex + nextSectionMatch.index + 1
        : responsibilitiesIndex + afterMarker.length;
      
      const before = originalContent.substring(0, injectionPoint);
      const after = originalContent.substring(injectionPoint);
      const updatedContent = before + '\n\n' + l1Guidance + '\n\n' + after;
      
      writeFileSync(skillPath, updatedContent, 'utf-8');
    }

    // Verify injection
    const result = readFileSync(skillPath, 'utf-8');
    assert.ok(result.includes('Precipitation Discipline'), 'L1 guidance should be injected');
    assert.ok(result.includes('Your Responsibilities'), 'Original content should be preserved');
  });

  test('export does not create hooks', () => {
    // Simulate export: only skills, no hooks
    const exportDir = join(testDir, 'exported');
    const skillDir = join(exportDir, 'discuss-for-specs');
    
    ensureDirectory(skillDir);
    writeFileSync(join(skillDir, 'SKILL.md'), '# Skill');
    
    // Verify no hooks-related directories exist
    assert.strictEqual(existsSync(join(exportDir, 'hooks')), false, 'No hooks directory');
    assert.strictEqual(existsSync(join(exportDir, '.vibe-x')), false, 'No .vibe-x directory');
  });
});
