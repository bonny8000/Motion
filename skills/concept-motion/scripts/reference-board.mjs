#!/usr/bin/env node

/**
 * Probe a reference video and build an evenly sampled contact sheet.
 *
 *   node reference-board.mjs goal.mov --start 0 --seconds 10 \
 *     --samples 15 --width 640 --columns 5 --out work/goal-reference
 *
 * Requires ffprobe and ffmpeg on PATH. The JSON manifest records exact sample
 * times because some ffmpeg builds omit drawtext and should not be required just
 * to label a review board.
 */

import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdir, readdir, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const run = promisify(execFile);
const argv = process.argv.slice(2);
const input = argv.find((arg) => !arg.startsWith('--'));

if (!input) {
  console.error(
    'usage: node reference-board.mjs <video> [--start 0] [--seconds N]\n' +
    '       [--samples 12] [--width 640] [--columns 4] [--out work/reference]'
  );
  process.exit(1);
}

const flag = (name, fallback) => {
  const index = argv.indexOf(`--${name}`);
  return index === -1 ? fallback : argv[index + 1];
};
const numberFlag = (name, fallback) => {
  const value = Number(flag(name, fallback));
  if (!Number.isFinite(value)) throw new Error(`--${name} must be a number`);
  return value;
};

const inputPath = path.resolve(input);
if (!existsSync(inputPath)) {
  console.error(`video not found: ${inputPath}`);
  process.exit(1);
}

const start = numberFlag('start', 0);
const samples = Math.round(numberFlag('samples', 12));
const width = Math.round(numberFlag('width', 640));
const columns = Math.round(numberFlag('columns', 4));

if (start < 0 || samples < 3 || samples > 40 || width < 160 || columns < 1) {
  console.error('--start must be >= 0; --samples 3-40; --width >= 160; --columns >= 1');
  process.exit(1);
}

let probe;
try {
  const { stdout } = await run('ffprobe', [
    '-v', 'error', '-show_entries',
    'format=duration,size:stream=index,codec_type,codec_name,width,height,r_frame_rate,avg_frame_rate',
    '-of', 'json', inputPath,
  ]);
  probe = JSON.parse(stdout);
} catch (error) {
  console.error('ffprobe failed. Confirm ffprobe is installed and the video is readable.');
  console.error(String(error.stderr ?? error.message ?? error));
  process.exit(1);
}

const duration = Number(probe.format?.duration);
if (!Number.isFinite(duration) || start >= duration) {
  console.error(`--start ${start} is outside the ${duration || 'unknown'}s video`);
  process.exit(1);
}

const requestedWindow = numberFlag('seconds', Math.min(12, duration - start));
const seconds = Math.min(requestedWindow, duration - start);
if (seconds <= 0) {
  console.error('--seconds must select a positive window inside the video');
  process.exit(1);
}

const defaultOut = path.join('work', `${path.basename(inputPath, path.extname(inputPath))}-reference`);
const outDir = path.resolve(flag('out', defaultOut));
await mkdir(outDir, { recursive: true });

for (const file of await readdir(outDir)) {
  if (/^frame-\d+\.png$/.test(file)) await rm(path.join(outDir, file));
}

// Sample through 99% rather than the exact end. At the exact cycle boundary an
// infinite animation has already reset, hiding the seam pose we need to inspect.
const times = Array.from({ length: samples }, (_, index) =>
  start + seconds * 0.99 * index / (samples - 1)
);

console.log(`probing ${path.basename(inputPath)}`);
console.log(`sampling ${samples} frames from ${start.toFixed(3)}s to ${times.at(-1).toFixed(3)}s`);

for (let index = 0; index < times.length; index++) {
  const file = `frame-${String(index).padStart(3, '0')}.png`;
  try {
    await run('ffmpeg', [
      '-hide_banner', '-loglevel', 'error', '-y',
      '-ss', times[index].toFixed(6), '-i', inputPath,
      '-frames:v', '1', '-vf', `scale=${width}:-2`,
      path.join(outDir, file),
    ]);
  } catch (error) {
    console.error(`ffmpeg failed while extracting ${times[index].toFixed(3)}s`);
    console.error(String(error.stderr ?? error.message ?? error));
    process.exit(1);
  }
  process.stdout.write(`\r  ${index + 1}/${times.length}`);
}
process.stdout.write('\n');

const rows = Math.ceil(samples / columns);
const board = path.join(outDir, 'contact-sheet.png');
await run('ffmpeg', [
  '-hide_banner', '-loglevel', 'error', '-y',
  '-pattern_type', 'glob', '-i', path.join(outDir, 'frame-*.png'),
  '-vf', `tile=${columns}x${rows}:padding=8:margin=8:color=white`,
  '-frames:v', '1', board,
]);

const videoStream = probe.streams?.find((stream) => stream.codec_type === 'video') ?? {};
const manifest = {
  input: inputPath,
  source: {
    duration,
    size: Number(probe.format?.size),
    codec: videoStream.codec_name,
    width: videoStream.width,
    height: videoStream.height,
    frameRate: videoStream.avg_frame_rate || videoStream.r_frame_rate,
  },
  window: { start, seconds, end: start + seconds },
  board: { file: path.basename(board), columns, rows, sampleWidth: width },
  frames: times.map((time, index) => ({
    index,
    time: Number(time.toFixed(6)),
    file: `frame-${String(index).padStart(3, '0')}.png`,
  })),
  note: 'Frames sample 0-99% of the selected window; isolate one loop before comparing an output.',
};
await writeFile(path.join(outDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);

console.log(`done -> ${board}`);
console.log(`        ${path.join(outDir, 'manifest.json')}`);
