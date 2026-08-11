# Polish and drama

Three failures show up again and again in a first draft, and all three were
present in a scene this skill produced before this file existed:

1. **Geometry left at defaults** — 2px radii, no depth, colliding elements.
2. **Everything eased `linear`** — informationally correct, visually dead.
3. **No dramatic structure** — beats happen, but nothing builds or lands.

None of them are bugs. The animation "works" in every case. They're the
difference between a scene that reads as finished and one that reads as a
prototype, so check them before delivering.

## Contents

- [Geometry tokens](#geometry-tokens)
- [Easing: the expressive set](#easing-the-expressive-set)
- [Two-layer entrances](#two-layer-entrances)
- [Choreography — making it dramatic](#choreography--making-it-dramatic)
- [Honest metrics](#honest-metrics)
- [Polish checklist](#polish-checklist)
- [Credits](#credits)

## Geometry tokens

Define these once per scene. Leaving radii at 2px is the fastest way to make
output look cheap.

```css
--r-bar:   999px;   /* text/content placeholder bars: ALWAYS fully round */
--r-panel: 14px;    /* panels, cards, windows */
--r-chip:  10px;    /* labels, badges, pills */
```

- **Placeholder bars are fully round, without exception.** A 15px-tall bar with a
  2px radius reads as an unfinished wireframe. `999px` clamps to a perfect
  semicircle at any height, so it survives resizing.
- **Panels want 12–16px.** 4px reads as a 2015 dialog.
- **Give panels depth.** A soft shadow plus a barely-there top highlight turns a
  flat rectangle into a material:
  ```css
  box-shadow: 0 18px 44px rgba(12,20,26,.30),
              0 2px 0 rgba(255,255,255,.07) inset;
  ```
  Keep it subtle. Two stacked large shadows on a dark panel is plenty.
- **Standard offsets: 8 / 16 / 24px.** Pick spacing from a scale, not per element.
- **Check for collisions at the final frame.** A badge overlapping a panel edge by
  a few pixels is invisible while building and unmistakable in a screenshot.

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

- [ ] Placeholder bars fully round; panels 12–16px
- [ ] Panels have a soft shadow — not flat rectangles
- [ ] Nothing collides at any frame, especially the final one
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
