# Mechanism recipes

Once `intent-to-mechanism.md` has picked a mechanism, this is how to build it from
the kit. Each recipe lists the shape, the beat sequence, and — honestly — what the
kit doesn't yet provide.

Two mechanisms ship as working scenes. The rest are recipes: the beats and shapes
they need mostly exist, but you'll write the scene and sometimes a new shape.
Building one is an afternoon, not a rewrite, because the stage, the seek hook,
the reset discipline, the label sequencing and the export path are already solved.

## Contents

- [What the kit gives you](#what-the-kit-gives-you)
- [Shipping scenes](#shipping-scenes)
- [Recipes](#recipes)
- [Adding a shape](#adding-a-shape)
- [Adding a beat](#adding-a-beat)

## What the kit gives you

`lib/kit.js`:

| Shapes | What it represents |
|---|---|
| `codeRows` | indented lines — code, a document, config, a transcript |
| `listRows` | full-width records — a list, queue, table, feed |
| `cardGrid` | peer units — results, media, devices, people |

| Beats | Does |
|---|---|
| `reset` | zero-length steps at t=0 so the loop is idempotent — always call first |
| `dot` | a dot drifts in; doubles as the seam cover |
| `drawFrame` | two pens trace the panel frame from the top-left |
| `fillPanel` | the panel fades in |
| `enter` | content appears unit by unit, optional typing caret |
| `scan` | a selection box walks the groups, converting each |
| `convertFrom` | convert groups the scan didn't reach |
| `unconvert` | take the accent back off |
| `recede` | dim units without removing them |
| `promote` | survivors go accent and nudge forward |
| `accentChrome` | frame flips to accent |
| `collapse` | the closing scale-to-a-point |
| `labelCues` | state labels, sequenced so they never overlap |

Shapes declare `enterMode` (`growX` / `popIn`) and `convertMode` (`wipeX` /
`fade`); the beats respect both, so a new shape gets correct behaviour for free.

## Shipping scenes

- **`assets/scene-phase-spine.html`** — phase spine. Autonomous work advancing
  through named states. The reference reproduction.
- **`assets/scene-field-collapse.html`** — field collapse. Many candidates, most
  recede, a few resolve. Search, ranking, matching, filtering, triage.

## Recipes

### Conveyor — "turns X into Y"

Pipelines, compilers, ETL, format conversion, request handling.

```js
const body = shapes.listRows(scene, { count: 3 });    // three lanes
// STATIONS as x-positions; a token crosses and changes tint at each
beats.reset(scene, { panel, body });
beats.drawFrame(scene, panel, { at: .7 });
beats.fillPanel(scene, panel, { at: 1.9 });
beats.enter(scene, body, { at: 2.1, per: .3 });        // lanes appear
// then per station: move token, convert the lane segment behind it
beats.collapse(scene, { at: 8.6 });
```

Needs a `token` element and a `travel` beat — roughly ten lines: absolutely
position a small accent block and animate `x` between station offsets, converting
each lane segment as it passes. **Give each station a label**; a token sliding
past unlabelled stations shows motion but names nothing.

### Race — "faster than…"

```js
const body = shapes.listRows(scene, { count: 2, jitter: false });  // two equal tracks
beats.enter(scene, body, { at: 2.0, per: .2 });
// convert both lanes simultaneously at different rates — same beat, different duration
beats.convertFrom(scene, { groups: [body.groups[0]], ... }, { at: 3.0, per: 1.2 });
beats.convertFrom(scene, { groups: [body.groups[1]], ... }, { at: 3.0, per: 3.4 });
```

`convertFrom` takes any object with a `groups` array, so you can pass a synthetic
one to drive lanes independently. **Draw a finish line** — a 1px vertical rule at
the track end. Without it "faster" reads as "different." Label both tracks.

### Multiplication — "handles millions"

```js
const body = shapes.cardGrid(scene, { cols: 10, rows: 6, cw: 96, ch: 52, gap: 8 });
beats.enter(scene, body, { at: 2.0, per: .012 });   // tiny `per` = the field floods in
beats.scan(scene, body, { at: 4.5, per: .18 });
beats.collapse(scene, { at: 8.4 });
```

Works today with no new code. Caveat from `house-style.md`: dense fields turn to
noise at thumbnail size — fine for a talk clip, risky for a page hero.

### Wipe / split — "before vs after"

```js
const before = shapes.codeRows(scene, ROWS, { pad: { left: 44,  top: 118 } });
const after  = shapes.codeRows(scene, ROWS, { pad: { left: 700, top: 118 } });
beats.enter(scene, before, { at: 2.0, per: .1 });
beats.enter(scene, after,  { at: 2.0, per: .1 });
beats.convertFrom(scene, after, { at: 4.0 });        // only one side converts
```

Works today — two shapes in one scene, offset by `pad`. Add a 1px divider between
them. Keep the layouts **identical**, or the viewer reads layout differences as
the point instead of the treatment.

### Emission — "reaches everywhere"

Sync, distribution, broadcast, fan-out.

Needs a `radial` shape (targets on a circle around a source) and an `emit` beat
(scale a ring outward, activating targets as it crosses them). The kit's
`cardGrid` plus `promote` gets you a crude version — activate targets in
distance-from-centre order — but a proper radial layout is worth the hour.

### Graph knit — "it all connects"

Needs a `nodeGraph` shape and an `edge` beat. Edges are the interesting part:
draw them with the same technique `drawFrame` uses — a 1px div scaled from one
end, rotated to the angle between nodes. Reuse `drawFrame`'s per-edge timing idea
so edges appear in a deliberate order rather than all at once.

### Feedback loop — "learns / improves"

`codeRows` plus `scan`, then re-enter: run `unconvert` + `scan` again with a
shorter `per` each pass, and tighten something visible between passes (fewer
rows, faster scan, a shrinking error band). **Each pass must differ visibly** or
it reads as a stuck animation rather than as improvement.

### Exploded stack — "architecture, layers"

Needs a `stack` shape: N panels offset in y with a slight x skew, each labelled.
The beat is a single `separate` — animate `y` apart with a stagger, hold, then
reassemble. `scene.panel()` gives you one layer; call it N times with different
offsets. Closest to a diagram of any mechanism here, so lean hardest on labels.

## Adding a shape

Return the contract and the two mode hints; every beat then works against it:

```js
export const shapes = {
  myShape(scene, o = {}) {
    const body = el('cm-body', scene.unit, { left: `${scene.x0 + 44}px`, top: `${scene.y0 + 100}px` });
    const groups = /* … */ [{ x, y, w, h, items: [{ el, fill, x, y, w, h }] }];
    return { el: body, groups, items: groups.flatMap((g) => g.items),
             enterMode: 'popIn', convertMode: 'fade' };
  },
};
```

`items` are the smallest individually-animatable units; `groups` are the bands
anything scanning or staggering will walk. Every item needs a `fill` child span —
that's what carries the accent conversion.

## Adding a beat

Take `(scene, …, { at })`, push steps with absolute `at`, return the end time so
callers can chain:

```js
myBeat(scene, body, { at, per = .3 }) {
  let t = at;
  for (const g of body.groups) {
    scene.push([g.items.map((i) => i.el), { y: g.y - 20 }, { at: t, duration: per, ease: EASE }]);
    t += per;
  }
  return t;
}
```

Two rules, both load-bearing: **absolute `at` only** — relative offsets make
retiming one beat cascade through the rest; and **anything you animate must be
restored in `reset`**, or the second loop iteration opens in the first one's end
state.
