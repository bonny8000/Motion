# Visual foundations for motion systems

## Contents

- Role-first model
- Color roles
- Typography roles
- Spacing and density
- Radius and connected geometry
- Elevation and material
- Gradients and texture
- Component aliases
- Theme completeness
- Bundled kit themes

## Role-first model

Use literal palette values only to construct roles. Scenes and components consume
roles so a theme can change without rewriting every artifact.

```text
palette/literal -> semantic role -> component alias -> scene exception
```

Examples:

```text
warm-600 -> color-accent -> verified-reveal-accent -> campaign override
neutral-0 -> color-surface -> panel-surface -> reference fidelity override
radius-4 -> radius-tile -> result-card-radius -> none
```

Keep roles separate even when they currently share a value. `color-fg-muted` and
`color-stroke` may look identical today but need independent evolution.

## Color roles

Define a complete relationship, not just a palette:

| Token | Role | Typical consumers |
|---|---|---|
| `color-canvas` | environmental background | stage, export poster |
| `color-surface` | primary object surface | panel, card, container |
| `color-surface-raised` | elevated or active surface | promoted card, overlay |
| `color-fg-primary` | essential text and marks | labels, final values |
| `color-fg-muted` | supporting or pending content | setup rows, annotations |
| `color-fg-subtle` | low-emphasis structure | inactive units, guides |
| `color-fg-disabled` | unavailable or receded content | rejected candidates |
| `color-accent` | focal action or resolved state | verified content, active path |
| `color-accent-soft` | quiet accent field | focus region, status surface |
| `color-stroke` | primary structural line | frame, active connector |
| `color-stroke-subtle` | separators and quiet structure | grid, inactive connector |

Rules:

- Preserve foreground/background contrast at every keyframe.
- Pair status color with label, form, icon, or position.
- Do not use accent for setup if the payoff depends on accent.
- Treat palette colors as exceptions; record their semantic intent locally.
- Verify roles in light, dark, high-contrast, compressed-video, and projector contexts.

## Intent roles — earning a second colour

A single accent forces every scene to say everything in one colour. Followed
across a library, that is exactly what makes a set of clips look like one style
repeated rather than a system applied — every claim, whatever it is, arrives as
the same blue.

The fix is not more colours. It is colours that mean something. This is SEED
Design's model (Apache-2.0, see `NOTICE.md`), which crosses three properties
with a set of functional roles:

**Property** — foreground, background, stroke
**Role** — brand, neutral, positive, critical, warning, informative
**Variant** — `solid` (the mark itself) and `weak` (a field it sits on)

| Token | Says | Reach for it when |
|---|---|---|
| `color-accent` | this is the subject | the default; resolved state, active path |
| `color-positive` | this succeeded, passed, is safe | a check completes, a test passes |
| `color-critical` | this failed, was rejected, is destructive | an error path, a removal, a blocked step |
| `color-warning` | this is uncertain, degraded, needs a look | a soft failure, a limit approached |
| `color-informative` | this is a system state, not a judgment | neutral status, a note, a hand-off |
| `color-magic` | this was generated rather than authored | AI output, an inferred result |

Each has a `-weak` companion for the surface behind it — a tinted band, a
highlighted row — so a state can be shown without a saturated block dominating
the frame.

**The rule that keeps this from becoming decoration:** a scene earns a second
colour when it is making a second **claim**, not when it has a second element.
Two lanes racing are still one claim (*this one is faster*) and should differ by
emphasis, not hue. A lane that *fails* while another *succeeds* is two claims,
and that is what `critical` and `positive` are for.

Consequences worth stating:

- **Never encode a claim in hue alone.** Roughly 1 in 12 men cannot separate
  the positive and critical roles. Pair colour with position, label, form, or
  motion — the colour is reinforcement, never the carrier.
- **`weak` variants are not "lighter accents".** They are surfaces. Putting a
  `solid` role on a `weak` field of a *different* role produces a state nobody
  can name.
- **Brand is a slot, not a value.** `color-accent` defaults to the informative
  role precisely so a borrowed brand colour never ships by accident.
- **Two roles per scene is usually the ceiling.** Three is a diagram. If a
  scene needs four, the claim is quantitative — load the `dataviz` skill.

For the rare scene with genuinely peer series — lanes, tracks, candidates with
no ranking between them — `HUES` in the kit gives six categorical values per
theme. Peer means *no ranking*: the moment one series matters more, drop back
to emphasis.

## Typography roles

Define type by role and reading behavior:

| Role | Purpose | Motion behavior |
|---|---|---|
| Display | campaign or hero claim | expressive entrance, long hold |
| Message | explanatory sentence | phrase-level reveal, stable payoff |
| State label | current phase or status | fixed slot, short transition |
| Annotation | relationship or detail | follows target, restrained motion |
| Metric | exact value or delta | tabular numerals, deterministic change |
| Micro label | legend or compact key | usually static |

Each role should define family, size, line height, weight, tracking, maximum lines, and
minimum hold. Use responsive `clamp()` for live web text and test localization. Keep
text in the DOM when the deliverable is live HTML.

Avoid changing weight, width, tracking, and position simultaneously. Variable-font
axes are motion channels and need the same semantic justification as translation.

## Spacing and density

Use a small base scale and component aliases:

```text
space-1  4
space-2  8
space-3  16
space-4  24
space-5  32
space-6  48
```

For large canvases, use these values for internal component relationships and derive
scene margins from canvas size. Do not stretch component padding proportionally with
resolution.

Define density profiles:

| Density | Content | Motion |
|---|---|---|
| Compact | more items, smaller gaps | shorter travel and stagger |
| Comfortable | default explanatory density | default tokens |
| Spacious | fewer, larger objects | longer holds and stronger focal contrast |

Use attributes or explicit scene options for core density behavior. Container style
queries may progressively enhance local behavior, but do not rely on them when broad
runtime compatibility is required.

## Radius and connected geometry

Define primitive radii and semantic component roles:

```text
radius-xs    technical bars and tiny indicators
radius-sm    rows and compact controls
radius-md    tiles and nested surfaces
radius-lg    hero panels and editorial surfaces
radius-full  pills, dots, circular controls
```

Connected geometry rules:

- Derive inner radius from outer radius minus inset.
- Keep morphing corners concentric through size changes.
- Use the same radius role for equivalent components across states.
- Do not mix sharp and soft geometry without a state or material reason.
- Preserve visible stroke weight during slow or held scaling.

The kit exposes `radiusPanel`, `radiusCode`, `radiusRow`, `radiusTile`, and `radiusBar`
so themes can alter geometry without scene-level hard-coded values.

## Elevation and material

Use elevation to encode hierarchy, not quality.

| Level | Meaning | Treatment |
|---|---|---|
| 0 | diagrammatic or resting | no shadow, direct stroke or contrast |
| 1 | active or grouped | restrained soft shadow or surface contrast |
| 2 | temporary focal overlay | stronger shadow, short duration, clear return |

Avoid animating large shadows every frame. Use opacity, transform, or a precomposed
shadow layer when possible. In forced-colors and print-like contexts, ensure borders or
structure survive without shadow.

Material profiles should bind surface, stroke, geometry, elevation, and motion:

- flat: tight radii, no shadow, precise transforms;
- soft: concentric rounded surfaces, restrained elevation, soft settle;
- technical: linework and measured rhythm;
- editorial: high type contrast, spacious composition, longer holds.

## Gradients and texture

Use gradients for light, depth, flow, or brand atmosphere. They must not replace
semantic status.

- Prefer predefined gradient roles to arbitrary scene gradients.
- Interpolate in `oklab` or `oklch` when the browser policy allows it.
- Provide a solid-color fallback and inspect video banding.
- Keep moving gradients slow and low contrast; disable decorative travel in reduced mode.
- Use texture sparingly and keep it stable during semantic changes.
- Isolate blend modes so they do not alter unrelated component colors.

## Component aliases

Components should consume aliases, not foundations directly:

```css
.result-card {
  --result-card-bg: var(--color-surface);
  --result-card-fg: var(--color-fg-primary);
  --result-card-radius: var(--radius-tile);
  --result-card-enter-duration: var(--motion-enter-primary-duration);
  --result-card-enter-ease: var(--motion-enter-ease);
}
```

This extra tier is useful when a component's design changes independently of the global
theme. Small systems may skip explicit variables in code, but the conceptual mapping
must still be documented.

## Theme completeness

A theme is ready only when all of these are defined and reviewed together:

- canvas, surface, raised surface;
- primary, muted, subtle, and disabled foreground;
- accent, soft accent, status colors;
- primary and subtle stroke;
- display, message, label, annotation, and metric type;
- spacing and density;
- panel, row, tile, and control radius;
- elevation levels;
- gradient and texture policy;
- calm, precise, and expressive motion mappings;
- reduced and static behavior.

Review themes on at least one object transition, status component, collection pattern,
kinetic-text pattern, and reduced-motion still. A palette preview alone is insufficient.

## Bundled kit themes

`lib/kit.js` includes:

- `reference` — cool, flat, diagrammatic; preserves existing source fidelity;
- `studioLight` — light neutral canvas, warm accent, concentric rounded geometry,
  restrained elevation;
- `studioDark` — deep neutral canvas, warm accent, soft structural depth.
- `seedLight` / `seedDark` — neutral and intent roles mapped from SEED Design's
  shipped tokens; the pair to reach for when a clip has to sit inside a product
  built on that system and look like the same hand made both.

`MOTION_PROFILES.seed` carries the matching curves and durations. Take the
curves freely; take the durations only for product-embedded work. SEED's scale
tops out at 300ms because it is tuned for motion a user *triggers*, where
waiting is the cost. In an explainer the viewer only watches, a 150ms beat
reads as a flicker — `calm` is almost always the right profile there.

**On the brand colour.** `seedLight`/`seedDark` do not ship SEED's brand
orange. It is a Karrot brand resource under the trademark terms in their
NOTICE, outside the Apache grant, so `colorAccent` defaults to the informative
role instead. Set it yourself if you hold the rights.

Use `assets/scene-system-showcase.html` as the visual smoke test for role tokens and
component aliases. Treat these themes as starting systems. A real product or brand
should supply its own complete role map rather than changing only `colorAccent`.
