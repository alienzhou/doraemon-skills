import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, rm, access } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn, spawnSync } from 'node:child_process';
import { createServer } from 'node:net';
import { request } from 'node:http';
import { setTimeout as delay } from 'node:timers/promises';
import { args, run } from './common.mjs';
import { atomicJSON } from '../assets/template/data-utils.mjs';

await run(async () => {
  const a = args({ browser: { type: 'boolean', default: false } });
  const root = await mkdtemp(join(tmpdir(), 'discussion-mindmap-test-'));
  const scripts = fileURLToPath(new URL('./', import.meta.url)), children = [], checks = [];
  function check(name, value) { assert.ok(value, name); checks.push(name); }
  function cli(file, parameters, ok = true) {
    const result = spawnSync(process.execPath, [join(scripts, file), ...parameters], { encoding: 'utf8', timeout: 10000 });
    const json = JSON.parse(result.stdout.trim().split('\n').at(-1));
    assert.equal(json.ok, ok, result.stdout + result.stderr); assert.equal(result.status, ok ? 0 : 1);
    return json;
  }
  async function freePort() {
    const server = createServer(); await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    const value = server.address().port; await new Promise(resolve => server.close(resolve)); return value;
  }
  async function launch(directory) {
    const child = spawn(process.execPath, [join(directory, 'server.mjs')], { stdio: ['ignore', 'pipe', 'pipe'] });
    children.push(child); child.output = ''; child.diagnostics = '';
    child.stdout.on('data', b => child.output += b); child.stderr.on('data', b => child.diagnostics += b);
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(Error('server readiness timeout')), 5000);
      child.stdout.on('data', () => { if (child.output.includes('running')) { clearTimeout(timeout); resolve(); } });
      child.once('exit', code => { clearTimeout(timeout); reject(Error(`server exited ${code}: ${child.output}`)); });
      child.once('error', reject);
    }); return child;
  }
  async function rawRequest(url, path, headers = {}) {
    return new Promise((resolve, reject) => {
      const req = request(url, { path, headers }, res => {
        let body = ''; res.on('data', b => body += b);
        res.on('end', () => resolve({ status: res.statusCode, body, headers: res.headers }));
      });
      req.setTimeout(5000, () => req.destroy(Error('HTTP timeout')));
      req.on('error', reject); req.end();
    });
  }
  async function shutdown(child) {
    if (child.exitCode !== null || child.signalCode !== null) return;
    await new Promise(resolve => {
      const timer = setTimeout(() => child.kill('SIGKILL'), 3000);
      child.once('exit', () => { clearTimeout(timer); resolve(); }); child.kill('SIGTERM');
    });
  }
  async function snapshot(url, condition) {
    const response = await fetch(url + 'events', { signal: AbortSignal.timeout(5000) });
    const reader = response.body.getReader(); let buffer = '';
    try {
      while (true) {
        const { value, done } = await reader.read(); if (done) throw Error('SSE ended');
        buffer += new TextDecoder().decode(value);
        let boundary;
        while ((boundary = buffer.indexOf('\n\n')) >= 0) {
          const frame = buffer.slice(0, boundary); buffer = buffer.slice(boundary + 2);
          const line = frame.split('\n').find(row => row.startsWith('data: '));
          if (line) { const value = JSON.parse(line.slice(6)); if (condition(value)) return value; }
        }
      }
    } finally { await reader.cancel(); }
  }
  try {
    const one = join(root, 'one'), two = join(root, 'two'), input = join(root, 'input.json');
    const port1 = await freePort(); let port2 = await freePort(); while (port2 === port1) port2 = await freePort();
    const first = cli('create-instance.mjs', ['--output', one, '--title', '测试甲', '--port', String(port1)]).data;
    const second = cli('create-instance.mjs', ['--output', two, '--title', '测试乙', '--port', String(port2)]).data;
    check('independent instance IDs and ports', first.instanceId !== second.instanceId && port1 !== port2);
    check('new root has no invented viewpoints', JSON.parse(await readFile(join(one, 'data.json'))).root.children.length === 0);
    check('reject existing directory', cli('create-instance.mjs', ['--output', one, '--title', '不可覆盖'], false).error === 'OUTPUT_EXISTS');
    check('reject invalid port', cli('create-instance.mjs', ['--output', join(root, 'bad'), '--title', '中性', '--port', '0'], false).error === 'INVALID_ARGUMENT');
    for (const file of ['app.js', 'server.mjs', 'data-utils.mjs']) check(`syntax ${file}`, spawnSync(process.execPath, ['--check', join(one, file)]).status === 0);
    const server1 = await launch(one); await launch(two);
    const health = await (await fetch(first.url + 'health')).json();
    check('health verifies instance without host metadata', health.data.instanceId === first.instanceId && Object.keys(health.data).sort().join(',') === 'instanceId,port,revision');
    for (const file of ['', 'app.js', 'styles.css', 'data.js']) check(`static ${file || 'index'}`, (await fetch(first.url + file)).status === 200);
    check('private configuration not exposed', (await fetch(first.url + 'instance.json')).status === 404);
    for (const path of ['/../SKILL.md', '/x/../health', '/%2e%2e/health', '/%2fetc%2fpasswd', '/server.mjs', '/data.json', '/.update.lock', '/info', '/__proto__']) {
      const response = await rawRequest(first.url, path);
      check(`reject non-allowlisted path ${path}`, response.status === 404 && !response.body.includes(root));
    }
    check('reject foreign Host', (await rawRequest(first.url, '/health', { Host: 'untrusted.invalid' })).status === 403);
    check('reject foreign Origin', (await rawRequest(first.url, '/data.js', { Origin: 'https://untrusted.invalid' })).status === 403);
    check('reject cross-site script fetch', (await rawRequest(first.url, '/data.js', { 'Sec-Fetch-Site': 'cross-site' })).status === 403);
    check('resource policy prevents cross-origin embedding', (await rawRequest(first.url, '/data.js')).headers['cross-origin-resource-policy'] === 'same-origin');
    const missing = cli('inspect-instance.mjs', ['--instance', join(root, 'private-missing')], false);
    check('native errors redact local paths', missing.error === 'FILE_NOT_FOUND' && !JSON.stringify(missing).includes(root));
    const invalidArg = cli('inspect-instance.mjs', ['--unknown-' + root], false);
    check('argument errors do not echo inputs', invalidArg.error === 'INVALID_ARGUMENT' && !JSON.stringify(invalidArg).includes(root));
    check('no write API', (await fetch(first.url, { method: 'POST' })).status === 405);
    check('port conflict returns JSON and exits', JSON.parse(spawnSync(process.execPath, [join(two, 'server.mjs'), '--port', String(port1)], { encoding: 'utf8', timeout: 10000 }).stdout.trim()).error === 'PORT_IN_USE');
    const fixture = { title: '测试甲', root: { t: '测试甲', children: [{ t: '段落甲', children: [{ t: '仅测试的子节点' }] }, { t: '段落乙' }] } };
    await writeFile(input, JSON.stringify(fixture));
    const changed = cli('update-instance.mjs', ['--instance', one, '--input', input, '--expected-hash', first.hash]).data;
    check('new IDs automatically assigned', !!changed.snapshot.root.children[0].id);
    check('SSE receives atomic file update', (await snapshot(first.url, value => value.revision >= 2)).data.root.children.length === 2);
    check('second instance unchanged', (await snapshot(second.url, () => true)).data.root.children.length === 0);
    check('stale update rejected', cli('update-instance.mjs', ['--instance', one, '--input', input, '--expected-hash', first.hash], false).error === 'STALE_SNAPSHOT');
    const renamed = structuredClone(changed.snapshot); renamed.root.children.reverse(); renamed.root.children[1].t = '段落甲改名';
    await writeFile(input, JSON.stringify(renamed));
    const updated = cli('update-instance.mjs', ['--instance', one, '--input', input, '--expected-hash', changed.hash]).data;
    check('rename and reorder retain identity', updated.snapshot.root.children[1].id === changed.snapshot.root.children[0].id);
    await snapshot(first.url, value => value.revision >= 3);
    await writeFile(join(one, 'data.json'), '{invalid');
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(Error('invalid snapshot not observed')), 5000);
      server1.stderr.on('data', () => { if (server1.diagnostics.includes('INVALID_DATA')) { clearTimeout(timeout); resolve(); } });
    });
    check('invalid file keeps last good snapshot', (await snapshot(first.url, () => true)).data.root.children[1].t === '段落甲改名');
    await atomicJSON(join(one, 'data.json'), updated.snapshot);
    const inspected = cli('inspect-instance.mjs', ['--instance', one]).data;
    const reset = cli('update-instance.mjs', ['--instance', one, '--reset', '--title', '新讨论', '--expected-hash', inspected.hash]).data;
    check('reset changes generation and empties current instance', reset.snapshot.generation !== updated.snapshot.generation && reset.snapshot.root.children.length === 0);
    check('reset does not touch other instance', cli('inspect-instance.mjs', ['--instance', two]).data.hash === second.hash);
    const duplicate = { title: '中性', root: { id: 'same', t: '中性', children: [{ id: 'same', t: '重复' }] } };
    await writeFile(input, JSON.stringify(duplicate));
    check('duplicate IDs rejected', cli('update-instance.mjs', ['--instance', one, '--input', input, '--expected-hash', reset.hash], false).error === 'INVALID_DATA');
    await writeFile(input, 'not JSON; not executable');
    check('malformed input rejected', cli('update-instance.mjs', ['--instance', one, '--input', input, '--expected-hash', reset.hash], false).error === 'INVALID_DATA');
    check('rejected updates leave content unchanged', cli('inspect-instance.mjs', ['--instance', one]).data.hash === reset.hash);
    await writeFile(join(one, '.update.lock'), '{}');
    try {
      check('existing write lock prevents update', cli('update-instance.mjs', ['--instance', one, '--input', input, '--expected-hash', reset.hash], false).error === 'INSTANCE_BUSY');
    } finally { await rm(join(one, '.update.lock')); }
    if (a.browser) {
      await writeFile(input, JSON.stringify(fixture));
      cli('update-instance.mjs', ['--instance', one, '--input', input, '--expected-hash', reset.hash]);
      const ready = { root, one, two, url1: first.url, url2: second.url, doneFile: join(root, 'browser-done') };
      console.error(JSON.stringify({ browserReady: ready }));
      const deadline = Date.now() + 600000;
      // Bounded waiting belongs only to this opt-in browser test, never user service hosting.
      while (true) {
        try { await access(ready.doneFile); break; } catch { if (Date.now() >= deadline) throw Error('browser verification timed out'); }
        await delay(500);
      }
    }
    for (const child of children) {
      await shutdown(child);
      check('graceful shutdown final JSON', JSON.parse(child.output.trim().split('\n').at(-1)).data.state === 'stopped');
    }
    return { passed: checks.length, checks, browserMode: a.browser, temporaryFilesRemoved: true };
  } catch (error) { console.error(JSON.stringify({ failedAfter: checks.at(-1) || 'initialization', assertion: error.operator || null })); error.code = 'TEST_FAILED'; throw error; }
  finally {
    for (const child of children) await shutdown(child);
    await rm(root, { recursive: true, force: true });
  }
});
