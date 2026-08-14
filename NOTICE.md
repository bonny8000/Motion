# Third-party notices

## SEED Design — 주식회사 당근마켓 (Karrot)

`skills/concept-motion/lib/kit.js` adapts, and
`skills/concept-motion/references/visual-foundations.md` documents, material
from SEED Design (<https://github.com/daangn/seed-design>):

- the role-based colour model — Property (foreground / background / stroke) ×
  Role (brand, neutral, positive, critical, warning, informative) × Variant
  (solid / weak) — as the `colorPositive` / `colorCritical` / `colorWarning` /
  `colorInformative` / `colorMagic` intent tokens;
- neutral and intent colour values for the `seedLight` and `seedDark` themes,
  resolved from `packages/rootage/color.yaml`;
- the categorical `HUES` set, from the palette's 600 step;
- the `timing-function` curves as `SEED_EASING`, `SEED_ENTER`, `SEED_EXIT`,
  `SEED_ENTER_X`, `SEED_EXIT_X`, and the `duration` scale plus the macro/micro
  split as `MOTION_PROFILES.seed`.

SEED Design is Copyright 2025 주식회사 당근마켓, licensed under the Apache
License 2.0. A copy of that licence must accompany redistribution — see
<https://www.apache.org/licenses/LICENSE-2.0> and the `LICENSE` and `NOTICE`
files in the upstream repository.

**Trademark.** SEED's NOTICE reserves "brand resources" — logos, trade names,
characters, and any element identifiable as Karrot or its products — as
trademarks outside the Apache grant, permitted for non-commercial use only
absent prior agreement, and never in a way implying affiliation or
endorsement. This project therefore adopts SEED's neutral and functional
intent roles but **does not ship its brand colour**; `colorAccent` in the seed
themes defaults to the informative role. Nothing here is affiliated with,
sponsored by, or endorsed by Karrot.

## Kyle Zantos — design-motion-principles

`skills/concept-motion/references/visual-foundations.md` and
`references/motion-craft.md` cross-reference the context-weighting idea — that
motion guidance is conditional on what is being built rather than universal —
and the frequency gate from
<https://github.com/kylezantos/design-motion-principles> (MIT). That skill
targets interactive UI motion; the frequency gate does not transfer to
non-interactive explanatory motion, and this skill records why.

## Emil Kowalski — skills

`skills/concept-motion/references/motion-craft.md` adapts craft rules, easing
curve values, the stagger range, the never-`scale(0)` rule, the reduced-motion
stance, the blur-masking technique, the debugging methods and the motion
vocabulary from <https://github.com/emilkowalski/skills> (chiefly
`review-animations/STANDARDS.md`, `animation-vocabulary`, and
`find-animation-opportunities`), and from <https://emilkowal.ski/>.

That material is written for interactive UI. This skill targets non-interactive
explanatory motion, so `motion-craft.md` also documents which of those rules
deliberately do **not** apply here.

Used under the MIT License:

```
MIT License

Copyright (c) 2026 Emil Kowalski

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## Meng To — Skills (animation-systems)

`skills/concept-motion/references/polish.md` adapts the choreography model
(hero → supporting reading order, one hero moment), the duration and stagger
defaults, and the motion-primitive set from
<https://github.com/MengTo/Skills> (`agent-skills/web-design/animation-systems`).

## GreenSock — gsap-skills

The same file adapts GSAP's ease vocabulary (`power2.out`, `power3.out`,
`expo.out`, `back.out`) and the labelled-timeline / position-parameter approach
from <https://github.com/greensock/gsap-skills>, MIT licensed. Values are used as
plain `cubic-bezier` equivalents; GSAP itself is not bundled or required.

## Apple — Designing Fluid Interfaces

Spatial-consistency and symmetric-path guidance derives from Apple's
*Designing Fluid Interfaces* (WWDC 2018), by way of the `apple-design` skill in
the repository above. Referenced as prior art, not reproduced.

`skills/concept-motion/references/ui-walkthrough.md` and the `SPRINGS` presets in
`lib/kit.js` additionally adapt, from that same `apple-design` skill: the
damping-ratio / response spring parameterisation in place of
mass/stiffness/damping, Apple's shipped values for move, rotation and
drawer interactions, the "bounce is earned by momentum" rule, feedback-on-press,
continuous-rather-than-terminal feedback, and anchor-to-source origins.
Typography guidance (size-specific tracking, hierarchy from weight and leading)
comes from *The Details of UI Typography* (WWDC 2020) by the same route.

That material describes interactive, gesture-driven UI. This skill produces
non-interactive explanatory motion, so the springs are **sampled** into fixed
easing functions to preserve deterministic seeking, and `ui-walkthrough.md`
records which principles — interruptibility, 1:1 tracking, velocity handoff,
momentum projection, rubber-banding — deliberately do **not** transfer.

## Motion (motion.dev)

Scenes load Motion at runtime from a CDN; it is not vendored here.
Motion is MIT licensed — <https://github.com/motiondivision/motion>.

## Referenced, not included

`skills/concept-motion/SKILL.md` points at
<https://github.com/diffusionstudio/lottie> (MIT) for Lottie output, which this
skill does not produce. No code from it is included.

The deterministic `?t=N` inspection contract and sampled contact-sheet review
workflow were informed by the verification approach described in iart-ai's
`gsap-web` skill (<https://github.com/iart-ai/web-animation-skills>). The
implementation here is independent, uses native WAAPI/Playwright, and does not
include GSAP or code from that repository.
