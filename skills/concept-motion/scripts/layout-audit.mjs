#!/usr/bin/env node
/**
 * Full-resolution layout gate for concept-motion scenes.
 *
 * Mark shared-column surfaces with `data-audit-column`, contained controls with
 * `data-audit-parent="#parent"`, mutually exclusive space with
 * `data-audit-no-overlap="group"`, centred containers with `data-audit-center`,
 * and exact focal words or controls with `data-audit-anchor`.
 *
 *   node layout-audit.mjs scene.html --times 4.9,8.5,12.6 --out dist/layout-audit
 */

import { chromium } from 'playwright';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import http from 'node:http';
import path from 'node:path';

const argv = process.argv.slice(2);
const scene = argv.find((arg) => !arg.startsWith('--'));
const flag = (name, fallback) => {
  const index = argv.indexOf(`--${name}`);
  return index < 0 ? fallback : argv[index + 1];
};
if (!scene) {
  console.error('usage: node layout-audit.mjs <scene.html> [--times 4.9,8.5,12.6] [--out dist/layout-audit]');
  process.exit(1);
}

const scenePath = path.resolve(scene);
if (!existsSync(scenePath)) {
  console.error(`scene not found: ${scenePath}`);
  process.exit(1);
}
const times = String(flag('times', '4.9,8.5,12.6')).split(',').map(Number);
if (!times.length || times.some((time) => !Number.isFinite(time) || time < 0)) {
  console.error('--times must be a comma-separated list of positive seconds');
  process.exit(1);
}
const outDir = path.resolve(flag('out', 'dist/layout-audit'));
await mkdir(outDir, { recursive: true });

const sceneDir = path.dirname(scenePath);
// Keep the scene inside its directory in the URL so sibling imports such as
// `../lib/kit.js` resolve exactly as they do in the export server. Serving the
// scene directory at `/` made those imports point outside the server root.
const root = path.resolve(sceneDir, '..');
const server = http.createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://local').pathname);
    const target = path.resolve(root, `.${pathname}`);
    if (target !== root && !target.startsWith(`${root}${path.sep}`)) {
      response.writeHead(403).end();
      return;
    }
    const body = await readFile(target);
    const type = target.endsWith('.html') ? 'text/html'
      : target.endsWith('.js') || target.endsWith('.mjs') ? 'text/javascript'
      : 'application/octet-stream';
    response.writeHead(200, { 'content-type': type });
    response.end(body);
  } catch {
    if (!response.headersSent) response.writeHead(404);
    response.end('not found');
  }
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const relativeScene = path.relative(root, scenePath).split(path.sep).map(encodeURIComponent).join('/');
const url = `http://127.0.0.1:${server.address().port}/${relativeScene}`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width:1600, height:900 }, deviceScaleFactor:1, reducedMotion:'no-preference' });
const runtimeErrors = [];
page.on('pageerror', (error) => runtimeErrors.push(error.message));
page.on('requestfailed', (request) => runtimeErrors.push(`${request.failure()?.errorText} ${request.url()}`));
await page.goto(url, { waitUntil:'load' });
await page.evaluate(() => document.fonts.ready);

const reports = [];
for (const time of times) {
  await page.evaluate((seconds) => {
    if (typeof window.__seek === 'function') window.__seek(seconds);
    else document.getAnimations().forEach((animation) => {
      animation.pause(); animation.currentTime = seconds * 1000;
    });
  }, time);

  const result = await page.evaluate(() => {
    const tolerance = 1;
    const visible = (element) => {
      const style = getComputedStyle(element);
      return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) > .05;
    };
    const box = (element) => {
      const rect = element.getBoundingClientRect();
      return { left:rect.left, top:rect.top, right:rect.right, bottom:rect.bottom,
               width:rect.width, height:rect.height, cx:rect.left + rect.width / 2,
               cy:rect.top + rect.height / 2 };
    };
    const overlaps = (a, b) => a.left < b.right - tolerance && a.right > b.left + tolerance &&
      a.top < b.bottom - tolerance && a.bottom > b.top + tolerance;
    const failures = [];

    const columns = [...document.querySelectorAll('[data-audit-column]')].filter(visible);
    if (columns.length > 1) {
      const reference = box(columns[0]);
      for (const element of columns.slice(1)) {
        const rect = box(element);
        if (Math.abs(rect.left-reference.left) > tolerance ||
            Math.abs(rect.right-reference.right) > tolerance ||
            Math.abs(rect.cx-reference.cx) > tolerance) {
          failures.push(`${element.id || element.tagName} does not share the reference column`);
        }
      }
    }

    for (const element of [...document.querySelectorAll('[data-audit-parent]')].filter(visible)) {
      const parent = document.querySelector(element.dataset.auditParent);
      if (!parent) { failures.push(`${element.id} has a missing audit parent`); continue; }
      if (!visible(parent)) continue;
      const childRect = box(element); const parentRect = box(parent);
      if (childRect.left < parentRect.left-tolerance || childRect.right > parentRect.right+tolerance ||
          childRect.top < parentRect.top-tolerance || childRect.bottom > parentRect.bottom+tolerance) {
        failures.push(`${element.id} escapes ${element.dataset.auditParent}`);
      }
    }

    const groups = Map.groupBy(
      [...document.querySelectorAll('[data-audit-no-overlap]')].filter(visible),
      (element) => element.dataset.auditNoOverlap,
    );
    for (const [group, elements] of groups) {
      for (let first=0; first<elements.length; first += 1) {
        for (let second=first+1; second<elements.length; second += 1) {
          if (overlaps(box(elements[first]), box(elements[second]))) {
            failures.push(`${elements[first].id} overlaps ${elements[second].id} in ${group}`);
          }
        }
      }
    }

    const stage = document.querySelector('.stage, .cm-stage')?.getBoundingClientRect();
    const anchors = [...document.querySelectorAll('[data-audit-anchor]')].filter(visible);
    if (stage) {
      const stageCenter = stage.left + stage.width / 2;
      for (const element of [...document.querySelectorAll('[data-audit-center]')].filter(visible)) {
        const rect = box(element);
        if (Math.abs(rect.cx-stageCenter) > tolerance) failures.push(`${element.id} is not centred on the stage column`);
      }
      for (const element of anchors) {
        const rect = box(element);
        if (Math.abs(rect.cx-stageCenter) > tolerance) {
          failures.push(`${element.id || element.textContent.trim()} is not the centre-column anchor`);
        }
      }
    }
    return {
      failures,
      columns:columns.map((element) => ({ id:element.id, ...box(element) })),
      anchors:anchors.map((element) => ({ id:element.id, text:element.textContent.trim(), ...box(element) })),
    };
  });

  const filename = `layout-${String(time).replace('.', '_')}s.png`;
  await page.locator('.stage, .cm-stage').first().screenshot({ path:path.join(outDir, filename) });
  reports.push({ time, screenshot:filename, ...result });
}

await browser.close();
server.close();
const report = { scene:scenePath, runtimeErrors, reports };
await writeFile(path.join(outDir, 'report.json'), `${JSON.stringify(report, null, 2)}\n`);
const failures = [...runtimeErrors, ...reports.flatMap((item) => item.failures.map((failure) => `${item.time}s: ${failure}`))];
if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log(`layout audit passed at ${times.join(', ')}s`);
console.log(`screenshots and report -> ${outDir}`);
