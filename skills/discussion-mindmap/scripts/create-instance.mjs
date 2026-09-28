import { mkdir, copyFile, writeFile, realpath, rm } from 'node:fs/promises';
import { resolve, dirname, basename, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { args, run } from './common.mjs';
import { title, port, fail, readJSON, normalize, empty, hash } from '../assets/template/data-utils.mjs';

await run(async () => {
  const a = args({ output: { type: 'string' }, title: { type: 'string' }, port: { type: 'string', default: '8931' }, input: { type: 'string' }, 'template-dir': { type: 'string' } });
  if (!a.output) fail('INVALID_ARGUMENT', '--output 必填');
  title(a.title); const listeningPort = port(a.port);
  const output = resolve(a.output), parent = await realpath(dirname(output));
  const destination = join(parent, basename(output));
  const template = a['template-dir'] ? await realpath(a['template-dir']) : fileURLToPath(new URL('../assets/template/', import.meta.url));
  const data = a.input ? normalize({ ...(await readJSON(a.input)), title: a.title }, true) : empty(a.title);
  data.generation = randomUUID();
  const config = { kind: 'discussion-mindmap', version: 1, instanceId: randomUUID(), port: listeningPort };
  let created = false;
  try {
    // mkdir is exclusive even under competing creators; never touch an existing directory.
    try { await mkdir(destination); created = true; }
    catch (error) { if (error.code === 'EEXIST') fail('OUTPUT_EXISTS', '目标已存在，请选择新目录；未覆盖任何文件'); throw error; }
    for (const file of ['index.html', 'styles.css', 'app.js', 'server.mjs', 'data-utils.mjs', 'README.md']) await copyFile(join(template, file), join(destination, file));
    const serialized = JSON.stringify(data, null, 2) + '\n';
    await writeFile(join(destination, 'data.json'), serialized, { flag: 'wx' });
    await writeFile(join(destination, 'instance.json'), JSON.stringify(config, null, 2) + '\n', { flag: 'wx' });
    return { directory: destination, dataFile: join(destination, 'data.json'), instanceId: config.instanceId, hash: hash(serialized), url: `http://127.0.0.1:${listeningPort}/`, start: { executable: 'node', args: [join(destination, 'server.mjs')] }, stop: '在启动终端按 Ctrl+C', running: false };
  } catch (error) { if (created) await rm(destination, { recursive: true, force: true }); throw error; }
});
