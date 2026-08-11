# The Motion track

[Motion](https://motion.dev) (formerly Framer Motion) is the right tool for a
specific subset of concept animations. It is the wrong tool for the rest, and
choosing it by default costs you a build step, a dependency, and the simplicity
that makes the CSS clock easy to hand to someone else.

## Contents

- [Choosing a track](#choosing-a-track)
- [Packages and sizes](#packages-and-sizes)
- [Keeping Motion scenes exportable](#keeping-motion-scenes-exportable)
- [Sequences](#sequences)
- [React patterns worth using](#react-patterns-worth-using)
- [Reduced motion](#reduced-motion)
- [Publishing a Motion scene as an artifact](#publishing-a-motion-scene-as-an-artifact)

## Choosing a track

Reach for **Motion** when the animation involves any of these. Each is either
impossible or genuinely painful in hand-written CSS:

- **The viewer drives it.** Drag, hover, press, scrub. Explaining an *interaction*
  is often better done by letting someone perform it, and this is where a page
  beats a video outright.
- **Interruption mid-flight.** If a user can hover away halfway through, Motion's
  springs redirect while preserving velocity. A CSS transition restarts from
  wherever it was with the wrong velocity, which reads as a stutter.
- **Layout / FLIP animations.** The `layout` prop animates an element between two
  positions computed by the browser — reordering a list, a card expanding into a
  detail view. Hand-rolling FLIP is a genuine time sink.
- **Enter/exit of elements that unmount.** `AnimatePresence` exists because CSS
  cannot animate an element that has already left the DOM.
- **Sequences past roughly a dozen steps**, where `clamp()` windows stop being
  readable and a declarative timeline is easier to reason about.

Stay on the **CSS clock** (`assets/scene-template.html`) when:

- The loop is non-interactive and destined for MP4/WebM/GIF anyway.
- It ships on a marketing page where ~8KB versus ~20KB+React matters.
- You want to hand a single self-contained HTML file to someone with no build.
- You are publishing it as an artifact (see the CSP note below).

A useful tiebreaker: if the deliverable is a *video file*, the interactivity
Motion buys you is discarded at export, so it earns nothing. If the deliverable
is a *page*, it may be the whole point.

## Packages and sizes

| Import | Size | What you get |
|---|---|---|
| `motion/mini` | 2.3kb | `animate()` on HTML/SVG styles, keyframes, springs — native WAAPI |
| `motion` | 18kb | plus independent transforms, CSS variables, SVG paths, sequences, colors |
| `motion/react` | — | `<motion.div>`, variants, `useAnimate`, `AnimatePresence`, `layout` |

```bash
npm install motion
```

`motion/mini` is worth knowing about: because it drives native Web Animations,
`document.getAnimations()` finds its animations and `export.mjs` can seek them
with no extra wiring. If your scene fits inside mini, export works for free.

## Keeping Motion scenes exportable

Frame-exact export depends on being able to seek. Motion supports this — the
`AnimationPlaybackControls` returned by `animate()` has a `.time` getter/setter
in **seconds** — but JS-driven animations are invisible to
`document.getAnimations()`, so you have to hand them over deliberately.

`export.mjs` looks for `window.__motionControls`. Register every long-lived
control there:

```js
import { animate } from 'motion';

window.__motionControls = [];

const loop = animate(
  '.card',
  { scale: [1, 0.62, 0.015] },
  { duration: 14, repeat: Infinity, ease: 'easeInOut' }
);

window.__motionControls.push(loop);   // now export.mjs can seek it
```

Two things to get right, because both fail silently rather than loudly:

- **`.time` is in seconds, not milliseconds.** `export.mjs` already divides by
  1000 for these controls while using milliseconds for WAAPI. Mixing the units up
  yields a video where nothing appears to move.
- **Register before export reads the array.** Build the timeline at module scope
  or on `DOMContentLoaded`. If controls are created inside an interaction handler,
  they will not exist during capture and those elements will render frozen.

Verify with `--formats frames` and look at the actual PNGs before encoding. An
unseekable animation produces 420 identical frames, which is obvious in the
frames directory and easy to miss in a 14-second video.

## Three failure modes that cost real time

All three fail *silently* — no console error, no thrown exception, just an element
that never moves. Verified against Motion 13.1.0.

### `pathLength` and `strokeDashoffset` do nothing in vanilla `animate()`

Motion's SVG path-drawing values (`pathLength`, `pathOffset`, `pathSpacing`) are
wired into its **React** SVG renderer. Call `animate(pathEl, { pathLength: [0,1] })`
from vanilla JS and Motion writes no inline style at all. `strokeDashoffset`
likewise doesn't animate — Motion treats it as a plain length and skips it.

Rather than fight this, draw a frame from four 1px divs and animate `scaleX`
/`scaleY` with `transform-origin` set per edge. It's compositor-friendly, and
giving each edge its own start time is what produces the "two pens tracing from
one corner" effect a single dash animation can't:

```js
const half = drawDuration / 2;
seq.push([topEdge,    { scaleX: [0,1] }, { at: t,        duration: half }]);
seq.push([leftEdge,   { scaleY: [0,1] }, { at: t,        duration: half }]);
seq.push([rightEdge,  { scaleY: [0,1] }, { at: t + half, duration: half }]);
seq.push([bottomEdge, { scaleX: [0,1] }, { at: t + half, duration: half }]);
```

If you do need true path drawing, use React with `<motion.path>`, or drive
`stroke-dashoffset` through plain WAAPI — but then register that animation
separately so export can still seek it.

### A repeating sequence does not reset state between iterations

Each element holds its last animated value until its own step runs again. So a
scene that ends with everything grown and accent-coloured *opens* iteration two
that way — content sitting on the background before the panel has even faded in.

Fix it with zero-duration steps at `at: 0` that restore every animated property:

```js
const RESET = { at: 0, duration: 0 };
seq.push([bars,  { scaleX: 0 },              RESET]);
seq.push([panel, { opacity: 0 },             RESET]);
seq.push([unit,  { scale: 1, opacity: 1 },   RESET]);
seq.push([chrome,{ backgroundColor: '#fff' },RESET]);
```

Beyond fixing the loop, this makes the cycle idempotent — seeking to time *t*
gives the same frame in every iteration, which is what export depends on.

### Labels sharing a position must sequence, not crossfade

Overlapping fades on two words in the same spot render both at once for a fifth
of a second — "Reviewing" over "Testing" reads as `ReTesting`. Derive each
fade-out from the *next* cue's start so the outgoing word is always gone first,
and retiming a beat can't quietly reintroduce the overlap:

```js
const FADE = .2;
CUES.forEach(([name, at], i) => {
  const next = CUES[i + 1];
  seq.push([label(name), { opacity: 1 }, { at, duration: FADE }]);
  seq.push([label(name), { opacity: 0 },
            { at: next ? next[1] - FADE - .02 : endTime, duration: FADE }]);
});
```

To check a scene for this, sweep the cycle and assert combined label opacity
never exceeds 1.

## Note on seeking and rendering

Motion applies values on its own rAF pass, so reading `getComputedStyle`
immediately after setting `.time` returns the *previous* frame. When verifying a
scene programmatically, await a frame between the seek and the read — otherwise
you will conclude a working animation is broken:

```js
const step = () => new Promise(r => requestAnimationFrame(r));
controls.time = 3.6; await step();
// ...now read computed styles
```

Also keep such sweeps coarse. Two awaited frames per sample at 20ms steps over a
10s cycle is ~1000 frames and will hang the tab.

## Sequences

For multi-element choreography, a sequence is the readable equivalent of the
CSS clock's `--from`/`--to` windows:

```js
const seq = animate([
  ['.row-1 i', { width: '100%' }, { duration: 0.6 }],
  ['.row-2 i', { width: '100%' }, { duration: 0.6, at: '-0.3' }],  // overlap
  ['.label',   { opacity: [0, 1] }, { duration: 0.25, at: '<' }],  // with prev
]);
```

`at` is what makes this worth using: `'-0.3'` starts 300ms before the previous
step ends, `'<'` starts alongside it, and a number is an absolute offset. Getting
overlap right is most of what makes a sequence feel composed rather than queued.

Note the beat-sheet rules from `SKILL.md` still apply. A sequence makes it *easy*
to have eight things moving at once, which is exactly the failure mode to avoid.

## React patterns worth using

```jsx
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';

// variants keep state names in one place and propagate to children
const card = {
  idle:    { scale: 1,    borderColor: '#ffffff' },
  working: { scale: 0.85, borderColor: '#2c6fdf' },
};

<motion.div
  variants={card}
  animate={busy ? 'working' : 'idle'}
  transition={{ type: 'spring', stiffness: 120, damping: 18 }}
/>
```

- **Variants over imperative calls.** Naming states (`idle`, `working`) keeps the
  animation legible against the beat sheet, and `when` / `delayChildren` give you
  staggered children without per-element bookkeeping.
- **`layout` for anything positional.** If an element moves because surrounding
  layout changed, add `layout` and delete your manual position animation.
- **Springs for physical things, easing for opacity and color.** Motion defaults
  this way already. A spring on opacity can overshoot outside 0–1 and flicker.

## Reduced motion

```jsx
const reduce = useReducedMotion();
<motion.div animate={reduce ? { opacity: 1 } : { scale: [1, 0.62], opacity: 1 }} />
```

Land on a representative still, not the empty first frame — same rule as the CSS
track. `export.mjs` launches with `reducedMotion: 'no-preference'`, so this never
affects captures.

## Publishing a Motion scene as an artifact

Artifacts run under a strict CSP that blocks every external host, so a CDN
`import` from `esm.sh` or `jsdelivr` fails at runtime with an opaque error. To
publish a Motion scene you must inline the library into the page — bundle it, or
paste the minified source into a `<script type="module">`.

At that point weigh it honestly: `motion/mini` inlines at ~2.3kb and is fine,
while the full hybrid build plus React is a large paste for a page whose whole
job is to loop silently. If the scene is non-interactive, the CSS clock is
usually the better answer for artifact delivery — no bundling step, and it stays
readable to whoever opens the file next.
