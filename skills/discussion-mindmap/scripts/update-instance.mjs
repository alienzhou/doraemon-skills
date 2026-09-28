import { readFile, open, unlink } from 'node:fs/promises';
import { join } from 'node:path';
import { args, run, instance } from './common.mjs';
import { normalize, empty, fail, hash, parseJSON, readJSON, atomicJSON } from '../assets/template/data-utils.mjs';

await run(async () => {
  const a = args({ instance: { type: 'string' }, input: { type: 'string' }, reset: { type: 'boolean', default: false }, title: { type: 'string' }, 'expected-hash': { type: 'string' } });
  if (!/^[a-f0-9]{64}$/.test(a['expected-hash'] || '')) fail('INVALID_ARGUMENT', '--expected-hash 需为读取时的 SHA-256');
  if (a.reset ? (!a.title || a.input) : (!a.input || a.title)) fail('INVALID_ARGUMENT', '更新使用 --input；重置使用 --reset --title，二者互斥');
  const { path, config } = await instance(a.instance), file = join(path, 'data.json'), lockPath = join(path, '.update.lock');
  let lock;
  try {
    try { lock = await open(lockPath, 'wx'); }
    catch (error) { if (error.code === 'EEXIST') fail('INSTANCE_BUSY', '实例存在写锁；先确认没有写入者，勿自动移除锁'); throw error; }
    await lock.writeFile(JSON.stringify({ pid: process.pid, instanceId: config.instanceId }));
    const source = await readFile(file, 'utf8');
    if (hash(source) !== a['expected-hash']) fail('STALE_SNAPSHOT', '内容已变化，请重新读取当前实例并合并本轮内容');
    const previous = normalize(parseJSON(source));
    const data = a.reset ? empty(a.title) : normalize(await readJSON(a.input), true);
    if (!a.reset) data.generation = previous.generation;
    await atomicJSON(file, data);
    return { directory: path, instanceId: config.instanceId, reset: a.reset, hash: hash(JSON.stringify(data, null, 2) + '\n'), snapshot: data };
  } finally { if (lock) { await lock.close(); await unlink(lockPath); } }
});
