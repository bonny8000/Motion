# Reference fidelity

Use this whenever a user supplies a goal video, GIF or screenshots. Matching a
reference is a separate problem from explaining the new claim. Treating the
reference as a mood board while freely replacing its composition is the fastest
way to produce a competent animation that the user still calls "very different."

## Contents

- [Declare the match mode](#declare-the-match-mode)
- [Collect evidence before interpreting](#collect-evidence-before-interpreting)
- [Write the fidelity contract](#write-the-fidelity-contract)
- [Separate visual grammar from meaning](#separate-visual-grammar-from-meaning)
- [Rank fixes by perceptual leverage](#rank-fixes-by-perceptual-leverage)
- [Validate at normalized phases](#validate-at-normalized-phases)
- [Reference review gate](#reference-review-gate)

## Declare the match mode

Name one mode before building:

| Mode | Preserve | May change |
|---|---|---|
| **Reproduce** | composition, timing, motion paths, material, palette, content structure | labels and tiny implementation details |
| **Adapt** | composition, focal path, cycle shape, material and motion vocabulary | subject, labels and the internal representation needed by the new claim |
| **Inspire** | only the explicitly named traits | everything else |

If the user says "similar style" and supplies a goal clip, default to **Adapt**.
Do not silently downgrade it to Inspire. Preserve the number and placement of
hero objects, the focal movement path, the approximate cycle duration, the
opening and closing poses, and the material treatment. Change content inside
that grammar.

Ask only when the new claim cannot fit the locked grammar. State the conflict
concretely: "the reference uses one centered panel; a literal race wants two
tracks." Offer an adaptation inside the existing hero before proposing a new
composition.

## Collect evidence before interpreting

Screen recordings often contain several loops, cursor movement and dead time.
The file duration is not necessarily the animation duration.

1. Probe the file and create an evenly sampled board:

   ```bash
   node scripts/reference-board.mjs goal.mov --seconds 10 --samples 15 \
     --out work/goal-reference
   ```

2. Find one complete cycle by locating the repeated opening pose. Re-run with
   `--start` and `--seconds` around that cycle.
3. Mark the first visible frame, full-size hero pose, information-rich pose,
   payoff and 99% seam pose.
4. Inspect the video, not only stills. A set of differently sized stills does not
   prove a continuous zoom; look for an element straddling the transition.

Record observations on seven axes. Use measurements where practical and plain
language where measurement would create false precision:

| Axis | Record |
|---|---|
| **Composition** | hero count, panel bounds as % of stage, alignment, negative space |
| **Motion topology** | which object travels, draws, scans, transforms or collapses; in what order |
| **Timing** | cycle length, holds, beat boundaries, stagger and closing seam cover |
| **Geometry** | radius, border/handle size, bar height, spacing, scale origin |
| **Material** | flat vs elevated, shadow, glow, blur, texture, clipping |
| **Color/type** | sampled flat-region colors, accent count, label position and scale |
| **Meaning** | what each state, color and transition communicates |

Do not start by naming eases. Easing is hard to infer reliably from sparse frames
and has less perceptual leverage than composition or timing.

## Write the fidelity contract

Before the beat sheet, make a short lock/adapt table:

```markdown
| Trait | Reference evidence | Decision |
|---|---|---|
| One centered 81% × 66% panel | stable full-size pose | LOCK |
| About 10s, dot → frame → work → collapse | repeated cycle | LOCK |
| Flat 2px geometry, no shadow | full-size frames | LOCK |
| Status/Writing/Reviewing labels | semantic content | ADAPT |
| Code-row structure | fits the new claim | KEEP / ADAPT |
```

Anything marked LOCK must survive implementation and review. A generic polish
rule never overrides it. If a later decision breaks a lock, call that out as a
direction change rather than hiding it inside implementation.

## Separate visual grammar from meaning

Build two models, then combine them:

- **Reference fingerprint:** hero count, layout, focal path, cycle contour,
  material, color semantics and transition vocabulary.
- **Claim mechanism:** what comparison or transformation makes the new idea
  literal. Use `intent-to-mechanism.md` for this part.

The claim mechanism chooses what happens **inside** the reference fingerprint.
It does not automatically replace the fingerprint.

For example, a speed comparison does not require two large side-by-side panels
when the goal clip has one centered hero. Put two synchronized tracks inside the
one hero panel, keep the frame draw and collapse, and use internal timing to make
the race legible. Switch to two hero panels only if fidelity is explicitly loose
or the user approves the structural change.

This distinction also prevents "better" material decisions from reducing
similarity. A flat panel with 2px corners is not an unfinished version of a
14px card with a shadow. They are different visual grammars.

## Rank fixes by perceptual leverage

When output feels unlike the goal, fix in this order:

1. **Composition and topology** — hero count, placement, focal path, sequence.
2. **Timing and key poses** — loop duration, holds, beat spacing, start/end state.
3. **Geometry and material** — size, radius, depth, density, clipping.
4. **Palette and typography** — sampled colors, accent semantics, labels.
5. **Micro-motion** — easing, overshoot, blur, 20ms stagger changes.

Do not tune tier 5 while tier 1 differs. Local polish cannot repair a different
storyboard.

A useful diagnostic sentence is: **"At thumbnail size, what is the largest
structural difference?"** That is usually the next fix.

## Validate at normalized phases

Compare the goal and output at the same narrative phase, not merely at the same
wall-clock second. Use 8–12 samples including:

- 0% opening pose;
- first visible change;
- frame/hero established;
- 25%, 50% and 75% narrative progress;
- payoff;
- 99% seam pose.

For a seekable HTML scene:

```bash
node scripts/export.mjs assets/scene.html --formats sheet \
  --seconds 10.2 --samples 12 --out work/scene-review
```

The output includes a PNG board and JSON timestamps. Place it beside the video
board and compare each axis from the fidelity contract.

Standalone HTML deliverables must expose a deterministic seek hook. A simple
WAAPI page can support `?t=4.2` by pausing every animation and assigning the same
cycle-relative `currentTime`; also expose `window.__ready = true`. "Looks right
while playing" is not a substitute for inspectable frames.

## Reference review gate

Do not deliver until all are true:

- [ ] Match mode and lock/adapt decisions are explicit
- [ ] One complete reference cycle is isolated from the recording
- [ ] Hero count, bounds, alignment and focal path match the contract
- [ ] Opening, information-rich, payoff and 99% poses compare cleanly
- [ ] Material has not been generically "upgraded" away from the reference
- [ ] Accent color keeps the same semantic job throughout the cycle
- [ ] The HTML opens from `file://` if the deliverable is one standalone file
- [ ] `?t=N` or the scene's documented seek hook freezes deterministic frames
- [ ] The reduced-motion still is information-rich, not the empty opening pose
- [ ] The loop seam is inspected at 99% → 0%, not assumed from code
