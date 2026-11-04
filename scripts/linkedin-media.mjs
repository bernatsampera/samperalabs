import { execFile } from 'node:child_process';
import {
  copyFile,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  stat,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { extname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

import matter from 'gray-matter';
import { chromium } from 'playwright-core';
import sharp from 'sharp';
import { transform } from 'esbuild';

const runFile = promisify(execFile);
const root = fileURLToPath(new URL('../', import.meta.url));
const linkedinRoot = resolve(root, 'src/editorial/linkedin');
const e2eRoot = resolve(linkedinRoot, '_e2e');
const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const pageWidth = 1080;
const pageHeight = 1350;
const frameRate = 30;

class MediaError extends Error {
  constructor(code, message) {
    super(`[F${code}] ${message}`);
    this.code = code;
  }
}

const fail = (code, message) => {
  throw new MediaError(code, message);
};

const escapeHtml = (value = '') =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

const pathExists = async (path) => {
  try {
    await stat(path);
    return true;
  } catch (error) {
    if (error.code === 'ENOENT') return false;
    throw error;
  }
};

const inside = (parent, child) => {
  const value = relative(parent, child);
  return value !== '' && !value.startsWith(`..${sep}`) && value !== '..' && !isAbsolute(value);
};

function parseArguments(argv) {
  const offline = argv.includes('--offline');
  const values = argv.filter((value) => value !== '--offline');
  const [command, slug, imagePath, ...extra] = values;
  if (!['carousel', 'video', 'image', 'check'].includes(command) || !slug || extra.length) {
    throw new Error('Usage: linkedin-media <carousel|video|image|check> <slug> [image-path] [--offline]');
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) fail(2, `Invalid slug: ${slug}`);
  if (command === 'image' && !imagePath) throw new Error('The image command needs a repository-relative image path.');
  if (command !== 'image' && imagePath) throw new Error(`${command} does not accept an image path.`);
  return { command, slug, imagePath, offline };
}

function outputFolder(slug) {
  const configured = process.env.LINKEDIN_MEDIA_ROOT;
  if (!configured) return resolve(linkedinRoot, slug);
  const target = resolve(root, configured);
  if (!inside(e2eRoot, target)) {
    fail(2, 'LINKEDIN_MEDIA_ROOT must point inside src/editorial/linkedin/_e2e/.');
  }
  return target;
}

async function fetchArticle(slug) {
  const url = `https://samperalabs.com/posts/${slug}`;
  let response;
  try {
    response = await fetch(url, { method: 'GET', redirect: 'follow' });
  } catch (error) {
    fail(1, `The live article request failed for ${url}: ${error.message}`);
  }
  if (response.status !== 200) fail(1, `The live article returned HTTP ${response.status}: ${url}`);
  return { url, html: await response.text() };
}

async function loadFonts() {
  const fontRoot = resolve(root, 'node_modules/@fontsource/poppins/files');
  const [regular, semibold, mono] = await Promise.all([
    readFile(join(fontRoot, 'poppins-latin-400-normal.woff2')),
    readFile(join(fontRoot, 'poppins-latin-600-normal.woff2')),
    readFile(resolve(root, 'node_modules/@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2')),
  ]);
  return {
    regular: regular.toString('base64'),
    semibold: semibold.toString('base64'),
    mono: mono.toString('base64'),
  };
}

function fontCss(fonts) {
  return `
    @font-face{font-family:Poppins;src:url(data:font/woff2;base64,${fonts.regular}) format('woff2');font-weight:400;font-style:normal}
    @font-face{font-family:Poppins;src:url(data:font/woff2;base64,${fonts.semibold}) format('woff2');font-weight:600;font-style:normal}
    @font-face{font-family:'JetBrains Mono';src:url(data:font/woff2;base64,${fonts.mono}) format('woff2');font-weight:100 800;font-style:normal}
  `;
}

function imageMime(path) {
  const extension = extname(path).toLowerCase();
  return {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
  }[extension] ?? 'application/octet-stream';
}

async function imageData(path) {
  const bytes = await readFile(path);
  return `data:${imageMime(path)};base64,${bytes.toString('base64')}`;
}

function requireString(value, label) {
  if (typeof value !== 'string' || !value.trim()) fail(3, `${label} must be a non-empty string.`);
}

async function readSlides(folder, slug) {
  const path = join(folder, 'slides.json');
  let value;
  try {
    value = JSON.parse(await readFile(path, 'utf8'));
  } catch (error) {
    fail(3, `Cannot read valid JSON from ${relative(root, path)}: ${error.message}`);
  }
  if (!value || typeof value !== 'object' || Array.isArray(value)) fail(3, 'slides.json must contain an object.');
  requireString(value.slug, 'slides.json slug');
  requireString(value.title, 'slides.json title');
  requireString(value.url, 'slides.json url');
  if (value.slug !== slug) fail(3, `slides.json slug must equal ${slug}.`);
  if (!Array.isArray(value.slides)) fail(3, 'slides.json slides must be an array.');
  if (value.slides.length < 3 || value.slides.length > 10) {
    fail(5, `The carousel has ${value.slides.length} slides. It must have 3 to 10 slides.`);
  }
  const kinds = new Set(['cover', 'image', 'text', 'code', 'end']);
  for (const [index, slide] of value.slides.entries()) {
    const number = index + 1;
    if (!slide || typeof slide !== 'object' || Array.isArray(slide) || !kinds.has(slide.kind)) {
      fail(3, `Slide ${number} has an unknown or missing kind.`);
    }
    if (slide.kind === 'cover') {
      requireString(slide.heading, `Slide ${number} heading`);
      requireString(slide.body, `Slide ${number} body`);
    }
    if (slide.kind === 'image') {
      requireString(slide.image, `Slide ${number} image`);
      requireString(slide.text, `Slide ${number} text`);
    }
    if (slide.kind === 'text') {
      requireString(slide.heading, `Slide ${number} heading`);
      if (slide.body !== undefined && typeof slide.body !== 'string') fail(3, `Slide ${number} body must be a string.`);
      if (slide.list !== undefined && (!Array.isArray(slide.list) || slide.list.some((item) => typeof item !== 'string' || !item.trim()))) {
        fail(3, `Slide ${number} list must contain non-empty strings.`);
      }
      if (!slide.body?.trim() && !slide.list?.length) fail(3, `Slide ${number} needs a body or list.`);
    }
    if (slide.kind === 'code') {
      requireString(slide.heading, `Slide ${number} heading`);
      requireString(slide.code, `Slide ${number} code`);
      if (slide.body !== undefined && typeof slide.body !== 'string') fail(3, `Slide ${number} body must be a string.`);
    }
    if (slide.kind === 'end') {
      requireString(slide.heading, `Slide ${number} heading`);
      requireString(slide.body, `Slide ${number} body`);
      requireString(slide.url, `Slide ${number} url`);
    }
    if (slide.image !== undefined) {
      requireString(slide.image, `Slide ${number} image`);
      const imagePath = resolve(root, slide.image);
      if (!inside(root, imagePath) || !(await pathExists(imagePath))) {
        fail(4, `Slide ${number} image does not exist: ${slide.image}`);
      }
      slide.imageData = await imageData(imagePath);
    }
  }
  return value;
}

function slideMarkup(slide, index, count) {
  const footer = `<footer><span>Bernat Sampera \u00b7 samperalabs.com</span><span>${index + 1} / ${count}</span></footer>`;
  const image = slide.imageData
    ? `<div class="image-box"><img src="${slide.imageData}" alt=""></div>`
    : '';
  const eyebrow = slide.eyebrow ? `<p class="eyebrow">${escapeHtml(slide.eyebrow)}</p>` : '';
  if (slide.kind === 'cover') {
    const body = slide.body ? `<p class="body measure" data-reader>${escapeHtml(slide.body)}</p>` : '';
    return `<section class="slide cover${image ? '' : ' type-only'}" data-slide="${index + 1}"><main>${eyebrow}<h1 class="measure" data-reader>${escapeHtml(slide.heading)}</h1>${body}${image}</main>${footer}</section>`;
  }
  if (slide.kind === 'image') {
    return `<section class="slide image-slide" data-slide="${index + 1}"><main>${eyebrow}${slide.heading ? `<h2 class="image-heading measure" data-reader>${escapeHtml(slide.heading)}</h2>` : ''}${image}<p class="image-text measure" data-reader>${escapeHtml(slide.text)}</p></main>${footer}</section>`;
  }
  if (slide.kind === 'code') {
    const lines = slide.code.split('\n').map((line) => line.trimStart().startsWith('#') ? `<span class="comment">${escapeHtml(line)}</span>` : escapeHtml(line)).join('\n');
    const body = slide.body ? `<p class="body measure" data-reader>${escapeHtml(slide.body)}</p>` : '';
    return `<section class="slide text-slide code-slide" data-slide="${index + 1}"><main>${eyebrow}<h2 class="measure" data-reader>${escapeHtml(slide.heading)}</h2><pre class="code measure" data-reader>${lines}</pre>${body}</main>${footer}</section>`;
  }
  if (slide.kind === 'text') {
    const body = slide.body ? `<p class="body measure" data-reader>${escapeHtml(slide.body)}</p>` : '';
    const list = slide.list?.length
      ? `<ul class="measure" data-reader>${slide.list.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`
      : '';
    return `<section class="slide text-slide" data-slide="${index + 1}"><main>${eyebrow}<h2 class="measure" data-reader>${escapeHtml(slide.heading)}</h2>${body}${list}</main>${footer}</section>`;
  }
  return `<section class="slide end" data-slide="${index + 1}"><main>${eyebrow}<h2 class="measure" data-reader>${escapeHtml(slide.heading)}</h2><p class="body measure" data-reader>${escapeHtml(slide.body)}</p><p class="url measure" data-reader>${escapeHtml(slide.url)}</p></main>${footer}</section>`;
}

function carouselHtml(data, fonts) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>
    ${fontCss(fonts)}
    *{box-sizing:border-box}html,body{margin:0;padding:0;background:#fafafa;color:#18181b;font-family:Poppins,sans-serif}
    .slide{position:relative;width:1080px;height:1350px;padding:84px 84px 68px;background:#fafafa;page-break-after:always;break-after:page;overflow:hidden}
    .slide:last-child{page-break-after:auto;break-after:auto}.slide main{height:1128px;display:flex;flex-direction:column;min-height:0}
    .eyebrow{margin:0 0 30px;color:#52525b;font-size:34px;line-height:1.2;text-transform:uppercase;letter-spacing:.08em}
    h1,h2{margin:0;padding-bottom:12px;font-size:72px;line-height:1.15;font-weight:600;letter-spacing:-.035em;max-height:330px;overflow:hidden}
    .body{margin:36px 0 0;font-size:42px;line-height:1.35;max-height:230px;overflow:hidden}.cover :is(.eyebrow,h1,.body,.image-box){flex-shrink:0}.cover h1{font-size:68px;max-height:400px}.cover .body{max-width:820px}
    .image-box{display:flex;align-items:center;justify-content:center;border:2px solid #e4e4e7;background:#fff;overflow:hidden;min-height:0}
    .image-box img{display:block;width:100%;height:100%;object-fit:contain}
    .cover main,.image-slide main{justify-content:center}.cover main>*,.image-slide main>*{flex-shrink:0}
    .image-box{align-self:center;flex:none}.cover .image-box{margin-top:42px}
    .image-text{margin:42px 0 0;font-size:40px;line-height:1.35;max-height:230px;overflow:hidden}
    .text-slide h2{max-height:260px}.text-slide .body{max-height:220px}
    ul{margin:44px 0 0;padding-left:56px;font-size:42px;line-height:1.45;max-height:530px;overflow:hidden}
    li{padding-left:14px;margin:0 0 22px}.end main{justify-content:center;padding-bottom:100px}.end h2{max-height:320px}
    .end .body{max-width:840px;max-height:250px}.url{margin:48px 0 0;color:#18181b;font-size:38px;line-height:1.35;max-height:120px;overflow:hidden;overflow-wrap:anywhere}
    .eyebrow{color:#8a5a00;font-weight:600}.image-heading{font-size:56px;max-height:150px;margin-bottom:36px}.image-slide .image-text{color:#3f3f46}
    .type-only h1{font-size:104px;line-height:1.08;padding-bottom:24px;max-height:700px}.type-only .body{font-size:46px;max-height:320px;margin-top:56px;color:#52525b}
    .text-slide main{justify-content:center}ul{list-style:none;padding-left:0}li{padding:26px 0;margin:0;border-top:2px solid #e4e4e7}li:last-child{border-bottom:2px solid #e4e4e7}
    .code{margin:44px 0 0;padding:36px 40px;background:#18181b;color:#f4f4f5;font-family:'JetBrains Mono',monospace;font-size:40px;line-height:1.45;white-space:pre;overflow:hidden;max-height:840px;border-radius:6px}.code .comment{color:#d4a64a}.code-slide h2{font-size:60px}
    footer{position:absolute;left:84px;right:84px;bottom:34px;display:flex;justify-content:space-between;border-top:2px solid #e4e4e7;padding-top:18px;color:#52525b;font-size:26px;line-height:1}
    @page{size:1080px 1350px;margin:0}
  </style></head><body>${data.slides.map((slide, index) => slideMarkup(slide, index, data.slides.length)).join('')}</body></html>`;
}

async function verifyPdf(path, expectedPages) {
  try {
    const { stdout } = await runFile('pdfinfo', [path]);
    const pages = Number(stdout.match(/^Pages:\s+(\d+)/m)?.[1]);
    if (pages !== expectedPages) fail(10, `The PDF has ${pages} pages. It must have ${expectedPages}.`);
    const size = stdout.match(/^Page size:\s+([\d.]+) x ([\d.]+) pts/m);
    if (!size) fail(11, 'Cannot read the PDF page size.');
    const width = (Number(size[1]) * 96) / 72;
    const height = (Number(size[2]) * 96) / 72;
    if (Math.abs(width - pageWidth) > 1 || Math.abs(height - pageHeight) > 1) {
      fail(11, `The PDF page size is ${width.toFixed(1)} x ${height.toFixed(1)} px.`);
    }
    return;
  } catch (error) {
    if (error instanceof MediaError) throw error;
    if (error.code !== 'ENOENT') throw error;
  }
  const pdf = await readFile(path, 'latin1');
  const pages = [...pdf.matchAll(/\/Type\s*\/Page(?!s)\b/g)].length;
  if (pages !== expectedPages) fail(10, `The PDF has ${pages} pages. It must have ${expectedPages}.`);
  const boxes = [...pdf.matchAll(/\/MediaBox\s*\[\s*0\s+0\s+([\d.]+)\s+([\d.]+)\s*\]/g)];
  if (!boxes.length || boxes.some((match) => Math.abs((Number(match[1]) * 96) / 72 - pageWidth) > 1 || Math.abs((Number(match[2]) * 96) / 72 - pageHeight) > 1)) {
    fail(11, 'A PDF page does not have the size 1080 x 1350 px.');
  }
}

async function makeCarousel(folder, slug) {
  const data = await readSlides(folder, slug);
  const fonts = await loadFonts();
  const browser = await chromium.launch({ executablePath: chromePath, headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: pageWidth, height: pageHeight }, deviceScaleFactor: 1 });
    await page.setContent(carouselHtml(data, fonts), { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    await page.locator('.image-box').evaluateAll(async (boxes) => {
      for (const box of boxes) {
        const image = box.querySelector('img');
        await image.decode();
        const main = box.parentElement;
        const outerHeight = (node) => {
          const style = getComputedStyle(node);
          return node.getBoundingClientRect().height + parseFloat(style.marginTop) + parseFloat(style.marginBottom);
        };
        const textHeight = [...main.children].filter((node) => node !== box).reduce((sum, node) => sum + outerHeight(node), 0);
        const gap = parseFloat(getComputedStyle(box).marginTop);
        const available = Math.max(4, main.clientHeight - textHeight - gap);
        const scale = Math.min((Math.min(912, main.clientWidth) - 4) / image.naturalWidth, (available - 4) / image.naturalHeight);
        box.style.width = `${image.naturalWidth * scale + 4}px`;
        box.style.height = `${image.naturalHeight * scale + 4}px`;
      }
    });
    const fontStatus = await page.evaluate(() => ({
      regular: document.fonts.check('400 34px Poppins'),
      semibold: document.fonts.check('600 72px Poppins'),
      family: getComputedStyle(document.querySelector('.slide')).fontFamily,
    }));
    if (!fontStatus.regular || !fontStatus.semibold || !fontStatus.family.startsWith('Poppins')) {
      fail(12, 'Poppins did not load for the carousel.');
    }
    const checks = await page.locator('.slide').evaluateAll((slides) => slides.map((slide) => ({
      number: Number(slide.dataset.slide),
      overflow: [...slide.querySelectorAll('.measure')]
        .filter((node) => node.scrollHeight > node.clientHeight + 1 || node.scrollWidth > node.clientWidth + 1)
        .map((node) => ({
          className: node.className,
          clientHeight: node.clientHeight,
          scrollHeight: node.scrollHeight,
          clientWidth: node.clientWidth,
          scrollWidth: node.scrollWidth,
        })),
      minimum: Math.min(...[...slide.querySelectorAll('[data-reader]')].map((node) => Number.parseFloat(getComputedStyle(node).fontSize))),
      images: [...slide.querySelectorAll('img')].map((image) => ({
        fit: getComputedStyle(image).objectFit,
        naturalWidth: image.naturalWidth,
        naturalHeight: image.naturalHeight,
      })),
    })));
    for (const check of checks) {
      if (check.overflow.length) {
        const box = check.overflow[0];
        fail(7, `Slide ${check.number} text overflows its ${box.className || 'text'} box (${box.scrollWidth} x ${box.scrollHeight} in ${box.clientWidth} x ${box.clientHeight}).`);
      }
      if (check.minimum < 34) fail(8, `Slide ${check.number} has reader text below 34 px.`);
      if (check.images.some((image) => image.fit !== 'contain' || !image.naturalWidth || !image.naturalHeight)) {
        fail(9, `Slide ${check.number} has an image that is cropped, stretched, or unreadable.`);
      }
    }
    const slidesFolder = join(folder, 'slides');
    await mkdir(slidesFolder, { recursive: true });
    for (let index = 0; index < data.slides.length; index += 1) {
      await page.locator('.slide').nth(index).screenshot({ path: join(slidesFolder, `${String(index + 1).padStart(2, '0')}.png`) });
    }
    const pdfPath = join(folder, 'carousel.pdf');
    await page.pdf({ path: pdfPath, width: '1080px', height: '1350px', printBackground: true, preferCSSPageSize: true });
    await verifyPdf(pdfPath, data.slides.length);
    console.log(`Carousel: ${relative(root, pdfPath)}`);
    console.log(`Slides: ${data.slides.length}, 1080 x 1350 px`);
  } finally {
    await browser.close();
  }
}

async function loadPresentation(slug) {
  const source = await readFile(resolve(root, 'src/lib/postPresentation.ts'), 'utf8');
  const code = await transform(source, { loader: 'ts', format: 'esm' });
  const module = await import(`data:text/javascript;base64,${Buffer.from(code.code).toString('base64')}`);
  return module.getPostPresentation(slug);
}

async function restrictNetwork(context) {
  await context.route('**/*', async (route) => {
    const request = route.request();
    let url;
    try {
      url = new URL(request.url());
    } catch {
      await route.abort();
      return;
    }
    if (request.method() !== 'GET' || url.protocol !== 'https:' || url.hostname !== 'samperalabs.com') {
      await route.abort();
      return;
    }
    await route.continue();
  });
}

function articleTitle(html) {
  const encoded = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? '';
  return encoded
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replace(/&#(x?[0-9a-f]+);/gi, (_, value) => String.fromCodePoint(Number.parseInt(value.replace(/^x/i, ''), /^x/i.test(value) ? 16 : 10)))
    .replace(/\s*[\u2013\u2014]\s*Bernat Sampera\s*$/i, '')
    .replace(/[\u2013\u2014]/g, '-')
    .trim();
}

function compositionHtml(fonts, presentation, title, slug) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>
    ${fontCss(fonts)}
    *{box-sizing:border-box}html,body{margin:0;width:1080px;height:1350px;overflow:hidden;background:#fafafa;color:#18181b;font-family:Poppins,sans-serif}
    #animation,#end-card{position:absolute;inset:0;background:#fafafa}#animation{padding:76px 60px 52px;display:flex;flex-direction:column}
    h1{margin:0;padding-bottom:12px;font-size:64px;line-height:1.15;font-weight:600;letter-spacing:-.035em}#animation h1{flex:none;overflow:hidden}
    #scene{width:960px;height:600px;flex:none;align-self:center;margin-top:28px;border:2px solid #e4e4e7;background:#fff;display:flex;align-items:center;justify-content:center;overflow:hidden}
    #scene-image{display:block;width:100%;height:100%;object-fit:contain}.caption{flex:none;margin:28px 0 24px;padding-bottom:8px;color:#52525b;font-size:36px;line-height:1.3;overflow:hidden}
    footer{flex:none;margin-top:auto;border-top:2px solid #e4e4e7;padding-top:18px;color:#52525b;font-size:26px}
    #end-card{display:none;padding:118px 84px;align-items:center}#end-card.visible{display:flex}#end-card .inner{width:100%}
    #end-card h1{font-size:70px;max-width:900px}#end-card p{margin:54px 0 0;font-size:38px;line-height:1.35;overflow-wrap:anywhere}
  </style></head><body><section id="animation"><h1>${escapeHtml(presentation.heading)}</h1><div id="scene"><img id="scene-image" alt=""></div><p class="caption">${escapeHtml(presentation.caption)}</p><footer>samperalabs.com</footer></section><section id="end-card"><div class="inner"><h1>${escapeHtml(title)}</h1><p>samperalabs.com/posts/${escapeHtml(slug)}</p></div></section></body></html>`;
}

async function prepareComposer(browser, presentation, title, slug) {
  const fonts = await loadFonts();
  const page = await browser.newPage({ viewport: { width: pageWidth, height: pageHeight }, deviceScaleFactor: 1 });
  await page.setContent(compositionHtml(fonts, presentation, title, slug), { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  const loaded = await page.evaluate(() => document.fonts.check('600 64px Poppins') && document.fonts.check('400 36px Poppins'));
  if (!loaded) fail(12, 'Poppins did not load for the video frames.');
  return page;
}

async function composeFrame(page, sceneBytes, path) {
  const source = `data:image/png;base64,${sceneBytes.toString('base64')}`;
  await page.locator('#scene-image').evaluate(async (image, value) => {
    image.src = value;
    await image.decode();
  }, source);
  const layout = await page.evaluate(() => {
    const heading = document.querySelector('#animation h1');
    const caption = document.querySelector('.caption');
    const scene = document.querySelector('#scene');
    const image = document.querySelector('#scene-image');
    const footer = document.querySelector('footer');
    const available = 1350 - 76 - 52 - heading.offsetHeight - footer.offsetHeight - 28 - 28 - 24;
    for (const fontSize of [36, 35, 34]) {
      caption.style.fontSize = fontSize + 'px';
      const height = available - caption.offsetHeight;
      const width = Math.min(960, (height - 4) * image.naturalWidth / image.naturalHeight + 4);
      if (width < 840) continue;
      scene.style.width = width + 'px';
      scene.style.height = ((width - 4) * image.naturalHeight / image.naturalWidth + 4) + 'px';
      break;
    }
    return {
      overflow: [heading, caption].filter((node) => node.scrollHeight > node.clientHeight + 1 || node.scrollWidth > node.clientWidth + 1).map((node) => node === heading ? 'heading' : 'caption'),
      fits: footer.getBoundingClientRect().bottom <= 1299,
      pixels: image.naturalWidth >= scene.clientWidth,
    };
  });
  if (layout.overflow.length || !layout.fits) fail(7, `Video ${layout.overflow.join(' and ') || 'caption'} text overflows its box.`);
  if (!layout.pixels) fail(16, 'The captured scene has too few pixels for the composed frame.');
  await page.screenshot({ path });
}

async function captureWithClock(page, section, sceneGraphic, playButton, composer, framesFolder) {
  await playButton.evaluate((button) => button.click());
  await page.clock.runFor(16);
  const start = Number(await section.locator('[data-scene-progress]').getAttribute('aria-valuenow'));
  if (start !== 0) fail(14, `The clock capture started at progress ${start}.`);
  console.log('Capture start progress: 0');
  const animationFrames = Math.ceil(3.6 * frameRate) + 1;
  let lastScene;
  for (let index = 0; index < animationFrames; index += 1) {
    lastScene = await sceneGraphic.screenshot({ type: 'png' });
    await composeFrame(composer, lastScene, join(framesFolder, `${String(index + 1).padStart(5, '0')}.png`));
    if (index < animationFrames - 1) await page.clock.runFor(1000 / frameRate);
  }
  await page.clock.runFor(80);
  const end = Number(await section.locator('[data-scene-progress]').getAttribute('aria-valuenow'));
  if (end !== 100) fail(14, `The clock capture ended at progress ${end}.`);
  return { count: animationFrames, lastScene, method: 'clock' };
}

async function captureWithRecording(browser, slug, composer, framesFolder) {
  const recordRoot = await mkdtemp(join(tmpdir(), 'linkedin-media-record-'));
  const context = await browser.newContext({
    viewport: { width: 1000, height: 1200 },
    deviceScaleFactor: 2,
    recordVideo: { dir: recordRoot, size: { width: 2000, height: 2400 } },
  });
  await restrictNetwork(context);
  const page = await context.newPage();
  const video = page.video();
  await page.goto('https://samperalabs.com/', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => document.fonts.ready);
  const section = page.locator(`#essay-${slug}`);
  if (!(await section.count())) fail(13, `The live homepage has no section #essay-${slug}.`);
  await section.scrollIntoViewIfNeeded();
  const scene = section.locator('[data-home-scene]');
  const graphic = scene.locator('svg').first();
  const target = (await graphic.count()) ? graphic : scene;
  const button = section.locator('[data-scene-play]');
  const mode = await section.getAttribute('data-scene-mode');
  if (mode !== 'manual') fail(15, `The recordVideo fallback used ${mode ?? 'no'} scene mode.`);
  const box = await target.boundingBox();
  if (!box) fail(14, 'The recordVideo fallback cannot measure the scene.');
  await page.waitForTimeout(500);
  await button.click();
  const start = Number(await section.locator('[data-scene-progress]').getAttribute('aria-valuenow'));
  if (!Number.isFinite(start) || start > 5) fail(14, `The recordVideo fallback started at progress ${start}.`);
  await section.locator('[data-scene-progress][aria-valuenow="100"]').waitFor({ timeout: 7000 });
  await page.waitForTimeout(350);
  const end = Number(await section.locator('[data-scene-progress]').getAttribute('aria-valuenow'));
  if (end !== 100) fail(14, `The recordVideo fallback ended at progress ${end}.`);
  await page.close();
  await context.close();
  const videoPath = await video.path();
  const extracted = join(recordRoot, 'frames');
  await mkdir(extracted, { recursive: true });
  const crop = `crop=${Math.floor(box.width * 2)}:${Math.floor(box.height * 2)}:${Math.floor(box.x * 2)}:${Math.floor(box.y * 2)},fps=${frameRate}`;
  await runFile('ffmpeg', ['-y', '-i', videoPath, '-vf', crop, join(extracted, '%05d.png')], { maxBuffer: 10 * 1024 * 1024 });
  const files = (await readdir(extracted)).filter((file) => file.endsWith('.png')).sort();
  if (files.length < Math.ceil(4.1 * frameRate)) fail(14, `The recordVideo fallback captured only ${files.length} frames.`);
  let lastScene;
  for (const [index, file] of files.entries()) {
    const bytes = await readFile(join(extracted, file));
    lastScene = bytes;
    await composeFrame(composer, bytes, join(framesFolder, `${String(index + 1).padStart(5, '0')}.png`));
  }
  return { count: files.length, lastScene, method: 'recordVideo' };
}

async function compareFinalScene(browser, slug, expected) {
  const context = await browser.newContext({ viewport: { width: 1000, height: 1200 }, deviceScaleFactor: 2, reducedMotion: 'reduce' });
  try {
    await restrictNetwork(context);
    const page = await context.newPage();
    await page.goto('https://samperalabs.com/', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => document.fonts.ready);
    const section = page.locator(`#essay-${slug}`);
    await section.scrollIntoViewIfNeeded();
    const scene = section.locator('[data-home-scene]');
    const svg = scene.locator('svg').first();
    const actual = await ((await svg.count()) ? svg : scene).screenshot({ type: 'png' });
    const metadata = await sharp(expected).metadata();
    const left = await sharp(expected).ensureAlpha().raw().toBuffer();
    const right = await sharp(actual).resize(metadata.width, metadata.height, { fit: 'fill' }).ensureAlpha().raw().toBuffer();
    let total = 0;
    let large = 0;
    for (let index = 0; index < left.length; index += 1) {
      const difference = Math.abs(left[index] - right[index]);
      total += difference;
      if (difference > 30) large += 1;
    }
    const mean = total / left.length;
    const largeRatio = large / left.length;
    if (mean > 8 || largeRatio > 0.02) {
      fail(18, `The final scene differs from reduced motion. Mean difference: ${mean.toFixed(2)}.`);
    }
    return { mean, largeRatio };
  } finally {
    await context.close();
  }
}

async function endCard(composer, path) {
  await composer.locator('#animation').evaluate((node) => { node.style.display = 'none'; });
  await composer.locator('#end-card').evaluate((node) => { node.classList.add('visible'); });
  await composer.screenshot({ path });
}

async function verifyVideo(path) {
  const { stdout } = await runFile('ffprobe', [
    '-v', 'error', '-show_entries', 'stream=codec_name,pix_fmt,width,height,avg_frame_rate,codec_type',
    '-show_entries', 'format=duration', '-of', 'json', path,
  ]);
  const data = JSON.parse(stdout);
  const video = data.streams.find((stream) => stream.codec_type === 'video');
  const audio = data.streams.find((stream) => stream.codec_type === 'audio');
  const duration = Number(data.format.duration);
  const [numerator, denominator] = String(video?.avg_frame_rate ?? '0/1').split('/').map(Number);
  const fps = numerator / denominator;
  if (!video || video.codec_name !== 'h264' || video.pix_fmt !== 'yuv420p' || video.width !== pageWidth || video.height !== pageHeight || Math.abs(fps - frameRate) > 0.01 || audio) {
    fail(16, 'The video must be H.264, yuv420p, 30 fps, 1080 x 1350, with no audio.');
  }
  if (duration < 3 || duration > 60) fail(17, `The video duration is ${duration.toFixed(3)} seconds.`);
  return { codec: video.codec_name, pixelFormat: video.pix_fmt, width: video.width, height: video.height, fps, duration };
}

async function makeVideo(folder, slug, liveArticle) {
  const presentation = await loadPresentation(slug);
  if (!presentation) fail(6, `The slug has no homepage scene: ${slug}`);
  const title = articleTitle(liveArticle.html);
  if (!title) throw new Error('The live article has no readable title.');
  const work = await mkdtemp(join(tmpdir(), 'linkedin-media-video-'));
  const framesFolder = join(work, 'frames');
  await mkdir(framesFolder, { recursive: true });
  const browser = await chromium.launch({ executablePath: chromePath, headless: true });
  let capture;
  let clockError;
  try {
    const composer = await prepareComposer(browser, presentation, title, slug);
    const context = await browser.newContext({ viewport: { width: 1000, height: 1200 }, deviceScaleFactor: 2 });
    await restrictNetwork(context);
    const page = await context.newPage();
    try {
      await page.clock.install({ time: new Date('2026-01-01T00:00:00Z') });
      await page.goto('https://samperalabs.com/', { waitUntil: 'domcontentloaded' });
      await page.evaluate(() => document.fonts.ready);
      await page.clock.pauseAt(new Date('2026-01-02T00:00:00Z'));
      const section = page.locator(`#essay-${slug}`);
      if (!(await section.count())) fail(13, `The live homepage has no section #essay-${slug}.`);
      await section.scrollIntoViewIfNeeded();
      await page.clock.runFor(100);
      const scene = section.locator('[data-home-scene]');
      const graphic = scene.locator('svg').first();
      const sceneGraphic = (await graphic.count()) ? graphic : scene;
      const playButton = section.locator('[data-scene-play]');
      if (!(await scene.count()) || !(await playButton.count())) fail(13, `The homepage section #essay-${slug} has no scene or Play button.`);
      const mode = await section.getAttribute('data-scene-mode');
      if (mode !== 'manual') fail(15, `The scene mode is ${mode ?? 'missing'} at 1000 px.`);
      capture = await captureWithClock(page, section, sceneGraphic, playButton, composer, framesFolder);
    } catch (error) {
      if (error instanceof MediaError && [7, 13, 15, 16].includes(error.code)) throw error;
      clockError = error;
    } finally {
      await context.close();
    }
    if (!capture) capture = await captureWithRecording(browser, slug, composer, framesFolder);
    const finalAnimationPath = join(framesFolder, `${String(capture.count).padStart(5, '0')}.png`);
    const posterPath = join(folder, 'poster.png');
    await copyFile(finalAnimationPath, posterPath);
    const comparison = await compareFinalScene(browser, slug, capture.lastScene);
    for (let index = 0; index < 2 * frameRate; index += 1) {
      await copyFile(finalAnimationPath, join(framesFolder, `${String(capture.count + index + 1).padStart(5, '0')}.png`));
    }
    const endPath = join(work, 'end-card.png');
    await endCard(composer, endPath);
    for (let index = 0; index < 3 * frameRate; index += 1) {
      await copyFile(endPath, join(framesFolder, `${String(capture.count + 2 * frameRate + index + 1).padStart(5, '0')}.png`));
    }
    const totalFrames = capture.count + 5 * frameRate;
    const videoPath = join(folder, 'video.mp4');
    await runFile('ffmpeg', [
      '-y', '-framerate', String(frameRate), '-i', join(framesFolder, '%05d.png'), '-frames:v', String(totalFrames),
      '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-r', String(frameRate), '-movflags', '+faststart', '-an', videoPath,
    ], { maxBuffer: 20 * 1024 * 1024 });
    const info = await verifyVideo(videoPath);
    console.log(`Video: ${relative(root, videoPath)}`);
    console.log(`Capture method: ${capture.method}${clockError ? ` (clock failed: ${clockError.message})` : ''}`);
    console.log(`Final scene difference: mean ${comparison.mean.toFixed(2)}, large pixels ${(comparison.largeRatio * 100).toFixed(2)}%`);
    console.log(`ffprobe: codec=${info.codec} pix_fmt=${info.pixelFormat} size=${info.width}x${info.height} fps=${info.fps.toFixed(2)} duration=${info.duration.toFixed(3)}`);
  } catch (error) {
    if (!capture && clockError && !(error instanceof MediaError)) {
      error.message = `Deterministic capture failed: ${clockError.message}. recordVideo failed: ${error.message}`;
    }
    throw error;
  } finally {
    await browser.close();
  }
}

async function copyImage(folder, imagePath) {
  const source = resolve(root, imagePath);
  if (!inside(root, source) || !(await pathExists(source))) fail(4, `The image does not exist: ${imagePath}`);
  const extension = extname(source).toLowerCase();
  if (!extension) fail(4, `The image has no file extension: ${imagePath}`);
  const output = join(folder, `image${extension}`);
  await copyFile(source, output);
  let metadata;
  try {
    metadata = await sharp(output).metadata();
  } catch (error) {
    fail(4, `Sharp cannot read the image: ${error.message}`);
  }
  if (!metadata.width || !metadata.height) fail(4, 'The image has no readable width or height.');
  const ratio = metadata.width / metadata.height;
  console.log(`Image: ${relative(root, output)}`);
  console.log(`Size: ${metadata.width} x ${metadata.height}, ratio ${ratio.toFixed(3)}:1`);
  if (ratio > 1.91) console.warn('Warning: The image is wider than 1.91:1.');
  if (ratio < 0.8) console.warn('Warning: The image is taller than 4:5.');
}

function sectionText(body, heading, nextHeading) {
  const start = body.search(new RegExp(`^## ${heading}\\s*$`, 'mi'));
  if (start < 0) return '';
  const contentStart = body.indexOf('\n', start) + 1;
  const tail = body.slice(contentStart);
  const end = nextHeading ? tail.search(new RegExp(`^## ${nextHeading}\\s*$`, 'mi')) : tail.search(/^##\s+/m);
  return (end < 0 ? tail : tail.slice(0, end)).trim();
}

function wordCount(markdown) {
  const plain = markdown
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[`*_>#|~-]/g, ' ');
  return plain.match(/[\p{L}\p{N}]+(?:['\u2019][\p{L}\p{N}]+)*/gu)?.length ?? 0;
}

function phrasePattern(phrase) {
  const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const left = /^[\p{L}\p{N}_]/u.test(phrase) ? '(?<![\\p{L}\\p{N}_])' : '';
  const right = /[\p{L}\p{N}_]$/u.test(phrase) ? '(?![\\p{L}\\p{N}_])' : '';
  return new RegExp(`${left}${escaped}${right}`, 'iu');
}

async function checkPost(folder) {
  const path = join(folder, 'post.md');
  const failures = [];
  let source;
  try {
    source = await readFile(path, 'utf8');
  } catch (error) {
    throw new Error(`Cannot read ${relative(root, path)}: ${error.message}`);
  }
  let parsed;
  try {
    parsed = matter(source);
  } catch (error) {
    throw new Error(`Cannot parse post.md frontmatter: ${error.message}`);
  }
  const post = sectionText(parsed.content, 'Post', 'First comment');
  const firstComment = sectionText(parsed.content, 'First comment', 'Media');
  const facts = sectionText(parsed.content, 'Facts');
  if (/[\u2013\u2014]/u.test(source)) failures.push('[F19] post.md contains an en dash or an em dash.');
  const blockedPath = resolve(root, 'src/docs/commands/post-to-linkedin/blocked-phrases.json');
  const blocked = JSON.parse(await readFile(blockedPath, 'utf8'));
  for (const phrase of blocked.phrases) {
    if (phrasePattern(phrase).test(`${post}\n${firstComment}`)) failures.push(`[F20] Post or First comment contains the blocked phrase: ${phrase}`);
  }
  const paragraphs = post.split(/\n\s*\n/).map((part) => part.trim()).filter(Boolean);
  const hook = (paragraphs[0] ?? '').split('\n')[0].trim();
  if (hook.length > 140) failures.push(`[F25] The hook (first line) has ${hook.length} characters. It must have 140 or fewer.`);
  if (hook.endsWith('?')) failures.push('[F25] The hook (first line) is a question. Write it as a claim.');
  const fragments = paragraphs.filter((part) => wordCount(part) <= 3);
  if (fragments.length > 1) failures.push(`[F26] The post has ${fragments.length} paragraphs of three words or fewer. One is the maximum.`);
  const count = wordCount(post);
  if (count < 80 || count > 260) failures.push(`[F21] Post has ${count} words. It must have 80 to 260 words.`);
  if (typeof parsed.data.url !== 'string' || !firstComment.includes(parsed.data.url)) failures.push('[F22] First comment does not contain the frontmatter URL.');
  const mediaFiles = Array.isArray(parsed.data.media_files) ? parsed.data.media_files : [];
  for (const file of mediaFiles) {
    const mediaPath = typeof file === 'string' ? resolve(folder, file) : '';
    if (typeof file !== 'string' || !file.trim() || !inside(folder, mediaPath) || !(await pathExists(mediaPath))) {
      failures.push(`[F23] Media file does not exist: ${String(file)}`);
    }
  }
  const rows = facts.split('\n').filter((line) => /^\s*\|/.test(line));
  for (const [index, row] of rows.entries()) {
    const cells = row.split('|').slice(1, -1).map((cell) => cell.trim());
    if (index < 2 || !cells.some(Boolean)) continue;
    const claim = cells[0] ?? '';
    const sourceCell = cells[1] ?? '';
    if (!sourceCell) {
      failures.push(`[F24] Facts claim has no Source: ${claim || `row ${index + 1}`}`);
      continue;
    }
    const sourcePath = sourceCell.replace(/^`|`$/g, '').trim();
    const looksLikePath = /^(?:\.\.?\/|src\/|scripts\/|public\/|context\/|[\w.-]+\/)[^\s]+$/.test(sourcePath);
    if (looksLikePath && !(await pathExists(resolve(root, sourcePath)))) {
      failures.push(`[F24] Facts source path does not exist: ${sourcePath}`);
    }
  }
  if (failures.length) {
    for (const failure of failures) console.error(failure);
    process.exitCode = 1;
    return;
  }
  const preview = post.replace(/\s+/g, ' ').trim().slice(0, 210);
  console.log(`Post check passed: ${count} words.`);
  console.log(`LinkedIn preview: ${preview}`);
}

async function main() {
  const options = parseArguments(process.argv.slice(2));
  const folder = outputFolder(options.slug);
  const liveArticle = options.offline ? { url: '', html: '' } : await fetchArticle(options.slug);
  await mkdir(folder, { recursive: true });
  if (options.command === 'carousel') await makeCarousel(folder, options.slug);
  if (options.command === 'video') {
    if (options.offline) throw new Error('The video command cannot use --offline because it captures the live homepage.');
    await makeVideo(folder, options.slug, liveArticle);
  }
  if (options.command === 'image') await copyImage(folder, options.imagePath);
  if (options.command === 'check') await checkPost(folder);
}

try {
  await main();
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
