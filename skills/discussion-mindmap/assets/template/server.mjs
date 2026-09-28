import http from 'node:http';
import { watch } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { normalize, readJSON, port, errorResult, fail } from './data-utils.mjs';

const root = new URL('./', import.meta.url), clients = new Set();
let current, revision = 0, server, watcher, debounce, heartbeat, polling, stopping = false, updating = false, pending = false;
function send(res) { res.write(`data: ${JSON.stringify({ revision, data: current })}\n\n`); }
function stop(error) {
  if (stopping) return;
  stopping = true; clearTimeout(debounce); clearInterval(heartbeat); clearInterval(polling); watcher?.close();
  for (const client of clients) client.end();
  const done = () => { console.log(JSON.stringify(error ? errorResult(error) : { ok: true, data: { state: 'stopped' } })); process.exitCode = error ? 1 : 0; };
  if (server?.listening) { server.close(done); server.closeAllConnections(); } else done();
}
// Serialize reads; a burst of atomic saves cannot publish an older snapshot last.
async function update() {
  if (stopping) return;
  if (updating) { pending = true; return; }
  updating = true;
  try {
    do {
      pending = false;
      try {
        const next = normalize(await readJSON(new URL('data.json', root)));
        if (JSON.stringify(next) !== JSON.stringify(current)) {
          current = next; revision++;
          for (const client of clients) send(client);
          console.error(`Published revision ${revision}`);
        }
      } catch (error) { console.error(JSON.stringify(errorResult(error))); }
    } while (pending && !stopping);
  } finally { updating = false; }
}
try {
  const args = process.argv.slice(2);
  if (args.length && (args.length !== 2 || args[0] !== '--port')) fail('INVALID_ARGUMENT', '用法：node server.mjs [--port 8931]');
  const config = await readJSON(new URL('instance.json', root));
  const listeningPort = port(args[1] ?? config.port);
  current = normalize(await readJSON(new URL('data.json', root))); revision = 1;
  // Watch the directory, not the old inode: atomic rename remains observable.
  // Some filesystems omit filenames or notifications. Polling is a portable
  // fallback; validated snapshots are deduplicated before publication.
  try {
    watcher = watch(root, (_, name) => { if (name == null || String(name) === 'data.json') { clearTimeout(debounce); debounce = setTimeout(update, 60); } });
    watcher.on('error', () => { watcher.close(); console.error('File watching unavailable; using polling'); });
  } catch { console.error('File watching unavailable; using polling'); }
  polling = setInterval(update, 1000);
  server = http.createServer(async (req, res) => {
    try {
      // Reject foreign Host/Origin values: loopback binding alone does not stop
      // DNS rebinding or another website embedding the executable data endpoint.
      const hosts = new Set([`127.0.0.1:${listeningPort}`, `localhost:${listeningPort}`]);
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
      res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'");
      if (!hosts.has(req.headers.host) || (req.headers.origin && req.headers.origin !== `http://${req.headers.host}`) || req.headers['sec-fetch-site'] === 'cross-site') { res.writeHead(403).end(); return; }
      // Match raw paths against the resource allowlist, before URL normalization
      // can turn traversal segments into a valid endpoint. No filesystem join.
      const path = req.url.split('?')[0];
      if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405, { Allow: 'GET, HEAD' }).end(); return; }
      if (path === '/events' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' });
        res.write('retry: 1000\n\n'); clients.add(res); send(res);
        res.on('close', () => clients.delete(res)); res.on('error', () => clients.delete(res)); return;
      }
      let body, type;
      if (path === '/health') { body = JSON.stringify({ ok: true, data: { instanceId: config.instanceId, port: listeningPort, revision } }); type = 'application/json'; }
      else if (path === '/data.js') {
        // Serve the last validated snapshot, not executable user-authored source.
        body = `window.MINDMAP = ${JSON.stringify(current).replace(/</g, '\\u003c')};\n`; type = 'text/javascript';
      } else {
        const files = { '/': 'index.html', '/index.html': 'index.html', '/app.js': 'app.js', '/styles.css': 'styles.css' };
        if (!Object.hasOwn(files, path)) { res.writeHead(404).end(); return; }
        body = await readFile(new URL(files[path], root)); type = path.endsWith('.js') ? 'text/javascript' : path.endsWith('.css') ? 'text/css' : 'text/html';
      }
      res.writeHead(200, { 'Content-Type': `${type}; charset=utf-8`, 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
      res.end(req.method === 'HEAD' ? undefined : body);
    } catch (error) { console.error(JSON.stringify(errorResult(error))); if (!res.headersSent) res.writeHead(500); res.end(); }
  });
  server.on('error', stop);
  heartbeat = setInterval(() => { for (const client of clients) client.write(': heartbeat\n\n'); }, 15000);
  server.listen(listeningPort, '127.0.0.1', () => console.log(JSON.stringify({ ok: true, data: { state: 'running', pid: process.pid, instanceId: config.instanceId, url: `http://127.0.0.1:${listeningPort}/` } })));
  process.on('SIGINT', () => stop()); process.on('SIGTERM', () => stop());
} catch (error) { stop(error); }
