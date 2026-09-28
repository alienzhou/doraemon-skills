import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { args, run, instance } from './common.mjs';
import { hash, parseJSON, normalize } from '../assets/template/data-utils.mjs';
await run(async () => {
  const a = args({ instance: { type: 'string' } });
  const { path, config } = await instance(a.instance);
  const source = await readFile(join(path, 'data.json'), 'utf8');
  return { directory: path, instanceId: config.instanceId, port: config.port, hash: hash(source), snapshot: normalize(parseJSON(source)) };
});
