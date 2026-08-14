# Art direction and layout for motion graphics

## Contents

- Art-direction frame
- Canvas and safe areas
- Composition and hierarchy
- Typography
- Color and state
- Geometry and material
- Camera and depth
- Responsive compositions
- Style review

## Art-direction frame

Before storyboarding, write six decisions:

```yaml
art_direction:
  audience: technical decision makers
  tone: calm, precise, optimistic
  representation: abstract system with restrained UI cues
  focal_strategy: one centered hero with fixed label zone
  material: flat with one depth level for active state
  character: fast departure, soft settle, no bounce
```

Derive these choices from the product or brand system. If a goal clip exists, use
`reference-fidelity.md` and record whether each choice is locked, adapted, or replaced.

## Canvas and safe areas

Define a master composition and destination crops before building.

| Destination | Common frame | Safe-area concern |
|---|---|---|
| Product hero | 16:9, 3:2, or responsive | copy and controls may share the viewport |
| Slide or deck | 16:9 | title, footer, and presenter overlays |
| Square social | 1:1 | aggressive side crop from widescreen |
| Vertical social | 9:16 | UI overlays at top and bottom |
| Embedded card | variable | small size and low detail tolerance |

Use a design-safe zone for essential objects and a crop-safe zone for supporting
decoration. Keep payoff content inside the intersection of required aspect ratios.
Do not solve responsive output by uniformly scaling a dense widescreen composition.

## Composition and hierarchy

- Choose one primary focal object or relationship per beat.
- Reserve a stable region for labels so reading does not chase the animation.
- Align related objects to shared edges, centers, baselines, or paths.
- Use negative space to separate semantic groups.
- Make entrances originate from their cause or container.
- Keep ambient motion outside the focal path and below primary contrast.
- Hold the payoff in the clearest composition, not merely the final timestamp.

Use a simple focal-path notation during storyboarding:

```text
source-left -> hero-center -> outcome-center -> status-top
```

If the eye must jump to unrelated corners in successive beats, redesign the layout or
add a continuity object.

## Typography

Treat type as a component with content limits and localization behavior.

- Use one stable hierarchy: message, state label, annotation, optional metric.
- Keep state labels to one or two words when possible.
- Give moving text a readable rest before and after motion.
- Avoid transforming text while it must be read.
- Preserve baseline, alignment, and container width during word replacement.
- Test the longest expected translation and right-to-left layouts.
- Use tabular numerals for counters and metrics.
- Do not rasterize essential text in live web deliverables.
- Provide captions or text equivalents when motion carries narration.

For kinetic typography, animate semantic units—phrase, word, or number—rather than
letters by default. Letter-level choreography is an expressive exception and must
still preserve the complete message in the payoff frame.

### No title unless it was asked for

**Do not put the topic name on the artifact by default.** A clip almost always
arrives somewhere that already names it — a slide with a heading, a doc section,
a figure caption, a deck built around the term. Repeating it inside the frame
duplicates what the surroundings say, spends the largest type in the composition
on the one thing the viewer already knows, and shrinks the subject to make room.

Set a title only when the request asks for one, or when the artifact genuinely
travels alone with nothing around it to name it — a standalone social post, a
looping screen with no caption. If in doubt, leave it out; adding one later is a
single element, while a composition designed around a title has to be re-laid
out to remove it.

The same restraint applies to a subtitle or a caption track. Diegetic text is
different and stays: labels *inside* the depicted thing (an axis, a target, a
readout, a message in a chat) are content, not narration about content.

## Color and state

Assign color roles before choosing values:

| Role | Meaning |
|---|---|
| Canvas | environmental baseline |
| Surface | object or container body |
| Content-primary | readable information |
| Content-muted | pending, supporting, or unverified information |
| Accent | focal action or verified state |
| Success/warning/error | status with noncolor reinforcement |
| Connector | relationship without competing with content |

Do not spend accent color during setup if the payoff depends on accent. Pair status
color with labels, shape, icon, pattern, or position. Test contrast at every keyframe,
not only the start and end.

When matching a reference, preserve palette relationships—contrast, temperature,
saturation, role—before copying exact values.

## Geometry and material

Define a small geometry set:

- outer container radius;
- inner surface radius;
- control radius;
- stroke weight;
- spacing rhythm;
- one or two depth levels;
- connector thickness and endpoint style.

Keep nested radii concentric. Let inner radii derive from outer radius minus inset.
Avoid mixing sharp, pill, and soft-card geometry without semantic reason.

Choose one material profile per scene:

- **Flat** — solid fills, minimal depth, diagrammatic precision.
- **Soft** — subtle elevation, rounded surfaces, product-like warmth.
- **Technical** — linework, grids, measured states, restrained color.
- **Editorial** — larger typography, bolder crops, deliberate transitions.
- **Spatial** — perspective and depth used to explain structure, not decorate it.

Material affects motion. Flat systems favor masks, paths, and direct transforms;
soft systems can use restrained elevation and settles; technical systems need exact
alignment and cadence; editorial systems need stronger holds and focal contrast.

## Iconography and illustration

- Preserve stroke weight during visible scale changes when it matters.
- Morph icons only when the relationship between states is obvious.
- Keep illustration texture stable through transitions.
- Avoid mixing outlined and filled states unless fill communicates completion.
- Use path drawing for construction or connection, not as a default entrance.
- Make particle count and randomness deterministic for frame-exact export.

## Camera and depth

Camera motion changes the viewer's frame of reference and should be rare in explanatory
product motion.

Use it when the claim depends on scale, spatial relationship, or discovery. Prefer
object movement and masks when the scene can stay anchored.

If camera movement is necessary:

- establish the world before moving;
- keep one stable anchor in view;
- move on one primary axis at a time;
- avoid sudden reversals and continuous orbit;
- lower contrast or speed for large-field movement;
- provide a no-camera reduced variant;
- hold after arrival before the next semantic event.

Depth must communicate hierarchy or assembly. Do not add parallax to a flat reference
or a simple state change merely to make it feel premium.

## Responsive compositions

Define behavior by hierarchy rather than coordinate scaling:

| Wide | Compact |
|---|---|
| side-by-side comparison | stacked tracks with shared alignment |
| peripheral annotations | inline or sequential annotations |
| longer travel | shorter, contained travel |
| simultaneous secondary detail | progressive disclosure |
| fixed labels beside hero | fixed labels above or below hero |

For each breakpoint, record:

- retained focal object;
- reading and motion order;
- hidden or deferred supporting detail;
- token aliases that change;
- crop and safe-area behavior;
- reduced-motion still.

Do not change the causal story across breakpoints. Compact layouts may serialize events,
but the same trigger, object, and payoff must remain recognizable.

## Style review

At opening, development, payoff, and seam, ask:

- Is the focal object unmistakable?
- Does the composition support the current claim rather than a future beat?
- Are text and status readable at this exact frame?
- Are geometry and material consistent?
- Does color preserve semantic meaning?
- Is every depth or camera change necessary?
- Does the frame survive required crops and compact layouts?
- Would a still image of the payoff explain the intended result?

Use `house-style.md` for the bundled abstract-skeleton palette and curves, and
`polish.md` for expressive choreography. Project or reference art direction takes
precedence over those defaults.
