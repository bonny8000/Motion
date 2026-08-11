# Semantic continuity

Use this before markup. Visual continuity is not enough: the viewer must
understand what every object is, why it changes now, and how the new state relates
to the action that caused it.

## 1. Write the claim as cause → feedback → benefit

Bad: “Streaming transcription is faster.”

Buildable: “While a person is still speaking, partial text appears, so they can
notice and correct a mistake before stopping.”

The sentence names the trigger, visible system response and user consequence.
Every beat must advance one of those three parts.

## 2. Make the object ledger

| Object | User-world meaning | Appears because | Persists / becomes / exits | Color role |
|---|---|---|---|---|
| microphone | input control and session source | person starts speaking | stays attached to recorder; returns to ready state | shared input |
| waveform | captured acoustic energy | microphone is active | settles when recording stops | shared input |
| interim text | recognition hypothesis that may change | speech is processed | same text stabilises into final output | active feedback |
| delayed result | output unavailable during capture | stop finalises processing | appears only after stop | muted comparison |

Delete an object when any cell cannot be filled. Common failures:

- dots used as “activity” without naming what is active;
- handles or selection frames copied from design-tool footage into a product that
  has no editing or selection action;
- connectors that do not connect a source and destination;
- final outlines, glows or badges that communicate no new status;
- decorative particles used to cover a missing causal transition.

An established convention can carry meaning, but keep its context. Three dots
can mean waiting only when they sit beside a waiting label or inside a familiar
message/loading control. Detached dots are decoration.

## 3. Map connected geometry

For every transition, write `source object → destination state`.

```text
mic button → active recorder header
captured audio → two recognition routes
interim words → corrected words → final transcript
complete session → the same ready mic button
```

Use one shared element as the focal anchor. New surfaces should expand from the
action or data that creates them. Keep its centerline, tangent or edge contact
continuous across the handoff. Crossfade content inside a transforming container;
do not stretch text or icons with the container.

If no object is shared, use a brief fade and name the state change. Do not invent
a travelling object merely to make the transition look sophisticated.

## 4. Transfer a reference through a meaning gate

Classify each reference feature twice:

| Feature | Visual role | Semantic role | Transfer decision |
|---|---|---|---|
| rounded dark panel | material and composition | neutral container | usually keep |
| editor handles | small white geometry | editable/selected object | keep only for editing stories |
| scanning selection box | focal motion | review or selection action | adapt or remove |
| caret following text | focal motion | generation position | keep for live text |
| collapse to point | loop contour | scale/reset claim | keep only when the destination is meaningful |

“It is in the reference” is evidence for style, not permission to import the
wrong product metaphor.

## 5. Use status colors, not decoration colors

Assign one role to each accent before animating:

- neutral grey — unavailable, waiting or comparison baseline;
- primary accent — active data or current path;
- amber — interim or uncertain content that can still change;
- green — corrected, accepted or final state.

Keep ordinary text ordinary. A transcript is a sentence, not a row of colorful
chips, unless the product genuinely tokenizes words as editable objects.

## 6. Review the causal frames

Sample at least these frames:

1. the action before activation;
2. the first visible system response;
3. partial progress;
4. a change the user can react to;
5. completion;
6. the consequence or benefit;
7. the reset / loop seam.

For each frame ask:

- Can a viewer name what changed and why?
- Did the feedback appear near or from its cause?
- Is the same object still trackable across the transition?
- Does the final state communicate an outcome instead of merely adding chrome?
- Would removing any object make the claim less clear? If not, remove it.

## Sources

- Apple Human Interface Guidelines, Motion: purposeful motion should provide
  status, feedback or instruction — <https://developer.apple.com/design/human-interface-guidelines/motion>
- Microsoft Fluent, Connected animation: shared elements preserve context across
  state changes — <https://learn.microsoft.com/en-us/windows/apps/develop/motion/connected-animation>
- Material Design, Choreography: new surfaces originate from the element or
  action that creates them — <https://m1.material.io/motion/choreography.html>
- Google Cloud Speech-to-Text: streaming results explicitly distinguish interim
  hypotheses from final results — <https://docs.cloud.google.com/speech-to-text/docs/reference/rest/v2/StreamingRecognitionResult>
