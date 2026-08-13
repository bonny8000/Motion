# Actors and loops

For claims about **who does what**, and about **loops that only close through a
person**: human-in-the-loop, review and approval, agent hand-offs, escalation,
collaboration, oversight, RLHF, expert-in-the-loop.

This reference exists because of a specific failure that is easy to repeat, and
easy to miss until someone tells you the animation "isn't clear".

## The failure this prevents

A first attempt at "human in the loop" was built as a phase spine: work typed
itself in, halted at a gate, a selection box framed it, the box turned the work
to accent, and work resumed. Every beat was clean. It was still wrong.

**Two reasons, both structural:**

1. **A gate is not a loop.** Work stopping at a checkpoint reads as the system
   verifying *itself* — which is exactly what the existing phase-spine scene
   already means. Nothing said the pause was for someone else.
2. **An abstract box cannot be an actor.** The abstract-skeleton vocabulary in
   `house-style.md` describes *what happens to content*. It has no way to say
   *who did it*. A selection box is a machine affordance; using it to stand for
   a person silently deletes the person.

The claim was about an actor and a cycle. The mechanism depicted neither.

## The third question

`intent-to-mechanism.md` asks what the claim is about and which register to
draw it in. Add a third question whenever more than one party is involved:

> **Does the viewer need to know WHO acted?**

If yes, actor identity must be legible — named nodes and distinguishable
glyphs — no matter which register the rest of the scene uses. This is
orthogonal to the abstract/stylized decision: the *content* can stay abstract
while the *actors* are explicit. Anonymous geometry is still correct for the
work being passed around; it is never correct for the parties passing it.

If the answer is no — the claim is about a process, not a cast — use a plain
mechanism and do not add characters. Actors invite the viewer to ask whose
side they're on, and that question has to be worth answering.

## The actor-circuit mechanism

| Element | Means | Rule |
|---|---|---|
| Two named nodes | the parties | label both, always visible, never move |
| Outbound edge | what one produces | quiet until traffic is on it |
| **Return edge** | the other's judgment coming back | **this is the concept** |
| A travelling token | the thing being handed over | one at a time |
| Colour on the token | who touched it last | provenance, not decoration |
| A late colour change | the effect of the feedback | the payoff beat |

**The return edge is the whole point.** Approval alone is a gate. What makes it
a *loop* is that the judgment goes back and changes what happens next. If you
cut one thing from this scene, cut the outbound edge — never the return.

**Colour is provenance.** Extend the kit's grammar rather than inventing a
palette: neutral means produced-but-unjudged, accent means carries-a-human-
decision. Then the accent's path around the circuit is a readable claim about
causality.

**Make the effect land late.** The machine node must change *after* the return
token arrives, not with it. Simultaneous change reads as correlation; a beat of
delay reads as cause. This is the single highest-value timing decision in the
scene.

**Let the playback loop be the claim.** When the concept is cyclical, a looping
clip is not a delivery format — it is the argument. Do not close with a collapse
or a resolved end state; land the cycle so it re-enters cleanly.

## Beat sheet

Four beats, roughly 1.2–1.5s each. Fits 6s.

| Beat | Changes | Says |
|---|---|---|
| propose | node A active, token leaves on the outbound edge | "it produced something" |
| judge | token arrives, node B activates, one ring | "a person decided" |
| return | **return edge lights, accent token travels back** | "the decision goes back in" |
| change | node A takes accent | "and it changed what happens next" |

Give the judgment beat a single ring or pulse and nothing else. It is the one
instant the whole clip exists to show, and competing motion buries it.

## Failure modes

- **No return edge.** You have drawn approval, not a loop.
- **Both nodes identical.** If the actors aren't distinguishable at a glance,
  the viewer cannot tell who is doing the work.
- **The human node is a box, a cursor, or a selection frame.** Those are machine
  affordances. Use a figure.
- **Machine changes at the same instant feedback arrives.** Reads as
  coincidence. Delay it.
- **Two tokens in flight.** The eye picks one and misses the other; the circuit
  stops reading as a sequence.
- **A resolved ending on a cyclical claim.** Collapsing to a final state
  contradicts the message that this repeats.
- **Actors added to a claim that has none.** If nobody hands anything to anyone,
  a circuit is decoration.

## Captions

This mechanism usually needs four short captions, and they carry real load —
the visual says *something moved between two parties*, the caption says *what
it means*. Two rules:

- **A state word needs ~0.7s at full opacity to be read.** `beats.labelCues`
  derives each fade-out from the *next* cue's start, so placing beats as tight
  as the motion allows silently steals a caption's reading time. Space the
  beats to fit the words, not the other way round.
- **Accent exactly one word per caption** — the one naming the human's role
  (`judge`, `back in`, `you`). More than one and the emphasis stops meaning
  anything.

## Implementation

`assets/scene-actor-loop.html` is the reference implementation: zero
dependencies, one CSS clock, a fixed 1600×900 design space scaled by a
`ResizeObserver`, and reduced motion frozen on the judgment frame.

It is deliberately **not** built on `lib/kit.js`. The kit's shapes describe
content being worked on; this mechanism is about parties and edges between
them, which the shape contract does not model. A CSS-clock scene also stays
double-clickable, which matters for a clip whose main job is to be pasted into
someone else's deck.

Geometry worth keeping if you adapt it: nodes at the same y, edges as two
symmetric curves, and the token driven by `offset-path` along exactly the same
path data the visible edge uses — so the token cannot drift off its wire.
