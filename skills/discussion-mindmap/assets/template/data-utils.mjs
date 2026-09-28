import { randomUUID, createHash } from 'node:crypto';
import { readFile, writeFile, rename, unlink } from 'node:fs/promises';

// Only deliberately authored messages may cross the CLI/log boundary. Native
// filesystem and parser errors can include private paths or user-supplied text.
export function fail(code, message) { throw Object.assign(new Error(message), { code, publicMessage: true }); }
export function errorResult(error) {
  const aliases = { ENOENT: 'FILE_NOT_FOUND', EACCES: 'PERMISSION_DENIED', EPERM: 'PERMISSION_DENIED', EADDRINUSE: 'PORT_IN_USE' };
  const code = aliases[error.code] || (/^[A-Z][A-Z0-9_]*$/.test(error.code || '') ? error.code : 'UNEXPECTED_ERROR');
  const messages = { FILE_NOT_FOUND: '所需文件或父目录不存在，请核对本次命令参数', PERMISSION_DENIED: '没有访问所需文件或端口的权限', PORT_IN_USE: '端口已占用，请选择其他端口', TEST_FAILED: '回归测试失败，请检查本次测试步骤' };
  return { ok: false, error: code, msg: error.publicMessage ? error.message : messages[code] || '操作失败；请核对参数、文件权限和运行环境（不输出底层路径或输入内容）' };
}
export function title(value) {
  if (typeof value !== 'string' || !value.trim() || value.length > 300 || /[\x00-\x1f\x7f]/.test(value)) fail('INVALID_ARGUMENT', '标题需为 1–300 字符的非空纯文本，不含控制字符');
  return value;
}
export function port(value) {
  if (!/^\d+$/.test(String(value)) || Number(value) < 1024 || Number(value) > 65535) fail('INVALID_ARGUMENT', '端口需为 1024–65535 的整数');
  return Number(value);
}
export function hash(text) { return createHash('sha256').update(text).digest('hex'); }
export function parseJSON(text) {
  try { return JSON.parse(text); } catch { fail('INVALID_DATA', '输入必须是有效 JSON，不接受 JavaScript'); }
}
// Strict snapshots prevent duplicate identities and oversized trees from poisoning live clients.
export function normalize(data, assignIds = false) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) fail('INVALID_DATA', '快照必须为对象');
  title(data.title);
  const ids = new Set(); let count = 0;
  function visit(node, depth = 0) {
    if (++count > 3000 || depth > 40) fail('INVALID_DATA', '最多 3000 节点、40 层');
    if (!node || typeof node.t !== 'string' || node.t.length > 2000 || (node.note !== undefined && (typeof node.note !== 'string' || node.note.length > 10000)) || (node.children !== undefined && !Array.isArray(node.children))) fail('INVALID_DATA', '节点需含文本 t，可选文本 note 与数组 children');
    const id = node.id === undefined && assignIds ? randomUUID() : node.id;
    if (typeof id !== 'string' || !id || id.length > 200 || ids.has(id)) fail('INVALID_DATA', '每个节点必须有唯一非空字符串 id；新节点可在提交时省略');
    ids.add(id);
    return { id, t: node.t, ...(node.note !== undefined ? { note: node.note } : {}), children: (node.children || []).map(child => visit(child, depth + 1)) };
  }
  return { title: data.title, ...(typeof data.generation === 'string' ? { generation: data.generation } : {}), root: visit(data.root) };
}
export function empty(titleText) { return { title: title(titleText), generation: randomUUID(), root: { id: randomUUID(), t: titleText, children: [] } }; }
export async function readJSON(file) { return parseJSON(await readFile(file, 'utf8')); }
export async function atomicJSON(file, value) {
  const temporary = `${file}.${randomUUID()}.tmp`;
  try { await writeFile(temporary, JSON.stringify(value, null, 2) + '\n', { flag: 'wx' }); await rename(temporary, file); }
  finally { await unlink(temporary).catch(error => { if (error.code !== 'ENOENT') throw error; }); }
}
