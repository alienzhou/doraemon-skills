import assert from 'node:assert/strict';
import { mkdtemp, readdir, lstat, readFile, cp, rm, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve, dirname, relative, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn, spawnSync } from 'node:child_process';
import { createServer } from 'node:net';
import { run } from './common.mjs';

// No shell, package manager, browser installation, or original working directory
// participates in these tests. All filesystem writes belong to a fresh temp root.
await run(async () => {
  const source = fileURLToPath(new URL('../', import.meta.url));
  const temporary = await mkdtemp(join(tmpdir(), 'mindmap portable '));
  const copy = join(temporary, 'global skills', 'discussion mindmap');
  const checks = [], files = [];
  let child;
  const check = (name, value) => { assert.ok(value, name); checks.push(name); };
  async function inventory(directory) {
    for (const name of await readdir(directory)) {
      const path = join(directory, name), stat = await lstat(path);
      assert.ok(!stat.isSymbolicLink(), 'distribution must not contain symlinks');
      assert.ok(!name.startsWith('.'), 'distribution must not contain hidden files');
      if (stat.isDirectory()) await inventory(path);
      else { assert.ok(stat.isFile()); files.push(path); }
    }
  }
  const env = { ...process.env, HOME: temporary, USERPROFILE: temporary, NODE_PATH: '', NODE_OPTIONS: '' };
  function command(path, parameters = []) {
    const result = spawnSync(process.execPath, [path, ...parameters], { cwd: temporary, env, encoding: 'utf8', timeout: 60000 });
    assert.equal(result.status, 0, 'copied command must succeed');
    const json = JSON.parse(result.stdout.trim().split('\n').at(-1));
    assert.equal(json.ok, true); return json.data;
  }
  try {
    await inventory(source);
    for (const path of files) {
      const text = await readFile(path, 'utf8');
      // Detect host-specific home paths, credentials, corporate dependencies and
      // platform-only browser references without embedding any real local values.
      const privatePattern = new RegExp('(?:/Users/|/home/)[\\w.-]+|[A-Z]:\\\\Users\\\\|\\.' + 'browser-cli|myflicker' + '-browser|https?://[^\\s"\'<>]*(?:corp|intranet)|BEGIN (?:RSA |OPENSSH )?PRIVATE KEY', 'i');
      assert.ok(!privatePattern.test(text), 'private distribution content');
      if (path.endsWith('.md')) {
        for (const match of text.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
          const target = resolve(dirname(path), match[1]);
          const rel = relative(source, target);
          assert.ok(!rel.startsWith('..') && !isAbsolute(rel), 'documentation link stays inside skill');
          assert.ok((await lstat(target)).isFile(), 'documentation link exists');
        }
      }
      if (/\.(?:mjs|js)$/.test(path)) {
        check(`syntax ${relative(source, path)}`, spawnSync(process.execPath, ['--check', path], { env, timeout: 10000 }).status === 0);
        for (const match of text.matchAll(/(?:from\s+|import\s*\()['"]([^'"]+)['"]/g)) {
          const specifier = match[1];
          if (specifier.startsWith('node:')) continue;
          assert.ok(specifier.startsWith('.'), 'no external package imports');
          const target = resolve(dirname(path), specifier), rel = relative(source, target);
          assert.ok(!rel.startsWith('..') && !isAbsolute(rel), 'import stays within skill');
          assert.ok((await lstat(target)).isFile(), 'local import exists');
        }
      }
    }
    check('complete inventory contains no hidden files or symlinks', files.length > 0);
    check('private-content and static import audit', true);
    await cp(source, copy, { recursive: true });
    const regression = command(join(copy, 'scripts', 'test.mjs'));
    check('full dual-instance regression from spaced skill copy', regression.passed >= 40 && regression.temporaryFilesRemoved);
    const isolated = join(temporary, 'unrelated working directory'); await mkdir(isolated);
    const socket = createServer(); await new Promise(resolve => socket.listen(0, '127.0.0.1', resolve));
    const port = socket.address().port; await new Promise(resolve => socket.close(resolve));
    const originalInstance = join(temporary, 'original instance');
    const literal = 'Literal $(not-a-command) `text` & <script>not code</script>';
    const created = command(join(copy, 'scripts', 'create-instance.mjs'), ['--output', originalInstance, '--title', literal, '--port', String(port)]);
    const inspected = command(join(copy, 'scripts', 'inspect-instance.mjs'), ['--instance', originalInstance]);
    check('user text is literal argv and JSON, not shell execution', inspected.snapshot.title === literal);
    const detached = join(temporary, 'detached instance'); await cp(originalInstance, detached, { recursive: true });
    // Delete both the copied skill and source instance. The detached server must
    // run solely from its eight files, with no skill-local imports or assets.
    await rm(copy, { recursive: true }); await rm(originalInstance, { recursive: true });
    child = spawn(process.execPath, [join(detached, 'server.mjs')], { cwd: isolated, env, stdio: ['ignore', 'pipe', 'pipe'] });
    let output = ''; child.stdout.on('data', b => output += b); child.stderr.resume();
    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(Error('detached startup timeout')), 5000);
      child.stdout.on('data', () => { if (output.includes('running')) { clearTimeout(timer); resolve(); } });
      child.once('error', e => { clearTimeout(timer); reject(e); });
      child.once('exit', () => { clearTimeout(timer); reject(Error('detached startup failed')); });
    });
    const health = await (await fetch(created.url + 'health', { signal: AbortSignal.timeout(5000) })).json();
    check('detached instance runs after copied skill deletion', health.data.instanceId === created.instanceId);
    check('health contains only public identity and revision', Object.keys(health.data).sort().join(',') === 'instanceId,port,revision');
    const dataScript = await (await fetch(created.url + 'data.js')).text();
    check('script payload escapes markup and omits generated local paths', !dataScript.includes('<script>') && !dataScript.includes(temporary));
    for (const file of ['index.html', 'app.js', 'styles.css']) {
      check(`detached asset ${file}`, (await fetch(created.url + file)).status === 200);
    }
    // Static-file failures must not serialize native filesystem diagnostics.
    await rm(join(detached, 'styles.css'));
    const broken = await fetch(created.url + 'styles.css');
    check('HTTP error body does not expose local paths', broken.status === 500 && await broken.text() === '');
    // A user-created instance naturally contains the user's own content. Only the
    // neutral skill itself is audited for redistribution; never bundle instances.
    return { passed: checks.length, filesAudited: files.length, regressionPassed: regression.passed, checks, temporaryFilesRemoved: true };
  } catch (error) { console.error(JSON.stringify({ failedAfter: checks.at(-1) || 'inventory', assertion: error.operator || null })); error.code = 'TEST_FAILED'; throw error; }
  finally {
    if (child && child.exitCode === null && child.signalCode === null) await new Promise(resolve => {
      const timer = setTimeout(() => child.kill('SIGKILL'), 3000);
      child.once('exit', () => { clearTimeout(timer); resolve(); }); child.kill('SIGTERM');
    });
    await rm(temporary, { recursive: true, force: true });
  }
});
