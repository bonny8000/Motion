# Polish and drama

Three failures show up again and again in a reference-free first draft:

1. **Geometry left unresolved** — arbitrary radii, depth and spacing.
2. **Everything eased `linear`** — informationally correct, visually dead.
3. **No dramatic structure** — beats happen, but nothing builds or lands.

None of them are bugs. The animation "works" in every case. They're the
difference between a scene that reads as finished and one that reads as a
prototype, so check them before delivering.

## Contents

- [Geometry tokens](#geometry-tokens)
- [Fidelity overrides polish](#fidelity-overrides-polish)
- [Easing: the expressive set](#easing-the-expressive-set)
- [Two-layer entrances](#two-layer-entrances)
- [Choreography — making it dramatic](#choreography--making-it-dramatic)
- [Honest metrics](#honest-metrics)
- [Polish checklist](#polish-checklist)
- [Credits](#credits)

## Geometry tokens

Define geometry once per scene. Pick a material profile deliberately; neither is
more "finished" than the other:

```css
/* flat diagram / reference footage */
--r-bar: 2px; --r-panel: 2px; --panel-shadow: none;

/* soft product UI, only when the brief calls for it */
--r-bar: 999px; --r-panel: 14px;
--panel-shadow: 0 18px 44px rgba(12,20,26,.30),
                0 2px 0 rgba(255,255,255,.07) inset;
```

- **Flat diagram bars use 1–3px radii.** They should read as abstract code, not as
  a loading skeleton. Fully round bars belong to the softer UI profile.
- **Panel radius and bar radius move together.** A square panel full of pill bars,
  or a soft panel full of hard rectangles, mixes two material languages.
- **Depth must have evidence.** Add the soft shadow and top highlight only when
  the reference or brand world contains elevation. A flat reference with a new
  shadow is lower fidelity, not higher craft.
- **Standard offsets: 8 / 16 / 24px.** Pick spacing from a scale, not per element.
- **Declare an alignment contract.** Name the shared column, edges and centreline
  before placing content. Components explaining the same comparison should not
  invent independent coordinate systems.
- **Use concentric radii for nested surfaces.** Start with
  `inner radius = outer radius - inset`, then adjust optically. Arbitrary radii
  make related layers look assembled from different systems.
- **Match handoff geometry.** A shared element must keep the same centerline or
  edge contact at the transition boundary. Connectors meet the actual source and
  destination surfaces; they do not stop in nearby empty space.
- **Reserve separate lanes for text and paths.** Connector labels need a clear
  gutter; when a route crosses its explanation, simplify or remove the route.
- **Check collisions at full resolution across keyframes.** A reduced contact
  sheet proves sequence, not spacing. Inspect opening, midpoint and payoff at the
  delivery resolution and use `scripts/layout-audit.mjs` when the scene declares
  audit attributes.

`lib/kit.js` defaults to `material: 'reference'`. Opt into the other profile:

```js
createScene({ material: 'soft' });
```

## Fidelity overrides polish

When a goal clip or screenshots exist, their observable decisions are the style
specification. Do not round, shade, bounce, blur or overshoot an element merely
because a generic craft rule recommends it. Preserve the reference's material,
motion topology and density first; apply polish only inside the degrees of
freedom the reference leaves open.

The common failure is to make every component locally nicer while making the
whole result globally less similar. A 14px radius can be well executed and still
be wrong.

## Easing: the expressive set

GSAP's ease names are the clearest vocabulary for this, and they map to plain
`cubic-bezier`, so you get the expressiveness without adding a dependency:

| GSAP | cubic-bezier | Use for |
|---|---|---|
| `power2.out` | `.215,.61,.355,1` | general entrance, the safe default |
| `power3.out` | `.165,.84,.44,1` | slightly stronger entrance |
| `power4.out` | `.23,1,.32,1` | a landing with weight |
| `expo.out` | `.19,1,.22,1` | the most dramatic stop — sweeps, wipes |
| `back.out` | `.34,1.56,.64,1` | overshoot; **use once per scene, maximum** |
| `power2.inOut` | `.645,.045,.355,1` | something already on screen moving A→B |
| `power2.in` | `.55,.085,.68,.53` | exits, and only exits |

Rules that matter more than the numbers:

- **Entrances `out`, exits `in`, and exits are faster.** Asymmetric timing is most
  of what makes motion feel considered rather than mechanical.
- **`linear` is only for genuinely mechanical progress** — a fill wipe, a time
  meter, a marquee. If most of your scene is `linear`, the scene is flat. Having a
  justification for each individual `linear` is not the same as the whole reading
  well.
- **Overshoot exactly once.** `back.out` is a spotlight: the one element that
  overshoots becomes where the eye lands, so spend it on the payoff. Two overshoots
  cancel out.
- **Avoid `elastic` and heavy bounce** for product work unless the brand is
  genuinely playful.

## Two-layer entrances

The single highest-value polish upgrade. A bar that only wipes reads as dry; a bar
that only fades loses the sense of being generated. Do both, on two elements:

```
outer wrapper  →  opacity 0→1  +  translateY 10px→0     power3.out
inner fill     →  scaleX 0→1                            linear
```

The wrapper supplies the craft, the inner fill supplies the meaning. Sizes:

| Element | Rise |
|---|---|
| Text lines, small bars | 8–12px |
| Cards, panels | 12–24px |
| A batch landing at once | 12–16px, with 20–30ms stagger |

Micro-emphasis (a badge, a selected state) uses `scale 0.98 → 1` plus a fade
instead of a rise. Never `scale(0)`.

## Choreography — making it dramatic

A scene where everything starts at once has no drama, no matter how good the
easing is. Structure it as four movements:

| Movement | Job | Typical share of a loop |
|---|---|---|
| **Anticipation** | a held beat before anything moves | 4–6% |
| **Tension** | the thing that takes time, visibly taking it | 50–60% |
| **Punctuation** | a fast, weighted landing — `power4.out` | 5–8% |
| **Reveal** | the payoff. The one overshoot. | 6–10% |
| *(hold)* | let the final frame be read | 8–12% |

Plus:

- **Establish a reading order.** Hero element first, supporting elements after,
  captions and legends **last**. Motion tells the viewer where to look; if
  everything appears together, it tells them nothing.
- **One hero moment per scene.** Everything else is supporting motion. If two
  moments compete, the viewer remembers neither.
- **Stagger 40–90ms** for group entrances (tighter, 20–30ms, for a batch meant to
  land as one mass).
- **A signal that two things start together** — a light sweeping across both, a
  simultaneous pulse — is worth the 0.3s it costs whenever the scene is a
  comparison. Without it, viewers assume the two sides started at different times
  and the comparison collapses.

## Honest metrics

If a scene displays a number, the number must not be an artifact of a choice you
made while composing.

A worked example from this skill's own output: a comparison scene showed
`4.9×`, derived from the ratio of two on-screen meter lengths. But those meters
stopped growing at an arbitrary time chosen for the loop. Extend the window and
the ratio drifts toward `1×`. The figure looked authoritative and was
manufactured by the framing.

The fix was to display the **difference between two moments** — "2.2 seconds
earlier" — which is invariant to where measurement stops.

So: prefer absolute differences to ratios; derive the number in code from the same
constants that drive the timeline, so it can't drift out of sync; and if a figure
changes when you extend the loop, it is a property of your framing rather than of
the product, and it does not belong on screen.

## Polish checklist

Run alongside the review pass in `motion-craft.md`:

- [ ] Geometry matches the chosen material profile or supplied reference
- [ ] Radius, shadow and bar-end treatment form one material language
- [ ] Related surfaces share the declared edges and centreline
- [ ] Full-resolution keyframes show no text, path or component collisions
- [ ] Entrances are two-layer (fade + rise, plus the meaningful transform)
- [ ] Every `linear` is genuinely mechanical progress
- [ ] Entrances `out`, exits `in` and faster
- [ ] Exactly one overshoot, on the payoff
- [ ] There is an anticipation beat, a punctuation, and a reveal
- [ ] Reading order is deliberate; legends and captions arrive last
- [ ] Any displayed number is invariant to the loop length

## Credits

The choreography model, duration/stagger defaults and the "restraint, clear
choreography, physical but not cartoony" framing are adapted from Meng To's
`animation-systems` skill (<https://github.com/MengTo/Skills>). Ease naming and
the timeline/label/position-parameter approach come from GreenSock's official GSAP
skills (<https://github.com/greensock/gsap-skills>, MIT) — the values are used as
`cubic-bezier` equivalents so no library dependency is introduced.
