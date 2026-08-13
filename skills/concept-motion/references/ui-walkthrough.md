# UI walkthrough

The stylized-UI register: legible interface mocks that show a sequence of things
a product can do, inside one frame that never moves.

This is the deliberate exception to `house-style.md`. Everything there argues for
anonymous geometry, and those arguments are still correct — they just stop
applying when the interface *is* the claim. Read this before reaching for the
`ui*` shapes, and be honest about which case you are in.

## Contents

- [When this register is correct](#when-this-register-is-correct)
- [What it costs](#what-it-costs)
- [The three rules](#the-three-rules)
- [Component vocabulary](#component-vocabulary)
- [Building one](#building-one)
- [Beat sheet template](#beat-sheet-template)
- [Failure modes](#failure-modes)
- [QA gates](#qa-gates)

## When this register is correct

`intent-to-mechanism.md` lists six representation registers. This one is
**stylized UI** — recognisable but drawn, never a screenshot. Reach for it when
all three hold:

1. **The claim is a capability set**, not a process. "This surface does these
   four things" — a launch clip, a feature tour, a changelog reel, a conference
   demo loop.
2. **The interface is the point.** The viewer is meant to recognise the product
   afterwards. Bars cannot do that.
3. **The specific states carry meaning** — a diff's added and removed lines, a
   mode changing, a control appearing, the product stopping to ask a question.
   Replacing those with grey rectangles deletes the message.

Three neighbouring cases that are **not** this register:

| If… | Do this instead |
|---|---|
| The viewer must reproduce exact steps in the real product | Screen recording. A drawn mock that drifts from shipped UI is worse than no video. |
| The claim is about a *process* — pipeline, search, sync, scale | Abstract geometry. Pick a mechanism from `intent-to-mechanism.md`. |
| Every beat needs a caption to make sense | Write a doc with screenshots. |

The distinction that matters: **a walkthrough shows what a product can do; a
tutorial teaches someone to operate it.** Animate the first. Record the second.

## What it costs

Take these seriously — they are why abstract geometry is the default:

- **It goes stale.** The mock is dated the day the UI changes. Budget for
  re-cutting it, or accept a shelf life measured in months.
- **It has to be localized.** Every string is translatable copy.
- **It dies at small sizes.** 15px monospace is unreadable in a 400px embed and
  mushes under H.264. This register needs ≥720p delivery and a generous crop.
- **It invites literal reading.** Viewers *will* read the code you put on
  screen. It must be real, correct, and not imply capabilities you lack.

If any of those is disqualifying, you are in the wrong register — go back.

## The three rules

**1. The frame never moves.** Chrome — window bar, path, meter, prompt — is
built once and persists across every step. That, not a transition effect, is
what says *one session, several capabilities*. Rebuild the frame per step and
you have four unrelated clips.

**2. One legible surface at a time.** Steps cross-fade with a gap: the outgoing
step is gone before the incoming one arrives. Two readable interfaces on screen
simultaneously is unreadable — the viewer tries to read both and reads neither.
This is the one place a walkthrough deliberately shows nothing. `beats.showStep`
enforces the gap.

**3. Progress only moves forward.** A context meter, step counter or token count
climbs monotonically. A meter that dips implies work was undone — a different
claim than the one you are making.

## Depicting a fluid interface

A drawn interface is judged against interfaces the viewer actually uses. If the
mock moves in ways no real interface moves, it reads as fake even when the
viewer cannot say why. Apple's *Designing Fluid Interfaces* is the ground truth
here; these are the parts that survive the trip into non-interactive motion.

**Springs, sampled.** Apple parameterises springs as **damping ratio** (overshoot:
`1.0` = none) and **response** (how quickly it reaches target, in seconds) —
not mass/stiffness/damping, because those two are the ones you can reason about.
Their shipped values:

| Interaction | Damping | Response | Kit |
|---|---|---|---|
| Move / reposition | `1.0` | `0.4` | `SPRINGS.move` |
| Rotation | `0.8` | `0.4` | `SPRINGS.rotate` |
| Drawer / sheet | `0.8` | `0.3` | `SPRINGS.sheet` |

A live spring cannot be used here: its settle time is emergent and
velocity-dependent, which breaks the absolute-`at` contract and frame-exact
export. `spring({ damping, response })` samples the step response into a plain
easing function with a fixed duration, so you get the shape on a fixed clock.

```js
const { ease, duration } = spring(SPRINGS.sheet);
scene.push([panel, { y: [10, 0] }, { at: 2.15, duration, ease }]);
```

**Bounce is earned.** Overshoot only when momentum preceded the motion — a
flick, a throw, a drag release. A highlight moving under keyboard control, or a
panel that simply appeared, must be critically damped. Decorative overshoot is
physics cosplay and reads as cheap.

**Feedback lands on the press, not the release.** If your walkthrough shows a
control being activated, the state change must appear at the moment of contact.
Showing it after is the single most common tell of a faked interface.

**Feedback is continuous, not terminal.** Anything progressing — a meter, a
generation, a scan — updates throughout, not only at the end.

**Anchor to source.** A panel, popover or menu originates from the thing that
triggered it; set `transform-origin` accordingly. Content arriving from nowhere
severs the causal link the walkthrough is trying to show.

**Mirror reversible paths, continue one-way ones.** A sheet that opens upward
dismisses downward. But a walkthrough only moves forward, so a step leaves in
the direction of travel — reversing it would read as undo. `beats.showStep`
does this.

**Hint in the direction of the outcome.** Intermediate frames should point at
where things are going, so the viewer predicts the end state before it lands.

### What does not transfer

Say this out loud so nobody wires it in: **interruptibility, 1:1 pointer
tracking, velocity handoff, momentum projection and rubber-banding are
meaningless here.** Every one of them exists to absorb live input. An exported
clip has no input to absorb. Borrowing the *feel* of those interactions is
correct; borrowing their machinery adds dependency and non-determinism for
motion nobody can touch.

Typography and material guidance from the same source **does** apply, because
this register renders real type on real surfaces: tighten tracking as type
grows, build hierarchy from weight and leading rather than size alone, and keep
translucent surfaces off other translucent surfaces.

## Component vocabulary

The stylized-UI counterpart to the abstract-skeleton table in `house-style.md`.

| Element | Means | Kit |
|---|---|---|
| Window chrome + path | "a real workspace, one place" | `scene.chrome()` |
| Context meter | cumulative work, only grows | `chrome` + `beats.meterTo` |
| Prompt bar + caret | the user's turn | `scene.promptBar()` + `beats.typeText` |
| Mode slot | the tool's posture changed | `beats.setMode` |
| Echoed instruction | "this is what was asked" | `shapes.uiEcho` |
| Muted status line | the machine narrating itself, quietly | `shapes.uiNote` |
| Diff rows, tinted | what changed, and in which direction | `shapes.diffRows` |
| Tab strip | this sits inside a bigger surface | `shapes.tabStrip` |
| Record rows | a registry, list, or result set | `shapes.recordRows` |
| Option list + highlight | a decision being made | `shapes.optionList` + `beats.selectRow` |

Colour is meaning, not decoration. Added and removed rows are the only places
green and red appear; a status line that takes colour steals attention from the
content it is introducing.

## Building one

Steps stack in one region and cross-fade; chrome sits outside them.

```js
const scene  = createScene({ w: 1600, h: 900, card: { w: 1300, h: 760 } });
const panel  = scene.panel();
const chrome = scene.chrome({ path: 'projects/main', percents: ['79%', '95%'] });
const prompt = scene.promptBar({ top: 668, model: 'grok-4.6',
                                 modes: ['plan', 'ask'], lines: ['do the thing'] });

const step = scene.step({ top: 96 });
const echo = shapes.uiEcho(scene, step, 'do the thing');
const diff = shapes.diffRows(scene, step, [
  { n: 42, text: 'const total = calculateTotal(items);' },
  { n: 43, text: 'if (total <= 0) throw new ValidationError();', state: 'add' },
], { top: 74 });

beats.reset(scene, { panel });                       // always first
beats.typeText(scene, prompt, { at: .8, index: 0, duration: 1.1, hold: 2.05 });
beats.showStep(scene, step, { at: 2.15 });           // pass `out:` for step 2+
beats.revealRows(scene, diff, { at: 2.6 });
beats.meterTo(scene, chrome, { at: 2.6, to: .7, index: 1 });
```

Every string typed by the prompt is declared up front in `lines`. `textContent`
cannot be interpolated, so a bar that rewrites itself at runtime is not
seekable — and seekability is what frame-exact export depends on.

Every `ui*` element registers its own reset when built, so `beats.reset` restores
it without the scene listing them. You still call `beats.reset` first.

## Beat sheet template

Per step, four beats and no more. A walkthrough that gives each capability more
than ~5s stops being a tour.

| Beat | Changes | Says |
|---|---|---|
| ask | prompt types, mode may change | "the user asks" |
| receive | step cross-fades in, instruction echoes | "it heard you" |
| think | one muted status line | "it is working" |
| show | the content reveals, staggered | "here is what it did" |

The stagger on the reveal is doing real work: rows appearing in reading order
say *produced*, all at once says *loaded from a file*.

## Failure modes

- **Chrome rebuilt per step.** Reads as separate clips. Build it once.
- **Two steps visible at once.** Illegible. Keep the gap.
- **Fake or wrong code on screen.** Viewers read it. Broken syntax in a hero
  clip is a credibility bug, not a typo.
- **Every line tinted.** If everything is an addition, nothing reads as one.
  Context rows must outnumber changed rows.
- **A caption explaining each step.** If the step needs prose, the interface
  is not carrying it — either fix the mock or use a different medium.
- **Typing that finishes and just sits there.** The typed line must cause the
  next thing. Type, then act on it.
- **Auto-scaling the mock to fit a small embed.** Below ~720p this register
  fails outright. Re-cut in abstract geometry instead.

## QA gates

In addition to the gates in `accessibility-delivery-qa.md`:

1. **Legibility count** — at every critical time, exactly one step has
   effective opacity > 0.05.
2. **Containment** — no `ui*` element extends past the panel rect.
3. **Monotonic progress** — the meter never decreases across the cycle.
4. **Text truth** — every visible string is real, spelled correctly, and does
   not claim a capability the product lacks.
5. **Crop test** — inspect at the smallest delivery size. If the type mushes,
   the register is wrong for that destination, not the type size.
6. **Reduced motion** — the walkthrough is narrative, so `reduced: 'calm'` is
   correct; cross-fades survive, and only movement keys are stripped.

`assets/scene-ui-walkthrough.html` is the reference implementation and passes
all six.
