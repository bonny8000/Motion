# Motion system foundations

## Contents

- System model
- Principles
- Motion profiles
- Token architecture
- Semantic timing
- Easing, distance, emphasis, and stagger
- Narrative timing
- Runtime theme contract
- Token handoff

## System model

Build motion in seven layers. Each layer should constrain the next:

1. **Principles** — what motion must communicate and how it should feel.
2. **Primitives** — raw duration, curve, distance, scale, opacity, blur, and delay values.
3. **Semantic tokens** — values named by purpose, such as `enter-supporting` or `exit-primary`.
4. **Components** — stateful motion contracts for objects, labels, containers, and indicators.
5. **Patterns** — coordinated components that express a recurring claim or transition.
6. **Compositions** — scene-specific timing, content, and art direction.
7. **Governance** — ownership, testing, versioning, migration, and exceptions.

Do not skip from raw values to scenes. A system becomes reusable when a designer can
choose a semantic role without inventing new timing or easing.

## Principles

Use five principles as default decision tests:

### Purposeful

Motion must reveal state, causality, hierarchy, continuity, progress, or character.
If removing it preserves the same understanding and tone, remove it or simplify it.

### Continuous

Preserve object identity across changes. Move, reshape, mask, or transform a shared
object before crossfading unrelated replacements. Make origins and destinations
legible.

### Directed

Guide attention in one intentional order. Primary motion leads; supporting motion
follows; ambient motion never competes with the message.

### Rhythmic

Use contrast between holds, actions, and settles. Avoid equal spacing and equal
duration everywhere. A sequence needs punctuation, not a metronome.

### Comfortable

Keep motion optional and bounded. Avoid unnecessary camera travel, large-field
scaling, repeated oscillation, flashing, and peripheral motion. Provide a meaningful
static or simplified equivalent.

## Motion profiles

Define a profile before choosing values. A profile is a small set of decisions that
connects brand character to implementation.

| Dimension | Quiet/productive | Balanced | Expressive/editorial |
|---|---|---|---|
| Attention | local and brief | one clear focal path | deliberate focal contrast |
| Travel | short, contained | moderate | larger only for key beats |
| Easing | crisp, low overshoot | smooth with soft settle | shaped, asymmetric, occasional overshoot |
| Stagger | minimal | short directional cascade | rhythmic groups |
| Depth | flat | restrained layering | depth as narrative emphasis |
| Loops | rare | status or hero only | authored loop with clear rest |

Choose one primary profile per product or campaign. Allow a secondary expressive
mode for milestones, launches, or hero communication; do not mix profiles randomly
inside one sequence.

Record the profile as:

```yaml
motion_profile:
  name: calm-technical
  principles: [purposeful, continuous, directed, comfortable]
  density: compact
  spatiality: contained
  character: precise-with-soft-settle
  emphasis_limit: one-primary-event-per-beat
  reduced_motion: dissolve-and-state-swap
```

## Token architecture

Use three token tiers.

### Primitive tokens

Raw values are implementation material, not authoring choices:

```css
:root {
  --motion-time-1: 80ms;
  --motion-time-2: 140ms;
  --motion-time-3: 220ms;
  --motion-time-4: 360ms;
  --motion-time-5: 560ms;
  --motion-time-6: 800ms;

  --motion-distance-1: 4px;
  --motion-distance-2: 8px;
  --motion-distance-3: 16px;
  --motion-distance-4: 32px;
  --motion-distance-5: 64px;

  --motion-scale-subtle: 0.98;
  --motion-scale-emphasis: 1.04;
  --motion-opacity-muted: 0.56;
}
```

Tune primitives to the brand and destination. Large canvases often need relative
travel, such as 2–8% of the short canvas edge, rather than literal UI distances.

### Semantic tokens

Name usage, not speed:

```css
:root {
  --motion-feedback-duration: var(--motion-time-2);
  --motion-enter-supporting-duration: var(--motion-time-3);
  --motion-enter-primary-duration: var(--motion-time-4);
  --motion-exit-duration: var(--motion-time-3);
  --motion-transform-duration: var(--motion-time-4);
  --motion-emphasis-duration: var(--motion-time-5);
  --motion-scene-transition-duration: var(--motion-time-6);

  --motion-enter-ease: cubic-bezier(0.16, 1, 0.3, 1);
  --motion-exit-ease: cubic-bezier(0.7, 0, 0.84, 0);
  --motion-standard-ease: cubic-bezier(0.65, 0, 0.35, 1);
  --motion-linear-ease: linear;
}
```

### Component tokens

Alias semantic tokens at the component level. This makes later system updates safe:

```css
.motion-label-cue {
  --duration: var(--motion-enter-supporting-duration);
  --ease: var(--motion-enter-ease);
  --offset: var(--motion-distance-2);
}
```

Do not expose primitive tokens in scene code unless the behavior is a documented
exception.

## Semantic timing

Use duration as a consequence of role, size, distance, and information load.

| Role | Default band | Notes |
|---|---:|---|
| Immediate feedback | 80–160ms | acknowledge input; do not delay response |
| Supporting enter/exit | 140–280ms | small labels, indicators, secondary objects |
| Primary transform | 280–560ms | preserve continuity; allow the change to be read |
| Scene transition | 480–900ms | large field or hierarchy change |
| Expressive emphasis | 560–1200ms | rare, important, and followed by a hold |

These bands apply to local movements, not the full explanatory narrative. An
8–20 second concept loop should use normalized beat windows, described below.

Increase duration when the object is larger, travels farther, carries more meaning,
or must remain readable during motion. Shorten it for repeated actions, exits, and
supporting elements. Do not make every event longer simply because the canvas is
large.

## Easing

Choose easing by lifecycle:

| Lifecycle | Curve behavior | Use |
|---|---|---|
| Enter | fast departure, gentle arrival | new visible objects and user-triggered responses |
| Exit | gentle departure, fast finish | objects leaving permanently |
| Standard | accelerate then decelerate | repositioning or resizing visible throughout |
| Linear | constant rate | scans, progress, rotation, continuous measurement |
| Expressive settle | decisive travel with one restrained settle | major reveal or brand moment |

Avoid decorative bounce by default. Overshoot must explain elasticity, energy, or
brand character, and should settle once. Use the curve set and physicality guidance
in `motion-craft.md` and `polish.md`.

## Distance and direction

- Use the smallest travel that communicates origin and destination.
- Align direction with reading order, spatial cause, or navigation hierarchy.
- Keep supporting entrances within the parent container.
- Use larger travel only for top-level transitions or deliberate editorial reveals.
- Replace large-axis movement with opacity, masking, or state swaps in reduced mode.
- Avoid simultaneous travel in conflicting directions unless comparison is the claim.

## Emphasis

Create emphasis with one primary variable at a time:

- scale for importance or energy;
- opacity for presence;
- color for state or verification;
- blur for focus only when accessibility and performance allow it;
- depth for hierarchy;
- path or position for causality.

Do not change scale, color, blur, depth, and position together unless the event is a
rare scene-level transformation. Supporting objects should use less distance, less
contrast, or shorter duration than the primary object.

## Stagger and choreography

Use stagger to reveal structure, not decorate lists.

- Keep local offsets in the 20–80ms range for UI-like groups.
- For editorial or hero sequences, define stagger as 1–4% of the loop.
- Cap the cascade so the last item does not feel delayed from the cause.
- Group homogeneous items; separate semantic groups with a hold.
- Let related objects land together when simultaneity communicates completion.
- Vary offsets only when the direction or hierarchy is meaningful and deterministic.

## Narrative timing

For explanatory loops, author in normalized phases so duration can change without
breaking the story:

| Phase | Typical window | Purpose |
|---|---:|---|
| Establish | 0–8% | show the readable starting state |
| Trigger | 8–18% | make the cause visible |
| Development | 18–62% | reveal mechanism and continuity |
| Payoff | 62–82% | make the benefit unmistakable |
| Hold | 82–92% | allow comprehension and capture |
| Return | 92–100% | reset through continuity or visual emptiness |

These are starting ranges, not fixed rules. Reference evidence and content complexity
override them. Every loop still needs an explicit opening, payoff, hold, and seam.

## Runtime theme contract

`lib/kit.js` implements the same role-first principle used by mature visual systems:
foundations define reusable roles, themes change role values, material changes geometry
and depth, components consume aliases, and a scene may add explicit exceptions.

```js
import { createScene, shapes, beats } from '../lib/kit.js';

const scene = createScene({
  theme: 'studioLight',
  motion: 'calm',
  card: { w: 1240, h: 600 },
  tokens: {
    colorAccent: '#7c5cff',       // semantic project override
    fontSizeLabel: '30px',        // component-facing foundation override
  },
});
```

Bundled themes:

| Theme | Character | Use |
|---|---|---|
| `reference` | flat, cool, diagrammatic | supplied reference fidelity and existing scenes |
| `studioLight` | warm accent, light surfaces, restrained depth | polished product and editorial explainers |
| `studioDark` | dark neutral surfaces, warm accent, soft depth | launch, presentation, and dark product contexts |

Bundled motion profiles:

| Profile | Character | Use |
|---|---|---|
| `calm` | deliberate, soft settle | default product communication |
| `precise` | compact, technical, fast | dense or system-oriented diagrams |
| `expressive` | longer contrast and stronger stops | rare hero and brand moments |

Prefer `theme`, `motion`, and semantic `tokens` over literal style overrides. The kit
still accepts legacy `bg`, `card`, `accent`, `barA`, `label`, and radius keys so existing
scenes remain compatible, but new scenes should not author against those names.

Treat themes as complete role maps. If a new theme changes canvas without checking
foreground, stroke, surface, accent, depth, and status relationships, it is incomplete.

## Token handoff

Provide tokens in both human and machine-readable form when building a system:

1. a table with name, value, semantic role, and examples;
2. CSS custom properties, JSON, or the target platform's token format;
3. component aliases showing how tokens are consumed;
4. reduced-motion aliases;
5. a changelog entry whenever meaning or value changes.

Keep token naming stable. Change primitive values without renaming semantic tokens
when the usage remains the same. Rename or deprecate a token when its meaning changes.

## External foundations

Use these as comparative references, not as values to copy blindly:

- [Material Design 3 motion](https://m3.material.io/styles/motion/overview/how-it-works)
- [Carbon motion](https://carbondesignsystem.com/elements/motion/overview/)
- [Fluent 2 motion](https://fluent2.microsoft.design/motion)
- [Apple motion guidance](https://developer.apple.com/design/human-interface-guidelines/motion)
