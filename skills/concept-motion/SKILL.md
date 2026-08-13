---
name: concept-motion
description: Design, standardize, build, and audit motion-graphic systems and short explanatory animations. Use for product hero loops, animated diagrams, brand motion, motion tokens, choreography, transitions, kinetic type, data or system visualizations, reference matching, motion design-system documentation, reduced-motion behavior, or frame-exact HTML/video/GIF delivery. Trigger when users ask to animate a concept, explain a feature through motion, define reusable motion foundations or components, reproduce a motion reference, or make motion across a product or brand feel consistent.
---

# Concept Motion

Treat motion as a designed system, not a collection of effects. Make every movement
explain state, causality, hierarchy, continuity, or brand character. Preserve the
existing seekable HTML pipeline for implementation and export, while using the
references in this skill to create reusable foundations and component contracts.

## Start by classifying the request

Inspect the supplied brief, files, reference media, and destination. Establish:

- the one claim or state change the viewer must understand;
- whether this is a one-off scene, a reusable pattern, or a full motion system;
- the destination: controlled web, embedded video, slide, social, mobile, or review;
- the representation register: interface, abstract system, data, spatial object, or type;
- the available brand system: palette, type, geometry, iconography, tone, and sound;
- whether a goal clip defines visual grammar or merely mood;
- accessibility, runtime, file-size, network, and authoring constraints.

Do not choose a library or scaffold before these decisions. If the claim is
quantitative or static, recommend a chart, diagram, or interactive flow instead of
forcing it into animation. If the viewer must reproduce exact steps in the real
product, recommend a screen recording.

Sequential does not by itself mean "not animation". A tour of what a product can
do, shown inside one interface, is a **walkthrough** — it is neither a chart nor a
tutorial, and `references/ui-walkthrough.md` covers it. Refuse a step-by-step brief
only when the viewer must reproduce the steps, not merely because it has steps.

## Route to the right system layer

| Need | Read first | Use it to produce |
|---|---|---|
| Define principles, tokens, or motion language | `references/system-foundations.md` | motion profile and semantic tokens |
| Define visual roles, themes, type, spacing, radius, or elevation | `references/visual-foundations.md` | complete visual theme and component aliases |
| Create or reuse a transition, behavior, or narrative pattern | `references/component-patterns.md` | component contract or beat pattern |
| Set composition, typography, color, material, or brand character | `references/art-direction-and-layout.md` | art-direction frame and layout rules |
| Translate an idea into an explanatory mechanism | `references/intent-to-mechanism.md` | claim, representation, mechanism |
| Tour several capabilities inside one legible interface | `references/ui-walkthrough.md` | stylized-UI walkthrough, persistent chrome |
| Match supplied motion evidence | `references/reference-fidelity.md` | fidelity contract and comparison board |
| Preserve object meaning across beats | `references/semantic-continuity.md` | object ledger and causal beat sheet |
| Implement with the reusable kit | `references/mechanisms.md` | scene assembled from shapes and beats |
| Implement with Motion or React | `references/motion-track.md` | seekable timeline with explicit resets |
| Tune feel and dramatic structure | `references/polish.md`, then `references/motion-craft.md` | polished motion and craft review |
| Make it accessible, responsive, performant, and shippable | `references/accessibility-delivery-qa.md` | reduced mode, test matrix, deliverables |
| Turn one-off work into a maintained system | `references/adoption-and-governance.md` | inventory, migration, versioning, ownership |

When several rows apply, read only the references needed for the current phase.
Keep detailed knowledge in references rather than copying it into the output.

## Workflow

### 1. Frame the communication job

Write a single sentence in the form:

`When <trigger>, <object> changes from <before> to <after>, so the viewer understands <benefit>.`

Name the audience, destination, duration, aspect ratios, loop behavior, and success
signal. Separate product truth from visual metaphor. Do not animate a metaphor that
implies capabilities the product does not have.

### 2. Lock evidence and system decisions

If reference media exists, read `references/reference-fidelity.md`, create a
reference board with `scripts/reference-board.mjs`, and declare which traits are
locked, adapted, or intentionally replaced.

For a system-level request, define a motion profile from
`references/system-foundations.md`: principles, semantic timing, easing, distance,
emphasis, stagger, loop, and reduced-motion tokens. Brand and destination may
override defaults, but record the reason.

### 3. Choose the mechanism and objects

Read `references/intent-to-mechanism.md`. Select a mechanism that directly depicts
the claim: transform, narrow, compare, emit, connect, sequence, accumulate, reveal,
or loop. Then read `references/semantic-continuity.md` and make an object ledger.
Every visible object must have a meaning, cause, state, and destination.

### 4. Specify the pattern before implementation

Use the contract in `references/component-patterns.md`. For a scene, write a causal
beat sheet with trigger, shared object, state change, feedback, token choice, and
reduced-motion equivalent. Confirm structural or material changes before markup;
timing polish cannot repair an incorrect story.

### 5. Select the implementation track

| Constraint | Track |
|---|---|
| Reusable scene source and deterministic export | `lib/kit.js` + a copied kit scene |
| Legible product or CLI walkthrough | `lib/kit.js` `ui*` shapes + `references/ui-walkthrough.md` |
| Single offline HTML or unknown network/CSP | inline Web Animations API |
| Simple continuous progression | `assets/scene-template.html` CSS clock |
| Interactive React motion | Motion track in `references/motion-track.md` |
| Editable native mobile asset | carry the spec and beat sheet to a Lottie/Rive workflow |
| Video, slide, or async handoff | export MP4; use GIF only when video is unsupported |

Do not call a module-based scene self-contained. A file importing `../lib/kit.js`
must be served or bundled. Prefer a zero-network track when the runtime is unknown.

### 6. Build with deterministic time

- Make seeking to time `t` always produce the same frame.
- In kit scenes, call `beats.reset` first and use absolute `at` values.
- In CSS-clock scenes, derive state from one shared progress variable.
- Keep scenes thin; promote reusable shapes, beats, and tokens to the kit.
- Preserve semantic continuity through shared objects instead of unrelated fades.
- Provide a representative still or simplified transition for reduced motion.

### 7. Verify the system and the artifact

Run the gates in `references/accessibility-delivery-qa.md`.

For a scene:

1. serve it in a real browser and fail on console or request errors;
2. export an 8-12 frame contact sheet;
3. inspect opening, midpoint, payoff, and seam at full resolution;
4. run `scripts/layout-audit.mjs` at critical times;
5. compare normalized phases with the goal board when a reference exists;
6. test representative breakpoints and reduced motion;
7. export only the destination formats that are required.

For a system:

1. check that every component uses semantic tokens rather than arbitrary values;
2. verify each pattern has default, variant, exit, interrupt, and reduced states;
3. test representative components across sizes, input modes, and content lengths;
4. document ownership, versioning, adoption, and deprecation rules.

### 8. Show the result

Deliver the actual scene, motion specification, token set, component contract, or
review board. State what is reusable, what is scene-specific, and what remains a
deliberate exception. Do not hand off only a prose description when an artifact was
requested.

## Source-of-truth order

Resolve conflicts in this order:

1. user intent and product truth;
2. accessibility and destination constraints;
3. observed reference evidence and the declared fidelity contract;
4. the project or brand motion profile;
5. component contracts and semantic tokens;
6. house defaults and generic craft advice.

Generic polish never overrides observed evidence or product meaning.

## Bundled resources

- `references/system-foundations.md` — system layers, principles, token model, motion profiles.
- `references/visual-foundations.md` — role-based color, type, spacing, radius, elevation, and themes.
- `references/component-patterns.md` — reusable component contract and pattern catalog.
- `references/ui-walkthrough.md` — the stylized-UI register: legible interface tours, persistent chrome, step choreography.
- `references/art-direction-and-layout.md` — composition, typography, color, material, camera.
- `references/accessibility-delivery-qa.md` — comfort, responsive behavior, performance, export, QA.
- `references/adoption-and-governance.md` — inventory, migration, contribution, versioning, ownership.
- Existing craft references — intent, fidelity, continuity, mechanisms, polish, motion craft, and Motion implementation.
- `lib/kit.js` — reusable stage, shape, and beat implementation.
- `assets/` — known-working kit, WAAPI, and CSS-clock scenes.
- `assets/scene-system-showcase.html` — role-token, studio-theme, and component-registry example.
- `assets/scene-ui-walkthrough.html` — stylized-UI walkthrough: four capabilities, one persistent frame.
- `scripts/reference-board.mjs` — normalized evidence board from goal media.
- `scripts/export.mjs` — serve, seek, capture, review sheet, and encode.
- `scripts/layout-audit.mjs` — keyframe layout and collision gate.

Copy a scene before adapting it. Extend shared resources only when the new behavior
will serve more than one scene or product.
