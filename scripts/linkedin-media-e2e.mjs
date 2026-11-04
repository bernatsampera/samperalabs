import { execFile } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const runFile = promisify(execFile);
const root = fileURLToPath(new URL('../', import.meta.url));
const script = join(root, 'scripts/linkedin-media.mjs');
const e2eRoot = join(root, 'src/editorial/linkedin/_e2e');
const globalContext = 'why-ai-agents-need-a-global-context';
const imageA = 'src/editorial/drafts/global-context/00-renewal-email.png';
const imageB = 'src/editorial/drafts/global-context/07-misc-drawers.png';

const validSlides = {
  slug: globalContext,
  title: 'Global context for AI agents: minimal to load, fast to find',
  url: `https://samperalabs.com/posts/${globalContext}`,
  slides: [
    { kind: 'cover', heading: 'Why did the agent email the old price?', body: 'A fictional example, and the fix.', image: imageA },
    { kind: 'image', image: imageB, text: 'Access to every tool does not tell the agent where the price is.' },
    { kind: 'text', heading: 'Three rules', body: 'Give the agent a small map that points to the correct business context.', list: ['Read the map first.', 'Load one domain.', 'Save the change where it belongs.'] },
    { kind: 'end', heading: 'Minimal to load, fast to find.', body: 'The full article has the map and a five-step test.', url: `samperalabs.com/posts/${globalContext}` },
  ],
};

const validPost = `---
slug: ${globalContext}
url: https://samperalabs.com/posts/${globalContext}
media: carousel
media_files:
  - carousel.pdf
planned: 2026-10-20 09:00 Europe/Madrid
status: ready
---

## Post

An agent can have access to every company tool and still use the wrong price.
Access does not tell the agent where approved information lives. A global context gives the agent a small map. The map points to clear business domains. The agent reads the map first. It loads only the domain that the task needs. It then saves each approved change in the same place. This method keeps the first load small. It also makes detailed context fast to find. The article uses a fictional renewal email to show the problem and the fix. It includes three rules and a five-step test for a context structure.

## First comment

Read the full article: https://samperalabs.com/posts/${globalContext}

## Media

Four slide carousel.

## Decisions

Use a document post.

## Facts

| Claim | Source |
| --- | --- |
| The article uses a fictional renewal email. | src/editorial/drafts/global-context/article.md |
`;

const invalidPost = validPost
  .replace('An agent can have access', 'An agent can have access and this is a game changer\u2014it')
  .replace(`Read the full article: https://samperalabs.com/posts/${globalContext}`, 'Read the full article in the first comment.');

const cases = [
  { id: '01-carousel-valid', command: ['carousel', globalContext, '--offline'], expected: 'success', prepare: async (folder) => writeJson(join(folder, 'slides.json'), validSlides) },
  {
    id: '02-carousel-overflow', command: ['carousel', globalContext, '--offline'], expected: 'F7',
    prepare: async (folder) => writeJson(join(folder, 'slides.json'), {
      ...validSlides,
      slides: [validSlides.slides[0], { kind: 'text', heading: 'Too much text', body: Array(900).fill('overflow').join(' ') }, validSlides.slides[3]],
    }),
  },
  {
    id: '03-carousel-missing-image', command: ['carousel', globalContext, '--offline'], expected: 'F4',
    prepare: async (folder) => writeJson(join(folder, 'slides.json'), {
      ...validSlides,
      slides: [validSlides.slides[0], { kind: 'image', image: 'src/editorial/drafts/global-context/missing.png', text: 'Missing image.' }, validSlides.slides[3]],
    }),
  },
  { id: '04-carousel-two-slides', command: ['carousel', globalContext, '--offline'], expected: 'F5', prepare: async (folder) => writeJson(join(folder, 'slides.json'), { ...validSlides, slides: validSlides.slides.slice(0, 2) }) },
  { id: '05-video-valid', command: ['video', 'gym-schedule-image-to-classes'], expected: 'success', prepare: async () => {} },
  { id: '06-video-no-scene', command: ['video', 'express-the-general'], expected: 'F6', prepare: async () => {} },
  {
    id: '07-check-valid', command: ['check', globalContext, '--offline'], expected: 'success',
    prepare: async (folder) => {
      await writeFile(join(folder, 'post.md'), validPost);
      await writeFile(join(folder, 'carousel.pdf'), 'E2E media placeholder.');
    },
  },
  {
    id: '08-check-three-failures', command: ['check', globalContext, '--offline'], expected: 'F19,F20,F22',
    prepare: async (folder) => {
      await writeFile(join(folder, 'post.md'), invalidPost);
      await writeFile(join(folder, 'carousel.pdf'), 'E2E media placeholder.');
    },
  },
];

async function writeJson(path, value) {
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`);
}

async function runCase(testCase) {
  const folder = join(e2eRoot, testCase.id);
  await mkdir(folder, { recursive: true });
  await testCase.prepare(folder);
  let exitCode = 0;
  let stdout = '';
  let stderr = '';
  try {
    const result = await runFile(process.execPath, [script, ...testCase.command], {
      cwd: root,
      env: { ...process.env, LINKEDIN_MEDIA_ROOT: folder },
      maxBuffer: 40 * 1024 * 1024,
    });
    stdout = result.stdout;
    stderr = result.stderr;
  } catch (error) {
    exitCode = error.code ?? 1;
    stdout = error.stdout ?? '';
    stderr = error.stderr ?? '';
  }
  const combined = `${stdout}\n${stderr}`.trim();
  const matched = [...new Set([...combined.matchAll(/\[F(\d+)\]/g)].map((match) => `F${match[1]}`))];
  let passed = testCase.expected === 'success' ? exitCode === 0 : exitCode !== 0;
  for (const code of testCase.expected.split(',')) {
    if (code !== 'success' && !matched.includes(code)) passed = false;
  }
  const outputPaths = [relative(root, folder)];
  if (testCase.id === '01-carousel-valid' && exitCode === 0) {
    const { stdout: pdfInfo } = await runFile('pdfinfo', [join(folder, 'carousel.pdf')]);
    const pages = Number(pdfInfo.match(/^Pages:\s+(\d+)/m)?.[1]);
    const size = pdfInfo.match(/^Page size:\s+([\d.]+) x ([\d.]+) pts/m);
    const width = size ? (Number(size[1]) * 96) / 72 : 0;
    const height = size ? (Number(size[2]) * 96) / 72 : 0;
    if (pages !== validSlides.slides.length || Math.abs(width - 1080) > 1 || Math.abs(height - 1350) > 1) passed = false;
    outputPaths.push(relative(root, join(folder, 'carousel.pdf')), relative(root, join(folder, 'slides')));
  }
  if (testCase.id === '05-video-valid' && exitCode === 0) {
    const { stdout: probe } = await runFile('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=codec_name,pix_fmt,width,height,avg_frame_rate:format=duration', '-of', 'compact=p=0:nk=0', join(folder, 'video.mp4')]);
    if (!/codec_name=h264/.test(probe) || !/pix_fmt=yuv420p/.test(probe) || !/width=1080/.test(probe) || !/height=1350/.test(probe) || !/avg_frame_rate=30\/1/.test(probe)) passed = false;
    outputPaths.push(relative(root, join(folder, 'video.mp4')), relative(root, join(folder, 'poster.png')));
    const firstFrame = join(folder, 'first-frame.png');
    await runFile('ffmpeg', ['-y', '-ss', '0.2', '-i', join(folder, 'video.mp4'), '-frames:v', '1', firstFrame]);
    outputPaths.push(relative(root, firstFrame));
    if (!stdout.includes('Capture start progress: 0')) passed = false;
    stdout += `\nffprobe stream: ${probe.trim()}\n`;
  }
  return { case: testCase.id, expected: testCase.expected, exitCode, matchedFailureCode: matched.join(',') || '', passed, outputPaths, output: `${stdout}\n${stderr}`.trim() };
}

await mkdir(e2eRoot, { recursive: true });
const results = [];
for (const testCase of cases) {
  process.stdout.write(`Run ${testCase.id}... `);
  const result = await runCase(testCase);
  results.push(result);
  console.log(result.passed ? 'PASS' : 'FAIL');
}

const report = {
  generatedAt: new Date().toISOString(),
  passed: results.every((result) => result.passed),
  cases: results,
};
await writeFile(join(e2eRoot, 'report.json'), `${JSON.stringify(report, null, 2)}\n`);
const rows = results.map((result) => `| ${result.case} | ${result.expected} | ${result.exitCode} | ${result.matchedFailureCode || 'none'} | ${result.passed ? 'PASS' : 'FAIL'} | ${result.outputPaths.join('<br>') || 'none'} |`);
const markdown = `# LinkedIn media E2E report

| Case | Expected | Exit code | Matched failure code | Result | Output paths |
| --- | --- | ---: | --- | --- | --- |
${rows.join('\n')}
`;
await writeFile(join(e2eRoot, 'report.md'), markdown);
console.log(`\n${markdown}`);
if (!report.passed) process.exitCode = 1;
