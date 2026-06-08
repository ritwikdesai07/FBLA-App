/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const workspaceRoot = process.cwd();
const fblaRoot = path.join(workspaceRoot, 'FBLA');
const fileListPath = path.join(workspaceRoot, '.codex_filelist.txt');

const readText = (absPath) => fs.readFileSync(absPath, 'utf8');
const sha1 = (buf) => crypto.createHash('sha1').update(buf).digest('hex');

const toPosix = (p) => p.split(path.sep).join('/');
const toWorkspaceRel = (absPath) => toPosix(path.relative(workspaceRoot, absPath));

const fileExists = (absPath) => {
  try {
    return fs.statSync(absPath).isFile();
  } catch {
    return false;
  }
};

const resolveInternalImport = (fromAbs, spec) => {
  let candidate;
  if (spec.startsWith('@/')) {
    candidate = path.join(fblaRoot, spec.slice(2));
  } else if (spec.startsWith('.')) {
    candidate = path.resolve(path.dirname(fromAbs), spec);
  } else {
    return null; // external package
  }

  // Exact match
  if (fileExists(candidate)) return candidate;

  // Try extensions
  const exts = ['.ts', '.tsx', '.js', '.jsx', '.json'];
  for (const ext of exts) {
    if (fileExists(candidate + ext)) return candidate + ext;
  }

  // Try folder index.*
  for (const ext of exts) {
    const idx = path.join(candidate, 'index' + ext);
    if (fileExists(idx)) return idx;
  }

  // Some imports target asset-ish paths (images/pdfs) via bundler resolution; keep best-effort path.
  const assetExts = ['.png', '.jpg', '.jpeg', '.pdf'];
  for (const ext of assetExts) {
    if (fileExists(candidate + ext)) return candidate + ext;
  }

  return null;
};

const parseImports = (src) => {
  const specs = [];
  const re = /^\s*import\s+(?:type\s+)?[\s\S]*?\sfrom\s+['"]([^'"]+)['"]\s*;?\s*$/gm;
  let m;
  while ((m = re.exec(src))) specs.push(m[1]);

  // Handle `import('x')` used for dynamic imports (rare here, but cheap to detect).
  const dyn = /import\(\s*['"]([^'"]+)['"]\s*\)/g;
  while ((m = dyn.exec(src))) specs.push(m[1]);

  // Handle common require() usage in scripts.
  const req = /require\(\s*['"]([^'"]+)['"]\s*\)/g;
  while ((m = req.exec(src))) specs.push(m[1]);
  return [...new Set(specs)];
};

const parseExports = (src) => {
  const exports = new Set();

  // Named exports
  const re = /^\s*export\s+(?:type|interface|const|let|var|function|class|enum)\s+([A-Za-z0-9_$]+)/gm;
  let m;
  while ((m = re.exec(src))) exports.add(m[1]);

  // `export { a, b as c }`
  const re2 = /^\s*export\s*\{\s*([^}]+)\s*\}\s*(?:from\s+['"][^'"]+['"]\s*)?;?\s*$/gm;
  while ((m = re2.exec(src))) {
    const parts = m[1]
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    for (const part of parts) {
      const [left, right] = part.split(/\s+as\s+/i).map((s) => s.trim());
      exports.add((right || left).replace(/[\s]+/g, ''));
    }
  }

  // Default export (best-effort name)
  const defFn = /^\s*export\s+default\s+function\s+([A-Za-z0-9_$]+)/m.exec(src);
  if (defFn) exports.add(`default(${defFn[1]})`);
  else if (/^\s*export\s+default\s+/m.test(src)) exports.add('default');

  return [...exports];
};

const parseExportDetails = (src) => {
  const details = [];
  const add = (kind, name, signature) => {
    details.push({ kind, name, signature: signature || '' });
  };

  // export type/interface/enum/class/function/const/let/var
  const re = /^\s*export\s+(type|interface|const|let|var|function|class|enum)\s+([A-Za-z0-9_$]+)/gm;
  let m;
  while ((m = re.exec(src))) {
    add(m[1], m[2], '');
  }

  // export default function Name(...)
  const defFn = /^\s*export\s+default\s+function\s+([A-Za-z0-9_$]+)\s*\(([^)]*)\)/m.exec(src);
  if (defFn) add('default function', defFn[1], `(${defFn[2].trim()})`);
  else if (/^\s*export\s+default\s+/m.test(src)) add('default', 'default', '');

  // best-effort signatures for exported functions/constants
  for (const item of details) {
    if (item.kind === 'function') {
      const sig = new RegExp(`^\\s*export\\s+function\\s+${item.name}\\s*\\(([^)]*)\\)`, 'm').exec(src);
      if (sig) item.signature = `(${sig[1].trim()})`;
    }
    if (item.kind === 'const' || item.kind === 'let' || item.kind === 'var') {
      const sig1 = new RegExp(
        `^\\s*export\\s+(?:const|let|var)\\s+${item.name}\\s*=\\s*async\\s*\\(([^)]*)\\)\\s*=>`,
        'm',
      ).exec(src);
      const sig2 = new RegExp(
        `^\\s*export\\s+(?:const|let|var)\\s+${item.name}\\s*=\\s*\\(([^)]*)\\)\\s*=>`,
        'm',
      ).exec(src);
      if (sig1) item.signature = `async(${sig1[1].trim()})`;
      else if (sig2) item.signature = `(${sig2[1].trim()})`;
    }
  }

  // export { a, b as c }
  const re2 = /^\s*export\s*\{\s*([^}]+)\s*\}\s*(?:from\s+['"][^'"]+['"]\s*)?;?\s*$/gm;
  while ((m = re2.exec(src))) {
    const parts = m[1]
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    for (const part of parts) {
      const [left, right] = part.split(/\s+as\s+/i).map((s) => s.trim());
      add('re-export', (right || left).replace(/[\s]+/g, ''), '');
    }
  }

  // Deduplicate by kind+name
  const seen = new Set();
  return details.filter((d) => {
    const k = `${d.kind}:${d.name}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
};

const classifyFile = (workspaceRel) => {
  const rel = workspaceRel.replace(/\\/g, '/');
  const ext = path.extname(rel).toLowerCase();

  const isRoute = rel.startsWith('FBLA/app/');
  if (isRoute) return 'Route';

  if (rel.startsWith('FBLA/components/')) return 'Component';
  if (rel.startsWith('FBLA/contexts/')) return 'Context';
  if (rel.startsWith('FBLA/hooks/')) return 'Hook';
  if (rel.startsWith('FBLA/models/')) return 'Model';
  if (rel.startsWith('FBLA/viewmodels/')) return 'ViewModel';
  if (rel.startsWith('FBLA/features/')) return 'Feature';
  if (rel.startsWith('FBLA/lib/')) return 'Library';
  if (rel.startsWith('FBLA/constants/')) return 'Constant';
  if (rel.startsWith('FBLA/screens/')) return 'Screen';
  if (rel.startsWith('FBLA/assets/')) return 'Asset';
  if (rel.endsWith('.json') || rel.endsWith('.js') || rel.endsWith('.ts') || rel.endsWith('.tsx')) return 'Config/Code';
  if (rel.endsWith('.md') || rel.endsWith('.txt') || rel.endsWith('.html') || rel.endsWith('.pdf')) return 'Documentation';
  if (ext) return ext.slice(1).toUpperCase();
  return 'Other';
};

const routeFromPath = (workspaceRel) => {
  const rel = workspaceRel.replace(/\\/g, '/');
  if (!rel.startsWith('FBLA/app/')) return null;
  let route = rel.slice('FBLA/app'.length); // keep leading '/'
  route = route.replace(/\.(tsx|ts|js|jsx)$/i, '');
  route = route.replace(/\/index$/i, '/');
  route = route.replace(/\/_layout$/i, '');
  route = route.replace(/\/\(([^)]+)\)/g, ''); // remove group segments
  route = route.replace(/\/{2,}/g, '/');
  return route || '/';
};

const inferNotes = (workspaceRel, src) => {
  const rel = workspaceRel.replace(/\\/g, '/');
  const notes = [];

  if (rel === 'FBLA/app/_layout.tsx') {
    notes.push('Root Expo Router layout: wraps providers + Stack navigator, anchors into `(tabs)` group.');
  }
  if (rel === 'FBLA/app/(tabs)/_layout.tsx') {
    notes.push('Tabs layout: defines bottom tab navigation and typically performs auth gating/redirect logic.');
  }
  if (src && /AsyncStorage/.test(src)) notes.push('Uses AsyncStorage: JSON serialization, schema/versioning matters.');
  if (src && /expo-router/.test(src)) notes.push('Uses Expo Router APIs; file path is part of runtime route graph.');
  if (src && /useEffect\(/.test(src)) notes.push('Has React side effects via `useEffect`; check dependency arrays for lifecycle behavior.');
  if (src && /useMemo\(/.test(src)) notes.push('Uses memoization; values may intentionally not update if deps are empty.');
  if (src && /react-native-pdf/.test(src)) notes.push('Renders PDFs; ensure native linking/permissions for device platforms.');
  if (src && /react-native-blob-util/.test(src)) notes.push('Uses blob/file utilities; impacts filesystem permissions and asset fetching.');
  if (src && /react-native-calendars/.test(src)) notes.push('Uses calendar UI; date format and timezone handling are key.');

  if (src) {
    const intervals = [...src.matchAll(/setInterval\s*\(\s*[^,]+,\s*(\d+)\s*\)/g)].map((m) => m[1]);
    if (intervals.length) {
      notes.push(`Polling/timers via setInterval: ${intervals.map((ms) => `${ms}ms`).join(', ')}.`);
    }
    const storageOps = [
      { re: /AsyncStorage\.getItem\(/g, label: 'getItem' },
      { re: /AsyncStorage\.setItem\(/g, label: 'setItem' },
      { re: /AsyncStorage\.removeItem\(/g, label: 'removeItem' },
    ]
      .map((x) => ({ label: x.label, count: (src.match(x.re) || []).length }))
      .filter((x) => x.count > 0);
    if (storageOps.length) {
      notes.push(`AsyncStorage ops: ${storageOps.map((x) => `${x.label}×${x.count}`).join(', ')}.`);
    }
    const routerOps = [
      { re: /router\.push\(/g, label: 'push' },
      { re: /router\.replace\(/g, label: 'replace' },
      { re: /router\.back\(/g, label: 'back' },
    ]
      .map((x) => ({ label: x.label, count: (src.match(x.re) || []).length }))
      .filter((x) => x.count > 0);
    if (routerOps.length) {
      notes.push(`Router ops: ${routerOps.map((x) => `${x.label}×${x.count}`).join(', ')}.`);
    }
  }

  return notes;
};

const buildGraph = (entries) => {
  const nodes = new Map(); // rel -> meta
  const edges = new Map(); // rel -> Set(rel)

  for (const e of entries) {
    nodes.set(e.rel, e);
    edges.set(e.rel, new Set());
  }

  for (const e of entries) {
    if (!e.isCode) continue;
    for (const spec of e.importSpecs) {
      const resolved = resolveInternalImport(e.abs, spec);
      if (!resolved) continue;
      const rel = toWorkspaceRel(resolved);
      if (nodes.has(rel)) edges.get(e.rel).add(rel);
    }
  }

  const usedBy = new Map();
  for (const rel of nodes.keys()) usedBy.set(rel, new Set());
  for (const [from, tos] of edges.entries()) {
    for (const to of tos) usedBy.get(to)?.add(from);
  }

  return { nodes, edges, usedBy };
};

const esc = (s) =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const renderHtml = ({ entries, graph, generatedAt }) => {
  const byCategory = new Map();
  for (const e of entries) {
    const cat = e.category;
    if (!byCategory.has(cat)) byCategory.set(cat, []);
    byCategory.get(cat).push(e);
  }

  const categories = [...byCategory.keys()].sort((a, b) => a.localeCompare(b));
  for (const cat of categories) byCategory.get(cat).sort((a, b) => a.rel.localeCompare(b.rel));

  const routeEntries = entries
    .filter((e) => e.category === 'Route')
    .map((e) => ({ ...e, route: routeFromPath(e.rel) }))
    .sort((a, b) => (a.route || '').localeCompare(b.route || ''));

  const tocItems = [];
  tocItems.push({ id: 'section-overview', label: '1. Technical Overview' });
  tocItems.push({ id: 'section-runtime', label: '2. Runtime & Boot Sequence' });
  tocItems.push({ id: 'section-routes', label: '3. Routes & Navigation Map' });
  tocItems.push({ id: 'section-architecture', label: '4. Subsystem Architecture' });
  tocItems.push({ id: 'section-storage', label: '5. Local Storage Schema' });
  tocItems.push({ id: 'section-modules', label: '6. Module Graph Summary' });
  tocItems.push({ id: 'section-files', label: '7. Per-File Technical Reference' });

  let html = '';
  html += '<!doctype html><html><head><meta charset="utf-8">';
  html += '<title>FBLA App Technical Layer (Generated)</title>';
  html += '<style>';
  html += `
  :root{
    --ink:#111;
    --muted:#444;
    --brand:#003A8F;
    --bg:#fff;
    --codebg:#f3f5fb;
    --border:#d9dfef;
  }
  @page{ margin: 0.75in; }
  body{ font-family: Segoe UI, Arial, sans-serif; color:var(--ink); background:var(--bg); line-height:1.45; }
  h1,h2,h3{ color:var(--brand); margin: 18px 0 8px; }
  h1{ font-size: 30px; margin-top:0; }
  h2{ font-size: 20px; page-break-after: avoid; }
  h3{ font-size: 16px; page-break-after: avoid; }
  p{ margin: 8px 0; }
  ul{ margin: 6px 0 6px 20px; padding:0; }
  li{ margin: 3px 0; }
  code, pre{ font-family: Consolas, 'Courier New', monospace; }
  code{ background: var(--codebg); padding:2px 5px; border-radius:4px; border:1px solid var(--border); }
  pre{ background: var(--codebg); padding:10px 12px; border-radius:8px; border:1px solid var(--border); overflow-wrap:anywhere; white-space:pre-wrap; }
  .meta{ color:var(--muted); font-size: 12px; margin-top:4px; }
  .toc a{ color: var(--brand); text-decoration:none; }
  .toc a:hover{ text-decoration:underline; }
  table{ border-collapse: collapse; width: 100%; }
  th, td{ border:1px solid var(--border); padding:6px 8px; vertical-align:top; }
  th{ background:#eef2ff; text-align:left; }
  .pill{ display:inline-block; padding:2px 8px; border-radius:999px; border:1px solid var(--border); background:#f7f9ff; font-size:12px; color:#1e2a4a; }
  .pagebreak{ page-break-before: always; }
  .nowrap{ white-space:nowrap; }
  `;
  html += '</style></head><body>';

  html += `<h1>FBLA App Technical Layer</h1>`;
  html += `<div class="meta">Generated: ${esc(generatedAt)}</div>`;
  html += `<div class="meta">Scope: repo source files in <code>FBLA/</code> excluding <code>node_modules</code>, <code>.git</code>, <code>.expo</code>.</div>`;

  html += '<h2>Table of Contents</h2><ul class="toc">';
  for (const item of tocItems) {
    html += `<li><a href="#${esc(item.id)}">${esc(item.label)}</a></li>`;
  }
  html += '</ul>';

  html += `<h2 id="section-overview">1. Technical Overview</h2>`;
  html += `<ul>`;
  html += `<li><span class="pill">Runtime</span> Expo + React Native + TypeScript; routing via <code>expo-router</code> (file-based routes under <code>FBLA/app/</code>).</li>`;
  html += `<li><span class="pill">State</span> Mostly local component state + hook-based viewmodels; no external global store.</li>`;
  html += `<li><span class="pill">Persistence</span> Local device persistence via <code>@react-native-async-storage/async-storage</code> (users, current session, reminders, messaging DB).</li>`;
  html += `<li><span class="pill">UI</span> Theming through <code>FBLA/contexts/ThemeContext.tsx</code> + <code>FBLA/hooks/use-theme-color.ts</code> and themed wrapper components.</li>`;
  html += `</ul>`;

  html += `<h2 id="section-runtime">2. Runtime & Boot Sequence</h2>`;
  html += `<pre>`;
  html += esc(
    [
      'Process start -> expo-router entry (declared in FBLA/package.json: main=expo-router/entry)',
      '  -> FBLA/app/_layout.tsx (RootLayout)',
      '    - registers providers (ThemeProvider, NavigationThemeProvider)',
      '    - defines Stack routes; anchors initial content to the "(tabs)" group',
      '  -> FBLA/app/(tabs)/_layout.tsx (Tabs layout)',
      '    - defines Tabs navigator and typically performs auth gating (redirect if not logged in / profile incomplete)',
      '  -> Route component (e.g., FBLA/app/(tabs)/index.tsx for Home tab)',
      '    - renders screen-level UI, may call feature hooks/viewmodels, which call lib/* for persistence.',
    ].join('\n'),
  );
  html += `</pre>`;

  html += `<h2 id="section-routes">3. Routes & Navigation Map</h2>`;
  html += `<table><thead><tr><th class="nowrap">Route</th><th>File</th><th>Notes</th></tr></thead><tbody>`;
  for (const e of routeEntries) {
    const route = e.route || '';
    const note = e.notes.join(' ') || '';
    html += `<tr><td class="nowrap"><code>${esc(route)}</code></td><td><code>${esc(e.rel)}</code></td><td>${esc(note)}</td></tr>`;
  }
  html += `</tbody></table>`;

  html += `<h2 id="section-architecture">4. Subsystem Architecture</h2>`;
  html += `<h3>Auth + Session Gating</h3>`;
  html += `<pre>`;
  html += esc(
    [
      'Data source: FBLA/lib/authStorage.ts (AsyncStorage-backed Users DB + Current Session)',
      'UI gating: FBLA/app/(tabs)/_layout.tsx',
      '',
      'Key state machine (AuthFlowState):',
      '  loading -> unauthenticated | needs-setup | ready',
      '',
      'Redirect rules (router.replace):',
      '  unauthenticated: force /landing (allowlist: /landing, /auth-choice, /login, /signup)',
      '  needs-setup: force /profile-setup',
      '  ready: prevent staying on /profile-setup by redirecting to /',
      '',
      'Polling:',
      '  TabLayout reloads current user on an interval (see file notes) so storage changes are reflected without app restart.',
    ].join('\n'),
  );
  html += `</pre>`;

  html += `<h3>Reminders (Calendar-Scoped CRUD)</h3>`;
  html += `<pre>`;
  html += esc(
    [
      'Route: FBLA/app/(tabs)/reminders/index.tsx',
      'ViewModel: FBLA/features/reminders/useRemindersViewModel.ts',
      'Domain helpers: FBLA/features/reminders/model.ts',
      'Persistence: FBLA/lib/authStorage.ts (UserRecord.reminders)',
      '',
      'Flow:',
      '  Calendar UI selects date -> open modal -> add/delete reminder',
      '  ViewModel computes:',
      '    - dayReminders = reminders[type][date]',
      '    - markedDates = dot/selection map for react-native-calendars',
      '  Mutations:',
      '    - buildUpdatedRemindersAfterSave/delete returns new immutable AllReminders',
      '    - persistCurrentUserReminders writes through setCurrentUserReminders()',
      '',
      'Polling:',
      '  Reminders VM reloads reminders on an interval so cross-screen changes appear.',
    ].join('\n'),
  );
  html += `</pre>`;

  html += `<h3>Messaging (Local Conversations)</h3>`;
  html += `<pre>`;
  html += esc(
    [
      'Routes:',
      '  FBLA/app/(tabs)/messaging.tsx (conversation list / directory)',
      '  FBLA/app/(tabs)/messages/[username].tsx (conversation detail)',
      'UI component: FBLA/components/messaging/ConversationCard.tsx',
      'Persistence: FBLA/lib/authStorage.ts (MESSAGES_DB_KEY + derived conversationId)',
      '',
      'Storage model:',
      '  conversationId = sort([userA,userB]).join("__")',
      '  messages append-only, ordered by createdAt ISO timestamp',
      '',
      'APIs:',
      '  getAllMembersDirectory() -> list of other users',
      '  getCurrentUserConversations() -> summaries for inbox',
      '  getConversationWithUser(other) -> messages + other user metadata',
      '  sendMessageToUser(other,text) -> append message',
    ].join('\n'),
  );
  html += `</pre>`;

  html += `<h3>Competition Tools</h3>`;
  html += `<pre>`;
  html += esc(
    [
      'Routes:',
      '  FBLA/app/(tabs)/competition-code.tsx',
      '  FBLA/app/(tabs)/competition-event.tsx',
      '  FBLA/app/(tabs)/event-map.tsx',
      'Model: FBLA/models/competitionModel.ts (in-memory event schedule keyed by 6-char codes)',
      'ViewModel: FBLA/viewmodels/useCompetitionViewModel.ts (normalizes code, picks next upcoming slot)',
    ].join('\n'),
  );
  html += `</pre>`;

  html += `<h3>Practice Quiz + PDF Viewer</h3>`;
  html += `<pre>`;
  html += esc(
    [
      'Routes:',
      '  FBLA/app/(tabs)/practice-quiz-events.tsx',
      '  FBLA/app/(tabs)/practice-quiz-viewer.tsx',
      'Model: FBLA/models/practiceQuizModel.ts (maps quiz "events" to PDF assets + metadata)',
      'ViewModel: FBLA/viewmodels/usePracticeQuizViewModel.ts',
      'Screen: FBLA/screens/PracticeQuizViewerScreen.tsx uses react-native-pdf to render bundled PDF assets.',
    ].join('\n'),
  );
  html += `</pre>`;

  html += `<h3>News (Static Feed + Dynamic Article Route)</h3>`;
  html += `<pre>`;
  html += esc(
    [
      'Feed data: FBLA/lib/newsData.ts exports NEWS_ITEMS: NewsItem[]',
      'Routes:',
      '  FBLA/app/(tabs)/home.tsx or FBLA/app/(tabs)/index.tsx (typically links to news items)',
      '  FBLA/app/(tabs)/news/[id].tsx (article detail; reads `id` via useLocalSearchParams)',
      '',
      'Contract:',
      '  Route param `id` must match NEWS_ITEMS[i].id, otherwise the screen renders an "Article not found" state.',
    ].join('\n'),
  );
  html += `</pre>`;

  html += `<h3>Profile + Dues Snapshot</h3>`;
  html += `<pre>`;
  html += esc(
    [
      'Profile persistence: FBLA/lib/authStorage.ts (UserRecord.profile)',
      'Routes:',
      '  FBLA/app/(tabs)/profile-setup.tsx (writes profileComplete via setCurrentUserProfile)',
      '  FBLA/app/(tabs)/dashboard.tsx (reads current user, shows dues progress, logout)',
      '',
      'Gating:',
      '  FBLA/app/(tabs)/_layout.tsx treats missing profileComplete as "needs-setup" and forces /profile-setup.',
    ].join('\n'),
  );
  html += `</pre>`;

  // Storage section: parse authStorage keys + schema hints
  const authStorageRel = 'FBLA/lib/authStorage.ts';
  const authEntry = entries.find((e) => e.rel.replace(/\\/g, '/') === authStorageRel);
  html += `<h2 id="section-storage">5. Local Storage Schema</h2>`;
  if (authEntry && authEntry.isCode) {
    const src = authEntry.src;
    const keyMatches = [...src.matchAll(/const\s+([A-Z0-9_]+)\s*=\s*['"]([^'"]+)['"]\s*;/g)].map((m) => ({
      name: m[1],
      value: m[2],
    }));

    html += `<p>Primary persistence lives in <code>${esc(authStorageRel)}</code> and uses JSON-serialized records keyed by versioned storage keys.</p>`;
    html += `<table><thead><tr><th>Key Constant</th><th>AsyncStorage Key</th></tr></thead><tbody>`;
    for (const k of keyMatches) {
      html += `<tr><td><code>${esc(k.name)}</code></td><td><code>${esc(k.value)}</code></td></tr>`;
    }
    html += `</tbody></table>`;

    html += `<h3>Core Records (Type-Level)</h3>`;
    const typeNames = [
      'UserRecord',
      'AllReminders',
      'ReminderMap',
      'Reminder',
      'ConversationSummary',
      'ConversationDetail',
      'ChatMessage',
      'MemberDirectoryItem',
    ];
    html += `<ul>`;
    for (const t of typeNames) {
      if (authEntry.exports.includes(t)) html += `<li><code>${esc(t)}</code> exported from <code>${esc(authStorageRel)}</code>.</li>`;
    }
    html += `</ul>`;
    html += `<p class="meta">This section is derived from exported TypeScript types. The runtime schema is enforced only by code paths that write to storage.</p>`;
  } else {
    html += `<p>Unable to locate <code>${esc(authStorageRel)}</code> for schema extraction.</p>`;
  }

  html += `<h2 id="section-modules">6. Module Graph Summary</h2>`;
  const { nodes, edges, usedBy } = graph;
  const internalEdgeCount = [...edges.values()].reduce((n, s) => n + s.size, 0);
  html += `<ul>`;
  html += `<li>Total scoped files: <code>${entries.length}</code></li>`;
  html += `<li>Total internal import edges: <code>${internalEdgeCount}</code></li>`;
  html += `<li>Most imported modules (top 10):</li>`;
  html += `</ul>`;

  const importCounts = [];
  for (const [rel, users] of usedBy.entries()) importCounts.push({ rel, count: users.size });
  importCounts.sort((a, b) => b.count - a.count || a.rel.localeCompare(b.rel));
  html += `<table><thead><tr><th>Module</th><th class="nowrap">Importers</th></tr></thead><tbody>`;
  for (const row of importCounts.slice(0, 10)) {
    html += `<tr><td><code>${esc(row.rel)}</code></td><td class="nowrap"><code>${row.count}</code></td></tr>`;
  }
  html += `</tbody></table>`;

  html += `<h2 id="section-files" class="pagebreak">7. Per-File Technical Reference</h2>`;
  html += `<p class="meta">Each entry includes: category, exports, import surface, reverse deps, and behavior notes inferred from code patterns.</p>`;

  for (const cat of categories) {
    const list = byCategory.get(cat);
    html += `<h3>${esc(cat)} (${list.length})</h3>`;

    for (const e of list) {
      const id = `file-${e.rel.replace(/[^A-Za-z0-9]+/g, '-')}`;
      const importsExternal = e.importSpecs.filter((s) => !s.startsWith('./') && !s.startsWith('../') && !s.startsWith('@/'));
      const importsInternal = e.importSpecs.filter((s) => s.startsWith('./') || s.startsWith('../') || s.startsWith('@/'));
      const usedByList = [...(usedBy.get(e.rel) || [])].sort((a, b) => a.localeCompare(b));
      const exportDetails = e.exportDetails || [];

      html += `<h4 id="${esc(id)}"><code>${esc(e.rel)}</code></h4>`;
      html += `<div class="meta">Size: ${e.sizeBytes} bytes | Lines: ${e.lineCount} | SHA1: ${esc(e.sha1.slice(0, 12))}</div>`;
      html += `<ul>`;
      html += `<li>Category: <code>${esc(e.category)}</code></li>`;
      if (e.category === 'Route') {
        const route = routeFromPath(e.rel) || '';
        html += `<li>Route: <code>${esc(route)}</code></li>`;
      }
      if (e.exports.length) html += `<li>Exports: <code>${esc(e.exports.join(', '))}</code></li>`;
      if (importsExternal.length) html += `<li>External imports: <code>${esc(importsExternal.join(', '))}</code></li>`;
      if (importsInternal.length) html += `<li>Internal imports: <code>${esc(importsInternal.join(', '))}</code></li>`;
      if (usedByList.length) html += `<li>Used by: <code>${esc(usedByList.join(', '))}</code></li>`;
      if (e.notes.length) html += `<li>Behavior notes: ${esc(e.notes.join(' '))}</li>`;
      html += `</ul>`;

      if (exportDetails.length) {
        const apiLines = exportDetails
          .filter((d) => d.kind !== 're-export')
          .map((d) => `- ${d.kind} ${d.name}${d.signature ? ' ' + d.signature : ''}`)
          .slice(0, 60);
        if (apiLines.length) {
          html += `<pre>${esc(['Public API (exports):', ...apiLines].join('\n'))}</pre>`;
        }
      }
    }
  }

  html += `<hr><div class="meta">End of generated technical layer reference.</div>`;
  html += '</body></html>';
  return html;
};

const renderText = ({ entries, graph, generatedAt }) => {
  const lines = [];
  const push = (s = '') => lines.push(s);

  push('FBLA App Technical Layer');
  push(`Generated: ${generatedAt}`);
  push('Scope: FBLA/ excluding node_modules, .git, .expo');
  push('');

  push('1. Technical Overview');
  push('- Runtime: Expo + React Native + TypeScript; expo-router file-based routing under FBLA/app/.');
  push('- State: local state + hook-based viewmodels; no external global store.');
  push('- Persistence: AsyncStorage (users DB, current session, reminders, messaging DB).');
  push('- UI: ThemeContext + themed hooks/components; vector icons + custom symbol wrapper.');
  push('');

  push('2. Runtime & Boot Sequence');
  push('Process start -> expo-router/entry (FBLA/package.json)');
  push('  -> FBLA/app/_layout.tsx (RootLayout): providers + Stack');
  push('  -> FBLA/app/(tabs)/_layout.tsx (TabLayout): auth gating + Tabs');
  push('  -> Route screen component: renders UI and calls viewmodels/services as needed');
  push('');

  push('3. Routes & Navigation Map');
  const routeEntries = entries
    .filter((e) => e.category === 'Route')
    .map((e) => ({ rel: e.rel, route: routeFromPath(e.rel), notes: e.notes.join(' ') }))
    .sort((a, b) => (a.route || '').localeCompare(b.route || '') || a.rel.localeCompare(b.rel));
  for (const r of routeEntries) {
    push(`- ${r.route || ''} -> ${r.rel}${r.notes ? ` | ${r.notes}` : ''}`);
  }
  push('');

  push('4. Subsystem Architecture');
  push('4.1 Auth + Session Gating');
  push('- Data: FBLA/lib/authStorage.ts (AsyncStorage-backed user DB + current session key).');
  push('- Gating: FBLA/app/(tabs)/_layout.tsx loads getCurrentUser() and redirects by AuthFlowState.');
  push('- Redirect allowlist when unauthenticated: /landing, /auth-choice, /login, /signup.');
  push('- Profile completeness gate: forces /profile-setup until profileComplete is true.');
  push('');

  push('4.2 Reminders');
  push('- Route: FBLA/app/(tabs)/reminders/index.tsx');
  push('- ViewModel: FBLA/features/reminders/useRemindersViewModel.ts');
  push('- Domain helpers: FBLA/features/reminders/model.ts');
  push('- Persistence: UserRecord.reminders via setCurrentUserReminders().');
  push('');

  push('4.3 Messaging');
  push('- Routes: FBLA/app/(tabs)/messaging.tsx, FBLA/app/(tabs)/messages/[username].tsx');
  push('- Storage: MESSAGES_DB_KEY; conversationId = sort([a,b]).join("__").');
  push('- APIs: getAllMembersDirectory(), getCurrentUserConversations(), getConversationWithUser(), sendMessageToUser().');
  push('');

  push('4.4 Competition Tools');
  push('- Model: FBLA/models/competitionModel.ts (code -> schedule).');
  push('- ViewModel: FBLA/viewmodels/useCompetitionViewModel.ts (normalize + next upcoming).');
  push('');

  push('4.5 Practice Quiz');
  push('- Model: FBLA/models/practiceQuizModel.ts');
  push('- ViewModel: FBLA/viewmodels/usePracticeQuizViewModel.ts');
  push('- PDF rendering: FBLA/screens/PracticeQuizViewerScreen.tsx uses react-native-pdf.');
  push('');

  push('4.6 News');
  push('- Data: FBLA/lib/newsData.ts exports NEWS_ITEMS; route param id selects item.');
  push('- Route: FBLA/app/(tabs)/news/[id].tsx renders fallback when id not found.');
  push('');

  push('5. Local Storage Schema');
  const authStorageRel = 'FBLA/lib/authStorage.ts';
  const authEntry = entries.find((e) => e.rel.replace(/\\/g, '/') === authStorageRel);
  if (authEntry && authEntry.isCode) {
    const src = authEntry.src;
    const keyMatches = [...src.matchAll(/const\s+([A-Z0-9_]+)\s*=\s*['"]([^'"]+)['"]\s*;/g)].map((m) => ({
      name: m[1],
      value: m[2],
    }));
    for (const k of keyMatches) push(`- ${k.name} = "${k.value}"`);
    push('- Types: UserRecord, AllReminders, ConversationSummary/Detail, ChatMessage, MemberDirectoryItem.');
  } else {
    push('- (Unable to extract; authStorage.ts not found)');
  }
  push('');

  push('6. Module Graph Summary');
  const { edges, usedBy } = graph;
  const internalEdgeCount = [...edges.values()].reduce((n, s) => n + s.size, 0);
  push(`- Total files: ${entries.length}`);
  push(`- Internal import edges: ${internalEdgeCount}`);
  const importCounts = [];
  for (const [rel, users] of usedBy.entries()) importCounts.push({ rel, count: users.size });
  importCounts.sort((a, b) => b.count - a.count || a.rel.localeCompare(b.rel));
  push('- Most imported modules:');
  for (const row of importCounts.slice(0, 10)) push(`  - ${row.count}x ${row.rel}`);
  push('');

  push('7. Per-File Technical Reference');
  const byCategory = new Map();
  for (const e of entries) {
    const cat = e.category;
    if (!byCategory.has(cat)) byCategory.set(cat, []);
    byCategory.get(cat).push(e);
  }
  const categories = [...byCategory.keys()].sort((a, b) => a.localeCompare(b));
  for (const cat of categories) {
    push('');
    push(`${cat} (${byCategory.get(cat).length})`);
    push(''.padEnd(Math.min(80, cat.length + 4), '-'));
    const list = byCategory.get(cat).sort((a, b) => a.rel.localeCompare(b.rel));
    for (const e of list) {
      push(`File: ${e.rel}`);
      push(`- Size: ${e.sizeBytes} bytes | Lines: ${e.lineCount} | SHA1: ${e.sha1.slice(0, 12)}`);
      if (e.category === 'Route') push(`- Route: ${routeFromPath(e.rel) || ''}`);
      if (e.exports.length) push(`- Exports: ${e.exports.join(', ')}`);
      if (e.importSpecs.length) push(`- Imports: ${e.importSpecs.join(', ')}`);
      const usedByList = [...(usedBy.get(e.rel) || [])].sort((a, b) => a.localeCompare(b));
      if (usedByList.length) push(`- Used by: ${usedByList.join(', ')}`);
      if (e.notes.length) push(`- Notes: ${e.notes.join(' ')}`);
      if (e.exportDetails && e.exportDetails.length) {
        const api = e.exportDetails
          .filter((d) => d.kind !== 're-export')
          .map((d) => `  - ${d.kind} ${d.name}${d.signature ? ' ' + d.signature : ''}`)
          .slice(0, 60);
        if (api.length) {
          push('- Public API (exports):');
          for (const a of api) push(a);
        }
      }
      push('');
    }
  }

  return lines.join('\n');
};

const main = () => {
  if (!fs.existsSync(fileListPath)) {
    console.error(`Missing file list: ${fileListPath}`);
    process.exit(1);
  }

  const relFiles = readText(fileListPath)
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => s.replace(/\//g, path.sep));

  const entries = [];
  for (const rel of relFiles) {
    const abs = path.join(workspaceRoot, rel);
    const stat = fs.statSync(abs);
    const buf = fs.readFileSync(abs);
    const ext = path.extname(rel).toLowerCase();
    const isText = ['.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.txt', '.html'].includes(ext);
    const isCode = ['.ts', '.tsx', '.js', '.jsx'].includes(ext);
    const src = isText ? buf.toString('utf8') : '';

    const importSpecs = isCode ? parseImports(src) : [];
    const exports = isCode ? parseExports(src) : [];
    const exportDetails = isCode ? parseExportDetails(src) : [];
    const lineCount = isText ? src.split(/\r?\n/).length : 0;

    const entry = {
      rel: toWorkspaceRel(abs),
      abs,
      sizeBytes: stat.size,
      sha1: sha1(buf),
      ext,
      isText,
      isCode,
      src,
      lineCount,
      category: classifyFile(toWorkspaceRel(abs)),
      importSpecs,
      exports,
      exportDetails,
      notes: isCode ? inferNotes(toWorkspaceRel(abs), src) : [],
    };
    entries.push(entry);
  }

  const graph = buildGraph(entries);
  const generatedAt = new Date().toISOString();

  const html = renderHtml({ entries, graph, generatedAt });
  const outHtml = path.join(fblaRoot, 'TECHNICAL_LAYER.html');
  fs.writeFileSync(outHtml, html, 'utf8');

  const text = renderText({ entries, graph, generatedAt });
  const outTxt = path.join(fblaRoot, 'TECHNICAL_LAYER.txt');
  fs.writeFileSync(outTxt, text, 'utf8');

  const outJson = path.join(fblaRoot, 'TECHNICAL_LAYER.index.json');
  const index = entries.map((e) => ({
    rel: e.rel,
    category: e.category,
    sha1: e.sha1,
    sizeBytes: e.sizeBytes,
    lineCount: e.lineCount,
    exports: e.exports,
    importSpecs: e.importSpecs,
  }));
  fs.writeFileSync(outJson, JSON.stringify({ generatedAt, files: index }, null, 2), 'utf8');

  console.log(`Wrote: ${toWorkspaceRel(outHtml)}`);
  console.log(`Wrote: ${toWorkspaceRel(outTxt)}`);
  console.log(`Wrote: ${toWorkspaceRel(outJson)}`);
};

main();
