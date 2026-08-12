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
  };

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
};
