# Motion system adoption and governance

## Contents

- Maturity model
- Inventory and audit
- System definition
- Migration from one-off motion
- Contribution workflow
- Versioning and deprecation
- Ownership and review
- Documentation template
- Success measures

## Maturity model

Use this model to choose the next useful investment:

| Level | State | Next move |
|---|---|---|
| 0 — Ad hoc | every scene invents values and behavior | inventory recurring motion and failures |
| 1 — Foundations | principles and tokens exist | define component contracts |
| 2 — Components | common transitions and states are reusable | compose patterns and add tests |
| 3 — Patterns | teams reuse narrative and interaction patterns | automate delivery and governance |
| 4 — Governed | ownership, versioning, adoption metrics, and migrations exist | evolve through evidence |

Do not build an exhaustive library at level 0. Start with the most repeated and costly
behaviors, then promote them when evidence shows reuse.

## Inventory and audit

Collect representative motion from products, campaigns, decks, and prototypes. For
each item record:

```yaml
location: product/feature/surface
purpose: feedback | transition | explanation | status | brand
trigger: user | system | autoplay | scroll | time
object: what persists or changes
values: duration, easing, distance, scale, opacity, stagger
runtime: CSS | WAAPI | Motion | video | Lottie | other
accessibility: reduced and static behavior
quality: meaning, consistency, performance, comfort
reuse_candidate: yes | no | uncertain
owner: team or person
```

Cluster by intent, not by visual effect. Five different fades may represent one
`object-enter` contract, while two visually similar slides may express different
navigation or causal relationships.

Identify:

- duplicated values with different names;
- one name used for different meanings;
- missing lifecycle states;
- repeated exceptions;
- inaccessible or nondeterministic patterns;
- scenes that should remain bespoke.

## System definition

Create system artifacts in this order:

1. motion principles and profile;
2. primitive and semantic tokens;
3. component contracts for the most repeated intents;
4. composition patterns for recurring product claims;
5. reference implementations and test scenes;
6. accessibility, responsive, delivery, and QA requirements;
7. contribution, versioning, migration, and ownership rules.

Keep one source of truth per kind of decision. Tokens hold values; component contracts
hold behavior; patterns hold orchestration; examples demonstrate usage. Do not duplicate
the same rules across all four.

## Migration from one-off motion

### 1. Freeze the existing artifact

Record source, runtime, viewport, duration, dependencies, and representative frames.
Do not refactor without a visual baseline.

### 2. Extract intent and lifecycle

Name the trigger, object, before/after states, feedback, benefit, interruptions, and
reduced equivalent. Remove decorative behavior that has no semantic role.

### 3. Map raw values to semantic tokens

Create a table:

| Existing value | Observed intent | Target token | Action |
|---|---|---|---|
| 320ms | primary object enter | `motion-enter-primary-duration` | replace |
| `ease-out` | supporting label enter | `motion-enter-ease` | replace |
| 48px | scene-specific source travel | none | keep documented exception |

Do not create a new token for every legacy value. Consolidate values that serve the
same purpose and preserve exceptions only when evidence requires them.

### 4. Separate reusable behavior from scene content

Move shared stage, shape, beat, token, and accessibility behavior into the system.
Keep labels, data, claim-specific timing, and fidelity-locked art direction in the
scene.

### 5. Compare before and after

Use deterministic frames at normalized phases. Verify meaning, fidelity, layout,
performance, reduced motion, and seam. A refactor is not successful if it merely uses
tokens but changes the story or visual grammar.

### 6. Deprecate the legacy path

Document replacement, migration steps, deadline, owner, and escape hatch. Remove it
only after known consumers migrate.

## Contribution workflow

Require a proposal when adding or changing a token, component, or pattern:

```yaml
proposal:
  problem: repeated user or production need
  evidence: at least two consumers or one critical platform requirement
  intent: semantic role
  scope: token | component | pattern | implementation
  states: default, variants, interrupt, reduced, static
  API: names and parameters
  examples: representative consumers
  tests: visual, deterministic, accessibility, performance
  migration: affected consumers and replacement path
  owner: accountable maintainer
```

Review in this order:

1. Is the problem real and reusable?
2. Is intent already covered by an existing contract?
3. Does the proposal preserve meaning and accessibility?
4. Can the API remain stable across destinations?
5. Are values semantic rather than scene-specific?
6. Are examples and tests sufficient?

Reject additions based only on novelty or visual preference.

## Versioning

Use semantic versioning for the motion system package or skill:

- **Patch** — bug fix, documentation clarification, performance improvement, or value
  correction that does not materially change perceived behavior.
- **Minor** — additive token, component, pattern, variant, or new delivery track.
- **Major** — renamed or removed tokens, changed semantic meaning, incompatible API,
  or a perceptually significant default change across existing consumers.

Visual changes can be breaking even when code still compiles. Treat a change as major
when it alters timing, hierarchy, spatial meaning, or brand character enough that
consumers need review.

Record for every release:

- added, changed, deprecated, and removed contracts;
- before/after review frames for perceptual changes;
- migration instructions;
- accessibility or platform implications;
- affected reference implementations.

## Deprecation

Mark deprecations in tokens, component docs, and code where possible. A deprecation
notice must include:

- replacement;
- reason;
- first deprecated version;
- planned removal version or review date;
- automated or manual migration steps;
- owner and support path.

Keep deprecated aliases when they are cheap and safe. Remove them when ambiguity,
bundle cost, or maintenance risk outweighs compatibility.

## Ownership and review

Assign roles:

- **System owner** — principles, semantic model, release decisions.
- **Motion design maintainer** — component and pattern quality.
- **Implementation maintainer** — runtime, kit, export, and performance.
- **Accessibility reviewer** — reduced/static behavior and safety.
- **Consumer representative** — adoption evidence and migration feedback.

Review cadence:

- per contribution: contract and technical review;
- per release: visual regression, accessibility, and migration review;
- quarterly or per product cycle: usage, exceptions, duplication, and gaps;
- after major brand or platform change: profile and token audit.

An exception needs owner, reason, affected surfaces, and review date. Exceptions without
an owner become accidental forks.

## Documentation template

For each component or pattern, document:

1. name and intent;
2. anatomy and semantic roles;
3. lifecycle states and causal timeline;
4. token mapping;
5. variants and content limits;
6. responsive behavior;
7. reduced and static equivalents;
8. implementation examples by supported track;
9. do/don't examples and failure conditions;
10. deterministic tests and acceptance criteria;
11. version, owner, and known consumers.

Keep deep implementation notes in references or code. The entry document should help a
designer or engineer choose and apply the pattern without reading the entire system.

## Success measures

Measure whether the system improves outcomes, not only whether it exists:

- percentage of new motion using semantic tokens;
- repeated patterns covered by a component contract;
- number and age of exceptions;
- time from brief to verified artifact;
- visual or accessibility regressions caught before delivery;
- proportion of components with reduced and static modes;
- bundle, frame pacing, and export reliability;
- adoption across teams and destinations;
- comprehension or usability findings for high-impact motion.

Avoid targeting 100% reuse. Brand campaigns and unique explanatory concepts may remain
bespoke; the system should make deliberate exceptions visible and well crafted.
