# CELADON — rebuild prompt series

Prompts to recreate the CELADON site from scratch, section by section. They assume a fresh
machine with **only the assets**:

```
hero scroll scrub.mp4      — the bottle scrub video (hero)
bottle type 1.png … 4.png  — the four concentration renders (Intensities)
bottle frame 1.png         — flacon still (House image)
bottle frame 2.png         — spare still
woman.png                  — portrait on a dark backdrop (Composition)
```

How to use: run the prompts in order, one per session step. Each prompt is self-contained
creative direction plus the exact numbers that make the result identical — paste it as
written. Verify in the browser between prompts before moving on.

---

## Prompt 0 — Scaffolding & design system

```text
We're building a single-page site for CELADON, a fictional fragrance house that makes one
formula at four strengths. One continuous scroll, editorial and restrained, no navigation
chrome. Scaffold the project and the design system first — no sections yet.

Stack: Next.js 15 (App Router, TypeScript), Tailwind v4 (CSS-first config in globals.css),
GSAP + ScrollTrigger, Lenis for smooth scrolling, and the motion library (motion/react)
for component animation. Dev server runs on port 3001.

Fonts via next/font/google: Instrument Serif (weight 400, normal + italic) as the display
face, Instrument Sans (400, 500) for body. Careful with Tailwind v4 here: next/font
attaches its CSS variables on <body>, so define real --font-display / --font-body custom
properties on body (pointing at the next/font variables) — if they only exist inside the
@theme block, handwritten utilities that reference them silently fall back to system fonts.

Palette, as CSS custom properties on :root and mapped into @theme inline so Tailwind
utilities like bg-bone work:
  --bone: #e8e5dd         (page ground)
  --bone-deep: #dedad0    (section ground — everything after the hero sits on this)
  --ink: #171a16          (text)
  --pitch: #10130f        (near-black)
  --muted: #6e7268        (secondary text)
  --celadon: #7e9b84      (accent)
  --celadon-deep: #2e4433 (deep accent)

Type scale as custom properties:
  --step-display: clamp(3.25rem, 8.5vw, 8.5rem)
  --step-h1: clamp(2.25rem, 4.5vw, 4rem)
  --step-h2: clamp(1.5rem, 2.6vw, 2.25rem)
  --step-numeral: clamp(2.5rem, 5vw, 5rem)
  --step-body: 1rem
  --step-small: 0.8125rem

Layout tokens:
  --content-max: 1440px
  --gutter: 24px
  --page-margin: clamp(1.5rem, 6vw, 7rem)
  --section-pad: clamp(6rem, 14vh, 11rem)

Hand-written @utility classes: page-shell (centred max-width column with page-margin
padding), grid-12 (twelve columns, 24px gutters), section-pad (block padding), and type
steps text-display / text-h1 / text-h2 / text-numeral / text-body / text-small. Display
steps use the serif with tight leading (display 0.92, h1 1.0, h2 1.15) and negative
tracking (-0.03em display, -0.02em h1); text-numeral is serif with tabular numerals.
Body is 1rem / 1.7.

Wrap the app in a SmoothScrollProvider client component: Lenis with lerp 0.085, wired to
GSAP's ticker (lenis.raf on tick, lagSmoothing(0)), and lenis.on("scroll",
ScrollTrigger.update). If prefers-reduced-motion, skip Lenis entirely — native scroll.
Also add a global reduced-motion CSS block that zeroes all animation and transition
durations.

body: bone background, ink text, body font. Metadata: title "CELADON", description
"A fragrance in one continuous scroll."

page.tsx: a <main> with className relative z-[1] bg-bone, rendering placeholder stubs for
Hero, About, Composition, Intensities, Acquire, and a Footer after main — we'll build each
in turn. Put the assets I have into public/ as-is.
```

---

## Prompt 1 — Extracting the hero frames

```text
The hero will be a scroll-scrubbed image sequence drawn to a canvas, sourced from
public/"hero scroll scrub.mp4". Video elements scrub badly (keyframe seeking stutters),
so pre-extract frames with ffmpeg.

Requirements:
- Motion-interpolate the video to a higher frame rate first (ffmpeg minterpolate) so the
  extracted sequence is dense enough that scrubbing between neighbouring frames looks
  continuous — target 298 frames total from the clip.
- Export as JPEG, quality high enough that the bottle's glass edges stay clean but each
  frame lands well under 100 KB at 1080p-ish (around -q:v 4).
- Name them public/hero/frames/scrub/frame_001.jpg through frame_298.jpg (zero-padded
  to 3 digits).

Run the extraction, confirm the count and a few file sizes, and open the first, middle
and last frames to check the interpolation didn't produce warping artifacts.
```

---

## Prompt 2 — Hero (scrubbed canvas + overlay exits + cover handoff)

```text
Now the hero. A pinned full-viewport stage where scrolling plays the 298-frame bottle
sequence, with an editorial overlay that exits as soon as you start scrolling. The bone
color (#e8e5dd) of the frames matches the page ground so the stage feels borderless.

Structure: a track section of height calc(350vh + 100svh) with a sticky top-0 h-svh
stage inside. Track progress from a useScroll on the track ("start start" to "end end").

Canvas scrub — smoothness comes from three layers:
1. The interpolated source frames (already extracted).
2. A rAF lerp: scroll writes only a target frame (continuous, not rounded); a
   requestAnimationFrame loop eases current toward target with factor 0.16, snapping when
   the gap is under 0.004 frames. Pause the loop via IntersectionObserver (300px margin)
   when the hero is off screen.
3. Sub-frame cross-blend: for a fractional position, draw floor(pos) at full alpha, then
   ceil(pos) at alpha = fraction, so even slow scrolling never steps visibly.
Frames map to scroll so the sequence completes at 60% of track progress and holds the
last frame. Draw object-fit cover by hand. Backing store = element size × devicePixelRatio
capped at 2, imageSmoothingQuality high, context { alpha: false }, and fill the canvas
with bone before the first frame decodes so there's no black flash. Preload all 298
frames eagerly; redraw as soon as frame 1 loads. On resize, resize the store and redraw.

Overlay, three clusters (pointer-events none except the button):
- Top left: three note cards, width 15.5rem, stacked with 1rem gaps, at
  top clamp(2rem, 6vh, 4.5rem), left = page margin. Each card: bone-deep/85 background,
  padding 1.25rem, serif name, notes line, muted timing line. Content:
    Top    — Bergamot, green mandarin, pink pepper — 0 to 15 minutes
    Heart  — Iris, vetiver, neroli — 15 minutes to 3 hours
    Base   — Oakmoss, cedar, ambrette — 3 hours onward
- Top right, right-aligned, max 30ch: muted paragraph "The same formula at four strengths.
  From a two hour cologne to a twelve hour extrait, only the intensity changes." and below
  it a button "Acquire the composition" linking to #acquire — ink fill, bone text, small
  size, padding 0.875rem × 1.75rem, hover fill celadon-deep.
- Bottom centre: the wordmark CELADON as an h1, nearly viewport-wide —
  clamp(3.25rem, 17.5vw, 19rem), serif, leading 0.82, tracking -0.02em — filled with a
  vertical gradient from ink at the top to transparent at 112% (background-clip: text),
  so it fades downward into the bottle.

On load, everything rises in gently (12px, 0.6s, ease [0.16, 1, 0.3, 1], staggered:
wordmark first at 0.05s, cards from 0.15s stepping 0.12s, paragraph at 0.3s).

Scroll exits — every value a pure function of track progress, so scrolling back up
rebuilds the stage. Everything must FULLY clear the viewport by 20% of the track:
- Cards slide out left to -45vw with fade, staggered windows [0.02–0.10], [0.06–0.14],
  [0.10–0.18].
- Paragraph + button slide out right to +45vw over [0.04–0.16].
- Wordmark sinks to 115% of its own height with fade and a slight scale to 0.96 over
  [0.04–0.20].
Once any cluster's opacity is under 0.02 set visibility hidden so nothing lingers.

Cover handoff: the next section will be pulled up over the pinned stage. In page.tsx wrap
everything after Hero in a div with -mt-[100svh] and relative z-10 (that's what the extra
100svh on the track pays for: the stage stays pinned while the next section slides over
it, and unpins exactly when covered). And from 72% to 100% of the track, wash a bone
overlay over the held frame from opacity 0 to 0.55, so the product visibly recedes rather
than being cut mid-body by the advancing edge.

Narrow viewports (max-width 860px) and reduced motion: no scrub, no pin — a static
min-h-svh section showing frame_001 as a cover image with the full overlay visible and
stacked in flow, plus one extra empty viewport of bone below it so the -100svh pull
doesn't cover the content. The matchMedia guard must also prevent phones from ever
starting the 298-frame download.
```

---

## Prompt 3 — About ("The practice" grid)

```text
Next section: About, on bg-bone-deep (#dedad0), min-h-svh. This block slides over the
pinned hero, so give it shallow top padding — clamp(3.5rem, 8vh, 6rem) — with normal
section padding at the bottom; the heading should ride close to the advancing edge.

Heading top left: "The practice" with "practice" in italic, serif,
clamp(2.5rem, 6vw, 5.5rem), leading 0.95, tracking -0.02em, rising from below inside an
overflow-hidden wrapper (y 60% → 0, 1.3s, ease [0.16, 1, 0.3, 1], once, at 25% in view).

Under it, one sentence broken into three fragments placed across the 12-column grid,
small caps style (text-small, uppercase, tracking 0.16em, muted), staggered rises:
  cols 1–2:  "It is"
  cols 3–5:  "one composition, refined for years,"
  cols 9–12 (right-aligned): "and released at four strengths. Nothing else leaves the studio."

Then the centrepiece: four expandable cards in a staircase. Desktop grid: 4 columns,
2 rows of clamp(19rem, 44vh, 24rem), no gaps. Cards sit at (col 1, row 1), (col 2, row 2),
(col 3, row 1), (col 4, row 2) — neighbours meet at shared corners. Content:
  01. The house — "Founded in 2021 in Ghent, four people and one still room. Small enough
      that every batch passes through the same hands, patient enough that nothing ships
      before its year is up."
  02. One formula — "Most houses answer every season with a new bottle. We keep a single
      formula and spend our years deepening it. The work is not variety. The work is depth."
  03. The materials — "Bergamot from Calabria, iris butter from Florence, oakmoss
      tinctured in the studio. The heart notes were chosen because they age well together,
      folding into one another as the day wears on."
  04. Four strengths — "Concentration changes character, not just duration. At three
      percent the formula is a citrus sketch. At twenty seven it is a shadow that lasts
      until midnight. Four strengths, one argument."

Card anatomy: uppercase small-caps title top left, serif numeral (1.75rem) top right,
body copy in the middle (max 38ch), a "+" glyph bottom left. One card open at a time
(card 02 open by default); clicking toggles; open card gets a solid bone fill and its
numeral turns celadon-deep; body copy fades in place (8px rise) inside the existing box
so nothing reflows. Hover: bone/60 fill, numeral tints celadon-deep, the "+" rotates 90°
(45° when open). Cards are keyboard-operable (role button, Enter/Space).

The grid's edges are DRAWN, not borders — this is the one place on the site lines are
wanted. An absolutely positioned SVG (viewBox 0 0 100 100, preserveAspectRatio none,
non-scaling strokes, stroke muted at 0.4 opacity) draws the shared edges on entrance
like a traversal being visualised: three horizontals (y = 0, 50, 100) sweep left to right
over 1.8s at delays 0 / 0.15 / 0.3, then five verticals (x = 0, 25, 50, 75, 100) draw
over 1.1s at delays 0.35 / 0.55 / 0.75 / 0.95 / 1.15. Same ease, play once.

While a card is hovered, its border comes alive: paint over the static lines on that
cell with a bone-deep rect (strokeWidth 3), then run two dashed segments circulating the
perimeter — pathLength normalised to 100, strokeDasharray "20 30", strokeDashoffset
animating 0 → -100 on a 3.2s linear infinite loop, stroke celadon-deep at 0.8. Fade the
whole group in/out over 0.35s so it doesn't pop.

Cards themselves rise in staggered (0.45s base + 0.18s per card). Mobile: single column,
cards get bone/60 fills and min-height 15rem, no SVG grid. Reduced motion: no entrance
animations, everything visible.
```

---

## Prompt 4 — Composition (the time axis)

```text
Composition section, still on bone-deep. Concept: a time axis reading downward — the
same three layers from the hero cards, now as a descent the visitor scrolls through.

Backdrop: woman.png fills the section (object-cover, anchored right). Its backdrop is
near-black, and this must stay a LIGHT section — dissolve it with a left-to-right
gradient overlay: solid bone-deep from 0% to 46%, fading to transparent at 80%. The
subject holds the right edge; the left half is clean ground for the text.

Content (page-shell, section-pad, above the image): three rows descending as a staircase,
16vh vertical gaps, each indented from the container's left edge by 0%, 6%, 12% of its
width, with clamp(3.5rem, 7vw, 6rem) of left padding for the path to live in:
  Top    (text-h1) / Bergamot, green mandarin, pink pepper (text-h2) / 0 to 15 minutes (text-small)
  Heart  / Iris, vetiver, neroli / 15 minutes to 3 hours
  Base   / Oakmoss, cedar, ambrette / 3 hours onward

The drawing: ONE continuous SVG polyline drawn by scroll from top to bottom, celadon
stroke, 1.5px. It starts at the first row's left edge at the container top, drops
vertically, steps RIGHT to the next indent at 32px below each subsequent row's top edge,
and continues past the last row to the container bottom. Measure the real row offsets at
runtime to build the path (M x0 0, V corner1, H x1, V corner2, H x2, V height), set
strokeDasharray to the path length and animate strokeDashoffset from a ScrollTrigger on
the section (start "top 70%", end "bottom 70%", no pin) so the line draws with scroll and
un-draws when scrolling back. Rebuild on resize/refresh.

A serif numeral (text-numeral, ink) rides the line via CSS offset-path with the same
path and offsetRotate 0deg, its offset-distance following scroll progress exactly. It
reads "01", switching to "02" and then "03" as it arrives at each row. The row it has
reached deepens from muted to ink (700ms color transition); rows ahead of it stay muted.
Drive the numeral and stroke with direct style writes from the ScrollTrigger callback,
not React state — only the reached-index (for text + colors) goes through state.

Reduced motion: line fully drawn, numeral at the end, all rows ink.
```

---

## Prompt 5 — Intensities ("The Descent")

```text
The four concentrations as a descent. A pinned dark stage where scrolling deepens
everything at once: the bottle render, the light in the room, the name, the wear data.
Assets: public/"bottle type 1.png" … "bottle type 4.png" (2244 × 2804), one per strength,
liquid deepening from pale to near-black across them.

Track: 650vh, sticky h-svh stage, overflow hidden. Background: a 160deg linear gradient
from celadon-deep to pitch at 85%. Text bone. The four steps play over the FIRST 60% of
the track — remap track progress 0–0.6 to a "descent" value 0–1 and drive all step
choreography from that. (The rest of the track is the handoff to the next section; leave
it be for now — next prompt.)

The steps:
  01 Eau de Cologne    —  3 per cent oil, worn for 2 hours
  02 Eau de Toilette   —  9 per cent oil, worn for 4 hours
  03 Eau de Parfum     — 18 per cent oil, worn for 7 hours
  04 Extrait de Parfum — 27 per cent oil, worn for 12 hours

Centre: the bottle, 62vh tall, centred, width from the 2244/2804 ratio, scaling gently
1 → 1.06 across the descent. All four renders stacked; crossfades happen in ±0.04 windows
around the descent boundaries 0.25 / 0.5 / 0.75 (so 0.21–0.29, 0.46–0.54, 0.71–0.79).

The room is lit by the liquid: a radial glow behind the bottle —
radial-gradient(46% 42% at 50% 56%, color, transparent 70%) — whose color interpolates
through the step midpoints (descent 0.125 / 0.375 / 0.625 / 0.875):
  rgba(220, 229, 214, 0.38) → rgba(185, 205, 178, 0.38) →
  rgba(126, 155, 132, 0.40) → rgba(63, 90, 70, 0.50)

Behind the bottle, the concentration name at display scale: bottom 5vh, centred,
whitespace-nowrap, serif, clamp(2.75rem, 7.5vw, 8.5rem), bone. On every step change it
cascades letter by letter — outgoing letters blur upward (to -0.55em, blur 8px, 0.4s
ease-in, stagger 0.016s), incoming letters rise from 0.85em below with blur 10px
clearing to 0 (0.7s, ease [0.16, 1, 0.3, 1], stagger 0.03s, delayChildren 0.06) —
overlapping in place, keyed by the name.

Left edge, vertically centred: the wear line for the active step, "{oil} per cent oil,
worn for {hours} hours", small, bone/70, rolling on step change inside a 3rem-tall
overflow-hidden box (out upward 1.2em, in from 1.2em below, 0.45s).

Right edge, vertically centred, right-aligned column: step indices 01–04, serif, 1.25rem,
active one bone, the rest bone/30, 500ms color transitions.

Active step index derives from descent quarters (0.25 / 0.5 / 0.75). Narrow viewports
(max-width 860px) and reduced motion: no pin — a calm stacked list on the same gradient,
each step as a centred 36vh render with name (text-h2) and wear line beneath.
```

---

## Prompt 6 — The house (inside the pinned descent)

```text
Now the handoff that ends the descent. The house section does NOT get its own scroll
section — it lives INSIDE the Intensities pinned stage. The descent empties, the room
goes fully dark, the light rises, and the house content cascades in on the light before
the stage unpins into the next section. Track progress runs the show:

- 0.58–0.66: the glow dies (opacity 1 → 0) while a solid pitch layer fades IN over the
  green gradient (0 → 1). The darkest moment must be NEUTRAL black — the light layer must
  never blend with green.
- 0.60–0.68: every descent element leaves through its own edge: the bottle sinks
  (translateY 0 → 30vh over 0.60–0.70) while fading; the wear line slides out left
  (-45vw); the indices slide out right (+30vw); both side rails fade over 0.60–0.66.
  Past 98% of the exit set visibility hidden — nothing may linger.
- The giant name plays its own letter-cascade exit when progress passes 0.61 (unmount it,
  let the exit variants run).
- 0.66–0.80: a bone-deep layer rises over the neutral pitch (opacity 0 → 1). The dawn.
- At 0.80: the house enters on the light.

CRITICAL implementation constraint, learned the hard way: inside this pinned stage, write
the handoff styles (glow/pitch/dawn opacities, exit transforms) DIRECTLY to the elements
via refs from the scroll callback — do not bind numeric motion values as styles. The
re-render that mounts the house resets style bindings to their initial values, which
drops the dark stage back in behind the house. Direct writes can't be reset; also
re-assert them in an effect after every render, which covers loading mid-track too.

The house content, absolutely positioned over the stage, vertically centred, ink on the
risen bone, page-shell width:
- Heading "The house" — the echoed cascade: the exact letter-by-letter rise used by the
  concentration names (0.85em rise, blur 10px → 0, stagger 0.04s, delayChildren 0.1),
  now ink on bone, serif, clamp(2.75rem, 7.5vw, 8.5rem), inside an overflow-hidden
  wrapper. When scrolling back up it cascades out the same way.
- Below, a 12-column grid, 6vh gap from the heading. Left, columns 1–5, two paragraphs
  (max 38ch, body, ink/80) settling up from 48px at delays 0.55s and 0.70s:
    "Founded in 2021 in Ghent, by four people who wanted to make one thing properly
    rather than many things quickly. The house occupies a single still room, and every
    batch that leaves it has passed through the same four pairs of hands."
    "Nothing here is seasonal. The formula does not change, the bottle does not change,
    and nothing ships before it has rested a full year. The only decision left to make
    is how much of the composition to carry."
- Right, columns 7–12: public/"bottle frame 1.png" (1672 × 941), settling at 0.40s, with
  a gentle parallax on an OUTER wrapper (so it never fights the entrance animation):
  translateY from 40px to 0 across track progress 0.8 → 1.0, written via direct ref
  writes from the scroll callback.

Narrow viewports and reduced motion: render a plain static house section after the
stacked intensities list — bone-deep, section padding, h1 heading, image, then the two
paragraphs.
```

---

## Prompt 7 — Acquire (the specimen table)

```text
Acquire section, id="acquire" (the hero button and footer link target it), bone-deep,
min-h-svh, page-shell + section-pad. A specimen table, not a data table: four rows held
together by scale and space. NO lines anywhere — separation is tonal.

Heading "Acquire" top left, same treatment as the About/practice heading (serif
clamp(2.5rem, 6vw, 5.5rem), rise from below in an overflow-hidden wrapper).

Rows, after a clamp(3rem, 8vh, 6rem) gap:
  Eau de Cologne     |  3 % |  2 hr | 100 ml |  95 EUR
  Eau de Toilette    |  9 % |  4 hr | 100 ml | 135 EUR
  Eau de Parfum      | 18 % |  7 hr | 100 ml | 185 EUR
  Extrait de Parfum  | 27 % | 12 hr |  50 ml | 260 EUR

Shared 5-column grid template for the header row and body rows so they align exactly:
minmax(0,2.2fr) / 1fr / 1fr / 0.9fr / 0.9fr, with the standard 24px gutters. Header row
(desktop only): Concentration / Oil / Longevity / Volume / Price in small caps
(text-small, uppercase, tracking 0.16em, muted), price right-aligned.

Each row: name as serif text-h2; oil and longevity as SPECIMENS — the value at
text-numeral scale in the serif with its unit ("%" / "hr") tucked beside it in small
muted sans; volume and price in plain body text, price right-aligned. Rows are
min-height 8.75rem, items centred.

Tonal separation: every second row (2nd and 4th) carries a bone/50 fill. On hover the row
fills with celadon at 12% opacity and the serif numerals deepen to celadon-deep (500ms
transitions). Give rows -mx-4 px-4 so the fills bleed slightly past the text column while
the text stays aligned with the header row.

Rows rise in staggered on scroll (16px, 1.1s, 0.25s base + 0.12s per row, once, 25% in
view). Narrow viewports: hide the header row; each row becomes a 2-column grid with the
name across the top and small-caps labels above each value. Reduced motion: no rises.
```

---

## Prompt 8 — Footer (the fixed reveal)

```text
Last section: the footer, and the page-end mechanic that reveals it. The footer is a
FIXED, full-viewport layer pinned behind the page (fixed bottom-0, h-screen, z-0,
overflow hidden), celadon-deep background, bone text. It never moves itself. Give <main>
a bottom margin of calc(100vh + 2px) — the page scrolls past its own end and uncovers
the footer standing still beneath it. (The +2px pushes the last section fully past the
viewport top; without it subpixel rounding leaves a 1px sliver above the footer. main
keeps relative z-[1] and its own background so it actually covers the footer while
scrolling.)

The wordmark is the entire composition: CELADON in the serif, tracking -0.02em, sitting
at the very bottom and fitted EDGE TO EDGE — no vw guessing. Measure it: render at some
size, compare rendered width to window.innerWidth, multiply the font size by the ratio,
repeat until within 0.5%. Re-fit on resize and after document.fonts.ready; keep it at
opacity 0 until first fitted so there's no visible jump. Crop its baseline with the
bottom screen edge by pulling it down with a negative bottom margin of 0.21em.

While the footer is being uncovered — the last viewport of document scroll — the
wordmark rises 60px against the scroll (translateY (1-t)·60px, t = uncover progress
computed from scrollHeight − innerHeight − scrollY). Write the transform directly to the
element from a passive scroll listener, not through state. Skip under reduced motion.

Upper left (page margin, 14vh from the top): three links stacked — Acquire → #acquire,
Instagram → #, Contact → mailto:studio@celadon.house — body size, bone/70 to bone on
hover. Below them, 2.5rem down, one serif line at text-h2, bone/80, max 26ch:
"Bergamot, green mandarin, pink pepper. Iris, vetiver, neroli. Oakmoss, cedar, ambrette."

Upper right, mirroring (desktop only): a small-caps label "Four strengths" (bone/40),
then the numeral ladder reading down — 03 Cologne, 09 Toilette, 18 Parfum, 27 Extrait —
each row a small-caps label beside a serif numeral at clamp(2rem, 3vw, 3rem). The
numerals deepen down the list the way the liquid deepens: bone/30, /45, /60, /80.

Nothing else. No columns of links, no legal, no social row.
```

---

## Verification pass (optional closing prompt)

```text
Full-page pass: scroll the whole site top to bottom and back in the browser and verify —
hero overlay fully clears by 20% of the track and rebuilds on the way up; About covers
the held hero frame cleanly with no gap or flash; the composition line draws and
un-draws with the numeral riding it; the descent crossfades land on the step boundaries;
the handoff passes through NEUTRAL black (no green tint under the dawn) and no descent
element lingers behind the house; the house cascade replays when scrolling back; Acquire
row hover fills bleed but text stays aligned to the header; the footer wordmark is
edge-to-edge at multiple window widths and its rise tracks the uncover. Fix anything
that misses, then run a production build to confirm it compiles clean.
```
