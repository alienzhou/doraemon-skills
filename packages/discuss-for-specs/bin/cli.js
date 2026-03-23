#!/usr/bin/env node

/**
 * discuss-skills CLI
 * 
 * Cross-platform skills and hooks installer for AI assistants.
 * 
 * Usage:
 *   npx discuss-skills install --platform <platform>
 *   npx discuss-skills uninstall --platform <platform>
 *   npx discuss-skills export <dir> [--include-l1-guidance]
 *   npx discuss-skills platforms
 *   npx discuss-skills --version
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { install, uninstall, listPlatforms, exportSkills, runConfigCommand } from '../src/index.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read package.json for version
const packageJson = JSON.parse(
  readFileSync(join(__dirname, '..', 'package.json'), 'utf-8')
);

// Build colored help text for main command
// Note: Colors are applied at runtime, respecting --no-color flag
const buildMainDescription = () => {
  const $ = chalk.gray('$');
  const l2Platforms = ['claude-code', 'cursor', 'cline'].map(p => chalk.green(p)).join(', ');
  const l1Platforms = ['kilocode', 'opencode', 'codex', 'trae', 'qoder', 'roo-code'].map(p => chalk.green(p)).join(', ');
  
  return `Cross-platform skills and hooks installer for AI assistants.

${chalk.bold('Get Started:')}
  ${$} ${chalk.cyan('npx discuss-for-specs install')} ${chalk.yellow('-p')} cursor   ${chalk.gray('# Quick install (no global setup)')}
  ${$} ${chalk.cyan('discuss-for-specs install')} ${chalk.yellow('-p')} cursor       ${chalk.gray('# If installed globally')}

${chalk.bold('Supported Platforms:')}
  L2 (auto-reminder):  ${l2Platforms}
  L1 (skills only):    ${l1Platforms}

  Run '${chalk.cyan('discuss-for-specs platforms')}' for platform details.`;
};

const program = new Command();

// Apply --no-color early if present in argv
if (process.argv.includes('--no-color')) {
  chalk.level = 0;
}

program
  .name('discuss-for-specs')
  .description(buildMainDescription())
  .version(packageJson.version, '-v, --version', 'Show version number')
  .option('--no-color', 'Disable colored output')
  .addHelpText('after', `
${chalk.bold('More Info:')}
  GitHub:  https://github.com/alienzhou/skill-discuss-for-specs

Run '${chalk.cyan('discuss-for-specs <command> --help')}' for detailed options and examples.`);

// Handle --no-color before any command runs
program.hook('preAction', (thisCommand) => {
  const opts = thisCommand.opts();
  if (opts.color === false) {
    // Disable chalk colors
    chalk.level = 0;
  }
});

// Install command
program
  .command('install')
  .description('Install skills and hooks to your environment')
  .requiredOption('-p, --platform <platform>', 'Target platform (claude-code, cursor, cline, kilocode, opencode, codex, trae, qoder, roo-code)')
  .option('-t, --target <dir>', 'Target directory for project-level installation (use "." for current directory)')
  .option('--skip-hooks', 'Skip hooks installation (L2 platforms only)')
  .option('--skip-skills', 'Skip skills installation')
  .option('--stale-threshold <n>', 'Stale detection threshold (0=disabled, default=3)', parseInt)
  .option('-y, --yes', 'Skip confirmation prompts')
  .addHelpText('after', `
${chalk.bold('Platform Options:')}
  ${chalk.bold('L2 Platforms')} (with hooks - auto-reminder support):
    ${chalk.green('claude-code')}   ~/.claude/skills/
    ${chalk.green('cursor')}        ~/.cursor/skills/
    ${chalk.green('cline')}         ~/.cline/skills/ (hooks: ~/Documents/Cline/Hooks/)

  ${chalk.bold('L1 Platforms')} (skills only - manual precipitation):
    ${chalk.green('kilocode')}      ~/.kilocode/skills/
    ${chalk.green('opencode')}      ~/.opencode/skill/
    ${chalk.green('codex')}         ~/.codex/skills/
    ${chalk.green('trae')}          ~/.trae/skills/
    ${chalk.green('qoder')}         ~/.qoder/skills/
    ${chalk.green('roo-code')}      ~/.roo/skills/

${chalk.bold('Installation Modes:')}
  (default)             User-level: ~/.{platform}/skills/
  ${chalk.yellow('--target')} <dir>      Project-level: <dir>/.{platform}/skills/
  ${chalk.yellow('--target')} .          Current directory: ./{platform}/skills/

${chalk.bold('Examples:')}
  ${chalk.gray('$')} discuss-for-specs install ${chalk.yellow('-p')} claude-code        ${chalk.gray('# User-level')}
  ${chalk.gray('$')} discuss-for-specs install ${chalk.yellow('-p')} cursor ${chalk.yellow('-t')} .        ${chalk.gray('# Current directory')}
  ${chalk.gray('$')} discuss-for-specs install ${chalk.yellow('-p')} cursor ${chalk.yellow('-t')} ./proj   ${chalk.gray('# Specific directory')}
  ${chalk.gray('$')} discuss-for-specs install ${chalk.yellow('-p')} cursor ${chalk.yellow('--stale-threshold')} 5`)
  .action(async (options) => {
    try {
      await install(options);
    } catch (err) {
      console.error(`\n${chalk.red('✖')} ${chalk.bold('Installation failed:')} ${err.message}`);
      process.exit(1);
    }
  });

// Uninstall command
program
  .command('uninstall')
  .description('Remove skills and hooks from your environment')
  .requiredOption('-p, --platform <platform>', 'Target platform (claude-code, cursor, cline, kilocode, opencode, codex, trae, qoder, roo-code)')
  .option('-t, --target <dir>', 'Target directory for project-level uninstallation')
  .option('--keep-hooks', 'Keep hooks but remove skills')
  .option('--keep-skills', 'Keep skills but remove hooks')
  .option('-y, --yes', 'Skip confirmation prompts')
  .addHelpText('after', `
${chalk.bold('Examples:')}
  ${chalk.gray('$')} discuss-for-specs uninstall ${chalk.yellow('-p')} cursor          ${chalk.gray('# User-level')}
  ${chalk.gray('$')} discuss-for-specs uninstall ${chalk.yellow('-p')} cursor ${chalk.yellow('-t')} .     ${chalk.gray('# Current directory')}
  ${chalk.gray('$')} discuss-for-specs uninstall ${chalk.yellow('-p')} cursor ${chalk.yellow('--keep-hooks')} ${chalk.gray('# Remove skills only')}`)
  .action(async (options) => {
    try {
      await uninstall(options);
    } catch (err) {
      console.error(`\n${chalk.red('✖')} ${chalk.bold('Uninstallation failed:')} ${err.message}`);
      process.exit(1);
    }
  });

// Platforms command
program
  .command('platforms')
  .alias('list')
  .description('List all supported platforms and their detection status')
  .addHelpText('after', `
${chalk.bold('This command shows:')}
  - All supported platforms (L1 and L2)
  - Whether each platform is detected on your system
  - Configuration directory locations`)
  .action(() => {
    listPlatforms();
  });

// Status command (alias for platforms with more detail)
program
  .command('status')
  .description('Show installation status for all platforms')
  .action(() => {
    listPlatforms({ showStatus: true });
  });

// Config command - update or show .discuss/.snapshot.yaml config
program
  .command('config')
  .description('Update or show discussion config (.discuss/.snapshot.yaml)')
  .option('-t, --target <dir>', 'Project directory (default: current directory)')
  .option('--stale-threshold <n>', 'Outline changes before reminder (0=disabled)', parseInt)
  .addHelpText('after', `
${chalk.bold('Examples:')}
  ${chalk.gray('$')} discuss-for-specs config                    ${chalk.gray('# Show current config')}
  ${chalk.gray('$')} discuss-for-specs config ${chalk.yellow('--stale-threshold')} 5   ${chalk.gray('# Set threshold to 5')}
  ${chalk.gray('$')} discuss-for-specs config ${chalk.yellow('-t')} . ${chalk.yellow('--stale-threshold')} 0  ${chalk.gray('# Disable reminder')}`)
  .action(async (options) => {
    try {
      const result = runConfigCommand({
        target: options.target,
        staleThreshold: options.staleThreshold
      });
      if (result.action === 'set') {
        console.log(chalk.green('✔') + ` Config updated: ${result.key}=${result.value}`);
        console.log(chalk.dim(`  File: ${result.path}`));
      } else {
        console.log(chalk.bold('\nCurrent config:'));
        const cfg = result.config;
        if (Object.keys(cfg).length === 0) {
          console.log(chalk.dim('  (defaults - no custom config)'));
        } else {
          for (const [k, v] of Object.entries(cfg)) {
            console.log(`  ${k}: ${v}`);
          }
        }
        console.log(chalk.dim(`\n  File: ${result.path}`));
      }
    } catch (err) {
      console.error(`\n${chalk.red('✖')} ${chalk.bold('Config failed:')} ${err.message}`);
      process.exit(1);
    }
  });

// Export command - raw directory export without platform structure
program
  .command('export <dir>')
  .description('Export skills to a raw directory (without .{platform}/skills/ structure)')
  .option('--include-l1-guidance', 'Include L1 platform guidance in SKILL.md')
  .addHelpText('after', `
${chalk.bold('Use Cases:')}
  - Unsupported platforms where you manage integration manually
  - Custom deployment scenarios
  - Testing and development

${chalk.gray('Note: No hooks are installed with export. Only skills are copied.')}

${chalk.bold('Examples:')}
  ${chalk.gray('$')} discuss-for-specs export ./my-skills/
  ${chalk.gray('$')} discuss-for-specs export /custom/path/ ${chalk.yellow('--include-l1-guidance')}`)
  .action(async (dir, options) => {
    try {
      await exportSkills(dir, options);
    } catch (err) {
      console.error(`\n${chalk.red('✖')} ${chalk.bold('Export failed:')} ${err.message}`);
      process.exit(1);
    }
  });

program.parse();
