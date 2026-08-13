# From intent to mechanism

The hardest part of a concept animation is not the code. It's deciding what
should move. This file is the bridge from "here's what I want to show" to a
concrete mechanism you can write a beat sheet against.

## Contents

- [The interview](#the-interview)
- [Find the claim](#find-the-claim)
- [Pick the mechanism from the claim](#pick-the-mechanism-from-the-claim)
- [Pick the representation register](#pick-the-representation-register)
- [Audit objects and feedback](#audit-objects-and-feedback)
- [When animation is the wrong medium](#when-animation-is-the-wrong-medium)
- [Pressure-test before building](#pressure-test-before-building)

## The interview

Five questions. Ask them before writing anything, because each one changes the
build in a way that's expensive to retrofit. Ask them conversationally — the goal
is to get the user talking about what they actually care about, not to fill a form.

1. **"If a viewer remembers one sentence, what should it be?"**
   Not the feature list. One sentence. This becomes the claim, and the claim
   picks the mechanism.
2. **"Where does this play, and who's watching?"**
   A page hero loops silently forever and needs to work at thumbnail size. A
   conference-talk clip plays once with a presenter narrating over it and can
   carry far more detail. A design-review artifact can be interactive.
3. **"What should the viewer be able to name afterward?"**
   Names are what state labels are for. If nothing needs naming, drop labels
   entirely; if five things do, the scene is overloaded and needs splitting.
4. **"Is the subject a UI, an abstract system, a physical product, or data?"**
   This picks the representation register, which determines whether you draw
   panels and bars, nodes and edges, or a device silhouette.
5. **"What action starts it, and what feedback can the person react to?"**
   This turns a feature claim into a causal story. If no one acts, name the data
   or event that starts the system. If no feedback can be observed, the scene is
   illustrating internals rather than a user benefit.

If the user can't answer (1), that's the real finding. Help them narrow: ask what
they'd cut if the clip had to be five seconds. Building against a muddy claim
produces a muddy animation, and no amount of craft rescues it.

## Find the claim

The claim is a sentence with a verb, about what the product *does for someone* —
not a description of its parts.

| Not a claim | Claim |
|---|---|
| "our sync architecture" | "your work follows you between devices" |
| "the recommendation pipeline" | "it narrows thousands of options to the three that fit" |
| "multi-agent orchestration" | "it splits the job up and does the parts in parallel" |
| "our latency improvements" | "it answers before you finish reading the question" |

The test: can you point at the mechanism and say "that's the claim happening"? If
the animation shows the architecture while the claim is about speed, the viewer
learns the architecture and forgets the speed.

## Pick the mechanism from the claim

The mechanism should be **the shape of the claim, not the shape of the product.**
This is the single most common failure — animating the org chart or the system
diagram because it exists, when the claim was about something else entirely.

| The claim is about… | Mechanism | What the viewer sees |
|---|---|---|
| Autonomous work — "it does it for you" | **Phase spine.** One unit advances through named states | a thing being worked on, start to finish |
| Narrowing — search, ranking, filtering, matching | **Field collapse.** Many candidates; most recede, one resolves | winnowing |
| Reach — sync, distribution, fan-out, broadcast | **Emission.** One source, N targets activate in sequence | spreading outward |
| Transformation — "turns X into Y" | **Conveyor.** A token crosses stations, changing form at each | a pipeline |
| Speed — "faster than…" | **Race.** Two tracks run at once; one finishes early | a direct comparison |
| Connection — integration, compatibility | **Graph knit.** Nodes appear, edges draw between them | assembly |
| Improvement — learning, iteration, refinement | **Feedback loop.** Output re-enters input, each pass tighter | circulation |
| Structure — architecture, layers, stack | **Exploded stack.** Layers separate along depth, each labelled | anatomy |
| Scale — "handles millions of…" | **Multiplication.** One unit tiles into a field, then the field acts as one | mass |
| Breadth — "it does all of this" | **Guided sequence.** Successive capabilities inside one persistent interface | a tour of one surface |
| Oversight — review, approval, human-in-the-loop | **Actor circuit.** Two named parties; judgment returns on a second edge | a loop closing through a person |
| Change — before/after, migration | **Wipe or split.** Identical layout, two treatments | contrast |

Notes that save rework:

- **One mechanism per animation.** Two mechanisms in one loop is the most reliable
  way to make a viewer remember neither. If the claim needs two, it's two clips.
- **The phase spine is the default for anything agentic**, and
  `assets/scene-phase-spine.html` already implements it — swap the shape and rename
  the phases rather than starting over. `references/mechanisms.md` has recipes for
  the others.
- **Emission and multiplication read badly at thumbnail size** — lots of small
  elements turn to noise. Prefer them for talk clips, not page heroes.
- **Race needs a visible finish line**, or "faster" reads as "different."
- Some claims map to a mechanism not in this table. The table is a starting set,
  not a taxonomy — invent one, and prefer whatever makes the claim literal.

## Pick the representation register

How literal should the visuals be? Each register buys something and costs
something.

| Register | Use when | Cost |
|---|---|---|
| **Abstract geometry** — bars, panels, dots | the claim is about a *process*; default for product concepts | viewer can't see the actual product |
| **Stylized UI** — recognisable but drawn layout | the layout itself is the point; capability tours — see `ui-walkthrough.md` | dates when the UI is redesigned |
| **Real screenshots / recording** | you're teaching an actual flow someone must reproduce | not really an animation — see below |
| **Node graph** — nodes and edges | topology or connection is the point | reads as an engineering diagram, not a product story |
| **Device silhouette** | the claim spans physical hardware | needs the industrial design to be settled |
| **Data marks** — bars, lines, points to scale | the claim is quantitative | this is a chart; load the `dataviz` skill instead |

Abstract geometry is the default for a reason: no real text means nothing to
localize, nothing to go stale at the next redesign, and nothing that turns to
mush under H.264. It also directs attention — viewers can't read fake content, so
they watch the change, which is the actual subject.

One thing it cannot do: **name an actor.** This vocabulary describes what happens
to content, not who did it. If the claim involves two parties — a person and a
system, two agents, a hand-off — the parties must be legible even when the work
they pass around stays abstract. A selection box or a cursor is a machine
affordance and will never read as a human. See `actors-and-loops.md`.

Use stylized UI instead when the claim depends on a familiar interaction state:
input acknowledged, interim text, correction, validation, error recovery or a
control becoming available. Replacing those states with generic bars can remove
the very feedback the animation is meant to explain.

## Audit objects and feedback

Before the beat sheet, read `semantic-continuity.md` and fill its object ledger.
The mechanism says what overall change to show; the ledger proves each visible
object belongs to that change. Reference artifacts such as editor handles,
selection boxes and loading dots must pass the same test as newly invented UI.

## When animation is the wrong medium

Say so early. Recommending the right medium is more useful than delivering a
polished animation that can't carry the message.

- **The claim is a number.** "40% faster," "99.9% uptime" — a chart or a single
  large number beats motion. Motion can show *that* something is faster; only a
  number says *how much*.
- **The viewer must reproduce the steps.** A screen recording with real UI is
  better than a stylized abstraction. Abstraction is for concepts, not tutorials.
  Note the boundary: *reproducing* steps needs a recording, but *showing what a
  product can do*, step after step, is a walkthrough and animates well — build it
  in the stylized-UI register per `ui-walkthrough.md`.
- **The content is mostly words.** If every beat needs a caption to make sense,
  the animation is carrying nothing — write the paragraph.
- **There are more than about five beats.** Split into several short loops, or use
  a static diagram where the viewer controls their own pace.
- **The mechanism can't be decided.** If the claim keeps changing across
  conversations, the product story isn't settled. Building will surface that, but
  saying it directly is faster and cheaper.

## Pressure-test before building

Cheap checks that catch expensive mistakes:

- **Describe the mechanism in one sentence without naming the product.** "Many
  things become one thing." If that sentence isn't recognisably the claim, the
  mechanism is wrong.
- **Squint test at thumbnail size.** Scale the beat sheet down mentally to 200px
  wide. Anything relying on small elements or fine text is already lost.
- **Silent test.** These almost always play muted and with no narration. If the
  motion needs a voiceover, it needs a rethink or a label.
- **Object test.** Point at every visible object and finish “this represents…”;
  then state where it came from and where it goes. Remove any failure.
- **Confirm the beat sheet with the user before writing markup.** It's a table of
  four rows and takes a minute to read. Restructuring beats after the timeline is
  built is the single most expensive change in this whole workflow.
