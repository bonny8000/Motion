# Motion craft

Craft rules for explanatory motion, plus a review pass. Most published animation
guidance is written for **interactive UI**, where the governing constraint is
responsiveness. Explanatory loops are a different problem: nobody is waiting on
them, and they play unattended and repeatedly. So this file separates what
transfers from what doesn't.

Sources are credited at the bottom.

## Contents

- [What does NOT transfer from UI guidance](#what-does-not-transfer-from-ui-guidance)
- [Easing](#easing)
- [Physicality](#physicality)
- [Stagger](#stagger)
- [Performance](#performance)
- [Reduced motion](#reduced-motion)
- [Masking an imperfect crossfade](#masking-an-imperfect-crossfade)
- [Say it in the right words](#say-it-in-the-right-words)
- [Review pass](#review-pass)
- [Debugging feel](#debugging-feel)
- [Credits](#credits)

## What does NOT transfer from UI guidance

Do not import these into an explanatory loop, even though they are correct for
interactive UI and you will find them stated as universal:

- **"Keep animations under 300ms."** That budget exists because a user is waiting
  for the interface to respond. Nobody is waiting on a hero loop. The same
  guidance carves out "marketing / explanatory: can be longer" — 8–20s is the
  right range here, and a 300ms beat would be unreadable.
- **The frequency tiers** ("100+ times/day → never animate"). These gate *whether*
  an interaction animates. An explanatory loop's entire purpose is motion.
- **Springs, interruptibility, velocity handoff, momentum, rubber-banding.** All
  of it exists so motion can be grabbed and redirected mid-flight. A pre-scripted
  timeline nobody touches is the case where fixed durations are *correct*, not a
  compromise. Springs also can't be frame-seeked, which breaks export.
- **Press feedback, hover gating, `@starting-style`.** No interaction to feed back.

Two things from the frequency principle *do* transfer, in adapted form:

- **A loop the same person sees repeatedly should be calm.** Someone visiting a
  product page weekly sees your hero every time. Frequency argues for less
  motion, not more — which is the real reason for the ≤20s rule, the tail hold,
  and the ban on anything strobing.
- **Never loop motion beside text people must read.** Peripheral movement next to
  body copy is a comprehension cost, not decoration. Give the loop its own band
  of the page, or make it play once.

## Easing

Built-in CSS keywords are too weak to read as deliberate. Use strong curves and
pick by **what the element is doing**:

| Situation | Curve |
|---|---|
| Entering or exiting | `EASE_OUT` — `cubic-bezier(.23, 1, .32, 1)` |
| Already on screen, moving A→B | `EASE_IN_OUT` — `cubic-bezier(.77, 0, .175, 1)` |
| Default / general move | `EASE` — `cubic-bezier(.32, .72, 0, 1)` |
| Constant mechanical progress | `linear` |
| Accelerating away and off screen | `EASE_IN` — `cubic-bezier(.5, 0, .75, 0)` |

All exported from `lib/kit.js`.

Two rules that matter more than the values:

- **`linear` is right for a fill wipe** and wrong for everything else. A wipe is
  mechanical progress, so constant speed is honest. A *move* at constant velocity
  is the single strongest tell of an unfinished animation.
- **`ease-in` is almost always wrong**, because it delays the moment the viewer is
  watching. The one legitimate use is an object accelerating away and off — which
  is exactly the closing collapse. Nowhere else.

For custom curves, use a generator ([easing.dev](https://easing.dev/),
[easings.co](https://easings.co/)) rather than hand-rolling numbers.

## Physicality

- **Never `scale(0)`.** Nothing in the physical world appears from literally
  nothing; the eye reads it as a glitch rather than an entrance. Start from
  `scale(0.92–0.97)` and let opacity do the appearing. `kit.js` `popIn` does this.
- **Scale from the right origin.** An element that emerges *from* something should
  have its `transform-origin` at that thing, not at its own centre. Centre origin
  is correct only when the element genuinely belongs to the whole frame — which is
  why the closing collapse scales about centre.
- **`translate` percentages are relative to the element's own size.** `translateY(100%)`
  moves an element exactly its own height whatever its dimensions — prefer it to
  hardcoded pixels so a shape can be resized without retiming.
- **Enter and exit along the same path.** If content arrives from the left it
  should leave to the left. Asymmetric paths break spatial consistency, and the
  viewer loses track of what went where.
- **`clip-path: inset(t r b l)`** is an under-used reveal tool — each value eats in
  from that side, so `inset(0 0 100% 0)` → `inset(0 0 0 0)` wipes upward. Useful
  for a reveal beat without adding a masking element.

## Stagger

**30–80ms between items** for a group entrance. Below ~30ms it stops reading as a
cascade and becomes a single flash; above ~80ms it drags.

The exception is a large field (20+ units) where you *want* a sweep rather than a
cascade — there, 15–25ms reads as a wave crossing the grid. If you go below 30ms,
do it because you want that effect, not by accident.

Stagger is decorative. It must never be the thing carrying meaning.

## Performance

Relevant only when the deliverable is a **live page**. For an export, every frame
is captured individually with the clock paused, so nothing here affects output.

- **Animate `transform` and `opacity` only.** They skip layout and paint and run
  on the GPU. `width`/`height`/`top`/`left`/`margin` force layout every frame.
- **`kit.js` knowingly breaks that rule in one place:** `beats.scan` animates the
  selection box's `width`/`height`. The alternative — `scaleX`/`scaleY` — would
  distort its 1px border into a visible smear. It's one element with no children,
  so the layout cost is negligible; that's the trade, made deliberately.
- **Motion's `x` / `y` / `scale` shorthands are not hardware-accelerated.**
  Independent transforms are composed on the main thread via rAF, so they can drop
  frames under load. A full transform string can go to the compositor:

  ```js
  // main thread — fine for export, can jank on a busy live page
  [el, { x: 100 }, { at, duration }]
  // hardware accelerated
  [el, { transform: 'translateX(100px)' }, { at, duration }]
  ```

  `kit.js` uses the shorthands, because they're what makes the beats composable
  and readable. If a scene ships live on a page with heavy scripting and you see
  jank, convert the hot beats to transform strings — and measure first, because
  the flat geometry here is cheap to composite.
- **Don't drive child transforms from a CSS variable on the parent** — it
  restyles every child each frame. Set transforms on the element itself.

## Reduced motion

**Reduced motion means fewer and gentler animations, not zero.** The setting asks
for less movement, not a dead page, and transitions that aid comprehension should
survive. Stripping everything is as wrong as ignoring the setting.

`scene.run({ reduced: 'calm' })` — the default — filters `scale`/`x`/`y`/`rotate`
steps out of the sequence while keeping opacity, colour and width. The labels
still cycle, content still fills, the narrative still reads; what goes is the
large scale change of the collapse and the drifting dot, which are the parts that
actually provoke vestibular discomfort.

Use `reduced: 'still'` only when large movement *is* the scene's whole point, so
calming it would leave nothing coherent.

For a live page, treat the preference as state rather than a one-time load check:
listen to the media query's `change` event and switch to or from the reduced
version when the OS setting changes. Also pause an unattended infinite loop while
`document.hidden`; resume only when motion is allowed. A video export is already
frame-seeked and needs neither runtime behaviour.

## Masking an imperfect crossfade

When two states overlap visibly during a transition and no amount of easing or
duration tuning fixes it, a brief `filter: blur(2px)` blends them into one
perceived transformation. Keep it under 20px — heavy blur is expensive, especially
in Safari.

Prefer restructuring first. `beats.labelCues` solves the label case properly by
sequencing the fades so they never overlap; blur is for when overlap is inherent.

## Say it in the right words

Using the standard term means a designer, a brief and an agent all end up building
the same thing. What this skill does, named properly:

| In this skill | The standard term |
|---|---|
| the two-pen frame trace | **Line drawing** — a path that draws itself in, as if traced by a pen |
| the caret and typing bars | **Typewriter** |
| grey bars standing in for content | **Skeleton** |
| bars converting to accent | **Reveal** (clip/wipe based) |
| the selection box walking rows | **Stagger** of **reveals**, driven by a moving indicator |
| cards appearing one after another | **Stagger** of **scale-in** entrances |
| the closing scale-to-a-point | **Scale** out, centre **transform origin** |
| label swapping in one slot | **Crossfade** — or sequenced fades, when overlap must be avoided |
| candidates dimming in a field collapse | **Fade** to a floor opacity, not exit |
| a panel growing from its trigger | **Origin-aware animation** |
| one shape becoming another | **Morph** — vs **crossfade** if they merely fade in place |
| an element travelling between positions | **Shared element transition** |
| the whole cycle repeating | **Loop** — vs **alternate/yoyo** if it reverses |
| deliberately timing several elements as one motion | **Orchestration** |

Also worth having: **anticipation** (a small wind-up opposite the coming move),
**follow-through** (parts settling slightly after the main motion stops),
**perceived performance**, **spatial consistency**, **jank**, **compositing**.

## Review pass

Run this before delivering. Ordered by how badly each failure hurts, so stop and
fix as soon as one fails rather than collecting a list.

1. **Does the mechanism match the claim?** Say the mechanism aloud without naming
   the product. If that sentence isn't recognisably the claim, nothing below
   matters. Rebuild rather than polish.
2. **Does every object have product meaning?** Name its role, cause and
   destination. Reference-derived chrome gets no exemption.
3. **Is geometry connected across state changes?** Track the shared element from
   source to destination. If nothing is shared, use an honest labelled fade.
4. **Is the loop seam invisible?** Compare the last frame to the first, explicitly.
   The most common defect and the easiest to miss when watching casually.
5. **Can you name what each beat is about?** If a beat has two things changing for
   two different reasons, the viewer tracks one and misses both.
6. **Does anything move at constant velocity?** Only fill wipes are allowed.
7. **Does anything appear from `scale(0)` or vanish to nothing?**
8. **Is one accent colour carrying one meaning?** Two accents, or an accent spent
   during authoring instead of on verification, destroys the signal.
9. **Squint test.** Scale to 200px wide. Does the mechanism still read? Small text
   and fine detail are already gone at hero-thumbnail size.
10. **Silent test.** These play muted with no narration. If a beat needs a
   voiceover to make sense, it needs a label or a rethink.
11. **Does it hold at the start and end?** Motion beginning on frame 1 reads as a
   dropped frame.
12. **Reduced motion:** does something coherent still play?
13. **Cohesion:** does the motion match the product's personality? A professional
    tool should be crisp and fast; a playful product can carry more bounce. Easing,
    duration, palette and subject should agree.

## Debugging feel

When something is wrong but you can't name it:

- **Slow it down 2–5×.** Multiply every duration, or seek frame by frame. At
  normal speed the eye reports "wrong"; at a fifth speed it reports *what*.
  Check colours crossfade cleanly, easing doesn't stop abruptly, `transform-origin`
  is where you think, and coordinated properties stay in sync.
- **Check coordinated properties for drift.** Two things meant to move as one
  drifting apart by 30ms is invisible per frame and obvious as a feeling.
- **Come back tomorrow.** Imperfections invisible while building surface
  immediately on fresh eyes. If a deadline allows one overnight, take it.

## Credits

The craft rules, the easing curves, the never-`scale(0)` rule, the stagger range,
the reduced-motion stance, the blur-masking trick, the debugging methods and the
vocabulary are adapted from **Emil Kowalski's** skills and writing
([github.com/emilkowalski/skills](https://github.com/emilkowalski/skills),
[emilkowal.ski](https://emilkowal.ski/)) — chiefly `review-animations/STANDARDS.md`,
`animation-vocabulary`, and `find-animation-opportunities`. His material is
written for interactive UI; the filtering above, and everything about explanatory
loops, is this skill's own.

Apple's *Designing Fluid Interfaces* (WWDC 2018), by way of the same author's
`apple-design` skill, is the source for spatial consistency and symmetric paths.
Its core argument — behaviour over prescribed animation, springs over durations —
deliberately does **not** apply here, for the reasons in the first section.
