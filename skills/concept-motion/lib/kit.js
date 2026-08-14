/**
 * concept-motion kit
 *
 * Separates the three things that used to be fused into one scene file:
 *
 *   the stage      — palette, geometry, seek hook, reduced-motion handling
 *   the shape      — WHAT is being worked on (code rows, a card grid, a list…)
 *   the beats      — WHAT HAPPENS to it (draws in, types, gets scanned, collapses)
 *
 * Transferring a feature into this style then means swapping a shape and
 * reordering beats, instead of rewriting a timeline. Every shape exposes the
 * same contract so every beat works against every shape:
 *
 *   { el, items: [{el, fill, x, y, w, h}], groups: [{x, y, w, h, items}] , enterMode }
 *
 *   items  — the smallest individually-animatable units
 *   groups — rows/clusters, for anything that scans or staggers by band
 *
 * Import Motion once, here, so scenes have a single dependency line.
 */
import { animate } from 'https://cdn.jsdelivr.net/npm/motion@13.1.0/+esm';

/* Easing. Built-in CSS keywords are too weak to read as intentional; these are
   the strong curves worth defaulting to.

   Pick by what the element is doing, not by taste:
     entering or exiting          → EASE_OUT     (starts fast, feels responsive)
     moving/morphing on screen    → EASE_IN_OUT
     constant mechanical progress → 'linear'     (a fill wipe, a marquee)
     default                      → EASE

   `ease-in` is wrong for anything a viewer is waiting on, because it delays the
   moment they're watching. The one legitimate use is an object accelerating
   away and off — which is exactly the closing collapse, hence EASE_IN below.
   Don't reach for it anywhere else. */
export const EASE        = [.32, .72, 0, 1];      // standard move: quick out, soft land
export const EASE_OUT    = [.23, 1, .32, 1];      // power4.out — a landing with weight
export const EASE_IN_OUT = [.77, 0, .175, 1];     // something already on screen moving A→B
export const EASE_IN     = [.5, 0, .75, 0];       // accelerate away — the collapse ONLY

/* The expressive set, named after GSAP's eases because that's the clearest
   vocabulary for them, expressed as plain cubic-beziers so no dependency is
   added. See references/polish.md — a scene where most things are `linear`
   reads as flat even when every individual `linear` is defensible. */
export const OUT2  = [.215, .61, .355, 1];        // power2.out — safe default entrance
export const OUT3  = [.165, .84, .44, 1];         // power3.out — stronger entrance
export const EXPO  = [.19, 1, .22, 1];            // expo.out   — most dramatic stop
export const BACK  = [.34, 1.56, .64, 1];         // back.out   — overshoot, ONCE per scene
export const IN2   = [.55, .085, .68, .53];       // power2.in  — exits only

/* Product-UI timing functions — a sharper split than the general-purpose curves
   above: separate curves for entering and leaving, plus expressive variants for
   the one move that should be felt. `UI_ENTER` is aggressively front-loaded —
   almost all of the distance is covered before the halfway point — which is why
   arriving UI reads as immediate without feeling abrupt. */
export const UI_EASING  = [.35, 0, .35, 1];       // functional micro-motion
export const UI_ENTER   = [0, 0, .15, 1];         // something arriving
export const UI_EXIT    = [.35, 0, 1, 1];         // something leaving
export const UI_ENTER_X = [.03, .4, .1, 1];       // expressive arrival
export const UI_EXIT_X  = [.35, 0, .95, .55];     // expressive departure

/* ── Sampled springs ────────────────────────────────────────────────────────
   Apple parameterises springs as damping ratio + response rather than
   mass/stiffness/damping, because those two are the ones a designer can
   actually reason about (see references/ui-walkthrough.md).

   A real spring is the wrong tool here: its settle time is emergent and
   velocity-dependent, which breaks the absolute-`at` contract every beat
   relies on and makes frame-exact export impossible. So we sample the
   spring's step response ONCE into a plain easing function with a fixed
   duration. You get the spring's shape — the weighted approach, the
   overshoot — on a deterministic clock.

   This is the honest half of the trade. The half that does not survive is
   interruption: a sampled spring cannot absorb a new target mid-flight,
   because there is no input to absorb. Non-interactive motion never needs it. */
export const SPRINGS = {
  move:   { damping: 1.0, response: .40 },   // reposition — no overshoot
  rotate: { damping: 0.8, response: .40 },
  sheet:  { damping: 0.8, response: .30 },   // drawer / panel arriving
};

/**
 * Normalised step response of a damped spring, sampled into `{ ease, duration }`.
 * `ease` takes and returns 0..1, so it drops straight into a beat's `ease`.
 */
export function spring({ damping = 1, response = .4, epsilon = .002, max = 4 } = {}) {
  const w0 = (2 * Math.PI) / response, z = damping;
  let x;
  if (Math.abs(z - 1) < 1e-6) {
    x = (t) => 1 - Math.exp(-w0 * t) * (1 + w0 * t);
  } else if (z < 1) {
    const wd = w0 * Math.sqrt(1 - z * z);
    x = (t) => 1 - Math.exp(-z * w0 * t) * (Math.cos(wd * t) + ((z * w0) / wd) * Math.sin(wd * t));
  } else {
    const s = w0 * Math.sqrt(z * z - 1), r1 = -w0 * z + s, r2 = -w0 * z - s;
    x = (t) => 1 - (r2 * Math.exp(r1 * t) - r1 * Math.exp(r2 * t)) / (r2 - r1);
  }
  // Settle time: the last moment the curve is still outside the epsilon band.
  let duration = 0;
  for (let t = 0; t <= max; t += 1 / 240) if (Math.abs(x(t) - 1) > epsilon) duration = t;
  duration = Math.max(duration + 1 / 60, .12);
  // Pin the endpoints so the beat lands exactly on its keyframe value.
  const ease = (p) => (p <= 0 ? 0 : p >= 1 ? 1 : x(p * duration));
  return { ease, duration };
}

/* Tokens follow the same four-tier pattern used by mature design systems:
   primitives and roles live here, themes override roles, component aliases are
   consumed by the CSS, and legacy aliases keep shipped scenes compatible.

   Scene code should override semantic names (`colorAccent`, `radiusPanel`) rather
   than literal/legacy names (`accent`, `panelRadius`). */
export const FOUNDATION_TOKENS = {
  colorCanvas:        '#657689',
  colorSurface:       '#1a2931',
  colorSurfaceRaised: '#22343e',
  colorFgPrimary:     '#e8eef0',
  colorFgMuted:       '#78868e',
  colorFgSubtle:      '#5e6c74',
  colorFgDisabled:    '#46545c',
  colorAccent:        '#0061de',
  colorAccentSoft:    'rgba(0,97,222,.16)',
  colorStroke:        '#ffffff',
  colorStrokeSubtle:  'rgba(255,255,255,.18)',

  fontFamily: "'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif",
  fontSizeLabel: '27px',
  fontWeightLabel: '450',
  fontTrackingLabel: '-.01em',

  space1: '4px',
  space2: '8px',
  space3: '16px',
  space4: '24px',
  space5: '32px',
  space6: '48px',

  radiusXs:   '2px',
  radiusSm:   '6px',
  radiusMd:   '14px',
  radiusLg:   '24px',
  radiusFull: '999px',

  radiusPanel:  '2px',
  radiusBar:    '2px',
  radiusCode:   '2px',
  radiusRow:    '3px',
  radiusTile:   '3px',
  shadowPanel:  'none',
  strokeFrame:  '1px',
  sizeHandle:   '7px',
  sizeDot:      '5px',
  sizeCaret:    '2px',

  durationFeedback:        '140ms',
  durationEnterSupporting: '220ms',
  durationEnterPrimary:    '360ms',
  durationExit:            '220ms',
  durationTransform:       '560ms',
  durationEmphasis:        '800ms',
  easeEnter:    'cubic-bezier(.16,1,.3,1)',
  easeExit:     'cubic-bezier(.7,0,.84,0)',
  easeStandard: 'cubic-bezier(.65,0,.35,1)',

  /* Stylized-UI register — the ONLY tokens that carry legible type. The
     abstract-skeleton vocabulary above stays the default for concept work;
     these exist for walkthroughs where the interface itself is the claim.
     See references/ui-walkthrough.md before reaching for them. */
  fontMono:       "ui-monospace,'SF Mono','JetBrains Mono','Cascadia Code',Menlo,Consolas,monospace",
  fontSizeUi:     '15px',
  fontSizeUiSm:   '13px',
  lineHeightUi:   '28px',
  colorDiffAdd:   'rgba(63,185,80,.15)',
  colorDiffDel:   'rgba(248,81,73,.14)',
  colorSuccess:   '#3fb950',
  colorDanger:    '#f85149',
  colorLink:      '#58a6ff',
  colorSyntax:    '#79c0ff',
  colorGutter:    '#5e6c74',
  radiusUi:       '6px',

  /* ── Intent roles ────────────────────────────────────────────────────────
     One accent forces every scene to say everything in one colour, which is
     why a whole library of them ends up looking like a single style. The model
     is Property × Role × Variant: foreground / background / stroke, crossed
     with brand, neutral, positive, critical, warning and informative, in solid
     and weak variants.

     Adopt the ROLE, not the decoration. A scene earns a second colour when it
     is making a second *claim* — this failed, this succeeded, this is
     uncertain. See references/visual-foundations.md before reaching for one.

     Values below are the dark-theme readings; `THEMES.productLight` swaps them. */
  colorPositive:      '#22b27f',
  colorPositiveWeak:  '#202926',
  colorCritical:      '#ff6e60',
  colorCriticalWeak:  '#322323',
  colorWarning:       '#dab156',
  colorWarningWeak:   '#2a2620',
  colorInformative:   '#41a2f9',
  colorInformativeWeak:'#1c2530',
  colorMagic:         '#8e6bee',
  colorMagicWeak:     '#201f1f',
};

/* Six categorical hues for the rare scene with genuinely peer series — lanes,
   tracks, competing candidates. Peer means *no ranking*: the moment one series
   matters more than the others, use emphasis (accent vs neutral) instead, or
   load the `dataviz` skill if the claim is quantitative. Light and dark
   readings of the same six hues. */
export const HUES = {
  light: ['#5e98fe', '#10ab7d', '#fc6a66', '#c49725', '#9f84fb', '#b0b3ba'],
  dark:  ['#1e82eb', '#1b946d', '#f73526', '#b6720d', '#8e6bee', '#868b94'],
};

/* A theme is a complete role map, not a loose palette. `reference` preserves
   the shipped footage. The studio themes add the warm accent, restrained depth,
   concentric radii, and role-based foreground/background/stroke hierarchy that
   make the system useful beyond a single reference style. */
export const THEMES = {
  reference: {},
  studioLight: {
    colorCanvas:        '#f2f5f3',
    colorSurface:       '#ffffff',
    colorSurfaceRaised: '#f8faf9',
    colorFgPrimary:     '#17201c',
    colorFgMuted:       '#65716b',
    colorFgSubtle:      '#98a39d',
    colorFgDisabled:    '#c7ceca',
    colorAccent:        '#f25f3a',
    colorAccentSoft:    'rgba(242,95,58,.14)',
    colorStroke:        '#cad3ce',
    colorStrokeSubtle:  '#e2e8e5',
    radiusPanel:        '24px',
    radiusBar:          '8px',
    radiusCode:         '6px',
    radiusRow:          '10px',
    radiusTile:         '16px',
    shadowPanel:        '0 28px 70px rgba(30,48,40,.12), 0 2px 10px rgba(30,48,40,.06)',
  },
  studioDark: {
    colorCanvas:        '#111613',
    colorSurface:       '#1c2420',
    colorSurfaceRaised: '#26302b',
    colorFgPrimary:     '#f1f5f2',
    colorFgMuted:       '#aeb9b3',
    colorFgSubtle:      '#77827c',
    colorFgDisabled:    '#4f5a54',
    colorAccent:        '#ff7652',
    colorAccentSoft:    'rgba(255,118,82,.16)',
    colorStroke:        '#d8e1dc',
    colorStrokeSubtle:  'rgba(216,225,220,.2)',
    radiusPanel:        '24px',
    radiusBar:          '8px',
    radiusCode:         '6px',
    radiusRow:          '10px',
    radiusTile:         '16px',
    shadowPanel:        '0 30px 76px rgba(0,0,0,.34), 0 1px 0 rgba(255,255,255,.05) inset',
  },

  /* ── Product themes ──────────────────────────────────────────────────────
     A complete light/dark pair on the layered-surface model: canvas is the
     basement, surface the default layer, raised the fill layer, with
     foregrounds at neutral / muted / subtle / disabled.

     `colorAccent` deliberately carries no brand identity — it defaults to the
     informative role, which is functional and unowned. Set it to your own
     brand colour; never borrow one you do not hold the rights to. */
  productLight: {
    colorCanvas:        '#f3f4f5',
    colorSurface:       '#ffffff',
    colorSurfaceRaised: '#f7f8f9',
    colorFgPrimary:     '#1a1c20',
    colorFgMuted:       '#555d6d',
    colorFgSubtle:      '#868b94',
    colorFgDisabled:    '#d1d3d8',
    colorAccent:        '#217cf9',
    colorAccentSoft:    'rgba(33,124,249,.12)',
    colorStroke:        '#dcdee3',
    colorStrokeSubtle:  'rgba(0,0,0,.06)',
    colorPositive:      '#079171',
    colorPositiveWeak:  '#edfaf6',
    colorCritical:      '#fa342c',
    colorCriticalWeak:  '#fdf0f0',
    colorWarning:       '#c49725',
    colorWarningWeak:   '#fdf7e7',
    colorInformative:   '#217cf9',
    colorInformativeWeak:'#eef4fe',
    colorMagic:         '#9f84fb',
    colorMagicWeak:     '#f9f2ee',
    colorGutter:        '#b0b3ba',
    radiusPanel:        '12px',
    radiusBar:          '4px',
    radiusCode:         '4px',
    radiusRow:          '6px',
    radiusTile:         '10px',
    shadowPanel:        '0 12px 32px rgba(26,28,32,.10), 0 1px 3px rgba(26,28,32,.06)',
  },
  productDark: {
    colorCanvas:        '#000000',
    colorSurface:       '#16171b',
    colorSurfaceRaised: '#1d2025',
    colorFgPrimary:     '#f3f4f5',
    colorFgMuted:       '#b0b3ba',
    colorFgSubtle:      '#868b94',
    colorFgDisabled:    '#5b606a',
    colorAccent:        '#41a2f9',
    colorAccentSoft:    'rgba(65,162,249,.16)',
    colorStroke:        '#393d46',
    colorStrokeSubtle:  'rgba(255,255,255,.09)',
    colorGutter:        '#5b606a',
    radiusPanel:        '12px',
    radiusBar:          '4px',
    radiusCode:         '4px',
    radiusRow:          '6px',
    radiusTile:         '10px',
    shadowPanel:        '0 16px 40px rgba(0,0,0,.45)',
  },
};

export const MOTION_PROFILES = {
  calm: {
    feedback: .14, enterSupporting: .22, enterPrimary: .36,
    exit: .22, transform: .56, emphasis: .8, stagger: .05,
    enterEase: OUT2, moveEase: EASE_IN_OUT, exitEase: IN2,
  },
  precise: {
    feedback: .1, enterSupporting: .18, enterPrimary: .28,
    exit: .18, transform: .42, emphasis: .62, stagger: .035,
    enterEase: EASE_OUT, moveEase: EASE_IN_OUT, exitEase: EASE_IN,
  },
  expressive: {
    feedback: .16, enterSupporting: .28, enterPrimary: .48,
    exit: .28, transform: .72, emphasis: 1.05, stagger: .075,
    enterEase: OUT3, moveEase: EXPO, exitEase: IN2,
  },
  /* Product-UI cadence: a 50–300ms scale with a macro/micro split — micro-motion
     sits at or under 200ms, macro above it. Correct when the clip has to sit
     inside a shipped interface and feel like the same hand made both.

     Do not reach for it by default. These durations are tuned for motion a
     user *triggers*, where waiting is the cost. An explainer the viewer only
     watches usually needs the slower `calm` profile — a 150ms beat in a
     6-second narrative reads as a flicker, not as snappiness. */
  product: {
    feedback: .10, enterSupporting: .15, enterPrimary: .25,
    exit: .20, transform: .30, emphasis: .30, stagger: .04,
    enterEase: UI_ENTER, moveEase: UI_EASING, exitEase: UI_EXIT,
  },
};

const LEGACY_TOKEN_MAP = {
  bg: 'colorCanvas',
  card: 'colorSurface',
  accent: 'colorAccent',
  barA: 'colorFgMuted',
  barB: 'colorFgSubtle',
  barC: 'colorFgDisabled',
  label: 'colorFgPrimary',
  frame: 'colorStroke',
  panelRadius: 'radiusPanel',
  panelShadow: 'shadowPanel',
  barRadius: 'radiusBar',
};

const normalizeTokenOverrides = (overrides = {}) => {
  const normalized = { ...overrides };
  Object.entries(LEGACY_TOKEN_MAP).forEach(([legacy, semantic]) => {
    if (legacy in normalized && !(semantic in normalized)) normalized[semantic] = normalized[legacy];
  });
  return normalized;
};

const withLegacyAliases = (tokens) => {
  const resolved = { ...tokens };
  Object.entries(LEGACY_TOKEN_MAP).forEach(([legacy, semantic]) => {
    resolved[legacy] = resolved[semantic];
  });
  return resolved;
};

export const TOKENS = withLegacyAliases({ ...FOUNDATION_TOKENS, ...THEMES.reference });

/* Material is a style decision, not a quality ladder. `reference` preserves the
   flat, diagrammatic grammar of the source footage. `soft` is available for a
   reference-free product-UI treatment, but must never be applied as automatic
   "polish" when the supplied reference is square and flat. */
export const MATERIALS = {
  reference: {},
  soft: {
    radiusPanel: '14px',
    shadowPanel: '0 18px 44px rgba(12,20,26,.30), 0 2px 0 rgba(255,255,255,.07) inset',
    radiusBar: '999px',
  },
};

const CSS = `
*{box-sizing:border-box;margin:0;padding:0}
html,body{height:100%;background:var(--color-canvas)}
body{display:grid;place-items:center;
  font-family:var(--font-family);
  -webkit-font-smoothing:antialiased}
.cm-stage{position:relative;background:var(--color-canvas);overflow:hidden;isolation:isolate}
.cm-unit{position:absolute;inset:0;transform-origin:center center}
.cm-panel{position:absolute;background:var(--color-surface);opacity:0;
  border-radius:var(--radius-panel);box-shadow:var(--shadow-panel)}
/* Frame as four 1px divs, not an SVG dash animation: Motion's pathLength lives
   in its React SVG renderer and silently does nothing from vanilla animate().
   Per-edge timing is also what makes the two-pen trace possible. */
.cm-frame{position:absolute}
.cm-frame .e{position:absolute;background:var(--color-stroke)}
.cm-frame .top,.cm-frame .bottom{left:0;width:100%;height:var(--stroke-frame);transform-origin:left center;transform:scaleX(0)}
.cm-frame .left,.cm-frame .right{top:0;width:var(--stroke-frame);height:100%;transform-origin:center top;transform:scaleY(0)}
.cm-frame .top{top:0}.cm-frame .bottom{bottom:0}
.cm-frame .left{left:0}.cm-frame .right{right:0}
.cm-frame .hd{position:absolute;width:var(--size-handle);height:var(--size-handle);background:var(--color-stroke);opacity:0}
.cm-frame .hd.tl{left:-3px;top:-3px}.cm-frame .hd.tr{right:-3px;top:-3px}
.cm-frame .hd.bl{left:-3px;bottom:-3px}.cm-frame .hd.br{right:-3px;bottom:-3px}
.cm-body{position:absolute}
.cm-item{position:absolute;border-radius:var(--radius-bar);transform-origin:left center;transform:scaleX(0)}
.cm-item>span{position:absolute;inset:0;background:var(--color-accent);border-radius:var(--radius-bar);
  transform-origin:left center;transform:scaleX(0)}
.cm-code{border-radius:var(--radius-code)}
.cm-row{border-radius:var(--radius-row)}
.cm-card{border-radius:var(--radius-tile)}
.cm-code>span,.cm-row>span,.cm-card>span{border-radius:inherit}
/* Never scale(0). Nothing in the physical world appears from literally nothing,
   and the eye reads it as a glitch rather than an entrance. Start near full size
   and let opacity do the appearing. */
.cm-pop{transform-origin:center center;transform:scale(.92);opacity:0}
.cm-caret{position:absolute;width:var(--size-caret);background:var(--color-accent);opacity:0}
.cm-sel{position:absolute;border:var(--stroke-frame) solid var(--color-accent);opacity:0}
.cm-sel i{position:absolute;width:var(--size-dot);height:var(--size-dot);background:var(--color-accent)}
.cm-sel i:nth-child(1){left:-3px;top:-3px}.cm-sel i:nth-child(2){right:-3px;top:-3px}
.cm-sel i:nth-child(3){left:-3px;bottom:-3px}.cm-sel i:nth-child(4){right:-3px;bottom:-3px}
.cm-label{position:absolute;text-align:right;white-space:nowrap;opacity:0;
  font-size:var(--font-size-label);font-weight:var(--font-weight-label);
  letter-spacing:var(--font-tracking-label);color:var(--color-fg-primary)}
.cm-dot{position:absolute;width:var(--size-dot);height:var(--size-dot);background:var(--color-fg-primary);opacity:0}

/* ── Stylized-UI register ───────────────────────────────────────────────────
   Legible interface mocks, for walkthroughs where the interface IS the claim.
   Everything here opts out of the abstract-skeleton grammar deliberately, so
   it is namespaced .cm-u* and never inherits the bar/scaleX machinery. */
.cm-u{position:absolute;font-family:var(--font-mono);font-size:var(--font-size-ui);
  color:var(--color-fg-primary);white-space:pre}
.cm-u-chrome{left:0;right:0;top:0;display:flex;align-items:center;gap:var(--space3);
  padding:0 var(--space4);height:60px}
.cm-u-lights{display:flex;gap:8px;flex:none}
.cm-u-lights>div{width:12px;height:12px;border-radius:999px}
.cm-u-path{color:var(--color-fg-muted);flex:1}
.cm-u-meter{display:flex;align-items:center;gap:var(--space2);color:var(--color-fg-muted);
  font-size:var(--font-size-ui)}
.cm-u-meter .track{width:58px;height:10px;background:var(--color-fg-disabled);border-radius:2px;overflow:hidden}
.cm-u-meter .fill{height:100%;width:100%;background:var(--color-fg-primary);
  transform-origin:left center;transform:scaleX(0)}
.cm-u-scene{position:absolute;opacity:0}
.cm-u-echo{left:0;right:0;display:flex;gap:var(--space2);align-items:baseline;
  background:var(--color-surface-raised);border-radius:var(--radius-ui);padding:14px var(--space3)}
.cm-u-echo .mark{color:var(--color-link);flex:none}
.cm-u-line{position:absolute;left:0;display:flex;align-items:center;gap:var(--space3);
  border-radius:2px;opacity:0}
.cm-u-line .gut{color:var(--color-gutter);text-align:right;flex:none;font-size:var(--font-size-ui-sm)}
.cm-u-line.add{background:var(--color-diff-add)}
.cm-u-line.add .gut{color:var(--color-success)}
.cm-u-line.del{background:var(--color-diff-del)}
.cm-u-line.del .gut{color:var(--color-danger)}
.cm-u-opt{position:absolute;left:0;display:flex;gap:var(--space3);align-items:flex-start;
  padding:10px var(--space3);border-radius:var(--radius-ui);opacity:0}
.cm-u-opt .key{color:var(--color-fg-subtle);flex:none;width:18px}
.cm-u-opt .radio{width:15px;height:15px;border-radius:999px;flex:none;margin-top:3px;
  border:1px solid var(--color-fg-subtle)}
.cm-u-opt .ttl{display:block}
.cm-u-opt .sub{display:block;color:var(--color-fg-muted);font-size:var(--font-size-ui-sm);margin-top:3px}
.cm-u-hi{position:absolute;left:0;background:var(--color-surface-raised);
  border-radius:var(--radius-ui);opacity:0}
.cm-u-tabs{position:absolute;left:0;display:flex;gap:var(--space1)}
.cm-u-tabs .tab{padding:6px 12px;border-radius:var(--radius-ui);color:var(--color-fg-muted)}
.cm-u-tabs .tab.on{background:var(--color-surface-raised);color:var(--color-fg-primary)}
.cm-u-rec{position:absolute;left:0;right:0;display:flex;align-items:center;gap:var(--space2);
  padding:6px 0;opacity:0}
.cm-u-rec .nm{color:var(--color-fg-primary)}
.cm-u-rec .meta{color:var(--color-fg-muted);font-size:var(--font-size-ui-sm);flex:1}
.cm-u-rec .act{color:var(--color-link)}
.cm-u-rec .act.done{color:var(--color-success)}
.cm-u-prompt{position:absolute;left:0;right:0;display:flex;align-items:center;gap:var(--space2);
  background:var(--color-surface-raised);border-radius:var(--radius-ui);padding:16px var(--space3)}
.cm-u-prompt .mark{color:var(--color-link);flex:none}
.cm-u-prompt .txt{flex:1}
.cm-u-prompt .mode{color:var(--color-fg-muted)}
/* The caret is an inline block on the growing edge, not the absolute .cm-caret:
   real type advances by character, so the caret has to sit in the text flow. */
.cm-u-car{display:inline-block;width:9px;height:19px;background:var(--color-fg-primary);
  vertical-align:-4px}
`;

/* How a unit converts to accent depends on what it represents, and getting this
   wrong is immediately legible. A left-to-right wipe reads as *authoring or
   verifying in reading order* — correct for lines of text or code. On peer units
   like grid cards it reads as a progress bar, which says nothing. Those should
   fade. Shapes declare `convertMode`; beats respect it. */
const convOn  = (body) => (body.convertMode === 'fade' ? { opacity: [0, 1] } : { scaleX: [0, 1] });
const convOff = (body) => (body.convertMode === 'fade' ? { opacity: 0 } : { scaleX: 0 });

const el = (cls, parent, style) => {
  const n = document.createElement('div');
  if (cls) n.className = cls;
  if (style) Object.assign(n.style, style);
  parent?.appendChild(n);
  return n;
};

/* ═══════════════════════════════════════════════════════════════════════════
   SCENE
   ═══════════════════════════════════════════════════════════════════════════ */
export function createScene(opts = {}) {
  const w = opts.w ?? 1600, h = opts.h ?? 900;
  const card = opts.card ?? { w: 1290, h: 590 };
  const theme = typeof opts.theme === 'string'
    ? (THEMES[opts.theme] ?? THEMES.reference)
    : (opts.theme ?? THEMES.reference);
  const material = typeof opts.material === 'string'
    ? (MATERIALS[opts.material] ?? MATERIALS.reference)
    : (opts.material ?? MATERIALS.reference);
  const tokens = withLegacyAliases({
    ...FOUNDATION_TOKENS,
    ...theme,
    ...normalizeTokenOverrides(material),
    ...normalizeTokenOverrides(opts.tokens),
  });
  const motion = typeof opts.motion === 'string'
    ? (MOTION_PROFILES[opts.motion] ?? MOTION_PROFILES.calm)
    : { ...MOTION_PROFILES.calm, ...(opts.motion ?? {}) };

  const style = document.createElement('style');
  style.textContent = `:root{${Object.entries(tokens)
    .map(([k, v]) => `--${k.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase())}:${v}`)
    .join(';')}}\n${CSS}`;
  document.head.appendChild(style);

  const stage = el('cm-stage', document.body, { width: `${w}px`, height: `${h}px` });
  const unit  = el('cm-unit', stage);

  const x0 = (w - card.w) / 2, y0 = (h - card.h) / 2;
  const scene = {
    w, h, card, x0, y0, tokens, motion, unit, stage,
    seq: [], labels: [], _dot: null,
    /* Stylized-UI elements register themselves here with the properties they
       animate, so `beats.reset` restores them without every scene having to
       remember. Same discipline as panel/body, just self-declaring. */
    _ui: [],
  };
  /** Register a UI element + the reset keyframe that returns it to frame 0. */
  scene.uiReset = (target, kf) => { scene._ui.push([target, kf]); return target; };

  /** Dark panel + traceable frame + corner handles. */
  scene.panel = () => {
    const box = { left: `${x0}px`, top: `${y0}px`, width: `${card.w}px`, height: `${card.h}px` };
    const fill = el('cm-panel', unit, box);
    const frame = el('cm-frame', unit, box);
    for (const e of ['top', 'right', 'bottom', 'left']) el(`e ${e}`, frame);
    for (const c of ['tl', 'tr', 'bl', 'br']) el(`hd ${c}`, frame);
    return {
      fill, frame,
      edgesX:  [...frame.querySelectorAll('.top, .bottom')],
      edgesY:  [...frame.querySelectorAll('.left, .right')],
      handles: [...frame.querySelectorAll('.hd')],
      get chrome() { return [...this.edgesX, ...this.edgesY, ...this.handles]; },
    };
  };

  /** Caret + selection box, created lazily by the beats that need them. */
  scene.caret = () => (scene._caret ??= el('cm-caret', unit,
    { left: `${x0 + (opts.pad?.left ?? 44)}px`, top: `${y0 + (opts.pad?.top ?? 118)}px` }));
  scene.sel = () => {
    if (!scene._sel) {
      scene._sel = el('cm-sel', unit,
        { left: `${x0 + (opts.pad?.left ?? 44)}px`, top: `${y0 + (opts.pad?.top ?? 118)}px` });
      for (let i = 0; i < 4; i++) scene._sel.appendChild(document.createElement('i'));
    }
    return scene._sel;
  };
  scene.dot = () => (scene._dot ??= el('cm-dot', stage,
    { left: `${x0 + card.w / 2}px`, top: `${y0 + card.h / 2}px` }));

  /* ── Stylized-UI chrome ───────────────────────────────────────────────────
     Persistent furniture that survives every step of a walkthrough. It is
     deliberately NOT part of any step: the whole point of a walkthrough is
     that the frame stays put while the content inside it changes, which is
     what tells the viewer these steps happen in one place. */

  /** Window bar: traffic lights, path, and a context meter that only grows. */
  scene.chrome = ({ path = '', percents = [], meterFrom = 0 } = {}) => {
    const bar = el('cm-u cm-u-chrome', unit, { left: `${x0}px`, top: `${y0}px`, width: `${card.w}px` });
    const lights = el('cm-u-lights', bar);
    for (const c of ['#ff5f57', '#febc2e', '#28c840']) el('', lights).style.background = c;
    const pathEl = el('cm-u-path', bar);
    pathEl.textContent = path;
    const meter = el('cm-u-meter', bar);
    const track = el('track', meter);
    const fill = el('fill', track);
    // Percentages crossfade between discrete values rather than counting up:
    // a seekable timeline cannot interpolate textContent, and a number that
    // only moves at beat boundaries is honest about when work happened.
    const slot = el('', meter, { position: 'relative', width: '76px', height: '20px' });
    const pcts = percents.map((p) => {
      const n = el('', slot, { position: 'absolute', right: '0', top: '0', opacity: '0' });
      n.textContent = p;
      return n;
    });
    scene.uiReset(fill, { scaleX: meterFrom });
    if (pcts.length) scene.uiReset(pcts, { opacity: 0 });
    return { el: bar, fill, pcts };
  };

  /**
   * The input line: prompt mark, typed text, caret, and a model/mode slot.
   *
   * `lines` are every string this bar will ever type. They are all built up
   * front — one measured, clipped wrap each — because textContent cannot be
   * interpolated, and a walkthrough that rewrites text at runtime stops being
   * seekable, which breaks frame-exact export.
   */
  scene.promptBar = ({ top, model = '', modes = [], lines = [] } = {}) => {
    const bar = el('cm-u cm-u-prompt', unit,
      { left: `${x0 + 24}px`, top: `${y0 + top}px`, width: `${card.w - 48}px` });
    el('mark', bar).textContent = '❯';
    const txt = el('txt', bar, { position: 'relative', height: '20px' });
    const wraps = lines.map((s) => {
      const n = el('', txt, { position: 'absolute', left: '0', top: '0', overflow: 'hidden',
                              whiteSpace: 'pre', width: 'auto' });
      n.textContent = s;
      n.dataset.w = String(n.offsetWidth);   // measure before clipping
      n.style.width = '0px';
      return n;
    });
    const caret = el('cm-u-car', txt, { position: 'absolute', left: '0', top: '0' });
    const slot = el('mode', bar, { position: 'relative', minWidth: '190px', height: '20px' });
    const modeEls = modes.map((m) => {
      const n = el('', slot, { position: 'absolute', right: '0', top: '0', opacity: '0' });
      n.textContent = model ? `${model} · ${m}` : m;
      return n;
    });
    if (wraps.length) scene.uiReset(wraps, { width: 0 });
    scene.uiReset(caret, { opacity: 1, x: 0 });
    if (modeEls.length) scene.uiReset(modeEls, { opacity: 0 });
    return { el: bar, txt, caret, wraps, modeEls };
  };

  /**
   * One screen of a walkthrough. Steps stack in the same region and cross-fade,
   * so only one is ever legible — the viewer reads a sequence, not a collage.
   */
  scene.step = ({ top = 92, left = 24 } = {}) => {
    const box = el('cm-u cm-u-scene', unit,
      { left: `${x0 + left}px`, top: `${y0 + top}px`, width: `${card.w - left * 2}px` });
    scene.uiReset(box, { opacity: 0 });
    return box;
  };

  /** State labels, all sharing one right-aligned slot inside the panel. */
  scene.setLabels = (names) => {
    scene.labels = names.map((text) => {
      const n = el('cm-label', unit,
        { left: `${x0}px`, top: `${y0 + (opts.labelTop ?? 40)}px`, width: `${card.w - 46}px` });
      n.textContent = text;
      return n;
    });
    scene.label = (name) => scene.labels[names.indexOf(name)];
    return scene.labels;
  };

  scene.push = (...steps) => { scene.seq.push(...steps); return scene; };

  /**
   * `cycle` pins the loop length so the tail hold is deliberate rather than
   * whatever the last step happens to leave behind.
   *
   * Reduced motion is not "no motion" — the setting asks for less movement, not
   * for a dead page, and transitions that aid comprehension should survive. So
   * `reduced: 'calm'` (the default) keeps the narrative running while removing
   * what actually triggers vestibular discomfort: the large scale change of the
   * collapse, and the drifting dot. The labels still cycle, content still
   * fills, the story still reads.
   *
   * `reduced: 'still'` freezes at `still` seconds instead — appropriate when the
   * scene's whole point IS large movement, so calming it leaves nothing.
   */
  scene.run = ({ cycle, still, reduced = 'calm' } = {}) => {
    if (cycle) scene.push([scene.dot(), { opacity: [0, 0] }, { at: cycle - .02, duration: .02 }]);

    const wantsReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (wantsReduced && reduced === 'calm') {
      // Strip movement KEYS, don't drop whole steps. Dropping steps looks
      // equivalent and isn't: `{scale: 1, opacity: 1}` in the reset would go
      // with it, while the collapse's separate `{opacity: 0}` would survive —
      // so the scene would fade out at the end of cycle one and never come
      // back. Removing just the keys keeps every opacity/colour reset intact.
      const moves = new Set(['scale', 'scaleX', 'scaleY', 'x', 'y', 'rotate']);
      scene.seq = scene.seq
        .map(([target, kf, opts]) => [
          target,
          Object.fromEntries(Object.entries(kf).filter(([k]) => !moves.has(k))),
          opts,
        ])
        .filter(([, kf]) => Object.keys(kf).length > 0);
    }

    const controls = animate(scene.seq, { repeat: Infinity });
    // scripts/export.mjs seeks JS-driven animation through this array; without
    // it a capture records the same frozen frame for the whole clip.
    (window.__motionControls ??= []).push(controls);

    if (wantsReduced && reduced === 'still' && still != null) {
      controls.time = still;
      controls.pause();
    }
    return controls;
  };

  return scene;
}

/* ═══════════════════════════════════════════════════════════════════════════
   SHAPES — what is being worked on.
   Each returns the same contract, so every beat works against every shape.
   ═══════════════════════════════════════════════════════════════════════════ */
export const shapes = {
  /**
   * Indented rows of bars: code, a document, a config file, a transcript.
   * `rows`: [{ indent, bars:[width…], tints:['a'|'b'|'c'…] }]
   */
  codeRows(scene, rows, o = {}) {
    const pad = o.pad ?? { left: 44, top: 118 };
    const g = { h: o.h ?? 16, pitch: o.pitch ?? 37, indent: o.indent ?? 36, gap: o.gap ?? 20 };
    const body = el('cm-body', scene.unit,
      { left: `${scene.x0 + pad.left}px`, top: `${scene.y0 + pad.top}px` });

    const groups = rows.map((row, r) => {
      const y = r * g.pitch, start = (row.indent ?? 0) * g.indent;
      let x = start;
      const items = (row.bars ?? []).map((wid, i) => {
        const n = el('cm-item cm-code', body, {
          left: `${x}px`, top: `${y}px`, width: `${wid}px`, height: `${g.h}px`,
          background: `var(--bar-${row.tints?.[i] ?? 'a'})`,
        });
        n.appendChild(document.createElement('span'));
        const it = { el: n, fill: n.firstChild, x, y, w: wid, h: g.h };
        x += wid + g.gap;
        return it;
      });
      return { x: start, y, w: x - g.gap - start, h: g.h, items };
    });
    return { el: body, groups, items: groups.flatMap((r) => r.items),
             enterMode: 'growX', convertMode: 'wipeX', pad, g };
  },

  /**
   * A grid of cards/tiles: search results, a media library, devices, people,
   * feed items. Use for anything where the units are peers rather than lines.
   */
  cardGrid(scene, o = {}) {
    const cols = o.cols ?? 6, rows = o.rows ?? 4;
    const cw = o.cw ?? 176, ch = o.ch ?? 96, gap = o.gap ?? 18;
    const pad = o.pad ?? { left: 44, top: 92 };
    const body = el('cm-body', scene.unit,
      { left: `${scene.x0 + pad.left}px`, top: `${scene.y0 + pad.top}px` });

    const groups = [];
    for (let r = 0; r < rows; r++) {
      const y = r * (ch + gap), items = [];
      for (let c = 0; c < cols; c++) {
        const x = c * (cw + gap);
        const n = el('cm-item cm-pop cm-card', body, {
          left: `${x}px`, top: `${y}px`, width: `${cw}px`, height: `${ch}px`,
          background: `var(--bar-${['a', 'b', 'c'][(r + c) % 3]})`,
        });
        n.appendChild(document.createElement('span'));
        // peers fade rather than wipe, so pre-set the fill to full width
        Object.assign(n.firstChild.style, { transform: 'scaleX(1)', opacity: '0' });
        items.push({ el: n, fill: n.firstChild, x, y, w: cw, h: ch });
      }
      groups.push({ x: 0, y, w: cols * (cw + gap) - gap, h: ch, items });
    }
    return { el: body, groups, items: groups.flatMap((r) => r.items),
             enterMode: 'popIn', convertMode: 'fade', pad };
  },

  /**
   * Full-width rows with a leading marker: a list, a queue, a table, a feed.
   * Reads more like "records" than codeRows does, and scans cleanly.
   */
  listRows(scene, o = {}) {
    const n = o.count ?? 7, rowH = o.h ?? 34, gap = o.gap ?? 14;
    const width = o.w ?? (scene.card.w - 120);
    const pad = o.pad ?? { left: 44, top: 104 };
    const body = el('cm-body', scene.unit,
      { left: `${scene.x0 + pad.left}px`, top: `${scene.y0 + pad.top}px` });

    const groups = Array.from({ length: n }, (_, r) => {
      const y = r * (rowH + gap);
      const w = Math.round(width * (o.jitter === false ? 1 : .72 + .28 * ((r * 37) % 11) / 10));
      const node = el('cm-item cm-row', body, {
        left: '0px', top: `${y}px`, width: `${w}px`, height: `${rowH}px`,
        background: `var(--bar-${['a', 'b', 'c'][r % 3]})`,
      });
      node.appendChild(document.createElement('span'));
      const it = { el: node, fill: node.firstChild, x: 0, y, w, h: rowH };
      return { x: 0, y, w, h: rowH, items: [it] };
    });
    return { el: body, groups, items: groups.flatMap((r) => r.items),
             enterMode: 'growX', convertMode: 'wipeX', pad };
  },

  /* ── Stylized-UI shapes ─────────────────────────────────────────────────
     These carry REAL text, so they deliberately do not expose the
     items/fill contract the abstract beats animate. Drive them with the
     ui* beats below. Read references/ui-walkthrough.md before using them:
     legible type is a considered exception to the house style, not an
     upgrade to it. Every one takes a `parent` — normally a `scene.step()`. */

  /** The user's instruction, echoed back above the result. */
  uiEcho(scene, parent, text, { top = 0 } = {}) {
    const box = el('cm-u-echo', parent, { position: 'absolute', top: `${top}px` });
    el('mark', box).textContent = '❯';
    const t = el('', box);
    t.textContent = text;
    scene.uiReset(box, { opacity: 1 });
    return { el: box, textEl: t, h: 52 };
  },

  /**
   * A quiet status line: "Thought for 2.5s", or a tool call plus its target.
   * `accent` is the part that names a real thing (a path, a tool) and is the
   * only part allowed to take colour — the rest is deliberately recessive so
   * the eye lands on the content below, not on the machine narrating itself.
   */
  uiNote(scene, parent, text, { top = 0, accent = '', dim = true } = {}) {
    const box = el('cm-u', parent,
      { position: 'absolute', top: `${top}px`, left: '0', opacity: '0',
        color: dim ? 'var(--color-fg-muted)' : 'var(--color-fg-primary)' });
    const a = el('', box, { display: 'inline' });
    a.textContent = text;
    if (accent) {
      const b = el('', box, { display: 'inline', color: 'var(--color-syntax)' });
      b.textContent = ' ' + accent;
    }
    scene.uiReset(box, { opacity: 0 });
    return { el: box, h: 26 };
  },

  /**
   * Numbered lines with diff state. `rows`: [{ n, text, state }] where state
   * is 'add' | 'del' | undefined. The tint is the claim — an unstated line is
   * context, and context must stay visually quiet or the diff reads as noise.
   */
  diffRows(scene, parent, rows, { top = 0, pitch = 28, gutter = 34 } = {}) {
    const out = rows.map((r, i) => {
      const line = el(`cm-u-line${r.state ? ' ' + r.state : ''}`, parent, { top: `${top + i * pitch}px` });
      const g = el('gut', line, { width: `${gutter}px` });
      g.textContent = r.n ?? '';
      const t = el('', line);
      t.textContent = r.text ?? '';
      return { el: line, state: r.state };
    });
    scene.uiReset(out.map((r) => r.el), { opacity: 0 });
    return { el: parent, rows: out, h: rows.length * pitch };
  },

  /** Radio options with a moving highlight — a decision the viewer watches. */
  optionList(scene, parent, options, { top = 0, pitch = 60 } = {}) {
    const hi = el('cm-u-hi', parent,
      { top: `${top}px`, width: '100%', height: `${pitch - 4}px` });
    const rows = options.map((o, i) => {
      const row = el('cm-u-opt', parent, { top: `${top + i * pitch}px`, width: '100%' });
      el('key', row).textContent = o.key ?? String(i + 1);
      el('radio', row);
      const c = el('', row);
      const t = el('ttl', c); t.textContent = o.title ?? '';
      if (o.sub) { const s = el('sub', c); s.textContent = o.sub; }
      return { el: row, y: top + i * pitch };
    });
    scene.uiReset(rows.map((r) => r.el), { opacity: 0 });
    scene.uiReset(hi, { opacity: 0, y: 0 });
    return { el: parent, rows, hi, pitch, top, h: options.length * pitch };
  },

  /** Name / meta / action rows — a registry, plugin list, or search result. */
  recordRows(scene, parent, records, { top = 0, pitch = 30 } = {}) {
    const rows = records.map((r, i) => {
      const row = el('cm-u-rec', parent, { top: `${top + i * pitch}px` });
      el('', row, { color: 'var(--color-fg-subtle)' }).textContent = '›';
      el('nm', row).textContent = r.name ?? '';
      el('meta', row).textContent = r.meta ?? '';
      const a = el(`act${r.done ? ' done' : ''}`, row);
      a.textContent = r.action ?? '';
      return { el: row };
    });
    scene.uiReset(rows.map((r) => r.el), { opacity: 0 });
    return { el: parent, rows, h: records.length * pitch };
  },

  /** A tab bar with one active tab — says "this lives inside a bigger surface". */
  tabStrip(scene, parent, tabs, { top = 0, active = 0 } = {}) {
    const strip = el('cm-u-tabs', parent, { top: `${top}px` });
    const els = tabs.map((label, i) => {
      const t = el(`tab${i === active ? ' on' : ''}`, strip);
      t.textContent = label;
      return t;
    });
    scene.uiReset(strip, { opacity: 0 });
    return { el: strip, tabs: els, h: 40 };
  },
};

/* ═══════════════════════════════════════════════════════════════════════════
   BEATS — what happens. Every beat takes an absolute `at`, so the code reads
   in the same order as the beat sheet and retiming one beat never cascades.
   ═══════════════════════════════════════════════════════════════════════════ */
export const beats = {
  /**
   * Zero-length steps at t=0 that restore every animated property.
   *
   * A repeating sequence does NOT reset between iterations — each element holds
   * its last value until its own step runs again, so without this the second
   * cycle opens with fully-grown accent content sitting on the background
   * before the panel has faded in. It also makes the cycle idempotent, which is
   * what frame-exact export depends on.
   */
  reset(scene, { panel, body } = {}) {
    const R = { at: 0, duration: 0 };
    scene.push([scene.unit, { scale: 1, opacity: 1 }, R]);
    if (body) {
      const pop = body.items.filter((i) => i.el.classList.contains('cm-pop'));
      const grow = body.items.filter((i) => !i.el.classList.contains('cm-pop'));
      if (grow.length) scene.push([grow.map((i) => i.el), { scaleX: 0 }, R]);
      if (pop.length)  scene.push([pop.map((i) => i.el),  { scale: .92, opacity: 0 }, R]);
      scene.push([body.items.map((i) => i.fill), convOff(body), R]);
    }
    if (panel) {
      scene.push([panel.fill, { opacity: 0 }, R]);
      scene.push([panel.edgesX, { scaleX: 0 }, R]);
      scene.push([panel.edgesY, { scaleY: 0 }, R]);
      scene.push([panel.chrome, { backgroundColor: scene.tokens.frame }, R]);
      scene.push([panel.handles, { opacity: 0 }, R]);
    }
    if (scene.labels.length) scene.push([scene.labels, { opacity: 0 }, R]);
    if (scene._caret) scene.push([scene._caret, { opacity: 0, x: 0, y: 0 }, R]);
    if (scene._sel)   scene.push([scene._sel, { opacity: 0 }, R]);
    // Stylized-UI elements declared their own reset when they were built.
    for (const [target, kf] of scene._ui) scene.push([target, kf, R]);
    return scene;
  },

  /** A dot drifts in — the remnant of the previous cycle, and the seam cover. */
  dot(scene, { at = 0, duration = .6, until }) {
    const d = scene.dot();
    scene.push([d, { opacity: [0, 1, 1], x: [-40, 0], y: [18, 0] }, { at, duration }]);
    if (until != null) scene.push([d, { opacity: 0 }, { at: until, duration: .2 }]);
    return scene;
  },

  /** Two pens trace the frame from the top-left, meeting at the bottom-right. */
  drawFrame(scene, panel, { at, duration = 1.2 }) {
    const half = duration / 2;
    const q = (s) => [...panel.frame.querySelectorAll(s)];
    scene.push(
      [q('.top'),    { scaleX: [0, 1] }, { at,        duration: half, ease: EASE }],
      [q('.left'),   { scaleY: [0, 1] }, { at,        duration: half, ease: EASE }],
      [q('.right'),  { scaleY: [0, 1] }, { at: at + half, duration: half, ease: EASE }],
      [q('.bottom'), { scaleX: [0, 1] }, { at: at + half, duration: half, ease: EASE }],
      [panel.handles, { opacity: 1 }, { at: at + duration - .1, duration: .2 }],
    );
    return scene;
  },

  fillPanel(scene, panel, { at, duration = .35 }) {
    scene.push([panel.fill, { opacity: 1 }, { at, duration }]);
    return scene;
  },

  /**
   * Content appears, unit by unit. `caret: true` puts a caret on the growing
   * edge — that is what makes a width animation read as *generation* rather
   * than as a progress bar, so use it whenever something is being authored.
   *
   * Content enters in its INERT tint, not the accent. Accent means "verified";
   * spending it during authoring throws away the only signal you have.
   */
  enter(scene, body, { at, per = .34, caret = false, mode = body.enterMode }) {
    let t = at;
    const c = caret ? scene.caret() : null;
    if (c) scene.push([c, { opacity: 1 }, { at: at - .1, duration: .2 }]);
    for (const g of body.groups) {
      for (const it of g.items) {
        scene.push(mode === 'popIn'
          // scale from .92 + fade, never from 0 — see .cm-pop
          ? [it.el, { scale: [.92, 1], opacity: [0, 1] }, { at: t, duration: per, ease: EASE_OUT }]
          // linear is right here: a fill wipe is mechanical progress, not a move
          : [it.el, { scaleX: [0, 1] }, { at: t, duration: per, ease: 'linear' }]);
        if (c) scene.push([c, { x: [it.x, it.x + it.w], y: [it.y, it.y] },
                              { at: t, duration: per, ease: 'linear' }]);
        t += per;
      }
    }
    if (c) scene.push([c, { opacity: 0 }, { at: t, duration: .15 }]);
    return t;
  },

  /**
   * A selection box walks the groups, converting each to accent as it lands.
   * Resizing per group is the detail that makes it read as inspecting real
   * content rather than as a decorative rectangle sliding around.
   */
  scan(scene, body, { at, per = .42, count = body.groups.length, until }) {
    const sel = scene.sel();
    let t = at;
    body.groups.slice(0, count).forEach((g, r) => {
      scene.push([sel, { x: g.x - 8, y: g.y - 8, width: g.w + 16, height: g.h + 16 },
                  { at: t, duration: .3, ease: EASE }]);
      if (r === 0) scene.push([sel, { opacity: 1 }, { at: t, duration: .15 }]);
      g.items.forEach((it, i) =>
        scene.push([it.fill, convOn(body), { at: t + .12 + i * .06, duration: .28, ease: EASE }]));
      t += per;
    });
    scene.push([sel, { opacity: 0 }, { at: until ?? t, duration: .2 }]);
    return t;
  },

  /** Convert whatever the scan didn't reach — the "and the rest passes too" beat. */
  convertFrom(scene, body, { at, group = 0, per = .3 }) {
    let t = at;
    for (const g of body.groups.slice(group)) {
      g.items.forEach((it, i) =>
        scene.push([it.fill, convOn(body), { at: t + i * .07, duration: per, ease: EASE }]));
      t += per;
    }
    return t;
  },

  /** Take the accent back off — the rejected half of a field collapse. */
  unconvert(scene, body, items, { at, duration = .35 }) {
    items.forEach((it) => scene.push([it.fill, convOff(body), { at, duration, ease: EASE }]));
    return at + duration;
  },

  /**
   * Units fade back without disappearing — the core move of a field collapse
   * (search, ranking, filtering, matching). Keep `to` above zero: candidates
   * that vanish entirely read as deleted, whereas dimmed ones read as
   * considered-and-rejected, which is the actual claim.
   */
  recede(scene, items, { at, to = .18, duration = .7, stagger = .04 }) {
    items.forEach((it, i) =>
      scene.push([it.el, { opacity: to }, { at: at + i * stagger, duration, ease: EASE }]));
    return at + duration + items.length * stagger;
  },

  /** The survivors of a collapse: converted to accent and nudged forward. */
  promote(scene, body, items, { at, duration = .5, scale = 1.06 }) {
    items.forEach((it, i) => scene.push(
      [it.fill, convOn(body), { at: at + i * .08, duration, ease: EASE }],
      [it.el, { scale }, { at: at + i * .08, duration, ease: EASE }],
    ));
    return at + duration + items.length * .08;
  },

  /** Chrome flips to accent: "this is done / this is ours now". */
  accentChrome(scene, panel, { at, duration = .3 }) {
    scene.push([panel.chrome, { backgroundColor: scene.tokens.accent }, { at, duration }]);
    return scene;
  },

  /**
   * The payoff move. The panel is full size for the whole narrative and only
   * scales here, which is why nothing needs counter-scaling: chrome fidelity
   * at a few percent scale is below what anyone can see.
   */
  collapse(scene, { at, duration = 1.75, to = .012 }) {
    scene.push(
      [scene.unit, { scale: [1, to] }, { at, duration, ease: EASE_IN }],
      [scene.unit, { opacity: 0 }, { at: at + duration - .3, duration: .3 }],
    );
    return scene;
  },

  /**
   * All labels share one slot, so overlapping fades render two words at once
   * ("ReTesting"). Deriving each fade-out from the NEXT cue's start guarantees
   * the outgoing word is gone first, and retiming a beat can't reintroduce it.
   *
   * The cost of that guarantee: a cue placed close behind another silently
   * steals the earlier word's reading time, and nothing errors. A state word
   * needs roughly 0.7s at full opacity to be read, so space the BEATS to fit
   * the words rather than packing them as tight as the motion allows.
   */
  labelCues(scene, cues, { fade = .2, end }) {
    cues.forEach(([name, at], i) => {
      const next = cues[i + 1];
      scene.push(
        [scene.label(name), { opacity: 1 }, { at, duration: fade }],
        [scene.label(name), { opacity: 0 },
         { at: next ? next[1] - fade - .02 : end, duration: fade }],
      );
    });
    return scene;
  },

  /* ── Stylized-UI beats ──────────────────────────────────────────────────
     For walkthroughs built from the ui* shapes. They follow the same two
     rules as everything above: absolute `at` only, and anything animated
     here was registered for reset when its element was built. */

  /**
   * Type a line into the prompt bar. The clip width grows linearly and the
   * caret rides its right edge — that pairing is what reads as *someone is
   * typing* rather than as a bar filling. `hold` blanks the line again so the
   * next step starts from an empty prompt.
   */
  typeText(scene, prompt, { at, index = 0, duration = .9, hold }) {
    const wrap = prompt.wraps[index];
    if (!wrap) return at;
    const w = Number(wrap.dataset.w || 0);
    scene.push(
      [wrap, { width: [0, w] }, { at, duration, ease: 'linear' }],
      [prompt.caret, { x: [0, w] }, { at, duration, ease: 'linear' }],
    );
    if (hold != null) scene.push(
      [wrap, { width: 0 }, { at: hold, duration: .18, ease: EASE }],
      [prompt.caret, { x: 0 }, { at: hold, duration: .18, ease: EASE }],
    );
    return at + duration;
  },

  /** Crossfade the model/mode slot — "the tool is in a different mode now". */
  setMode(scene, prompt, cues, { fade = .22 } = {}) {
    cues.forEach(([index, at], i) => {
      const next = cues[i + 1];
      const n = prompt.modeEls[index];
      if (!n) return;
      scene.push([n, { opacity: 1 }, { at, duration: fade }]);
      if (next) scene.push([n, { opacity: 0 }, { at: next[1] - fade - .02, duration: fade }]);
    });
    return scene;
  },

  /**
   * Bring one step forward and take the previous one away.
   *
   * The outgoing step leaves BEFORE the incoming one arrives (a gap, not a
   * dissolve) because two legible interfaces on screen at once is unreadable —
   * the viewer tries to read both and reads neither. This is the one place a
   * walkthrough deliberately shows nothing.
   */
  showStep(scene, step, { at, out, duration = .3, rise = 10, feel = SPRINGS.sheet }) {
    // A panel arriving — Apple's sheet spring, sampled so the clock stays absolute.
    const { ease } = spring(feel);
    scene.push([step, { opacity: [0, 1], y: [rise, 0] }, { at, duration, ease }]);
    // The outgoing step leaves the way the sequence is travelling (upward), not
    // back the way it came. Apple's mirror-the-path rule governs *reversible*
    // transitions — a sheet that opens up dismisses down. A walkthrough only
    // moves forward, so continuing the direction of travel is what reads as
    // progression; reversing it would read as undo.
    if (out) scene.push([out, { opacity: 0, y: -rise * .6 },
                         { at: at - duration - .08, duration, ease: IN2 }]);
    return at + duration;
  },

  /** Rows appear in reading order — the stagger is what makes it a sequence. */
  revealRows(scene, shape, { at, per = .09, duration = .28 }) {
    shape.rows.forEach((r, i) =>
      scene.push([r.el, { opacity: [0, 1] }, { at: at + i * per, duration, ease: EASE_OUT }]));
    return at + shape.rows.length * per + duration;
  },

  /** Fade a single UI element in (tab strip, echoed instruction, panel). */
  revealUi(scene, target, { at, duration = .28, to = 1 }) {
    scene.push([target, { opacity: to }, { at, duration, ease: EASE_OUT }]);
    return at + duration;
  },

  /** The highlight walks the options — a choice being considered, then made. */
  selectRow(scene, list, cues, { duration = .26, feel = SPRINGS.move } = {}) {
    // Repositioning, so `move` (critically damped): no overshoot. Bounce is
    // earned by momentum — a flick or a throw — and a keyboard selection has
    // none. An overshooting highlight here would be decoration pretending to
    // be physics.
    const { ease } = spring(feel);
    cues.forEach(([index, at], i) => {
      if (i === 0) scene.push([list.hi, { opacity: 1 }, { at, duration: .18 }]);
      scene.push([list.hi, { y: index * list.pitch }, { at, duration, ease }]);
    });
    return scene;
  },

  /**
   * Grow the context meter and crossfade to its new reading.
   *
   * It only ever moves one way. A meter that dips implies work was undone,
   * which is a different claim than the one a walkthrough is making.
   */
  meterTo(scene, chrome, { at, to, index, duration = .8 }) {
    scene.push([chrome.fill, { scaleX: to }, { at, duration, ease: EASE }]);
    if (index != null && chrome.pcts[index]) {
      const prev = chrome.pcts[index - 1];
      if (prev) scene.push([prev, { opacity: 0 }, { at, duration: .18 }]);
      scene.push([chrome.pcts[index], { opacity: 1 }, { at, duration: .18 }]);
    }
    return at + duration;
  },
};
