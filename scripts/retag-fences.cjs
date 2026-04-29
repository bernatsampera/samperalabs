const Database = require('better-sqlite3');
const path = require('path');

const DB = path.resolve(process.cwd(), 'scripts/manage-sqlite/content.db');
const APPLY = process.argv.includes('--apply');

function detectLang(body) {
  const lines = body.split('\n');
  const text = body;

  // Skip empty/whitespace-only blocks.
  if (text.trim().length === 0) return null;

  // Python
  if (
    /^\s*(def |async def |class |import |from [\w.]+ import|@\w+|if __name__|await |lambda )/m.test(text) ||
    /:\s*$/m.test(text) && /(\bself\.|f["'])/.test(text)
  ) return 'python';
  if (/\bself\./.test(text) || /\bf"[^"]*\{/.test(text)) return 'python';
  // Lone class/def with leading whitespace continuation (e.g., method body extracted alone).
  if (/^\s+(def |async def |return |await |yield )/m.test(text) && !/[{};]/.test(text)) return 'python';

  // TypeScript / TSX
  const hasTsMarker =
    /^\s*(export\s+(const|function|class|interface|type)\b|interface\s+\w+|type\s+\w+\s*=)/m.test(text) ||
    /^\s*import\s+.*from\s+['"]/m.test(text) && /:\s*\w+(\[\])?\s*[=;,)]/.test(text);
  const hasJsx = /<[A-Z]\w*(\s|\/?>)/.test(text) || /<\/[a-z]+>/.test(text) && /=>/.test(text);
  if (hasTsMarker && hasJsx) return 'tsx';
  if (hasTsMarker) return 'ts';

  // JavaScript / JSX
  if (/^\s*(const |let |var |function |require\()/m.test(text) || /=>/.test(text)) {
    return hasJsx ? 'jsx' : 'js';
  }

  // Bash
  if (/^#!\/.*\b(bash|sh|zsh)\b/m.test(text)) return 'bash';
  if (/^\s*\$ /m.test(text)) return 'bash';
  if (/^\s*(cd |ls |ln |pwd |echo |cat |grep |sed |awk |tail |head |touch |npm |pnpm |yarn |npx |pnpx |uv |uvx |pip |pipx |pyenv |poetry |python |python3 |node |bun |deno |git |curl |wget |apt(-get)? |brew |docker |docker-compose |kubectl |sudo |ssh |scp |rsync |make |mkdir |rm |mv |cp |export |source |chmod |chown |tar |zip |unzip |ollama |systemctl )/m.test(text)) return 'bash';
  // ALL_CAPS=value lines (env / shell exports) dominate the block.
  const envLines = text.split('\n').filter(l => /^[A-Z][A-Z0-9_]*\s*=/.test(l)).length;
  const nonBlank = text.split('\n').filter(l => l.trim().length).length;
  if (nonBlank > 0 && envLines / nonBlank >= 0.6 && !/[{};]/.test(text)) return 'bash';

  // TOML — section headers like [section] or [tool.foo]
  if (/^\[[\w.-]+\]\s*$/m.test(text) && /^[\w-]+\s*=\s*/m.test(text)) return 'toml';

  // Dockerfile
  if (/^(FROM|RUN|COPY|ADD|WORKDIR|ENV|EXPOSE|CMD|ENTRYPOINT|ARG|LABEL)\s/m.test(text) && !/\bdef \b/.test(text)) return 'dockerfile';

  // SQL
  if (/^\s*(SELECT|INSERT|UPDATE|DELETE|CREATE TABLE|ALTER TABLE|DROP TABLE|WITH)\b/m.test(text)) return 'sql';

  // JSON
  const trimmed = text.trim();
  if ((trimmed.startsWith('{') || trimmed.startsWith('['))) {
    try { JSON.parse(trimmed); return 'json'; } catch (_) {}
  }

  // YAML — kv lines + (services|volumes|version) hints; don't trigger on prose with colons.
  const yamlKvLines = (text.match(/^\s*[a-zA-Z][\w-]*:\s/gm) || []).length;
  if (
    yamlKvLines >= 2 &&
    !/^\s*(const |let |def |function |class |import |from \w+ import)/m.test(text) &&
    !/[;]\s*$/m.test(text) &&
    !/=>\s/.test(text)
  ) return 'yaml';

  // HTML
  if (/^\s*<!DOCTYPE\s+html/i.test(trimmed) || /^\s*<\w+[\s>]/.test(trimmed)) return 'html';

  // CSS
  if (/^\s*[.#]?[a-zA-Z][\w-]*\s*\{/m.test(text) && /:\s*[^;]+;/.test(text)) return 'css';

  return null;
}

function processContent(content) {
  const lines = content.split('\n');
  let inFence = false;
  const changes = []; // {lineNo, lang, preview}
  // First pass: collect indices of bare opening fences and their block bodies.
  const out = lines.slice();
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const isExactBare = line === '```';
    const isTaggedFence = /^```[a-zA-Z0-9_+-]+$/.test(line);
    if (!inFence && isExactBare) {
      // Find closing fence.
      let j = i + 1;
      while (j < lines.length && lines[j] !== '```') j++;
      const body = lines.slice(i + 1, j).join('\n');
      const lang = detectLang(body);
      const preview = body.split('\n').find(l => l.trim().length) || '';
      if (lang) {
        changes.push({ lineNo: i + 1, lang, preview: preview.slice(0, 70) });
        out[i] = '```' + lang;
      } else {
        changes.push({ lineNo: i + 1, lang: null, preview: preview.slice(0, 70) });
      }
      // Skip to closing fence.
      i = j + 1;
      inFence = false;
      continue;
    }
    if (isExactBare || isTaggedFence) {
      inFence = !inFence;
    }
    i++;
  }
  return { newContent: out.join('\n'), changes };
}

const db = new Database(DB);
const posts = db.prepare("SELECT id, slug, content FROM posts").all();

let totalBare = 0, totalRetagged = 0, totalLeftBare = 0;
const langCounts = {};
const perPost = [];
const writes = [];

for (const post of posts) {
  const { newContent, changes } = processContent(post.content);
  if (changes.length === 0) continue;
  const retagged = changes.filter(c => c.lang).length;
  const leftBare = changes.length - retagged;
  totalBare += changes.length;
  totalRetagged += retagged;
  totalLeftBare += leftBare;
  for (const c of changes) {
    if (c.lang) langCounts[c.lang] = (langCounts[c.lang] || 0) + 1;
  }
  perPost.push({ slug: post.slug, total: changes.length, retagged, leftBare, changes });
  if (newContent !== post.content) writes.push({ id: post.id, slug: post.slug, newContent });
}

console.log('=== DRY RUN REPORT ===');
console.log(`Posts scanned: ${posts.length}`);
console.log(`Posts with bare opening fences: ${perPost.length}`);
console.log(`Bare opening fences total: ${totalBare}`);
console.log(`  -> would retag: ${totalRetagged}`);
console.log(`  -> would leave bare: ${totalLeftBare}`);
console.log(`Language counts:`, langCounts);
console.log('');
for (const p of perPost) {
  console.log(`--- ${p.slug}  (retag ${p.retagged}, leave ${p.leftBare}) ---`);
  for (const c of p.changes) {
    const tag = c.lang ? `\`\`\`${c.lang}` : '(left bare)';
    console.log(`  L${c.lineNo}: ${tag.padEnd(14)}  ${JSON.stringify(c.preview)}`);
  }
}

if (!APPLY) {
  console.log('\n(dry run; pass --apply to write)');
  process.exit(0);
}

console.log(`\n=== APPLYING ${writes.length} updates ===`);
const update = db.prepare("UPDATE posts SET content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?");
const tx = db.transaction((rows) => { for (const r of rows) update.run(r.newContent, r.id); });
tx(writes);
console.log(`Updated ${writes.length} posts.`);
