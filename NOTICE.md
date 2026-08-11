# Third-party notices

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

## Motion (motion.dev)

Scenes load Motion at runtime from a CDN; it is not vendored here.
Motion is MIT licensed — <https://github.com/motiondivision/motion>.

## Referenced, not included

`skills/concept-motion/SKILL.md` points at
<https://github.com/diffusionstudio/lottie> (MIT) for Lottie output, which this
skill does not produce. No code from it is included.
