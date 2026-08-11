---
name: concept-motion
description: >-
  Build short looping motion graphics that explain a product concept or an
  interaction — the kind of 10-20s abstract animation that sits at the top of a
  model/product landing page, in a pitch deck, or in a design review. Authors one
  self-contained HTML file with a seekable timeline, then exports it to MP4, WebM,
  GIF, or ships it as live JS/CSS. Use this skill whenever the user wants an
  explainer animation, a concept loop, a "hero" animation for a feature page, an
  animated diagram of a flow or state machine, a motion study of an interaction,
  or says things like "animate this concept", "make a short loop showing how X
  works", "like the video on that product page", "a gif explaining our feature",
  or "show the interaction as motion" — even if they haven't decided on a file
  format yet. Also use it when they hand over a reference video or screenshots
  and ask to reproduce that style.
---

# Concept Motion

Short explainer loops live or die on two things: whether the motion carries one
clear idea, and whether the craft is invisible. The craft half is a solved problem
you shouldn't re-solve each time — seekable timelines, frame-exact export,
loop-safety, the scaffolds here. **The first half is the actual work, and it is
not a code problem.**

So the order matters: figure out what the user is trying to say, choose a
mechanism that *is* that claim, agree a beat sheet, and only then open a scaffold.
Starting from the scaffold produces a scene that looks like the scaffold rather
than one that explains anything.

## Workflow

1. **Lock the reference grammar when a goal clip exists.** Read
   `references/reference-fidelity.md`, run `scripts/reference-board.mjs`, isolate
   one loop, and write the short lock/adapt table before interpreting the new
   subject. When the user says "similar" and supplies a goal, default to content
   adaptation: preserve composition, focal path, cycle contour and material.
   Generic polish never overrides observed reference decisions.

2. **Interview for intent.** What one sentence should the viewer remember? Where
   does it play and who's watching? What must they be able to name afterward? Is
   the subject a UI, an abstract system, hardware, or data?
   Read `references/intent-to-mechanism.md` — it has the questions, and the reason
   each one changes the build.

   Ask rather than guess. A wrong claim means a total rebuild; wrong colors are a
   two-line fix. And if animation is the wrong medium for what they want — a
   quantitative claim, a flow they need to reproduce step by step — say so now
   rather than after building it.

3. **Choose the mechanism from the claim, not from the product.** "Many become
   one" for narrowing, a race for speed, a phase spine for autonomous work. The
   mapping table is in `references/intent-to-mechanism.md`. Animating the
   architecture diagram when the claim was about speed is the most common way
   these fail, and it fails *after* all the work is done.

4. **Audit meaning and continuity before the beat sheet.** Read
   `references/semantic-continuity.md`. Make an object ledger: every visible
   object needs a user-world meaning, a cause for appearing, and a destination or
   exit. Reference chrome is content, not style, when it implies editing,
   selection, loading or review.

5. **Write a causal beat sheet and confirm material direction changes** before
   any markup. Each row must name the trigger, the shared object and the user
   feedback — not merely what fades or moves. Restructuring beats after the
   timeline exists is the most expensive change in this workflow. See "Beat
   sheets" below.

6. **Copy the closest working scene** from `assets/` and swap its shape, labels
   and beats — see "Transferring a feature" below. The shipped scenes run as-is, so you
   always start from something that works. Put anything reusable in `lib/kit.js`
   rather than in the scene.

7. **Verify in a browser, then run both review passes.** Read
   `references/motion-craft.md`; when a goal exists also use the normalized-phase
   comparison in `references/reference-fidelity.md`. Generate a 8–12 frame board
   with `scripts/export.mjs --formats sheet` and compare it beside the goal board.
   A contact sheet verifies sequence, not layout: also inspect opening, midpoint
   and payoff screenshots at full resolution and run `scripts/layout-audit.mjs`
   for shared edges, containment and overlap. Check the loop seam explicitly.

8. **Export only what the destination needs** — `scripts/export.mjs`. If the
   deliverable is the live page, skip export entirely.

9. **Show the user the result**, not a description of it. Send the file, or publish
   the HTML as an artifact for a shareable link.

## Pick the output format from the destination

Ask where it's going before choosing, because the answer changes what you build:

| Destination | Ship | Why |
|---|---|---|
| Web page you control | the HTML/CSS/JS itself | Vector-crisp at any DPI, ~20KB, honors reduced-motion, text stays real text |
| Web page someone else owns | MP4 + WebM in `<video autoplay muted loop playsinline>` | One file to hand off, no integration work |
| Keynote / Google Slides / PowerPoint | MP4 | Universally embeddable |
| Slack, email, wiki, GitHub comment | GIF | Only because those surfaces reject video |
| Design review / async feedback | published artifact link | Reviewers can scrub and comment |

Measured from this pipeline — a 14s loop of the shipped template, so these are
real numbers for *this* style, not general video advice:

| Output | Resolution | Size |
|---|---|---|
| MP4 (H.264, crf 18) | 3200×1800 | 764 KB |
| WebM (VP9, crf 32) | 3200×1800 | 1.0 MB |
| GIF (25fps, 2-pass palette) | 1600×900 | 2.8 MB |
| the HTML itself | any | ~9 KB |

Two things worth knowing, because they contradict the usual advice:

- **GIF is only ~3.7× the MP4 here, not the 20× you'd expect.** Flat graphics use
  maybe eight distinct colors, so GIF's 256-color palette never binds and LZW
  compresses large uniform areas well. GIF stays a bad choice for gradients,
  photos, or blur — but for this style it's defensible when the destination
  demands it.
- **VP9 lost to H.264 on this content.** Flat, low-noise motion is the case where
  H.264 is already efficient, so serving MP4 alone is usually fine and the WebM
  is optional weight.

Still prefer video over GIF where you have the choice: GIF caps out at 25fps with
1-bit transparency, and it can't be anything but a fixed raster size.

### When the destination wants Lottie

This skill does not produce Lottie, and shouldn't pretend to. If the animation has
to ship **inside an iOS/Android app, or be handed to a design team as an editable
motion asset**, Lottie is what they'll ask for — it's vector, tiny, scriptable at
runtime, and native to their tooling in a way an MP4 or a web page isn't.

Hand-authoring Bodymovin JSON is not worth it. Use a dedicated tool —
[diffusionstudio/lottie](https://github.com/diffusionstudio/lottie) is an agent
skill for exactly this (`npx skills add diffusionstudio/lottie`), and it's
strongest on short single-scene motion graphics, which is precisely this shape of
work. Take the beat sheet and the mechanism from here and rebuild the scene there;
the direction transfers even though the code doesn't.

Say this early if the target is a mobile app. Discovering it after building a
14-second HTML scene wastes the whole build.

## Transferring a feature into this style

This is the common case: a feature exists, and it needs an animation. The kit at
`lib/kit.js` splits the three things that used to be fused into one file —

- **the stage** — palette, geometry, seek hook, reduced-motion handling
- **the shape** — *what* is being worked on
- **the beats** — *what happens* to it

— so a transfer is three edits, not a rewrite. Every shape exposes the same
contract, so every beat works against every shape.

When a supplied reference defines a different grammar, keep its locked traits
around this transfer. The claim mechanism chooses what happens inside the hero;
it does not automatically replace one centered hero with two cards, add depth to
a flat material, or compress a ten-second cycle to four seconds.

**1. Pick the shape from the noun.** What does the feature act *on*?

| The feature acts on | Shape |
|---|---|
| code, a document, config, a transcript | `shapes.codeRows` |
| records, a queue, a table, a feed, tasks | `shapes.listRows` |
| results, media, devices, people, options | `shapes.cardGrid` |

If none fit, write one — the contract is six lines, see `references/mechanisms.md`.

**2. Rename the phases to the domain's own words.** `Status / Writing / Reviewing
/ Testing / Building` becomes `Draft / Composing / Checking / Sending / Sent`, or
whatever the team actually says. Use their vocabulary, not generic verbs; the
labels are the only literal text in the whole piece.

**3. Reorder the beats to the mechanism.** Usually you're changing which beats
appear, not writing new ones.

A whole scene is then ~40 lines:

```js
import { createScene, shapes, beats } from '../lib/kit.js';

const scene = createScene({ card: { w: 1290, h: 590 } });
const panel = scene.panel();
const body  = shapes.listRows(scene, { count: 7 });
scene.setLabels(['Queued', 'Processing', 'Verifying', 'Done']);

beats.reset(scene, { panel, body });          // always first — see below
beats.dot(scene, { at: 0, until: 0.7 });
beats.drawFrame(scene, panel, { at: 0.7, duration: 1.2 });
beats.fillPanel(scene, panel, { at: 1.95 });
beats.enter(scene, body, { at: 2.25, per: 0.34, caret: true });
beats.scan(scene, body, { at: 5.15, per: 0.42, count: 4, until: 6.95 });
beats.convertFrom(scene, body, { at: 7.15, group: 4 });
beats.accentChrome(scene, panel, { at: 8.15 });
beats.collapse(scene, { at: 8.6, duration: 1.75 });
beats.labelCues(scene, [['Queued', 1.0], ['Processing', 2.35],
                        ['Verifying', 5.15], ['Done', 8.15]], { end: 9.15 });
scene.run({ cycle: 10.8, still: 5.75 });
```

Two invariants the kit relies on, both of which fail silently if broken:
`beats.reset` must come first (a repeating sequence does not restore state between
iterations), and every beat takes an **absolute** `at` (relative offsets make
retiming one beat cascade through everything after it).

Read `references/mechanisms.md` for the recipe for a specific mechanism, and
`references/motion-track.md` before writing new beats — it documents three Motion
behaviours that fail without any error.

## Scenes import a module, so serve rather than open

Scenes `import '../lib/kit.js'`, and a page opened over `file://` cannot import a
local ES module — the browser treats its origin as null and blocks it, leaving a
blank page with a console error. To look at a scene yourself:

```bash
node scripts/export.mjs assets/scene-phase-spine.html --serve
```

`export.mjs` starts the same server automatically when capturing, so exports need
no extra step. It also fails loudly on page errors and failed requests now,
because a scene whose module graph didn't load still captures happily as a blank
video.

### A module scene is not a standalone HTML deliverable

Be literal about the output contract. A page that imports `../lib/kit.js` or a
CDN is source code for the pipeline, not "one self-contained HTML file." When the
user requests a single HTML file that opens from `file://`:

- prefer a zero-network WAAPI scene such as `assets/scene-race-streaming.html`;
- keep all CSS, markup and JS inline;
- expose `?t=N`, `window.__ready` and a seek function for deterministic review;
- test with the network unavailable and from `file://`;
- do not add a library for a fixed sequence that WAAPI expresses clearly.

Use the kit for reusable source scenes and video export. Use a build/bundle step
only if an interactive feature genuinely earns the dependency, and verify the
bundled result rather than handing over the module source.

## The zero-dependency alternative

`assets/scene-template.html` is a separate, self-contained CSS-clock scaffold: one
file, no imports, no Motion, ~9KB, opens straight from disk. It suits a single
continuous progression where every element's state is a function of one clock.

It doesn't use the kit and doesn't compose — a five-phase narrative forced into
`clamp()` windows is a false economy. Use it when the dependency or the build step
is genuinely the constraint.

## The phase spine

This is **one** mechanism — the right one when the claim is about autonomous work
("it does the job for you"). For narrowing, reach, speed, transformation and the
rest, see the mapping table in `references/intent-to-mechanism.md` and don't force
the claim into this shape.

When it does fit, most such loops land on the same five phases. Start here and
rename to the domain, because it reads as a story rather than a feature list:

| Phase | Label | What the motion does |
|---|---|---|
| 1 | *(none)* | a dot drifts in — the remnant of the last cycle |
| 2 | `Status` | a frame draws itself in two pen strokes from the top-left |
| 3 | `Writing` | panel fills; content types in **grey**, a caret riding the write head |
| 4 | `Reviewing` | a selection box scans down the rows, converting each to accent |
| 5 | `Testing` → `Building` | remaining rows convert; chrome turns accent; the panel collapses to a point |

This is a domain-specific storyboard, not a bag of reusable decoration. A dot,
frame handle or selection box transfers only when the new story also contains a
source token, editable frame or selection action. Otherwise keep the reference's
composition and material while replacing that object with a meaningful trigger,
status or outcome. Run the ledger in `references/semantic-continuity.md` before
copying any of these beats.

Two details carry most of the credibility. Content types in **grey and only later
turns accent** — accent means *verified*, so spending it during authoring throws
away the one signal you have. And the caret riding the growing edge is what makes
a width animation read as *generation* rather than as a progress bar.

## Beat sheets

Write this as a table before you write markup. It's the artifact worth reviewing
with the user, because restructuring beats after the fact is expensive.

```
| Beat | Window | Trigger | Shared object / change | User-visible meaning |
|------|--------|---------|------------------------|----------------------|
| 1 | 0-8% | user starts input | input control opens | "the system heard me" |
| 2 | 8-58% | input continues | the same data becomes partial output | "I can inspect it now" |
| 3 | 58-76% | processing completes | partial output settles, not replaced | "this is final" |
| 4 | 76-96% | session ends | result returns to the same ready control | "I can do this again" |
```

Rules that hold across concepts:

- **One idea per beat.** Two simultaneous changes read as noise; the viewer
  tracks one thing at a time and misses both.
- **Every object earns its place.** If the team cannot answer what an object
  represents, why it appears now and what it becomes next, remove it.
- **Connect cause to feedback.** New surfaces originate from the action or data
  that creates them. Reusing a position is not continuity; reusing the same
  semantic object is.
- **8-20 seconds.** Under 8 and beats get clipped; over 20 and a looping
  background animation becomes an irritant on a page.
- **Loop-safe by construction.** Either end where you began, or end somewhere
  visually empty enough that the reset is invisible (a near-zero scale, a fade
  through the background color). Never cut from a busy frame to a different busy
  frame.
- **Hold before you move.** A beat that starts instantly at t=0 reads as a glitch.
  Give the opening state 3-5% of the loop to be seen.
- **Label the state in words.** One or two words, high contrast, one fixed
  position. The motion shows *that* something is happening; the word says *what*.
  Reference loops nearly always have this, and it's the cheapest clarity win.

## Timeline architecture

Both scaffolds obey one rule, for the same reason: **seeking to time *t* must
always produce the same frame.** Frame-exact export depends on it, the loop seam
can only be verified with it, and without it the first cycle quietly stops
matching later ones.

In a kit scene that means one Motion sequence with absolute `at` offsets plus a
`beats.reset` block at `at: 0` — never independent `animate()` calls racing each
other. In `scene-template.html` it means one CSS clock, described below.

### The CSS clock (scene-template.html only)

That scaffold animates exactly two registered custom properties on the stage —
`--p` (0→1 narrative progress) and `--s` (scale) — and derives everything else
with `calc()`. Don't add parallel CSS animations with their own durations and
delays.

Each element declares its own window against the shared clock:

```css
/* fills between --from and --to of the narrative, clamped outside that window */
.bar > i {
  width: calc(100% * clamp(0, (var(--p) - var(--from)) / (var(--to) - var(--from)), 1));
}
```

```html
<span class="bar" style="--from:.18; --to:.24"><i></i></span>
```

Adding a beat is then editing two numbers, and a partially-filled element falls
out for free — which is what makes a fill read as *generation in progress*
rather than a color snap.

Use `linear()` for anything that should feel physical. `cubic-bezier()` cannot
express overshoot or settle; `linear()` approximates arbitrary curves with enough
stops, and is Baseline since Dec 2023. `references/house-style.md` has ready-made
curves.

**Scale interpolates geometrically, not linearly.** Going 1.0 → 0.02 on a linear
ramp looks like it decelerates hard and then crawls, because the eye reads scale
as ratio. Interpolate the *logarithm* — the template's `--s` keyframes are spaced
so each equal slice of time is an equal multiplication. This one detail is most of
the difference between "smooth" and "cheap."

## Don't reach for non-scaling chrome by reflex

It's tempting to assume selection frames and handles must keep their pixel size
throughout, and to build counter-scaling machinery for it: size the panel with
`calc()` on width/height, scale only an inner content wrapper, keep borders in
untransformed space. That machinery is real, but it is usually solving a problem
the scene doesn't have.

In practice the panel is **full size for the entire narrative** and only scales
during a closing collapse — where it shrinks to a few percent and chrome fidelity
is far below what anyone can see. A plain `transform: scale()` on one wrapper is
then correct, simpler, and cheaper (no per-frame layout).

Build the counter-scaling version only when chrome must stay crisp at a scale a
viewer can actually study — a slow zoom that *holds* at 40%, or a scene that
scales while the viewer reads the panel. Deciding this early matters because it
dictates the DOM structure.

The trap worth naming: **three still frames at different sizes look exactly like
one continuous zoom.** Order frames by their scale and you'll invent a zoom that
isn't there. Only motion — a video, or a straddling element caught mid-transition
— tells you whether size is changing continuously or the panel is simply static
at different moments in different cycles.

## Accessibility

A looping animation on a page must respect `prefers-reduced-motion`. Land on a
representative still — usually the most information-rich beat — rather than
freezing at t=0, which is often the emptiest frame:

```css
@media (prefers-reduced-motion: reduce) {
  .stage { animation: none; --p: 0.62; --s: 0.72; }
}
```

Export runs with reduced-motion off explicitly, so this never affects captures.

## Exporting

```bash
node scripts/export.mjs scene.html --formats mp4,webm --seconds 14 --fps 30
```

First run only, from inside `scripts/` — the browser must match the installed
Playwright version, so don't substitute a globally cached Chromium:

```bash
npm install && npx playwright install chromium
```

| Flag | Default | Notes |
|---|---|---|
| `--formats` | `mp4` | any of `mp4,webm,gif,frames,sheet`; run `sheet` alone |
| `--seconds` | `14` | must equal the CSS `--loop` or the seam won't match |
| `--fps` | `30` | 30 is plenty for this style; 60 doubles size for little gain |
| `--width` / `--height` | `1600` / `900` | keep both even for H.264 |
| `--scale` | `2` | capture at 2x for retina, then downscale for video |
| `--out` | `dist/<scene>` | extension appended per format |
| `--samples` | `12` | sampled frames in `sheet` review mode |
| `--columns` | `4` | contact-sheet grid columns |

The script pauses all animations and seeks each frame individually, so output is
deterministic — rerunning gives byte-comparable frames, and you can diff two
versions of a scene. GIF export runs ffmpeg's two-pass `palettegen`/`paletteuse`,
which is worth it: the naive single-pass path is where most ugly GIFs come from.

## Reference

- `references/reference-fidelity.md` — match modes, the seven-axis evidence
  matrix, fidelity contracts, style-vs-meaning separation, normalized-phase
  comparison and the reference review gate. **Read first whenever a goal video,
  GIF or screenshots are supplied.**
- `references/intent-to-mechanism.md` — the interview questions, how to extract the
  claim, the claim→mechanism mapping table, representation registers, and when to
  tell the user animation is the wrong medium. Read it first when no reference is
  supplied, or immediately after the fidelity contract when one is.
- `references/semantic-continuity.md` — the semantic object ledger, causal beat
  sheet, connected-geometry map and transfer gate for reference artifacts. Read
  it before markup whenever a scene contains UI, labels, loaders, connectors,
  selection chrome or a supplied reference.
- `references/polish.md` — geometry tokens (radii, depth), the expressive easing
  set, two-layer entrances, the four-movement choreography model, and how to avoid
  displaying a dishonest metric. **Read it before finalising any scene** — it
  covers the three failures that make a first draft look like a prototype:
  unresolved geometry, everything `linear`, and no dramatic structure.
- `references/motion-craft.md` — easing decision table, physicality rules, stagger
  ranges, performance, reduced motion, the standard **vocabulary** for what this
  skill builds, the **review pass**, and how to debug feel. Also states plainly
  which widely-quoted UI rules (the 300ms budget, frequency tiers, springs) must
  *not* be imported here. Read it before finalising any scene.
- `references/house-style.md` — palette, easing curves, the abstract-skeleton
  visual vocabulary, and how to derive a house style from a reference video.
  Read it when starting a new scene or matching someone else's look.
- `references/mechanisms.md` — what the kit provides, and a build recipe per
  mechanism (conveyor, race, emission, graph knit, feedback loop, exploded stack…),
  plus how to add a shape or a beat. Read it after choosing the mechanism.
- `references/motion-track.md` — when Motion beats hand-written CSS, how to keep a
  scene exportable, and three silent failure modes. Read it before writing new
  beats, not just interactive scenes.
- `lib/kit.js` — the stage, the shapes, the beats. Everything reusable lives here;
  scenes should be thin.
- `assets/scene-phase-spine.html` — working scene: autonomous work through named
  states. The reference reproduction.
- `assets/scene-field-collapse.html` — working scene: many candidates narrow to a
  few. Search, ranking, matching, filtering.
- `assets/scene-race-streaming.html` — standalone WAAPI scene: one audio input
  feeding delayed and live transcription, including an interim correction before
  stop. Opens from `file://`, supports `?t=N`, and demonstrates semantic object
  continuity without reference-derived editor chrome.
- `assets/scene-template.html` — standalone CSS-clock scaffold, no kit, no deps.
- `scripts/reference-board.mjs` — probe a goal video and create a timestamped-
  by-manifest contact sheet for one selected cycle.
- `scripts/export.mjs` — serve, capture, encode. Seeks CSS animations and Motion
  controls, creates sampled review sheets, and fails loudly on page errors or if
  every captured frame is byte-identical.
- `scripts/layout-audit.mjs` — capture full-resolution keyframes and fail on
  broken shared columns, escaped controls, declared collisions or off-centre content.

Copy a scene rather than editing one in place, so the next transfer still starts
from something known to run. Extend `lib/kit.js` when a shape or beat would serve
more than one scene — that's what keeps the next transfer cheap.
