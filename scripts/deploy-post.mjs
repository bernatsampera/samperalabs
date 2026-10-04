import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { homedir } from 'node:os';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';

const root = path.resolve(fileURLToPath(new URL('../', import.meta.url)));
process.chdir(root);
const [draftName, ...flags] = process.argv.slice(2);
if (!draftName || !/^[a-z0-9-]+$/.test(draftName) || flags.some(f => !['--check', '--release-code'].includes(f))) {
  console.error('Use: npm run deploy-post -- <draft-folder> [--check] [--release-code]');
  process.exit(1);
}
const checkOnly = flags.includes('--check');
const releaseCode = flags.includes('--release-code');
const folder = path.join(root, 'src/editorial/drafts', draftName);
const inside = (parent, file) => file.startsWith(parent + path.sep);
const readJSON = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const hash = data => createHash('sha256').update(data).digest('hex');
const run = (cmd, args, options = {}) => {
  try { return (execFileSync(cmd, args, { encoding: 'utf8', cwd: root, stdio: ['pipe', 'pipe', 'pipe'], ...options }) || '').trim(); }
  catch { throw new Error(`${cmd} failed. The release stopped.`); }
};
const git = (...args) => run('git', args);
const quote = value => "'" + String(value).replaceAll("'", "'\\''") + "'";
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const sshTarget = process.env.POST_RELEASE_SSH_TARGET || 'root@178.156.132.116';
const sshKey = process.env.POST_RELEASE_SSH_KEY || path.join(homedir(), '.ssh/hetzni');
const appId = '14';
const appUUID = 'g08c40g44o88s8wwc488w0k8';
const ssh = (command, input) => run('ssh', ['-i', sshKey, '-o', 'BatchMode=yes', '-o', 'ConnectTimeout=15', sshTarget, command], { input, timeout: 45000 });
let receipt;
let receiptPath;

async function main() {
  if (readJSON('package.json').name !== '@bernatsampera/samperalabs') throw new Error('This command requires the SamperaLabs checkout.');
  if (!inside(path.join(root, 'src/editorial/drafts'), fs.realpathSync(folder))) throw new Error('The draft folder must remain inside this site.');
  process.loadEnvFile('.env');
  if (!process.env.BLOG_API_KEY) throw new Error('BLOG_API_KEY is unavailable.');
  const base = new URL(process.env.BLOG_REMOTE_URL || 'https://samperalabs.com').origin;
  const meta = readJSON(path.join(folder, 'metadata.json'));
  const manifest = readJSON(path.join(folder, 'deploy.json'));
  if (!/^[a-z0-9-]+$/.test(meta.slug) || !meta.title || !meta.author) throw new Error('Article metadata is incomplete.');
  const auth = { Authorization: `Bearer ${process.env.BLOG_API_KEY}`, Origin: base };
  async function api(route, options = {}) {
    const res = await fetch(base + route, { ...options, headers: { ...auth, ...options.headers }, signal: AbortSignal.timeout(30000) });
    if (!res.ok && res.status !== 404) throw new Error(`Content API returned HTTP ${res.status} for ${route}.`);
    return res;
  }
  receiptPath = path.join(folder, 'publication.json');
  receipt = fs.existsSync(receiptPath) ? readJSON(receiptPath) : { slug: meta.slug, assets: {} };
  if (receipt.slug !== meta.slug) throw new Error('The receipt belongs to another article.');
  const save = () => { if (!checkOnly) fs.writeFileSync(receiptPath, JSON.stringify(receipt, null, 2) + '\n'); };
  const lookup = await api('/api/posts/slug/' + meta.slug);
  const previous = lookup.ok ? await lookup.json() : null;
  if (previous?.deleted_at) throw new Error('The slug belongs to a deleted article.');
  if (previous && previous.id !== receipt.id) {
    if (receipt.phase !== 'creating' || hash(previous.content) !== receipt.pendingContentHash || previous.title !== meta.title || previous.author !== meta.author) throw new Error('The slug exists without this draft\'s saved record ID.');
    receipt.id = previous.id;
    save();
  }

  let content = fs.readFileSync(path.join(folder, 'article.md'), 'utf8');
  if (!content.trim() || /^# /m.test(content)) throw new Error('The article is empty or repeats the page title as an H1.');
  if (!Array.isArray(manifest.assets) || !Array.isArray(manifest.code_files)) throw new Error('deploy.json needs assets and code_files arrays.');
  const files = [];
  const links = [];
  const plannedAssets = {};
  for (const asset of manifest.assets) {
    if (!/^[a-zA-Z0-9][a-zA-Z0-9._-]*\.(png|jpg|jpeg|webp|svg)$/.test(asset.file)) throw new Error('Use a simple local image filename in deploy.json.');
    const source = fs.realpathSync(path.join(folder, asset.file));
    if (!inside(folder, source)) throw new Error('An image resolves outside the draft.');
    const bytes = fs.readFileSync(source);
    let url = receipt.assets?.[asset.file];
    let reusable = false;
    if (receipt.phase === 'deploying' && receipt.assetHashes?.[asset.file] === hash(bytes)) {
      reusable = true;
    } else if (url && new URL(url).origin === base && new URL(url).pathname.startsWith('/images/')) {
      const res = await fetch(url, { signal: AbortSignal.timeout(30000) });
      reusable = res.ok && hash(Buffer.from(await res.arrayBuffer())) === hash(bytes);
    }
    if (!reusable) {
      const name = `${meta.slug}-${path.parse(asset.file).name}-${hash(bytes).slice(0, 12)}${path.extname(asset.file)}`;
      const target = 'public/images/' + name;
      url = base + '/images/' + name;
      if (!fs.existsSync(target) || hash(fs.readFileSync(target)) !== hash(bytes) || git('status', '--porcelain', '--', target)) files.push({ target, bytes });
      links.push({ path: target, description: `Article image for ${meta.title}.` });
    }
    if (!content.includes(`](${asset.file})`)) throw new Error(`The article does not reference ${asset.file}.`);
    content = content.replaceAll(`](${asset.file})`, `](${url})`);
    plannedAssets[asset.file] = url;
  }
  const imageURLs = [...content.matchAll(/!\[[^\]]*\]\(([^)]+)\)/g)].map(m => m[1]);
  if (imageURLs.some(url => !/^https:\/\//.test(url))) throw new Error('Declare every local article image in deploy.json.');
  if (imageURLs.some(url => new URL(url).hostname.endsWith('.r2.cloudflarestorage.com'))) throw new Error('Private storage image URLs cannot be published.');
  const allowedCode = /^(src\/components\/home\/[a-zA-Z0-9][a-zA-Z0-9._-]*\.(astro|svg)|src\/assets\/styles\/home\.css|src\/lib\/postPresentation\.ts|src\/pages\/index\.astro)$/;
  const codeFiles = [];
  for (const entry of manifest.code_files) {
    if (!allowedCode.test(entry.path) || !/^[a-f0-9]{64}$/.test(entry.sha256)) throw new Error('Invalid declared homepage file.');
    const file = fs.realpathSync(entry.path);
    if (!inside(root, file) || hash(fs.readFileSync(file)) !== entry.sha256) throw new Error(`The approved file changed: ${entry.path}.`);
    const changes = git('status', '--porcelain', '--', entry.path);
    if (changes) codeFiles.push(entry.path);
    if (changes.startsWith('??')) links.push({ path: entry.path, description: `Homepage scene source for ${meta.title}.` });
  }
  const body = { title: meta.title, author: meta.author, description: meta.description, slug: meta.slug,
    tags: meta.tags || [], image_url: meta.image_url ?? null, image_alt: meta.image_alt ?? null,
    pub_date: previous?.pub_date || meta.pub_date || new Date().toISOString().slice(0, 10), status: 'published', content };
  const changed = !previous || Object.entries(body).some(([key, value]) => JSON.stringify(previous[key] ?? null) !== JSON.stringify(value ?? null));
  const needsCode = files.length > 0 || codeFiles.length > 0;
  const plan = { slug: meta.slug, recordId: previous?.id ?? null, articleChanged: changed, newImages: files.map(f => f.target), codeFiles, codeReleaseRequired: needsCode };
  console.log(JSON.stringify(plan, null, 2));
  if (checkOnly) {
    if (previous && !changed && !needsCode) {
      for (const route of ['/posts/' + meta.slug, '/', '/rss.xml', '/sitemap-0.xml']) {
        const res = await fetch(base + route, { signal: AbortSignal.timeout(30000) });
        const text = await res.text();
        if (!res.ok || ((route !== '/' || manifest.homepage) && !text.includes(meta.slug))) throw new Error(`Public check failed: ${route}.`);
      }
      console.log('The published article, images, homepage, RSS feed, and sitemap passed the HTTP checks.');
    }
    console.log('Read-only check complete. No files or remote records changed.'); return;
  }
  if (needsCode && !releaseCode) throw new Error('New images or homepage code need --release-code. This option authorizes the scoped commit, push, and deployment.');
  if (needsCode && git('diff', '--cached', '--name-only')) throw new Error('Unrelated files are staged. Clear the staging area before this release.');

  receipt.assets = plannedAssets;
  receipt.assetHashes = Object.fromEntries(manifest.assets.map(asset => [asset.file, hash(fs.readFileSync(path.join(folder, asset.file)))]));
  receipt.pendingContentHash = hash(content);
  save();
  if (needsCode) {
    if (git('branch', '--show-current') !== 'main') throw new Error('Code releases require the main branch.');
    git('fetch', 'origin', 'main');
    if (git('rev-list', '--left-right', '--count', 'HEAD...origin/main').replace(/\s+/g, ' ') !== '0 0') throw new Error('Local main differs from origin/main.');
    for (const file of files) fs.writeFileSync(file.target, file.bytes);
    console.log('Building the site.');
    run('npm', ['run', 'build'], { stdio: 'inherit' });
    const lintFiles = codeFiles.filter(f => /\.(ts|astro)$/.test(f));
    if (lintFiles.length) run('npx', ['eslint', ...lintFiles], { stdio: 'inherit' });
    git('diff', '--check');
    const selection = [...new Set([...files.map(f => f.target), ...codeFiles])];
    git('add', '--', ...selection);
    if (links.length) {
      const additions = links.filter(link => !git('show', 'HEAD:index.md').includes(`](${link.path})`)).map(link => `- [${link.path}](${link.path}): ${link.description}`).join('\n');
      if (additions) {
        const baseline = git('show', 'HEAD:index.md') + '\n';
        const staged = baseline + '\n' + additions + '\n';
        const blob = run('git', ['hash-object', '-w', '--stdin'], { input: staged });
        git('update-index', '--cacheinfo', `100644,${blob},index.md`);
        const working = fs.readFileSync('index.md', 'utf8');
        const missing = links.filter(link => !working.includes(`](${link.path})`)).map(link => `- [${link.path}](${link.path}): ${link.description}`).join('\n');
        if (missing) fs.appendFileSync('index.md', '\n' + missing + '\n');
      }
    }
    git('diff', '--cached', '--check');
    git('commit', '-m', `Publish article assets and homepage: ${meta.slug}`);
    receipt.commit = git('rev-parse', 'HEAD');
    receipt.phase = 'deploying'; save();
    git('push', 'origin', 'main');
  }
  // Resume a queued release without creating another commit or deployment.
  if (receipt.phase === 'deploying') {
    if (git('rev-parse', 'HEAD') !== receipt.commit) throw new Error('HEAD changed during the release.');
    git('push', 'origin', 'main');
    console.log('Waiting for the site deployment.');
    const deadline = Date.now() + 20 * 60 * 1000;
    let finished = false;
    while (Date.now() < deadline) {
      const sql = `SELECT deployment_uuid, status FROM application_deployment_queues WHERE application_id = '${appId}' AND commit = '${receipt.commit}' ORDER BY id DESC LIMIT 1;`;
      const result = ssh(`docker exec coolify-db psql -U coolify -d coolify -At -c ${quote(sql)}`);
      const [id, status] = result.split('|');
      if (status === 'failed' || status === 'cancelled') throw new Error(`Deployment ${id} ${status}.`);
      if (status === 'finished') { receipt.deployment = id; receipt.deployment_status = status; finished = true; break; }
      await delay(10000);
    }
    if (!finished) throw new Error('Deployment did not finish within 20 minutes. The receipt allows a later resume.');
    const images = ssh(`docker ps --filter name=${appUUID} --format '{{.Image}}'`);
    if (!images.split('\n').some(image => image.endsWith(':' + receipt.commit))) throw new Error('The running site does not use the release commit.');
    receipt.phase = 'assets-ready'; save();
  }
  console.log('Checking public images.');
  for (const url of imageURLs) {
    const res = await fetch(url, { signal: AbortSignal.timeout(30000) });
    if (!res.ok || !res.headers.get('content-type')?.startsWith('image/')) throw new Error('A public image is unavailable. Article publication stopped.');
    await res.arrayBuffer();
  }
  if (changed) {
    const fresh = await api('/api/posts/slug/' + meta.slug);
    const current = fresh.ok ? await fresh.json() : null;
    if (JSON.stringify(current) !== JSON.stringify(previous)) throw new Error('The remote article changed during release.');
    if (previous) receipt.previousRecord = previous;
    receipt.phase = previous ? 'updating' : 'creating'; save();
    console.log('Publishing the article.');
    const response = await api(previous ? '/api/posts/' + previous.id : '/api/posts', { method: previous ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (!response.ok) throw new Error('The publication write failed. Resume with the saved receipt.');
    const post = await response.json(); receipt.id = post.id; save();
  }
  const verified = await api('/api/posts/slug/' + meta.slug);
  if (!verified.ok) throw new Error('The published article is missing.');
  const post = await verified.json();
  if (post.status !== 'published' || post.content !== content) throw new Error('The published article does not match the release.');
  receipt.id = post.id; receipt.status = 'published'; receipt.url = base + '/posts/' + meta.slug; receipt.pub_date = post.pub_date; receipt.phase = 'published'; save();
  for (const route of ['/posts/' + meta.slug, '/', '/rss.xml']) {
    const res = await fetch(base + route, { signal: AbortSignal.timeout(30000) }); const text = await res.text();
    if (!res.ok || ((route !== '/' || manifest.homepage) && !text.includes(meta.slug))) throw new Error(`Public check failed: ${route}.`);
  }
  const sitemapIndex = await fetch(base + '/sitemap-index.xml');
  const indexXML = await sitemapIndex.text();
  const sitemapURL = indexXML.match(/<loc>([^<]+)<\/loc>/)?.[1];
  if (!sitemapIndex.ok || !sitemapURL || new URL(sitemapURL).origin !== base) throw new Error('The site sitemap index is unavailable.');
  const sitemap = await fetch(sitemapURL); const xml = await sitemap.text();
  if (!sitemap.ok || !xml.trimEnd().endsWith('</urlset>')) throw new Error('The generated sitemap is unavailable.');
  if (!xml.includes(`<loc>${receipt.url}</loc>`)) {
    console.log('Updating the generated sitemap.');
    const name = path.posix.basename(new URL(sitemapURL).pathname);
    if (!/^sitemap-[0-9]+\.xml$/.test(name)) throw new Error('Unexpected sitemap filename.');
    const containers = ssh(`docker ps --filter name=${appUUID} --format '{{.Names}}'`).split('\n').filter(Boolean);
    if (containers.length !== 1 || !/^[a-zA-Z0-9_-]+$/.test(containers[0])) throw new Error('Cannot identify one running site container.');
    const updated = xml.replace('</urlset>', `<url><loc>${receipt.url}</loc></url></urlset>`);
    const code = `const fs=require('node:fs'),crypto=require('node:crypto');const p='/app/dist/client/${name}';if(crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')!==${JSON.stringify(hash(xml))})throw Error('Sitemap changed');let s='';process.stdin.setEncoding('utf8');process.stdin.on('data',c=>s+=c);process.stdin.on('end',()=>{fs.copyFileSync(p,p+'.before-'+Date.now());fs.writeFileSync(p,s);});`;
    ssh(`docker exec -i ${quote(containers[0])} node -e ${quote(code)}`, updated);
  }
  const finalSitemap = await fetch(sitemapURL);
  if (!finalSitemap.ok || !(await finalSitemap.text()).includes(`<loc>${receipt.url}</loc>`)) throw new Error('Sitemap verification failed.');
  receipt.checks = { article: true, images: true, rss: true, sitemap: true, browser: 'not run' }; save();
  fs.writeFileSync(path.join(folder, 'metadata.json'), JSON.stringify({ ...meta, status: 'published', pub_date: post.pub_date }, null, 2) + '\n');
  const localIndex = path.join(folder, 'index.md');
  if (fs.existsSync(localIndex) && !fs.readFileSync(localIndex, 'utf8').includes('](publication.json)')) fs.appendFileSync(localIndex, '\n- [publication.json](publication.json): Publication receipt and release check results.\n');
  console.log(`Published: ${receipt.url} (post ${post.id})`);
}

main().catch(error => {
  if (receiptPath && receipt && !checkOnly) { receipt.lastError = 'Release stopped. Inspect the failed phase before retrying.'; fs.writeFileSync(receiptPath, JSON.stringify(receipt, null, 2) + '\n'); }
  // Avoid dumping HTTP bodies, environment values, or subprocess buffers.
  console.error(error instanceof Error ? error.message : 'Release failed.');
  process.exitCode = 1;
});
