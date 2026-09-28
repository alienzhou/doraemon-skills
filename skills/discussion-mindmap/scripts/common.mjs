import { parseArgs } from 'node:util';
import { realpath } from 'node:fs/promises';
import { join } from 'node:path';
import { fail, errorResult, readJSON } from '../assets/template/data-utils.mjs';
export function args(options) {
  try { return parseArgs({ options, strict: true, allowPositionals: false }).values; }
  catch { fail('INVALID_ARGUMENT', '参数无效；请核对选项名称、类型和必填项'); }
}
export async function instance(directory) {
  if (!directory) fail('INVALID_ARGUMENT', '--instance 必填');
  const path = await realpath(directory), config = await readJSON(join(path, 'instance.json'));
  if (config.kind !== 'discussion-mindmap' || typeof config.instanceId !== 'string') fail('INVALID_INSTANCE', '目标不是讨论脑图实例');
  return { path, config };
}
export async function run(task) {
  try { console.log(JSON.stringify({ ok: true, data: await task() })); }
  catch (error) { console.log(JSON.stringify(errorResult(error))); process.exitCode = 1; }
}
