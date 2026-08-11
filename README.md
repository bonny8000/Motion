# Motion

An agent skill for building **short looping motion graphics that explain a product
concept** — the kind of 10–20 second abstract animation that sits at the top of a
product or model landing page, in a pitch deck, or in a design review.

The animation is authored as one HTML scene with a seekable timeline, then either
shipped as a live page or exported frame-exact to MP4 / WebM / GIF.

## Why it's built this way

The craft half of a concept loop — a seekable timeline, loop-safety, frame-exact
export, correct easing — is a solved problem that shouldn't be re-solved each
time. The hard half is deciding **what should move**, and that isn't a code
problem. So the skill is intent-first: work out the claim, choose a mechanism that
*is* that claim, agree a beat sheet, and only then open a scaffold.

## Install

```bash
git clone https://github.com/bonny8000/Motion.git
cp -r Motion/skills/concept-motion ~/.claude/skills/
```

Then, from the skill directory, once:

```bash
cd ~/.claude/skills/concept-motion/scripts && npm install && npx playwright install chromium
```

Requires Node 18+ and `ffmpeg` on PATH (only for export). Scenes load
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
│   ├── intent-to-mechanism.md        interview → claim → mechanism. Read first.
│   ├── mechanisms.md                 build recipe per mechanism
│   ├── polish.md                     radii, depth, expressive easing, choreography
│   ├── motion-craft.md               easing, physicality, vocabulary, review pass
│   ├── house-style.md                palette, curves, visual vocabulary
│   └── motion-track.md               Motion API guidance + silent failure modes
└── scripts/export.mjs                serve, capture, encode
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

1. **Shape from the noun** — what does the feature act on?
2. **Labels from the domain's own words** — these are the only literal text in the
   piece, so use what the team actually says.
3. **Beats from the mechanism** — usually reordering, not writing new ones.

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
