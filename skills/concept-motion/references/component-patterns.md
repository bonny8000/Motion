# Motion components and patterns

## Contents

- Component contract
- Component states
- Primitive catalog
- Registry model
- Component catalog
- Narrative pattern catalog
- Selection matrix
- Example specification
- Promotion and exception rules

## Component contract

A motion component is a repeatable state-change contract, not an animation preset.
Specify every component with these fields:

```yaml
name: verified-reveal
intent: Confirm that generated content became trustworthy.
trigger: Verification completes.
roles: [content, verifier, status-label]
states: [rest, active, resolved, exit, reduced]
timeline: causal sequence or normalized windows
tokens: semantic duration, easing, distance, emphasis, stagger
continuity: which object persists through the change
interrupt: behavior when trigger reverses or repeats
content_limits: supported count, length, and density
responsive: compact and wide behavior
reduced_motion: static or simplified equivalent
failure_conditions: misleading or inaccessible uses
tests: deterministic frames and acceptance criteria
```

Do not approve a component that documents only duration and easing. The contract must
explain meaning, lifecycle, interruption, content limits, and reduced behavior.

## Component states

Every component should define:

- **Rest** — stable state before a trigger.
- **Enter** — how the object becomes present, including origin.
- **Active** — continuous, progress, or attention state if one exists.
- **Resolve** — successful completion and readable hold.
- **Exit** — permanent removal or return to a nearby state.
- **Interrupt** — cancellation, reversal, rapid repeat, or replacement.
- **Reduced** — behavior when motion is minimized.
- **Static** — representative frame for export, loading, or unsupported runtimes.

For noninteractive loops, map these states onto establish, trigger, development,
payoff, hold, and return.

## Primitive catalog

Use primitives as ingredients. Combine them through semantic components rather than
shipping a menu of effects.

| Primitive | Communicates | Guardrail |
|---|---|---|
| Fade | presence or focus | never the sole carrier of object continuity |
| Translate | origin, destination, direction | follow spatial or causal logic |
| Scale | hierarchy, energy, convergence | avoid large-field zoom in reduced mode |
| Mask/reveal | progressive disclosure | reveal from the source or reading direction |
| Morph | identity through shape change | keep anchors and area changes legible |
| Draw/path | connection, construction, route | use deterministic path progress |
| Color/state shift | status or category change | pair color with form, label, or position |
| Blur/focus | depth or attention | provide a no-blur mode and test readability |
| Rotate/orbit | cycle, activity, relationship | avoid indefinite decorative motion |
| Number/type change | measurement or language | preserve reading time and final state |

## Registry model

Organize reusable motion assets into registries so consumers can discover the right
level without copying a whole scene:

| Registry | Contains | Examples |
|---|---|---|
| `foundation` | role tokens and profiles | color roles, duration, easing, spacing, motion profile |
| `primitive` | atomic implementation ingredients | fade, translate, mask, path draw, counter |
| `component` | stateful semantic contracts | object enter, status cue, verified reveal |
| `pattern` | coordinated recurring stories | transform, narrow, race, graph knit |
| `scene` | content-specific compositions | phase spine, field collapse, campaign hero |

The dependency direction is one way:

```text
foundation -> primitive -> component -> pattern -> scene
```

A lower registry must never import a scene-specific value. Consumers may copy a scene
as a starting point, but reusable improvements should be promoted back to the lowest
valid registry.

Use consistent naming:

- foundations name semantic roles: `motion-enter-primary-duration`;
- primitives use verbs: `fade`, `translate`, `draw-path`;
- components use object plus lifecycle: `status-cue`, `verified-reveal`;
- patterns use the communicative mechanism: `field-collapse`, `shared-transform`;
- scenes use the product claim or campaign concept.

## Component catalog

### Object components

| Component | Intent | Default lifecycle |
|---|---|---|
| Object enter | introduce a meaningful entity | origin → settle → hold |
| Object exit | remove or conclude an entity | release → accelerate out |
| Shared-object transform | preserve identity through state change | hold → transform → settle |
| Container transform | connect source and destination surfaces | source bounds → shared bounds → destination |
| Focus handoff | move attention without losing context | current softens as next strengthens |
| Emphasis pulse | mark one exceptional moment | rise → one settle → rest |

### Status components

| Component | Intent | Required feedback |
|---|---|---|
| Progress indicator | show bounded work | origin, direction, completion |
| Indeterminate activity | show ongoing work | nonblocking, non-flashing, stoppable |
| Status label cue | name the current state | stable position and readable hold |
| Verification scan | show inspection and resolution | unverified and verified states differ semantically |
| Success resolve | confirm completion | visible outcome, not celebration alone |
| Error resolve | show failure and next step | persistent message and noncolor cue |

### Content components

| Component | Intent | Required continuity |
|---|---|---|
| Progressive reveal | expose content in sequence | reading order and stable layout |
| Generated line | show content being produced | caret or leading edge follows growth |
| Kinetic heading | introduce or transform a message | text remains legible before and after motion |
| Annotation cue | connect label to object | leader and target share timing |
| Counter change | show measured delta | final value holds; avoid false precision |
| Card/list cascade | reveal collection structure | deterministic, capped stagger |

### Relationship components

| Component | Intent | Required continuity |
|---|---|---|
| Connector draw | reveal a relationship | endpoints exist before or with the path |
| Stream | show ongoing transfer | direction, source, destination, rate |
| Merge | many become one | inputs remain traceable until convergence |
| Split | one becomes many | shared source remains visible through divergence |
| Orbit | show membership or dependency | center meaning and bounded cycle |
| Graph knit | reveal network formation | nodes precede edges; avoid visual noise |

## Narrative pattern catalog

Patterns coordinate several components around one claim.

| Claim | Pattern | Typical components |
|---|---|---|
| X becomes Y | Transform | shared-object transform, state label, resolve |
| Many become a few | Narrow | field, scan/filter, merge, payoff hold |
| A is faster than B | Race | shared trigger, two tracks, synchronized finish comparison |
| One action reaches many | Emission | source, wave/stream, destinations, completion |
| Separate parts connect | Graph knit | nodes, connector draw, network resolve |
| Work advances autonomously | Phase spine | stable hero, generated content, verification, state cues |
| Before differs from after | Wipe/split | shared frame, boundary, paired labels |
| A system learns | Feedback loop | input, processing, changed output, return path |
| Layers form a whole | Exploded stack | ordered layers, depth alignment, assembly resolve |
| A quantity accumulates | Build/count | units, grouping, counter, final scale cue |
| A process branches | Decision path | trigger, branch criterion, selected path, outcome |
| Attention moves through a story | Guided sequence | focal handoffs, annotation cues, holds |

Use `mechanisms.md` for implementation recipes. Do not choose a pattern by visual
appeal; choose the one whose causal structure matches the claim.

## Pattern selection matrix

Score candidate patterns from 0–2 on each criterion:

| Criterion | 0 | 1 | 2 |
|---|---|---|---|
| Claim fidelity | metaphorical or vague | partly direct | directly depicts the change |
| Object continuity | replacement by fade | partial continuity | shared objects stay traceable |
| Label dependence | needs prose | needs short labels | understandable mostly through motion |
| Destination fit | incompatible | requires adaptation | native to runtime and format |
| Accessibility | no equivalent | simplified equivalent | strong static/reduced equivalent |
| Reusability | scene-specific | reusable with edits | stable component/pattern contract |

Reject patterns that score 0 on claim fidelity or accessibility, even if their total
score is high.

## Example: verified reveal

```yaml
name: verified-reveal
intent: Show that a generated result has been inspected and accepted.
trigger: verification-complete
roles:
  content: persistent rows or cards
  verifier: scan frame or focus region
  status-label: Reviewing then Verified
states:
  rest: content is present in neutral styling
  active: verifier advances at a constant readable rate
  resolved: inspected content changes to verified styling and holds
  interrupt: verifier stops; content remains neutral; status becomes Interrupted
  reduced: verifier is removed; content and status swap once with a short dissolve
tokens:
  active-duration: motion-transform-duration
  resolve-duration: motion-enter-supporting-duration
  active-ease: motion-linear-ease
  resolve-ease: motion-enter-ease
failure_conditions:
  - accent color appears before verification
  - scan has no connection to the affected content
  - animation claims verification without product evidence
tests:
  - every row is neutral before the verifier reaches it
  - final state holds long enough to read
  - reduced mode preserves the same status information
```

## Kinetic typography patterns

Use text motion as information architecture:

- **Word replacement** — preserve baseline and container width where possible.
- **Line build** — reveal phrases in reading order, then hold the complete sentence.
- **Semantic emphasis** — move or recolor one meaningful word; keep the rest stable.
- **Type-to-object transform** — use only when the word and object share meaning.
- **Caption cue** — keep a fixed label zone while the visual mechanism changes.

Do not animate every glyph independently unless the letter-level behavior carries the
concept. Protect readability, translation, line wrapping, and reduced motion.

## Data-motion patterns

- Preserve scales and axes when values move.
- Use linear time for constant-rate processes; use eased time for presentation only.
- Distinguish data interpolation from decorative entrance.
- Hold exact values before and after a transition.
- Do not imply causality with sequence alone.
- Avoid racing comparisons that use unequal start times or visual distances.
- Pair color changes with position, label, form, or annotation.

## Promotion and exception rules

Promote a scene behavior into the system when:

1. it appears in at least two independent scenes or products;
2. its intent and states can be named without reference to one feature;
3. it can use semantic tokens;
4. reduced and interrupt behavior are defined;
5. it has deterministic tests.

Keep a behavior scene-specific when it depends on unique content, a campaign concept,
or a fidelity-locked reference decision. Record system exceptions with owner, reason,
scope, and expiry or review date.
