import { lstatSync, mkdirSync, realpathSync, symlinkSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const siteRoot = realpathSync(fileURLToPath(new URL('../', import.meta.url)));
const source = join(siteRoot, 'src/docs/commands/new-post');
const shared = join(homedir(), '.agents/skills/new-post');
const links = [
  { path: shared, target: source },
  { path: join(homedir(), '.claude/skills/new-post'), target: shared },
  {
    path: join(siteRoot, '.Codex/skills/new-post'),
    target: relative(join(siteRoot, '.Codex/skills'), source),
  },
  {
    path: join(siteRoot, '.claude/skills/new-post'),
    target: relative(join(siteRoot, '.claude/skills'), source),
  },
];

// Check every destination before installing any link. Never replace existing entries.
realpathSync(join(source, 'SKILL.md'));
const existing = new Set();
for (const link of links) {
  let entry;
  try {
    entry = lstatSync(link.path);
  } catch (error) {
    if (error.code === 'ENOENT') continue;
    throw error;
  }
  if (!entry.isSymbolicLink()) {
    throw new Error(`The skill location already contains another entry: ${link.path}`);
  }
  let resolved;
  try {
    resolved = realpathSync(link.path);
  } catch {
    throw new Error(`The skill link is unavailable: ${link.path}`);
  }
  if (resolved !== source) {
    throw new Error(`The skill link points to another source: ${link.path}`);
  }
  existing.add(link.path);
}

for (const link of links) {
  if (existing.has(link.path)) {
    console.log(`Already installed: ${link.path}`);
    continue;
  }
  mkdirSync(dirname(link.path), { recursive: true });
  symlinkSync(link.target, link.path, 'dir');
  console.log(`Installed: ${link.path}`);
}

console.log('Codex: $new-post <source> <topic>');
console.log('Claude Code: /new-post <source> <topic>');
