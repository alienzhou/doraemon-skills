/**
 * CLI UI Utilities
 * 
 * Provides consistent, beautiful CLI output with colors, spinners, and formatting.
 */

import chalk from 'chalk';
import ora from 'ora';
import figlet from 'figlet';
import boxen from 'boxen';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read package.json for version
const packageJson = JSON.parse(
  readFileSync(join(__dirname, '..', 'package.json'), 'utf-8')
);

// Color scheme (magentaBright for a vibrant pink-purple theme)
const colors = {
  primary: chalk.magentaBright,
  success: chalk.green,
  error: chalk.red,
  warning: chalk.yellow,
  dim: chalk.dim,
  bold: chalk.bold,
};

/**
 * Display ASCII art banner
 */
export function showBanner() {
  const banner = figlet.textSync('DISCUSS', {
    font: 'ANSI Shadow',
    horizontalLayout: 'default',
  });
  
  console.log('');
  console.log(colors.primary(banner));
  console.log(colors.dim(`              Skills Installer v${packageJson.version}`));
  console.log('');
}

/**
 * Create a spinner instance
 * @param {string} text - Initial spinner text
 * @returns {ora.Ora} Spinner instance
 */
export function createSpinner(text) {
  return ora({
    text,
    color: 'magenta',
    spinner: 'dots',
  });
}

/**
 * Success message with checkmark
 * @param {string} msg - Message to display
 * @param {boolean} indent - Whether to indent the message
 */
export function success(msg, indent = false) {
  const prefix = indent ? '  ' : '';
  console.log(`${prefix}${colors.success('✔')} ${msg}`);
}

/**
 * Error message with X mark
 * @param {string} msg - Main error message
 * @param {string} [hint] - Optional hint for fixing the error
 */
export function error(msg, hint) {
  console.log('');
  console.log(`${colors.error('✖')} ${colors.bold(msg)}`);
  
  if (hint) {
    console.log('');
    console.log(colors.dim('  To fix:'));
    console.log(colors.primary(`    ${hint}`));
  }
  console.log('');
}

/**
 * Info message
 * @param {string} msg - Message to display
 */
export function info(msg) {
  console.log(colors.primary(`→ ${msg}`));
}

/**
 * Warning message
 * @param {string} msg - Message to display
 * @param {boolean} indent - Whether to indent the message
 */
export function warning(msg, indent = false) {
  const prefix = indent ? '  ' : '';
  console.log(`${prefix}${colors.warning('⚠')} ${msg}`);
}

/**
 * Dim/subtle text
 * @param {string} msg - Message to display
 */
export function dim(msg) {
  console.log(colors.dim(msg));
}

/**
 * Print a blank line
 */
export function newline() {
  console.log('');
}

/**
 * Display completion box with success message
 * @param {Object} options - Box content options
 * @param {string[]} options.components - List of installed components
 * @param {string[]} options.nextSteps - List of next steps
 */
export function showCompletionBox({ components, nextSteps }) {
  const lines = [
    `${colors.success('✅')} ${colors.bold('Installation complete!')}`,
    '',
    'Installed:',
    ...components.map(c => `  ${colors.dim('•')} ${c}`),
    '',
    'Next steps:',
    ...nextSteps.map((step, i) => `  ${colors.dim(`${i + 1}.`)} ${step}`),
  ];
  
  const content = lines.join('\n');
  
  console.log(boxen(content, {
    padding: 1,
    margin: { top: 1, bottom: 1 },
    borderStyle: 'round',
    borderColor: 'magenta',
  }));
}

/**
 * Display uninstall completion box
 * @param {string} message - Completion message
 * @param {string} [note] - Optional note
 */
export function showUninstallBox(message, note) {
  const lines = [
    `${colors.success('✅')} ${colors.bold(message)}`,
  ];
  
  if (note) {
    lines.push('', colors.dim(note));
  }
  
  const content = lines.join('\n');
  
  console.log(boxen(content, {
    padding: 1,
    margin: { top: 1, bottom: 1 },
    borderStyle: 'round',
    borderColor: 'magenta',
  }));
}

/**
 * Section header
 * @param {string} title - Section title
 */
export function section(title) {
  console.log('');
  console.log(colors.bold(title));
}

// Export colors for direct use if needed
export { colors };
