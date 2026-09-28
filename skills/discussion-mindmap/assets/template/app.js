'use strict';

const $ = id => document.getElementById(id);
const stage = $('stage'), canvas = $('canvas'), nodesElement = $('nodes'), svg = $('edges');
const GAP_X = 60, GAP_Y = 16, MIN_ZOOM = .03, MAX_ZOOM = 4;
const collapsed = new Set();
let model, nodes = new Map(), visible = [], selectedId = null, focusedId = null;
let view = { x: 0, y: 0, k: 1 }, viewMode = 'fit', animation = null;
let matches = [], resultIndex = 0, query = '', drag = null, toastTimer;
let viewport = { width: stage.clientWidth, height: stage.clientHeight };
let inputMode = 'trackpad';
// Presentation owns only transient UI state; the content snapshot is never rewritten.
const presentation = { active: false, ids: [], index: 0, playing: false, timer: null, saved: null, fullscreenOwned: false };
try { inputMode = localStorage.getItem('mindmap-input-mode') === 'mouse' ? 'mouse' : 'trackpad'; } catch {}

// Explicit IDs survive renames/moves. Otherwise use title paths (not array indices),
// so inserting/reordering siblings does not attach selection or collapse to the wrong node.
function indexModel(data) {
  const indexed = new Map();
  function visit(source, parent = null, depth = 0, key = 'root') {
    if (!source || typeof source.t !== 'string' || (source.children !== undefined && !Array.isArray(source.children))) throw Error('无效节点');
    const id = source.id !== undefined ? `id:${source.id}` : key;
    if (indexed.has(id)) throw Error('节点 ID 重复');
    const node = { id, t: source.t, note: source.note, todo: source.todo, parent, depth, children: [] };
    indexed.set(id, node);
    const occurrences = new Map();
    node.children = (source.children || []).map(child => {
      const name = String(child.t), ordinal = occurrences.get(name) || 0;
      occurrences.set(name, ordinal + 1);
      return visit(child, node, depth + 1, `${id}/${encodeURIComponent(name)}~${ordinal}`);
    });
    return node;
  }
  const root = visit(data.root);
  return { root, indexed };
}

function shownChildren(node) { return collapsed.has(node.id) ? [] : node.children; }
function isWithin(node, ancestorId) {
  for (let current = node; current; current = current.parent) if (current.id === ancestorId) return true;
  return false;
}
function centerOf(node) { return { x: node.x + node.w / 2, y: node.y + node.h / 2 }; }
function screenPoint(point) { return { x: view.x + point.x * view.k, y: view.y + point.y * view.k }; }
function anchorFor(node) { return node?.el?.isConnected ? { id: node.id, point: screenPoint(centerOf(node)) } : null; }
function restoreAnchor(anchor) {
  const node = anchor && nodes.get(anchor.id);
  if (!node?.el?.isConnected) return;
  const center = centerOf(node);
  view.x = anchor.point.x - center.x * view.k;
  view.y = anchor.point.y - center.y * view.k;
}

function makeNode(node) {
  const element = document.createElement('div');
  element.className = `node${node.depth === 0 ? ' root' : node.depth === 1 ? ' d1' : ''}${node.todo ? ' todo' : ''}`;
  element.dataset.id = node.id;
  element.setAttribute('role', 'treeitem');
  element.setAttribute('aria-level', node.depth + 1);
  element.setAttribute('aria-label', [node.t, node.note, node.todo ? '待补充' : ''].filter(Boolean).join('，'));
  const title = document.createElement('span');
  title.textContent = node.t;
  element.append(title);
  if (node.note) {
    const note = document.createElement('span');
    note.className = 'note'; note.textContent = node.note; note.title = node.note;
    element.append(note);
  }
  if (node.children.length) {
    const toggle = document.createElement('button');
    toggle.className = 'toggle'; toggle.tabIndex = -1;
    const isCollapsed = collapsed.has(node.id);
    toggle.textContent = isCollapsed ? node.children.length : '−';
    toggle.setAttribute('aria-label', `${isCollapsed ? '展开' : '折叠'} ${node.t}`);
    toggle.setAttribute('aria-expanded', !isCollapsed);
    element.setAttribute('aria-expanded', !isCollapsed);
    toggle.title = `${isCollapsed ? '展开' : '折叠'} ${node.children.length} 个子分支`;
    toggle.addEventListener('click', event => { event.stopPropagation(); toggleNode(node); });
    toggle.addEventListener('dblclick', event => event.stopPropagation());
    element.append(toggle);
  }
  element.addEventListener('click', event => { if (!event.target.closest('.toggle')) selectNode(node); });
  element.addEventListener('dblclick', event => { if (!event.target.closest('.toggle')) focusBranch(node); });
  element.addEventListener('focus', () => { if (selectedId !== node.id) selectNode(node, false); });
  node.el = element;
  nodesElement.append(element);
  node.w = element.offsetWidth; node.h = element.offsetHeight;
  visible.push(node);
  shownChildren(node).forEach(makeNode);
}

function layout(node, x = 0) {
  node.x = x;
  const children = shownChildren(node);
  node.subtreeHeight = Math.max(node.h, children.reduce((sum, child) => sum + layout(child, x + node.w + GAP_X), 0) + Math.max(0, children.length - 1) * GAP_Y);
  return node.subtreeHeight;
}
function place(node, top = 0) {
  node.y = top + (node.subtreeHeight - node.h) / 2;
  node.el.style.left = `${node.x}px`; node.el.style.top = `${node.y}px`;
  const children = shownChildren(node);
  const height = children.reduce((sum, child) => sum + child.subtreeHeight, 0) + Math.max(0, children.length - 1) * GAP_Y;
  let cursor = top + (node.subtreeHeight - height) / 2;
  children.forEach(child => { place(child, cursor); cursor += child.subtreeHeight + GAP_Y; });
}
function drawEdges() {
  svg.replaceChildren();
  visible.forEach(node => {
    if (!node.parent) return;
    const parent = node.parent, x1 = parent.x + parent.w, y1 = parent.y + parent.h / 2;
    const x2 = node.x, y2 = node.y + node.h / 2, mid = x1 + (x2 - x1) * .55;
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', `M${x1},${y1} C${mid},${y1} ${mid},${y2} ${x2},${y2}`);
    path.dataset.id = node.id; svg.append(path);
  });
}
function render(anchor = null) {
  stopAnimation();
  // Rebuild only visible nodes; stale child elements/positions cannot leak after collapse.
  nodesElement.replaceChildren(); visible = [];
  makeNode(model.root); layout(model.root); place(model.root); drawEdges();
  let selection = nodes.get(selectedId);
  while (selection && !selection.el?.isConnected) selection = selection.parent;
  selectedId = selection?.id || null;
  if (focusedId && !nodes.get(focusedId)?.el?.isConnected) focusedId = selectedId;
  restoreAnchor(anchor); updateHighlights(); apply();
}
function updateHighlights() {
  const matchIds = new Set(matches.map(node => node.id));
  visible.forEach(node => {
    const selected = node.id === selectedId;
    node.el.classList.toggle('selected', selected);
    node.el.classList.toggle('branch', !!selectedId && node.id !== selectedId && isWithin(node, selectedId));
    node.el.classList.toggle('dimmed', !!focusedId && !isWithin(node, focusedId));
    node.el.classList.toggle('match', !!query && matchIds.has(node.id));
    node.el.setAttribute('aria-selected', selected);
    node.el.tabIndex = selected || (!selectedId && node === model.root) ? 0 : -1;
  });
  [...svg.children].forEach(path => {
    const node = nodes.get(path.dataset.id);
    path.setAttribute('class', `edge${selectedId && isWithin(node, selectedId) ? ' emphasis' : ''}${focusedId && !isWithin(node.parent, focusedId) ? ' dimmed' : ''}`);
  });
  $('selection-label').textContent = focusedId ? `聚焦 · ${nodes.get(focusedId).t}` : selectedId ? nodes.get(selectedId).t : '全图';
  $('node-count').textContent = `${visible.length} / ${nodes.size} 节点`;
  $('focus-selection').disabled = !selectedId;
  $('leave-focus').hidden = !focusedId;
}
function selectNode(node, focus = true) {
  selectedId = node.id;
  if (focusedId && !isWithin(node, focusedId)) { focusedId = null; viewMode = 'free'; }
  updateHighlights();
  if (focus) node.el?.focus({ preventScroll: true });
}
function toggleNode(node) {
  const anchor = anchorFor(node);
  if (collapsed.has(node.id)) collapsed.delete(node.id); else collapsed.add(node.id);
  if (selectedId && isWithin(nodes.get(selectedId), node.id)) selectedId = node.id;
  if (focusedId && isWithin(nodes.get(focusedId), node.id)) focusedId = node.id;
  viewMode = 'free'; render(anchor);
  (nodes.get(selectedId)?.el || stage).focus({ preventScroll: true });
}
function expandAll(expand) {
  const anchor = anchorFor(nodes.get(selectedId));
  collapsed.clear();
  if (!expand) model.root.children.filter(node => node.children.length).forEach(node => collapsed.add(node.id));
  focusedId = null; render(anchor); fit();
}

function apply() {
  canvas.style.transform = `translate(${view.x}px,${view.y}px) scale(${view.k})`;
  $('zoom-value').textContent = `${Math.round(view.k * 100)}%`;
  $('zoom-out').disabled = view.k <= MIN_ZOOM;
  $('zoom-in').disabled = view.k >= MAX_ZOOM;
}
function stopAnimation() { if (animation) cancelAnimationFrame(animation); animation = null; }
function moveView(target, animate = true) {
  stopAnimation();
  if (!animate || matchMedia('(prefers-reduced-motion: reduce)').matches) { view = target; apply(); return; }
  const from = { ...view }, start = performance.now();
  function frame(now) {
    const t = Math.min(1, (now - start) / 230), eased = 1 - (1 - t) ** 3;
    view = { x: from.x + (target.x - from.x) * eased, y: from.y + (target.y - from.y) * eased, k: from.k + (target.k - from.k) * eased };
    apply(); animation = t < 1 ? requestAnimationFrame(frame) : null;
  }
  animation = requestAnimationFrame(frame);
}
function bounds(list) {
  return { left: Math.min(...list.map(n => n.x)), top: Math.min(...list.map(n => n.y)), right: Math.max(...list.map(n => n.x + n.w)), bottom: Math.max(...list.map(n => n.y + n.h)) };
}
function fitNodes(list, max = 1, animate = true) {
  if (!list.length) return;
  const b = bounds(list), width = stage.clientWidth, height = stage.clientHeight;
  const padX = Math.min(64, width * .08), top = Math.min(76, height * .22), bottom = Math.min(32, height * .1);
  const k = Math.max(MIN_ZOOM, Math.min(max, (width - padX * 2) / (b.right - b.left), (height - top - bottom) / (b.bottom - b.top)));
  moveView({ x: width / 2 - (b.left + b.right) / 2 * k, y: top + (height - top - bottom) / 2 - (b.top + b.bottom) / 2 * k, k }, animate);
}
function fit(animate = true) { focusedId = null; viewMode = 'fit'; updateHighlights(); fitNodes(visible, 1, animate); }
function focusBranch(node = nodes.get(selectedId), animate = true) {
  if (!node) { notify('先单击选择一个节点'); return; }
  selectNode(node); focusedId = node.id; viewMode = 'focus'; updateHighlights();
  fitNodes(visible.filter(child => isWithin(child, node.id)), 1.35, animate);
}
function zoomAt(scale, x = stage.clientWidth / 2, y = stage.clientHeight / 2) {
  stopAnimation(); viewMode = 'free';
  const k = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, scale)), ratio = k / view.k;
  // Keep the same world coordinate under the pointer, including the stage's header offset.
  view = { x: x - (x - view.x) * ratio, y: y - (y - view.y) * ratio, k }; apply();
}
function revealNode(node) {
  let changed = false;
  for (let parent = node.parent; parent; parent = parent.parent) if (collapsed.delete(parent.id)) changed = true;
  focusedId = null;
  if (changed) render();
  selectNode(node); viewMode = 'free';
  const center = centerOf(node), k = Math.min(1.2, Math.max(.8, view.k), (stage.clientWidth - 48) / node.w);
  moveView({ x: stage.clientWidth / 2 - center.x * k, y: stage.clientHeight / 2 - center.y * k, k });
}
function ensureInView(node) {
  const point = screenPoint({ x: node.x, y: node.y });
  if (point.x < 30 || point.y < 70 || point.x + node.w * view.k > stage.clientWidth - 30 || point.y + node.h * view.k > stage.clientHeight - 30) {
    const center = centerOf(node); viewMode = 'free';
    moveView({ ...view, x: stage.clientWidth / 2 - center.x * view.k, y: stage.clientHeight / 2 - center.y * view.k });
  }
}

// A camera per root child, in author order. No inferred sub-slides or added copy.
function updatePresentationControls() {
  const node = nodes.get(presentation.ids[presentation.index]);
  const last = presentation.index >= presentation.ids.length - 1;
  $('presentation-map-title').textContent = $('map-title').textContent;
  $('presentation-title').textContent = node?.t || '暂无主段落';
  $('presentation-progress').textContent = `${presentation.ids.length ? presentation.index + 1 : 0} / ${presentation.ids.length}`;
  $('present-prev').disabled = presentation.index === 0;
  $('present-next').disabled = last;
  $('present-next').textContent = last ? '已到末段' : '下一段 →';
  $('present-play').disabled = last;
  $('present-play').textContent = presentation.playing ? 'Ⅱ 暂停预览' : '▷ 自动预览';
  $('present-play').setAttribute('aria-pressed', presentation.playing);
  $('presentation-status').textContent = presentation.playing ? `每 ${$('present-duration').value} 秒切换 · 仅预览` : `${last ? '已到末段 · 已停止' : '已暂停'} · 仅预览，非口播计时`;
}
function pausePresentation() {
  clearTimeout(presentation.timer); presentation.timer = null; presentation.playing = false;
  if (presentation.active) updatePresentationControls();
}
function schedulePresentation() {
  clearTimeout(presentation.timer); presentation.timer = null;
  if (!presentation.active || !presentation.playing) return;
  presentation.timer = setTimeout(() => {
    presentation.timer = null;
    if (presentation.active && presentation.playing) showPresentationCamera(presentation.index + 1);
  }, Number($('present-duration').value) * 1000);
}
function showPresentationCamera(index, animate = true) {
  if (!presentation.active || !presentation.ids.length) return;
  presentation.index = Math.max(0, Math.min(index, presentation.ids.length - 1));
  selectedId = focusedId = presentation.ids[presentation.index]; viewMode = 'presentation';
  updateHighlights();
  fitNodes(visible.filter(node => isWithin(node, focusedId)), 1.35, animate);
  if (presentation.index === presentation.ids.length - 1) pausePresentation();
  updatePresentationControls(); schedulePresentation();
}
function stepPresentation(delta) {
  // Manual navigation pauses preview, so a pending timeout cannot skip a paragraph.
  pausePresentation(); showPresentationCamera(presentation.index + delta);
}
function enterPresentation() {
  if (presentation.active) return;
  if (!model.root.children.length) { notify('暂无可演示的主段落'); return; }
  stopAnimation();
  presentation.saved = { view: { ...view }, viewMode, selectedId, focusedId, collapsed: new Set(collapsed), focus: document.activeElement, stageLabel: stage.getAttribute('aria-label') };
  closeSearch(); toggleHelp(false);
  presentation.active = true;
  presentation.ids = model.root.children.map(node => node.id);
  document.body.classList.add('presenting');
  $('presentation-header').hidden = $('presentation-controls').hidden = false;
  canvas.inert = true;
  stage.setAttribute('aria-label', '段落演示，空格或右箭头下一段，左箭头上一段，Esc 退出');
  collapsed.clear(); render(); showPresentationCamera(0);
  stage.focus({ preventScroll: true });
}
function exitPresentation() {
  if (!presentation.active) return;
  pausePresentation(); stopAnimation();
  const saved = presentation.saved;
  presentation.active = false; presentation.saved = null;
  document.body.classList.remove('presenting');
  $('presentation-header').hidden = $('presentation-controls').hidden = true;
  canvas.inert = false; stage.setAttribute('aria-label', saved.stageLabel);
  // Live snapshots may remove nodes; restore only surviving identities, never stale content.
  collapsed.clear(); for (const id of saved.collapsed) if (nodes.has(id)) collapsed.add(id);
  selectedId = nodes.has(saved.selectedId) ? saved.selectedId : null;
  focusedId = nodes.has(saved.focusedId) ? saved.focusedId : null;
  viewMode = saved.viewMode === 'focus' && !focusedId ? 'free' : saved.viewMode;
  view = saved.view; render();
  viewport = { width: stage.clientWidth, height: stage.clientHeight };
  (saved.focus?.isConnected ? saved.focus : nodes.get(selectedId)?.el || stage).focus({ preventScroll: true });
  if (presentation.fullscreenOwned && document.fullscreenElement) document.exitFullscreen().catch(() => notify('请使用浏览器退出全屏'));
  presentation.fullscreenOwned = false;
}
$('present-start').onclick = enterPresentation;
$('present-prev').onclick = () => stepPresentation(-1);
$('present-next').onclick = () => stepPresentation(1);
$('present-exit').onclick = exitPresentation;
$('present-play').onclick = () => {
  if (presentation.playing) pausePresentation();
  else if (presentation.index < presentation.ids.length - 1) {
    presentation.playing = true; updatePresentationControls(); schedulePresentation();
  }
};
$('present-duration').onchange = () => { updatePresentationControls(); schedulePresentation(); };
$('present-fullscreen').hidden = !document.fullscreenEnabled;
$('present-fullscreen').onclick = async () => {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else {
      await document.documentElement.requestFullscreen(); presentation.fullscreenOwned = true;
      if (!presentation.active) { presentation.fullscreenOwned = false; await document.exitFullscreen(); }
    }
  } catch { notify('当前环境不支持全屏，可继续窗口演示'); }
};
document.addEventListener('fullscreenchange', () => {
  $('present-fullscreen').textContent = document.fullscreenElement ? '退出全屏' : '全屏';
  $('present-fullscreen').setAttribute('aria-pressed', !!document.fullscreenElement);
  if (!document.fullscreenElement) presentation.fullscreenOwned = false;
});
document.addEventListener('visibilitychange', () => { if (document.hidden) pausePresentation(); });
window.addEventListener('pagehide', pausePresentation);

function setInputMode() {
  inputMode = $('input-mode').value;
  try { localStorage.setItem('mindmap-input-mode', inputMode); } catch {}
  $('gesture-hint').textContent = inputMode === 'mouse' ? '滚轮缩放 · Shift + 滚轮水平平移 · 拖动空白平移' : '双指滚动平移 · Ctrl / ⌘ + 滚轮缩放 · 拖动空白平移';
}
$('input-mode').value = inputMode; setInputMode();
$('input-mode').addEventListener('change', setInputMode);
stage.addEventListener('wheel', event => {
  event.preventDefault();
  if (presentation.active) return;
  const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? stage.clientHeight : 1;
  const dx = event.deltaX * unit, dy = event.deltaY * unit;
  if (event.ctrlKey || event.metaKey || (inputMode === 'mouse' && !event.shiftKey)) {
    const rect = stage.getBoundingClientRect();
    zoomAt(view.k * Math.exp(-Math.max(-200, Math.min(200, dy)) * .006), event.clientX - rect.left, event.clientY - rect.top);
  } else {
    stopAnimation(); viewMode = 'free';
    view.x -= event.shiftKey && !dx ? dy : dx;
    view.y -= event.shiftKey && !dx ? 0 : dy;
    apply();
  }
}, { passive: false });
stage.addEventListener('pointerdown', event => {
  // Node and toggle gestures never begin panning. Pointer capture keeps background
  // drags reliable even when the pointer leaves the viewport.
  if (presentation.active || event.button !== 0 || event.target.closest('.node')) return;
  stopAnimation(); stage.focus({ preventScroll: true });
  drag = { id: event.pointerId, startX: event.clientX, startY: event.clientY, x: view.x, y: view.y, moved: false };
  stage.setPointerCapture(event.pointerId); stage.classList.add('drag');
});
stage.addEventListener('pointermove', event => {
  if (!drag || event.pointerId !== drag.id) return;
  const dx = event.clientX - drag.startX, dy = event.clientY - drag.startY;
  if (Math.hypot(dx, dy) > 3) drag.moved = true;
  if (drag.moved) { viewMode = 'free'; view.x = drag.x + dx; view.y = drag.y + dy; apply(); }
});
function endDrag(event) {
  if (!drag || event.pointerId !== drag.id) return;
  const wasClick = !drag.moved && event.type === 'pointerup';
  drag = null; stage.classList.remove('drag');
  if (stage.hasPointerCapture(event.pointerId)) stage.releasePointerCapture(event.pointerId);
  if (wasClick) { selectedId = null; focusedId = null; viewMode = 'free'; updateHighlights(); }
}
['pointerup', 'pointercancel', 'lostpointercapture'].forEach(type => stage.addEventListener(type, endDrag));

function openSearch() { $('search-panel').hidden = false; $('search-input').focus(); $('search-input').select(); updateSearch(); }
function closeSearch() { $('search-panel').hidden = true; query = ''; $('search-input').value = ''; matches = []; updateHighlights(); stage.focus(); }
function updateSearch() {
  query = $('search-input').value.trim().toLocaleLowerCase();
  matches = query ? [...nodes.values()].filter(node => `${node.t} ${node.note || ''}`.toLocaleLowerCase().includes(query)) : [];
  resultIndex = Math.max(0, Math.min(resultIndex, matches.length - 1));
  $('search-summary').textContent = query ? `${matches.length} 个匹配节点${matches.length ? ' · 包含已折叠内容' : '，试试其他关键词'}` : '搜索整张脑图，包括已折叠的分支';
  $('search-results').replaceChildren();
  matches.forEach((node, index) => {
    const button = document.createElement('button'); button.className = 'search-result';
    button.textContent = node.t; button.classList.toggle('active', index === resultIndex);
    const breadcrumb = document.createElement('small'), parts = [];
    for (let parent = node.parent; parent; parent = parent.parent) parts.unshift(parent.t);
    breadcrumb.textContent = [...parts, node.note || ''].filter(Boolean).join(' / ') || '根节点';
    button.append(breadcrumb); button.addEventListener('click', () => chooseResult(index));
    $('search-results').append(button);
  });
  updateHighlights();
}
function chooseResult(index = resultIndex) {
  const node = matches[index]; if (!node) return;
  closeSearch(); revealNode(node); notify(`已定位：${node.t}`);
}
$('search-input').addEventListener('input', () => { resultIndex = 0; updateSearch(); });
$('search-input').addEventListener('keydown', event => {
  if (event.key === 'Enter') { event.preventDefault(); chooseResult(); }
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault();
    resultIndex = (resultIndex + (event.key === 'ArrowDown' ? 1 : -1) + matches.length) % (matches.length || 1);
    updateSearch(); $('search-results').children[resultIndex]?.scrollIntoView({ block: 'nearest' });
  }
});

document.addEventListener('keydown', event => {
  if (event.isComposing) return;
  if (presentation.active) {
    if (event.key === 'Escape') { event.preventDefault(); exitPresentation(); return; }
    // Leave native select/Tab/Enter behavior intact; never fall through to map shortcuts.
    if (event.target.closest('select,input,textarea') || event.ctrlKey || event.metaKey || event.altKey) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') event.preventDefault();
      return;
    }
    if ([' ', 'ArrowRight', 'ArrowLeft'].includes(event.key)) {
      event.preventDefault(); if (!event.repeat) stepPresentation(event.key === 'ArrowLeft' ? -1 : 1);
    }
    return;
  }
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); openSearch(); return; }
  if (event.key === 'Escape') {
    event.preventDefault();
    if (!$('search-panel').hidden) { closeSearch(); return; }
    if (!$('help').hidden) { toggleHelp(false); return; }
    selectedId = null; focusedId = null; fit(); stage.focus(); return;
  }
  if (event.target.closest('input,textarea,select') || event.ctrlKey || event.metaKey || event.altKey) return;
  if (['+', '=', '-', '_'].includes(event.key)) { event.preventDefault(); zoomAt(view.k * (['+', '='].includes(event.key) ? 1.2 : 1 / 1.2)); return; }
  if (event.shiftKey && event.code === 'Digit1') { event.preventDefault(); fit(); return; }
  if (event.shiftKey && event.code === 'Digit0') { event.preventDefault(); zoomAt(1); return; }
  if (event.key.toLowerCase() === 'f') { event.preventDefault(); focusBranch(); return; }
  if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
  if (event.target.closest('button') && !event.target.closest('.node')) return;
  event.preventDefault();
  let node = nodes.get(selectedId) || model.root, next = node;
  if (event.key === 'ArrowLeft') next = node.parent || node;
  if (event.key === 'ArrowRight') {
    if (collapsed.has(node.id)) toggleNode(node);
    next = node.children[0] || node;
  }
  if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
    const siblings = node.parent ? shownChildren(node.parent) : [node];
    next = siblings[Math.max(0, Math.min(siblings.length - 1, siblings.indexOf(node) + (event.key === 'ArrowDown' ? 1 : -1)))];
  }
  selectNode(next); ensureInView(next);
});
function toggleHelp(open = $('help').hidden) { $('help').hidden = !open; $('help-toggle').setAttribute('aria-expanded', open); }
$('search-open').onclick = openSearch; $('search-close').onclick = closeSearch;
$('fit').onclick = () => fit(); $('leave-focus').onclick = () => fit();
$('focus-selection').onclick = () => focusBranch();
$('zoom-in').onclick = () => zoomAt(view.k * 1.2); $('zoom-out').onclick = () => zoomAt(view.k / 1.2); $('zoom-reset').onclick = () => zoomAt(1);
$('expand-all').onclick = () => expandAll(true); $('collapse-all').onclick = () => expandAll(false);
$('help-toggle').onclick = () => toggleHelp();

// Fit modes re-fit after resize; manual views preserve the world coordinate at center.
new ResizeObserver(() => {
  const next = { width: stage.clientWidth, height: stage.clientHeight };
  if (next.width === viewport.width && next.height === viewport.height) return;
  stopAnimation();
  if (presentation.active) showPresentationCamera(presentation.index, false);
  else if (viewMode === 'fit') fit(false);
  else if (viewMode === 'focus' && nodes.has(focusedId)) focusBranch(nodes.get(focusedId), false);
  else { view.x += (next.width - viewport.width) / 2; view.y += (next.height - viewport.height) / 2; apply(); }
  viewport = next;
}).observe(stage);
function notify(message) {
  clearTimeout(toastTimer); $('toast').textContent = message; $('toast').classList.add('visible');
  toastTimer = setTimeout(() => $('toast').classList.remove('visible'), 2200);
}
function acceptData(data, preserve = true) {
  // Validate/index the complete snapshot first. Invalid SSE data cannot erase a good map.
  const next = indexModel(data);
  const reset = preserve && data.generation !== window.MINDMAP?.generation;
  // A deliberate restart drops only this page's transient state, not other instances.
  if (reset) {
    if (presentation.active) exitPresentation();
    collapsed.clear(); selectedId = focusedId = null;
    closeSearch(); toggleHelp(false); preserve = false;
  }
  const cameraId = presentation.active ? presentation.ids[presentation.index] : null;
  stopAnimation();
  let anchor = null;
  const keyboardOnNode = !!document.activeElement?.closest('.node');
  if (preserve && visible.length) {
    const selected = nodes.get(selectedId);
    const candidate = selected?.el?.isConnected ? selected : [...visible].sort((a, b) => {
      const distance = n => { const p = screenPoint(centerOf(n)); return Math.hypot(p.x - stage.clientWidth / 2, p.y - stage.clientHeight / 2); };
      return distance(a) - distance(b);
    })[0];
    anchor = anchorFor(candidate);
    // If a selected node was removed/renamed, fall back to its closest surviving parent.
    let surviving = selected;
    while (surviving && !next.indexed.has(surviving.id)) surviving = surviving.parent;
    selectedId = surviving?.id || null;
  }
  model = next; nodes = next.indexed;
  for (const id of collapsed) if (!nodes.has(id)) collapsed.delete(id);
  if (!nodes.has(focusedId)) focusedId = null;
  $('map-title').textContent = data.title || model.root.t; document.title = `${data.title || model.root.t} · 思路画布`;
  render(anchor);
  if (reset) fit(false);
  if (presentation.active) {
    // Keep the current identity through sibling insertion/reordering. A removed or
    // unidentifiable renamed camera falls back to the nearest ordinal, paused.
    pausePresentation();
    presentation.ids = model.root.children.map(node => node.id);
    if (!presentation.ids.length) { exitPresentation(); notify('主段落已移除 · 已退出演示'); }
    else {
      const survivingIndex = presentation.ids.indexOf(cameraId);
      showPresentationCamera(survivingIndex < 0 ? Math.min(presentation.index, presentation.ids.length - 1) : survivingIndex);
      notify(survivingIndex < 0 ? '当前段落已变更 · 已暂停并定位相邻段落' : '内容已更新 · 保留当前段落并暂停预览');
    }
    return;
  }
  if (!$('search-panel').hidden) updateSearch();
  if (keyboardOnNode) (nodes.get(selectedId)?.el || stage).focus({ preventScroll: true });
}
acceptData(window.MINDMAP, false); fit(false);

// Native EventSource reconnects, and the server sends a complete snapshot on connect.
// Keep scale, a visual anchor, selection and collapse; never auto-fit a live update.
const events = new EventSource('/events');
let liveRevision = null, lastSnapshot = JSON.stringify(window.MINDMAP);
function liveState(text, state) { $('live-status').textContent = text; $('live-status').dataset.state = state; }
events.onopen = () => liveState('实时同步已连接', 'connected');
events.onerror = () => liveState('连接中断 · 正在重连', 'connecting');
events.onmessage = ({ data }) => {
  try {
    const snapshot = JSON.parse(data), serialized = JSON.stringify(snapshot.data);
    if (snapshot.revision === liveRevision && serialized === lastSnapshot) return;
    if (serialized !== lastSnapshot) {
      const restarted = snapshot.data.generation !== window.MINDMAP?.generation;
      acceptData(snapshot.data); window.MINDMAP = snapshot.data;
      if (liveRevision !== null && !presentation.active) notify(restarted ? '已重置当前讨论 · 返回全图' : '内容已更新 · 已保留当前视角');
    }
    lastSnapshot = serialized; liveRevision = snapshot.revision;
    liveState('实时同步已连接', 'connected');
  } catch (error) { liveState('更新无效 · 保留上一版本', 'error'); console.error('Mindmap update rejected:', error); }
};
