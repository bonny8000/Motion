# Accessibility, delivery, and quality assurance

## Contents

- Accessible motion contract
- Reduced-motion modes
- Flashing, vestibular, and cognitive safety
- Responsive and input adaptation
- Runtime and performance budgets
- Delivery formats
- Deterministic review
- QA gates
- Acceptance checklist

## Accessible motion contract

Every component and pattern must preserve meaning when motion is reduced or absent.
Document three outputs:

1. **Full motion** — intended choreography and brand character.
2. **Reduced motion** — same state and causality with less travel, scale, blur, and repetition.
3. **Static** — representative state plus text or structural cues.

Do not treat reduced motion as `animation-duration: 0.01ms` without reviewing the
result. Instant state changes can become confusing, lose causality, or trigger large
layout flashes. Design the reduced behavior explicitly.

Essential information must not rely only on motion, color, sound, or haptics. Use
labels, structure, form, position, or programmatic announcements where appropriate.

## Reduced-motion modes

Choose the least disruptive equivalent that preserves understanding:

| Full behavior | Reduced equivalent |
|---|---|
| Large translation | short local shift or crossfade |
| Scale/zoom | opacity and state swap |
| Blur or depth transition | direct clarity change or border/elevation state |
| Parallax/camera move | fixed camera with sequential reveal |
| Repeated orbit/pulse | static status indicator |
| Spring/bounce | one short eased settle without overshoot |
| Continuous progress | bounded bar, number, or status label |
| Kinetic type | stable full phrase with one restrained emphasis |
| Looping explainer | representative payoff still with play control |

For live web artifacts:

```css
@media (prefers-reduced-motion: reduce) {
  .motion-stage {
    --motion-enter-primary-duration: 120ms;
    --motion-transform-duration: 160ms;
    --motion-distance-active: 0px;
  }

  .ambient,
  .decorative-loop {
    animation: none;
  }
}
```

For exported autoplay video, consider a static poster, user-controlled playback, and
a nonmotion description. A media file cannot respond to system preferences by itself.

## Flashing, vestibular, and cognitive safety

- Do not create content that flashes more than three times in any one-second period.
- Avoid rapid high-contrast alternation and full-field white flashes.
- Avoid sustained oscillation, uncontrolled spinning, and large peripheral movement.
- Minimize zoom, z-axis travel, blur animation, and camera movement in reduced mode.
- Keep automatically repeating motion short, subtle, or controllable.
- Give viewers enough time to read final text and state labels.
- Avoid multiple independent focal events competing in different regions.
- Do not use timed disappearance for essential instructions or outcomes.
- Keep sound optional and pair it with visual or textual feedback.

Follow [WCAG 2.2 Success Criterion 2.3.1](https://www.w3.org/WAI/WCAG22/Understanding/three-flashes-or-below-threshold.html)
and platform guidance such as [Apple accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility/)
for the destination. When in doubt, reduce field coverage, contrast, frequency, and
repetition.

## Responsive and input adaptation

Test motion as a state system, not only as pixels at one canvas size.

- Recompute paths from layout anchors rather than hard-coded coordinates.
- Shorten travel on compact screens while preserving direction and hierarchy.
- Serialize supporting events when compact layouts cannot show them simultaneously.
- Keep touch-triggered feedback immediate and spatially connected to the touch target.
- Keep keyboard and assistive-technology flows equivalent to pointer flows.
- Avoid hover-only meaning.
- Pause or simplify motion when the document is hidden or the component is offscreen.
- Define behavior for orientation changes and container resizing during motion.
- Respect reading direction for entrances, progress, and narrative order.

If an animation cannot safely reflow mid-sequence, restart from a stable semantic state
after resize rather than stretching a partially completed frame.

## Runtime and performance budgets

Set budgets from the destination and verify them on representative hardware.

### Live web

- Prefer transform and opacity for frequent updates.
- Avoid per-frame layout reads followed by writes.
- Limit simultaneous filters, large blurs, masks, shadows, and blend modes.
- Pre-size media and fonts to prevent layout shifts.
- Keep randomness seeded and timelines deterministic.
- Stop ambient work when offscreen or hidden.
- Test frame pacing under CPU throttling and on integrated graphics.
- Treat a stable 30fps as better than an unstable 60fps for noninteractive hero motion.

### Export

- Keep width and height even for H.264.
- Capture at a higher scale when crisp vector-like edges are required, then downsample.
- Match export duration exactly to the loop cycle.
- Use a consistent color profile and inspect gradients after encoding.
- Verify text, strokes, and one-pixel lines at delivery resolution.
- Compare first and last frames and inspect the seam in playback.

Do not invent a universal kilobyte or frame-time budget. Record project-specific values
for initial payload, total asset size, CPU/GPU class, target frame rate, and maximum
time to first meaningful frame.

## Delivery formats

| Destination | Preferred delivery | Required checks |
|---|---|---|
| Controlled web | live HTML/CSS/JS | reduced motion, resize, errors, performance |
| External web embed | MP4, optional WebM | autoplay muted loop, poster, captions/description |
| Slides | MP4 | codec compatibility, crop, playback start |
| Chat/email/wiki | GIF only if video unsupported | palette, size, frame rate, readability |
| Design review | seekable artifact + contact sheet | scrub, timestamps, comparison frames |
| Native mobile | Lottie/Rive/native implementation | platform reduced motion, asset validation |
| Social | platform-safe video | safe areas, compression, loop, cover frame |

Do not call a module-based HTML scene self-contained. Test a single-file deliverable
from `file://` with the network unavailable. Test a hosted deliverable under its actual
content-security policy.

## Deterministic review

A frame at time `t` must be reproducible. This enables export, diffing, and review.

For every scene:

1. expose readiness and seek hooks;
2. pause uncontrolled clocks during capture;
3. seed random values;
4. wait for fonts, images, and modules;
5. fail on console errors and failed network requests;
6. verify sampled frames are not all identical;
7. record loop duration, viewport, scale, and source commit.

Use:

```bash
node scripts/export.mjs assets/scene.html --formats sheet --seconds 12 --samples 12
node scripts/layout-audit.mjs assets/scene.html --times 0.6,4.8,9.4
```

When a goal clip exists, compare matching normalized phases rather than arbitrary
timestamps.

## QA gates

### Meaning gate

- The claim is true and visible.
- Every object has a user-world meaning.
- Cause precedes feedback and benefit.
- Labels use product or audience language.
- The motion does not imply unsupported capability or precision.

### System gate

- Values come from semantic tokens or documented exceptions.
- Components define enter, active, resolve, exit, interrupt, reduced, and static states.
- Shared components behave consistently across scenes.
- New reusable behavior is promoted to the kit or component catalog.

### Visual gate

- Focal path, hierarchy, alignment, geometry, and status color remain clear.
- Opening, midpoint, payoff, and seam survive full-resolution inspection.
- Text remains readable at required sizes and crops.
- No collisions, escaped controls, clipped labels, or accidental off-centering occur.

### Motion gate

- Timing follows semantic role and information load.
- Easing matches lifecycle.
- Stagger reveals structure and remains bounded.
- The payoff holds long enough to understand.
- The loop seam is invisible or deliberate.
- Interrupted and repeated triggers remain coherent.

### Accessibility gate

- Reduced and static modes preserve meaning.
- No essential information relies only on motion or color.
- Flashing, camera, peripheral, blur, and repetitive motion are safe.
- Playback can be paused or avoided when required.
- Text and controls meet the destination's accessibility requirements.

### Technical gate

- Browser console and requests are clean.
- Seeking is deterministic.
- Representative devices meet frame pacing and load budgets.
- Offline/CSP claims are tested under those exact conditions.
- Encoded outputs play in their target surfaces.

## Acceptance checklist

Include this short block in handoff notes:

```text
[ ] Claim and causal beat sheet approved
[ ] Motion profile and semantic tokens applied
[ ] Reference fidelity contract satisfied or exceptions recorded
[ ] Wide, compact, reduced, and static variants reviewed
[ ] Opening, payoff, and loop seam inspected at full resolution
[ ] Console, network, layout audit, and export checks pass
[ ] Delivery format tested in the target surface
[ ] Reusable additions documented; scene-specific exceptions identified
```
