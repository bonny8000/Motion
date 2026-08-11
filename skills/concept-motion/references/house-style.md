# House style

## Contents

- [The abstract-skeleton vocabulary](#the-abstract-skeleton-vocabulary)
- [Palette](#palette)
- [Easing curves](#easing-curves)
- [Timing defaults](#timing-defaults)
- [Deriving a style from a reference video](#deriving-a-style-from-a-reference-video)
- [Failure modes](#failure-modes)

## The abstract-skeleton vocabulary

The dominant style for product-concept loops represents content as **anonymous
geometry** rather than legible UI: rows of rounded bars standing in for text or
code, flat panels standing in for windows, a single word naming the current state.

This is a deliberate choice, not a shortcut, and it's worth understanding before
you decide to deviate:

- **It ages well.** No real screenshot means no stale UI when the product ships
  its next redesign.
- **It survives compression and small sizes.** Real 12px text turns to mush in an
  H.264 hero video or a 400px-wide embed. Bars stay readable.
- **It localizes for free.** There is almost nothing to translate.
- **It directs attention.** Viewers can't read the fake content, so they watch
  the *change* — which is the actual subject.

Element vocabulary:

| Element | Means | Build |
|---|---|---|
| Grey bar | inert / untouched content | flat rect with 1-3px radius, 6-10px tall at 1x |
| Accent bar | touched, generated, active | same rect, accent fill |
| Partially filled bar | in progress right now | width wipe on a child element |
| Dark panel | a document, editor, or window | flat fill, no gradient, slight radius |
| 1px frame + corner handles | "this object is selected / being worked on" | border plus 4 fixed-size squares |
| One word, fixed corner | the current state | 15-18px, high contrast, crossfade |
| Indentation | structure / hierarchy | left margin steps of ~40px at 1x |

Vary bar widths and indentation irregularly. Evenly sized bars read as a loading
skeleton (broken); irregular ones read as content.

Keep the panel fill perfectly flat, with a 1–2px radius. Gradients, pill ends and
shadows fight the flatness that makes this style read as diagrammatic rather than
as a screenshot. If the brief calls for a softer product-UI material instead,
use `createScene({ material: 'soft' })` consistently rather than mixing traits.

## Palette

Slate-and-azure, the default. Tuned to hold up in both a light and a dark page
surround, since a hero loop rarely controls its own background.

Sampled from reference footage rather than guessed, so these are a real
starting point:

```css
:root {
  --bg:     #657689;  /* desaturated slate — recedes, never competes    */
  --card:   #1a2931;  /* near-black navy panel                          */
  --accent: #0061de;  /* azure: the "active / generated" signal         */
  --bar-a:  #78868e;  /* light grey bar   — primary inert content       */
  --bar-b:  #5e6c74;  /* mid grey bar     — secondary                   */
  --bar-c:  #46545c;  /* dark grey bar    — tertiary, recedes into card */
  --label:  #e8eef0;  /* state text                                    */
  --frame:  #ffffff;  /* selection chrome                              */
}
```

Note how close the bar tints sit to the panel fill — the greys are much darker
than instinct suggests. Reaching for light greys makes the inert content shout
as loudly as the accent, and the whole point of the accent is that it is the
only thing shouting.

Rules that matter more than the specific hex values:

- **Exactly one accent.** The accent is a semantic signal — "this is the thing
  happening." A second accent color destroys that meaning instantly. If you need
  a second state, use opacity or a grey step, not a new hue.
- **Three greys, not five.** Three tints read as hierarchy; five read as mush.
- **Background is desaturated, foreground is saturated.** The slate background is
  intentionally muddy so the azure reads as bright by contrast. Saturating the
  background flattens the whole frame.
- **Test the accent against the card at small size.** Zoom to 25% and confirm the
  accent still separates from the panel fill. Blues on navy are the common trap.

For a brand palette, substitute `--accent` first and leave the neutrals alone.
Brand neutrals are usually tuned for text-on-white and go muddy here.

## Easing curves

Paste-ready `linear()` curves. All Baseline since 2023-12-11.

```css
:root {
  /* Standard UI move — the safe default for position and size.               */
  --ease-move: linear(0, 0.008 1.1%, 0.033 2.3%, 0.13 4.9%, 0.286 8%, 0.484 11.4%,
    0.688 15%, 0.865 18.9%, 0.994 23.1%, 1.07 27.6%, 1.098 32.4%, 1.09 37.5%,
    1.058 43.1%, 1.017 49.2%, 0.991 55.7%, 0.984 62.6%, 0.995 70%, 1.003 78%, 1);

  /* Soft settle — no overshoot. For anything that must not look bouncy.      */
  --ease-settle: linear(0, 0.11 2.6%, 0.21 5.3%, 0.39 10.9%, 0.54 16.7%,
    0.67 22.9%, 0.77 29.4%, 0.85 36.4%, 0.91 43.9%, 0.95 52%, 0.98 61%, 1 72%, 1);

  /* Snap — for a state flipping, a selection landing.                        */
  --ease-snap: linear(0, 0.29 3.4%, 0.51 6.8%, 0.69 10.5%, 0.82 14.5%,
    0.92 19%, 0.98 24.2%, 1.01 30.3%, 1.02 38.5%, 1.01 50%, 1);
}
```

Guidance:

- **`--ease-settle` for the master zoom.** Overshoot on a long continuous scale
  reads as a wobble, not as energy.
- **`--ease-snap` for labels and selection frames.** These are discrete events
  and should feel decided.
- **Never `linear` for anything spatial.** Constant velocity is the single
  strongest tell of an unfinished animation. It's acceptable only for a fill
  wipe that represents steady mechanical progress.
- **Nothing under 150ms or over 900ms** for a discrete transition. Below 150ms
  reads as a pop; above 900ms feels broken.

### Geometric scale

For a scale animation spanning more than about 3x, space the keyframes so each
equal time slice is an equal *multiplication*, not an equal subtraction. Going
1.0 → 0.02 in even linear steps spends most of the duration crawling through
sizes the eye can't distinguish.

For 1.0 → 0.02 across the loop, each 25% of time multiplies by ~0.375:

```css
0%   { --s: 1.0;   }
25%  { --s: 0.375; }
50%  { --s: 0.141; }
75%  { --s: 0.053; }
100% { --s: 0.02;  }
```

Ratio to use per step: `(end / start) ^ (1 / steps)`.

## Timing defaults

| Thing | Duration |
|---|---|
| Whole loop | 8-20s, default 14s |
| Opening hold before first move | 3-5% of loop |
| One bar's fill wipe | 4-7% of loop |
| Stagger between adjacent rows | 2-4% of loop |
| Label crossfade | 200-300ms |
| Selection frame land | 250-350ms |
| Closing hold / seam cover | 4-6% of loop |

## Deriving a style from a reference video

When handed a reference clip or a set of frames:

0. **Read `reference-fidelity.md` and declare the match mode.** A reproduction,
   a content adaptation and a loose inspiration permit different changes. When
   the user says "similar" and supplies a goal clip, default to content adaptation:
   preserve the clip's composition and motion grammar; change the subject matter.

1. **Name the single mechanism.** Almost every good concept loop has exactly one:
   a continuous zoom, a left-to-right pipeline, an orbit, a stack collapsing. Find
   it before cataloguing details. Everything else is decoration on top.
2. **Order the frames by that mechanism**, not by narrative logic. A monotonic
   scale across frames tells you the temporal order even when the labels suggest
   otherwise — and reveals whether it zooms in or out.
3. **Look for a straddling element.** One element caught mid-transition tells you
   the transition is continuous rather than a cut, and roughly how long it takes
   relative to neighbours.
4. **Check whether chrome scales.** Compare border thickness and handle size
   between a large frame and a small one. If they match, chrome is decoupled —
   which dictates the whole DOM structure, so establish it early.
5. **Sample colors from the flattest areas**, away from edges, since video
   compression shifts color hardest at high-contrast boundaries.
6. **Count the accent colors.** Usually one. If you think you see two, one is
   probably an opacity variant.

Reproduce the composition and motion topology first with placeholder geometry,
then confirm the *feel* before matching colors. Color is a five-minute fix; a
wrong number of hero objects or a wrong movement path is a rebuild.

## Failure modes

Things that make an otherwise fine loop look amateur, roughly in order of how
often they show up:

- **A visible loop seam.** Check t=99% against t=0 explicitly. Always.
- **Polishing away from the reference.** Added shadow, larger radius, pill bars or
  bounce are regressions when the goal clip is flat and square.
- **Linear easing on movement.** See above.
- **Everything moving at once.** If you can't name what a beat is about, it's
  about nothing.
- **Chrome that scales while the viewer must read it.** Decouple chrome during a
  held zoom. Scaling the whole unit is acceptable during a fast closing collapse,
  where the chrome is no longer inspectable, or when the reference does exactly
  that.
- **Uniform bar widths.** Reads as a loading skeleton, not content.
- **Text too small to survive.** Anything under 14px at 1x will not survive
  H.264 or a mobile embed. If it matters, make it bigger; if it can't be bigger,
  cut it.
- **Two accent colors.** Kills the accent's meaning.
- **No hold at the start or end.** Motion that begins on frame 1 reads as a
  dropped frame.
