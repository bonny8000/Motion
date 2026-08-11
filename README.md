# Motion

An agent skill for building **short looping motion graphics that explain a product
concept** — the kind of 10–20 second abstract animation that sits at the top of a
product or model landing page, in a pitch deck, or in a design review.

The animation is authored as a seekable HTML scene, then either shipped as a
verified standalone page or exported frame-exact to MP4 / WebM / GIF.

## Why it's built this way

The craft half of a concept loop — a seekable timeline, loop-safety, frame-exact
export, correct easing — is a solved problem that shouldn't be re-solved each
time. The hard half is deciding **what should move**, and that isn't a code
problem. So the skill is intent-first and reference-aware: isolate the goal
clip's visual grammar, work out the claim, combine them in a fidelity contract,
agree a beat sheet, and only then open a scaffold.

## Install

```bash
git clone https://github.com/bonny8000/Motion.git
cp -r Motion/skills/concept-motion ~/.claude/skills/
```

Then, from the skill directory, once:

```bash
cd ~/.claude/skills/concept-motion/scripts && npm install && npx playwright install chromium
```

Requires Node 18+ and `ffmpeg`/`ffprobe` on PATH for reference boards and export. Kit scenes load
[Motion](https://motion.dev) from a CDN at runtime.

## Quick start

Scenes `import '../lib/kit.js'`, and a page opened over `file://` cannot import a
local ES module — the browser blocks it and you get a blank page. Serve instead:

```bash
node scripts/export.mjs assets/scene-phase-spine.html --serve
```

Export (starts the same server automatically):

```bash
node scripts/export.mjs assets/scene-phase-spine.html --formats mp4,webm,gif --seconds 10.8
```

When a goal video is supplied, build two normalized review boards before tuning
micro-motion:

```bash
node scripts/reference-board.mjs goal.mov --seconds 10 --samples 12 --out work/goal
node scripts/export.mjs assets/scene-race-streaming.html --formats sheet \
  --seconds 18.4 --samples 16 --out work/output
node scripts/layout-audit.mjs assets/scene-race-streaming.html \
  --times 4.9,8.5,12.6 --out work/layout-audit
```

## What's in it

```
skills/concept-motion/
├── SKILL.md                          the workflow and the transfer recipe
├── lib/kit.js                        stage + shapes + beats — everything reusable
├── assets/
│   ├── scene-phase-spine.html        working scene: work advancing through states
│   ├── scene-field-collapse.html     working scene: many candidates narrow to a few
│   ├── scene-race-streaming.html     working scene: A/B comparison, zero-dependency WAAPI
│   └── scene-template.html           standalone CSS-clock scaffold, zero deps
├── references/
│   ├── reference-fidelity.md         goal clip → evidence → fidelity contract
│   ├── intent-to-mechanism.md        interview → claim → mechanism
│   ├── mechanisms.md                 build recipe per mechanism
│   ├── polish.md                     material profiles, expressive easing, choreography
│   ├── motion-craft.md               easing, physicality, vocabulary, review pass
│   ├── house-style.md                palette, curves, visual vocabulary
│   └── motion-track.md               Motion API guidance + silent failure modes
└── scripts/
    ├── reference-board.mjs            probe and sample goal footage
    ├── layout-audit.mjs               full-resolution alignment/collision gate
    └── export.mjs                     serve, capture, review sheet, encode
```

### The kit

Three things kept separate, which is what makes a transfer cheap:

- **stage** — palette, geometry, seek hook, reduced-motion handling
- **shape** — *what* is being worked on (`codeRows`, `listRows`, `cardGrid`)
- **beats** — *what happens* to it (`drawFrame`, `enter`, `scan`, `collapse`, …)

Every shape exposes the same contract, so every beat works against every shape.
A whole scene is ~40 lines:

```js
import { createScene, shapes, beats } from '../lib/kit.js';

const scene = createScene({ card: { w: 1290, h: 590 } });
const panel = scene.panel();
const body  = shapes.listRows(scene, { count: 7 });
scene.setLabels(['Queued', 'Processing', 'Verifying', 'Done']);

beats.reset(scene, { panel, body });          // must come first
beats.drawFrame(scene, panel, { at: 0.7, duration: 1.2 });
beats.fillPanel(scene, panel, { at: 1.95 });
beats.enter(scene, body, { at: 2.25, per: 0.34, caret: true });
beats.scan(scene, body, { at: 5.15, per: 0.42, count: 4, until: 6.95 });
beats.collapse(scene, { at: 8.6, duration: 1.75 });
scene.run({ cycle: 10.8 });
```

Two invariants, both of which fail silently if broken: `beats.reset` comes first
(a repeating sequence does not restore state between iterations), and every beat
takes an **absolute** `at` (relative offsets make retiming one beat cascade).

### Transferring a feature

1. **Reference grammar from evidence** — lock hero count, focal path, timing
   contour and material before changing the content.
2. **Shape from the noun** — what does the feature act on?
3. **Labels from the domain's own words** — these are the only literal text in the
   piece, so use what the team actually says.
4. **Beats from the mechanism** — usually reordering, not writing new ones. The
   mechanism happens inside the locked grammar; it does not silently replace it.

The kit defaults to the flat `reference` material. Use
`createScene({ material: 'soft' })` only when the brief actually calls for the
rounded, elevated product-UI profile.

## Output formats

Measured on a 14s loop of the shipped template:

| Output | Resolution | Size |
|---|---|---|
| MP4 (H.264, crf 18) | 3200×1800 | 764 KB |
| WebM (VP9, crf 32) | 3200×1800 | 1.0 MB |
| GIF (25fps, 2-pass palette) | 1600×900 | 2.8 MB |
| the HTML itself | any | ~9 KB |

Two results that contradict the usual advice: GIF is only ~3.7× the MP4 here (flat
graphics use few colours, so the 256-colour palette never binds), and VP9 *lost*
to H.264 on this content — serving MP4 alone is usually fine.

This skill does not produce Lottie. If the animation has to ship inside a mobile
app or go to designers as an editable asset, use
[diffusionstudio/lottie](https://github.com/diffusionstudio/lottie) and carry the
beat sheet over.

## A note on dependencies

`scene-race-streaming.html` uses the browser's native Web Animations API and has
**zero dependencies** — it runs offline, straight from disk. That was a fix, not a
preference: an earlier version imported Motion from a CDN, which is silently
blocked by strict-CSP preview surfaces and by corporate networks. The page still
rendered, nothing animated, and no error was visible anywhere.

It also demonstrates reference adaptation: the speed comparison stays inside one
centered hero with the goal clip's frame draw, flat material and closing collapse.
The microphone is the shared element from ready state to active recorder and back.
One captured utterance is compared in two vertically aligned timing states: the
live result exposes interim text and a correction before stop, while the delayed
result stays unavailable until recording completes. The capture bar and both cards
share one centre column, and a compact semantic key replaces crossing route lines.
There are no editor handles, decorative activity dots or selection outlines.
Rounded geometry is concentric across the recorder and result cards. The earlier
version copied those editor metaphors from the reference even though they had no
meaning in the audio-input story; `references/semantic-continuity.md` now prevents that
class of transfer error.

If a scene must survive an unknown network, prefer WAAPI. Each element gets one
animation covering the full cycle, so the loop resets itself and no reset block is
needed.

## Credits

Craft rules, easing curves, the motion vocabulary and the review discipline are
adapted from [Emil Kowalski's skills](https://github.com/emilkowalski/skills)
(MIT). His material targets interactive UI; `references/motion-craft.md` documents
which of those rules deliberately do **not** apply to non-interactive explanatory
motion.

`references/polish.md` adapts the choreography model and motion defaults from
[Meng To's animation-systems](https://github.com/MengTo/Skills), and the ease
vocabulary from [GreenSock's official GSAP skills](https://github.com/greensock/gsap-skills)
(MIT) — used as `cubic-bezier` equivalents, so no library dependency is added.

Full notices in [NOTICE.md](NOTICE.md).

## License

Not yet chosen — add one before relying on this in other projects. The
third-party obligations in [NOTICE.md](NOTICE.md) apply regardless.
