#!/usr/bin/env node
/**
 * Frame-exact export for concept-motion scenes.
 *
 *   node export.mjs scene.html --formats mp4,webm,gif --seconds 14 --fps 30
 *
 * First run needs Chromium once:  npx -y playwright@latest install chromium
 *
 * How this stays deterministic: rather than screen-recording in real time, it
 * pauses every animation on the page and seeks each one to an exact timestamp
 * before each screenshot. Nothing depends on wall-clock timing or render speed,
 * so the same scene always produces identical frames — which means you can diff
 * two versions of a scene, and a slow machine yields the same output as a fast
 * one. It also works with Motion's animate() controls, which expose .time.
 */

import { chromium } from 'playwright';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdir, rm, readdir, stat, readFile } from 'node:fs/promises';
import { existsSync, statSync } from 'node:fs';
import http from 'node:http';
import path from 'node:path';

const run = promisify(execFile);

// ── args ────────────────────────────────────────────────────────────────────
const argv = process.argv.slice(2);
const scene = argv.find((a) => !a.startsWith('--'));
if (!scene) {
  console.error('usage: node export.mjs <scene.html> [--formats mp4,webm,gif,frames]\n' +
                '                        [--seconds 14] [--fps 30] [--width 1600]\n' +
                '                        [--height 900] [--scale 2] [--out dist/name]\n' +
                '                        [--root dir] [--serve]\n\n' +
                '  --serve  start the local server and stop, for eyeballing a scene\n' +
                '           in your own browser instead of capturing it');
  process.exit(1);
}
const flag = (name, fallback) => {
  const i = argv.indexOf(`--${name}`);
  return i === -1 ? fallback : argv[i + 1];
};

const scenePath = path.resolve(scene);
if (!existsSync(scenePath)) {
  console.error(`scene not found: ${scenePath}`);
  process.exit(1);
}

/* ── local static server ─────────────────────────────────────────────────────
   Scenes `import '../lib/kit.js'`, and a page loaded over file:// cannot import
   a local ES module — the browser treats its origin as null and blocks it. So
   serve the project over http instead of reaching for a Chromium flag: it works
   the same headless and in a human's browser, and it's ~25 lines.

   Root defaults one level above the scene so sibling directories (lib/, assets/)
   both resolve. Override with --root when a scene lives somewhere unusual.     */
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript',
               '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml',
               '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2' };

const guessRoot = () => {
  const up = path.dirname(path.dirname(scenePath));
  return existsSync(up) && statSync(up).isDirectory() ? up : path.dirname(scenePath);
};
const root = path.resolve(flag('root', guessRoot()));

async function serve() {
  const server = http.createServer(async (req, res) => {
    try {
      const rel = decodeURIComponent(new URL(req.url, 'http://x').pathname);
      const file = path.join(root, rel);
      // never serve outside the root, even if the request walks up with ../
      if (!file.startsWith(root)) { res.writeHead(403).end(); return; }
      const buf = await readFile(file);
      res.writeHead(200, { 'content-type': MIME[path.extname(file)] ?? 'application/octet-stream' });
      res.end(buf);
    } catch { res.writeHead(404).end('not found'); }
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const url = `http://127.0.0.1:${server.address().port}/` +
              path.relative(root, scenePath).split(path.sep).join('/');
  return { server, url };
}

const { server, url } = await serve();

if (argv.includes('--serve')) {
  console.log(`serving ${root}\n  ${url}\n\nCtrl-C to stop.`);
  await new Promise(() => {});          // hold the process open
}

const seconds = Number(flag('seconds', 14));
const fps     = Number(flag('fps', 30));
const width   = Number(flag('width', 1600));
const height  = Number(flag('height', 900));
const scale   = Number(flag('scale', 2));
const formats = String(flag('formats', 'mp4')).split(',').map((f) => f.trim()).filter(Boolean);
const outBase = path.resolve(flag('out', path.join('dist', path.basename(scene, '.html'))));

// H.264 requires even dimensions in yuv420p. Catch it here rather than letting
// ffmpeg fail after several minutes of frame capture.
if (formats.includes('mp4') && ((width * scale) % 2 || (height * scale) % 2)) {
  console.error(`mp4 needs even output dimensions; got ${width * scale}x${height * scale}`);
  process.exit(1);
}

const totalFrames = Math.round(seconds * fps);
const framesDir = `${outBase}-frames`;
await mkdir(path.dirname(outBase), { recursive: true });
await rm(framesDir, { recursive: true, force: true });
await mkdir(framesDir, { recursive: true });

// ── capture ─────────────────────────────────────────────────────────────────
console.log(`capturing ${totalFrames} frames @ ${width * scale}x${height * scale}`);

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width, height },
  deviceScaleFactor: scale,
  // Force motion ON. The scene is expected to define a reduced-motion still
  // for real users; that must never leak into an export.
  reducedMotion: 'no-preference',
});

const failures = [];
page.on('pageerror', (e) => failures.push(String(e.message)));
page.on('requestfailed', (r) => failures.push(`${r.failure()?.errorText} ${r.url()}`));

await page.goto(url, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);

// A scene whose module graph fails to load still renders a blank page and
// captures happily, so surface it here rather than after ffmpeg finishes.
if (failures.length) {
  console.error('\nscene failed to load cleanly:');
  for (const f of failures.slice(0, 5)) console.error(`  ${f}`);
  await browser.close(); server.close();
  process.exit(1);
}

const animCount = await page.evaluate(() => {
  document.getAnimations().forEach((a) => a.pause());
  return document.getAnimations().length;
});
if (animCount === 0) {
  console.warn('warning: no CSS animations found — every frame will be identical.\n' +
               '         If the scene drives motion from JS, expose a seek hook instead.');
}
console.log(`  ${animCount} animation(s) paused for seeking`);

const target = page.locator('.stage').first();
const clip = (await target.count()) ? target : page;

for (let i = 0; i < totalFrames; i++) {
  const ms = (i / fps) * 1000;
  await page.evaluate((t) => {
    document.getAnimations().forEach((a) => { a.currentTime = t; });
    // Motion (motion.dev) controls, if the scene registered any on window.
    (window.__motionControls ?? []).forEach((c) => { c.time = t / 1000; });
  }, ms);
  // Do NOT pass `animations: 'disabled'` here. Playwright implements that by
  // cancelling infinite animations back to their initial state, which silently
  // undoes the seek above and yields a whole video of frame 0. The manual
  // pause + currentTime already guarantees determinism.
  await clip.screenshot({
    path: path.join(framesDir, `f${String(i).padStart(5, '0')}.png`),
  });
  if (i % fps === 0) process.stdout.write(`\r  ${i}/${totalFrames}`);
}
process.stdout.write(`\r  ${totalFrames}/${totalFrames}\n`);
await browser.close();
server.close();

// Cheap guard against the failure mode above and its cousins: if seeking did
// not actually take effect, every PNG is byte-identical. That is invisible in a
// 14-second video and obvious here.
{
  const sizes = new Set();
  for (const f of await readdir(framesDir)) {
    if (f.endsWith('.png')) sizes.add((await stat(path.join(framesDir, f))).size);
  }
  if (sizes.size === 1) {
    console.error('\nERROR: all frames are identical — seeking had no effect.\n' +
      '  If the scene drives motion from JS, register its controls on\n' +
      '  window.__motionControls (see references/motion-track.md).');
    process.exit(1);
  }
  console.log(`  ${sizes.size} distinct frame sizes — motion confirmed`);
}

// ── encode ──────────────────────────────────────────────────────────────────
const input = ['-y', '-framerate', String(fps), '-i', path.join(framesDir, 'f%05d.png')];
const ffmpeg = async (args, label) => {
  process.stdout.write(`encoding ${label}… `);
  try {
    await run('ffmpeg', args, { maxBuffer: 1 << 26 });
    console.log('ok');
  } catch (e) {
    console.log('FAILED');
    console.error(String(e.stderr ?? e).split('\n').slice(-12).join('\n'));
    throw e;
  }
};

for (const fmt of formats) {
  const out = `${outBase}.${fmt}`;

  if (fmt === 'mp4') {
    // crf 18 is visually lossless for flat motion graphics. faststart lets the
    // video begin playing before it fully downloads, which matters for a hero
    // loop above the fold.
    await ffmpeg([...input, '-c:v', 'libx264', '-preset', 'slow', '-crf', '18',
                  '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out], 'mp4');

  } else if (fmt === 'webm') {
    await ffmpeg([...input, '-c:v', 'libvpx-vp9', '-crf', '32', '-b:v', '0',
                  '-row-mt', '1', '-pix_fmt', 'yuv420p', out], 'webm');

  } else if (fmt === 'gif') {
    // Two passes. palettegen builds an optimal 256-colour table for THIS clip,
    // then paletteuse applies it with dithering. The single-pass path uses a
    // generic web palette and is where banded, muddy GIFs come from.
    const pal = path.join(framesDir, 'palette.png');
    const gifFps = Math.min(fps, 25);
    await ffmpeg([...input, '-vf',
      `fps=${gifFps},scale=${width}:-1:flags=lanczos,palettegen=stats_mode=diff`,
      '-y', pal], 'gif palette');
    await ffmpeg([...input, '-i', pal, '-filter_complex',
      `fps=${gifFps},scale=${width}:-1:flags=lanczos[x];[x][1:v]paletteuse=dither=sierra2_4a:diff_mode=rectangle`,
      out], 'gif');

  } else if (fmt === 'frames') {
    console.log(`frames kept at ${framesDir}`);

  } else {
    console.warn(`unknown format "${fmt}" — skipped`);
  }
}

if (!formats.includes('frames')) {
  await rm(framesDir, { recursive: true, force: true });
}

const made = (await readdir(path.dirname(outBase)))
  .filter((f) => f.startsWith(path.basename(outBase)) && !f.endsWith('-frames'));
console.log(`\ndone → ${path.dirname(outBase)}/`);
for (const f of made) console.log(`  ${f}`);

// A visible loop seam is the defect that survives casual review, so make
// checking it the path of least resistance.
console.log('\nCheck the seam: compare the last frame against the first.');
console.log(`  node ${path.basename(process.argv[1])} ${scene} --formats frames --seconds ${seconds} --fps ${fps}`);
