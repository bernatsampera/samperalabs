import { lstatSync, mkdirSync, realpathSync, symlinkSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = realpathSync(fileURLToPath(new URL('../', import.meta.url)));
const source = join(root, 'src/docs/commands/deploy-post');
const shared = join(homedir(), '.agents/skills/deploy-post');
const links = [
  { path: shared, target: source },
  { path: join(homedir(), '.claude/skills/deploy-post'), target: shared },
  { path: join(root, '.Codex/skills/deploy-post'), target: relative(join(root, '.Codex/skills'), source) },
  { path: join(root, '.claude/skills/deploy-post'), target: relative(join(root, '.claude/skills'), source) },
];
realpathSync(join(source, 'SKILL.md'));
const existing = new Set();
for (const link of links) {
  let entry;
  try { entry = lstatSync(link.path); } catch (error) { if (error.code === 'ENOENT') continue; throw error; }
  if (!entry.isSymbolicLink() || realpathSync(link.path) !== source) throw new Error(`Another entry occupies ${link.path}.`);
  existing.add(link.path);
}
for (const link of links) {
  if (existing.has(link.path)) continue;
  mkdirSync(dirname(link.path), { recursive: true });
  symlinkSync(link.target, link.path, 'dir');
}
console.log('Installed: $deploy-post in Codex and /deploy-post in Claude Code.');
