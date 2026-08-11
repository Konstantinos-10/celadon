# CELADON, build prep

Everything decided before a line of code. Brand, design system, section spec,
and every prompt with the output it is meant to produce.

Stack: VSCode and Claude Code, ChatGPT for stills, Kling for video, Canva for
layer and label work, Next.js with Tailwind, GSAP, Lenis and Motion.

---

## 0. House rules

These are absolute and they override anything else in this document.

| Rule | Applies to |
|---|---|
| No em dashes anywhere | All copy, headings, captions, alt text |
| No eyebrows of any kind | No small label above a heading, ever, unless explicitly requested for that section |
| No pill or capsule shapes | Tags, badges, buttons, chips |
| No monospace | Removed from the type system entirely |
| No hairlines or 1px rules | Separation comes from tonal fill and space, unless a line is explicitly specified |
| No decorative bullets | Lists only where the content is genuinely enumerable |

The only line anywhere on the site is the drawn SVG path in section 03, which
is specified below and is doing real work.

---

## 1. The brand

CELADON is a small perfume house that makes exactly one composition and
releases it in four concentrations.

Line: One composition. Four intensities.

That conceit is load bearing. It is why the concentration ladder is the
centrepiece instead of a product grid stapled to the bottom. There is no
catalogue to show, only the same thing at four strengths.

The composition, needed for section 03 and for the image prompts:

| Position | Window | Notes |
|---|---|---|
| Top | 0 to 15 minutes | Bergamot, green mandarin, pink pepper |
| Heart | 15 minutes to 3 hours | Iris, vetiver, neroli |
| Base | 3 hours onward | Oakmoss, cedar, ambrette |

Green, dry, mineral. Not sweet, not gourmand, not amber. That matters for the
palette below.

---

## 2. Design system

### The one decision worth defending

Almost every AI generated luxury fragrance site lands in the same place: cream
background, Didone serif, warm amber accent. Your members have seen it a
hundred times.

So the liquid is not amber. It is celadon, a pale grey green, the colour of the
glaze the house is named after. The palette is bone and green black, and the
only saturated colour anywhere on the site is the perfume itself. Colour
arrives with the product and nowhere else.

### Colour

| Token | Hex | Use |
|---|---|---|
| `--bone` | `#E8E5DD` | Page background, must match the studio backdrop in the hero video exactly |
| `--bone-deep` | `#DEDAD0` | Card fills, table row fills, section alternation |
| `--ink` | `#171A16` | Body and display text |
| `--pitch` | `#10130F` | Intensities section and footer |
| `--muted` | `#6E7268` | Inactive states, secondary text |
| `--celadon` | `#7E9B84` | Active states, EDP liquid |
| `--celadon-deep` | `#2E4433` | Extrait liquid, accents on dark |

Liquid tones for the ladder, and the exact values that go in prompt D:

| Concentration | Oil | Liquid | Longevity |
|---|---|---|---|
| Eau de Cologne | 3% | `#DCE5D6` | 2 hours |
| Eau de Toilette | 9% | `#B9CDB2` | 4 hours |
| Eau de Parfum | 18% | `#7E9B84` | 7 hours |
| Extrait de Parfum | 27% | `#3F5A46` | 12 hours |

### Typography

Two faces, from the same foundry, which keeps them coherent without either one
disappearing into the other.

**Instrument Serif**, 400 and italic, for display and for every numeral that
appears at any size above body text.

**Instrument Sans**, 400 and 500, for body, labels, table headers and
navigation.

The rule that replaces the old monospace rule: **numerals are always set in
Instrument Serif, at display scale.** The sans never carries a number larger
than body size. Percentages, hours, section indices and prices are all serif
and all large. This is what makes the data feel like a specimen sheet rather
than a spreadsheet, and it is the reason the mono is not missed.

### Scale

```css
--step-display: clamp(3.25rem, 8.5vw, 8.5rem);   /* lh 0.92, ls -0.03em */
--step-h1:      clamp(2.25rem, 4.5vw, 4rem);     /* lh 1.0,  ls -0.02em */
--step-h2:      clamp(1.5rem, 2.6vw, 2.25rem);   /* lh 1.15 */
--step-numeral: clamp(2.5rem, 5vw, 5rem);        /* serif, tabular figures */
--step-body:    1rem;                             /* lh 1.7, max 62ch */
--step-small:   0.8125rem;                        /* lh 1.55 */
```

Uppercase labels, where a section genuinely needs one, are `--step-small` in
Instrument Sans at 0.16em letterspacing. They are labels attached to structure,
such as a table header or a card title. They are never floated above a heading.

### Layout

Max width 1440, centred. Twelve columns, 24px gutters. Page margin
`clamp(1.5rem, 6vw, 7rem)`. Section block padding `clamp(6rem, 14vh, 11rem)`.

### Motion

Lenis at `lerp: 0.085` drives everything. GSAP ScrollTrigger handles the hero
scrub, the section 03 path, and the pinned ladder. Motion handles enter
transitions only, meaning fades and 12px rises at 600ms. Easing for anything
not scroll driven is `cubic-bezier(0.16, 1, 0.3, 1)`.

Under `prefers-reduced-motion` the hero shows a static frame, the ladder
becomes a normal stacked scroll, and the section 03 number sits at its final
position. Build this from the start.

---

## 3. Sections

| # | Section | Job |
|---|---|---|
| 01 | Hero | The scrubbed bottle. Wordmark and nothing else. |
| 02 | About | Staggered numbered cards, expandable. |
| 03 | Composition | Staircase rows against a monochrome portrait. |
| 04 | Four intensities | The signature. Pinned, scroll driven. |
| 05 | The house | Two paragraphs and one image. |
| 06 | Acquire | The specimen table. |
| 07 | Footer | Full viewport, revealed. |

### 01 Hero

Scroll scrubbed video across roughly 350vh. The wordmark sits centred above the
bottle, set in Instrument Serif at display scale. No tagline, no scroll hint,
no label. The page background is `--bone` and the video backdrop is the same
value, so the bottle floats in the page rather than sitting in a rectangle.

### 02 About

Built on the reference layout. Four cards arranged in a staggered run across
the full width, each offset vertically from its neighbour so the row reads as a
staircase rather than a grid. Card numerals sit top right in Instrument Serif.
Cards are defined by a `--bone-deep` fill, not by a border, since the house
rules remove hairlines.

Above the cards, one sentence broken into three fragments and distributed
across the grid at left, centre left and far right, exactly as in the
reference. This is the device that makes the section feel composed. It is a
sentence, not an eyebrow.

The four cards:

| | Card | Content |
|---|---|---|
| 01 | The house | Founded, where, and the size of the operation |
| 02 | One formula | The thesis. Open by default. |
| 03 | The materials | Sourcing, and why the three heart notes were chosen |
| 04 | Four strengths | Why concentration and not variation |

Collapsed cards show title and numeral with a plus at the bottom left. Expanded
cards show the body copy and swap the plus for a cross. Only one card open at a
time. The card that opens pushes nothing, since the cards are already at full
height and the copy fades in within the existing box.

### 03 Composition

A fragrance is not one smell. It evaporates in stages, and perfumery describes
it in three layers by how long each survives on skin. Top notes are the
volatile molecules that arrive first and burn off inside fifteen minutes. The
heart is what the perfume actually is, and it holds for a few hours. The base
is what remains at the end of the day.

So this section is a time axis, and everything in it encodes descent.

**Layout.** Full bleed 16:9 monochrome portrait behind the section, with the
subject occupying the right third of the frame and open negative space on the
left. The three rows sit over that empty left area. See prompt F.

**The rows.** Each row is the position name in Instrument Serif at `--step-h1`,
with the note names beneath at `--step-h2` and the time window at
`--step-small` in the sans. Each row is indented further right than the one
above it, so the three rows descend as a staircase. Roughly 0, 6% and 12% of
the container width.

**The path.** A single SVG polyline runs from the top of the section to the
bottom, stepping right at each row so it traces the staircase. It draws itself
on scroll via `stroke-dasharray` and `stroke-dashoffset`, at 1.5px, in
`--celadon`.

**The travelling numeral.** A number rides down the path as you scroll, set in
Instrument Serif at `--step-numeral`. It reads 01, then 02, then 03, changing as
it arrives at each row. The row it has reached goes from `--muted` to `--ink`.
Position it with `offset-path` against the same path data, driving
`offset-distance` from the ScrollTrigger progress.

This is the only drawn line on the site, which is exactly why it registers.

### 04 Four intensities

Pin the viewport against `--pitch`. Scroll advances an index from 0 to 3. On
each step the bottle crossfades at 400ms, which is why the four stills must be
framed identically. The liquid deepens through the four hexes. The percentage
counts up in Instrument Serif at display scale. The longevity bar grows. The
name changes in serif.

The numbers do the animating. You are not inventing motion, you are showing
data that happens to be real.

### 05 The house

Two paragraphs and one image, on `--bone`. Gentle parallax on the image, no
more than 40px of travel. This section exists to give the eye somewhere to rest
between the two heaviest sections. Resist adding to it.

### 06 Acquire

A specimen table, not a data table. Strength comes from scale and space rather
than from rules and borders.

Four rows, one per concentration. Row height around 140px. Columns: name,
concentration, longevity, volume, price. The name sits in Instrument Serif at
`--step-h2`. Concentration and longevity are serif numerals at
`--step-numeral`, using `font-variant-numeric: tabular-nums` so the columns
align. Volume and price are sans at body size.

Column headers are uppercase sans at `--step-small`, 0.16em letterspacing,
in `--muted`.

Separation is tonal. Rows alternate between transparent and `--bone-deep` at
low opacity, and there are no lines between them. On hover the whole row fills
with `--celadon` at 12% and the serif numerals shift to `--celadon-deep`.

| Concentration | Oil | Longevity | Volume | Price |
|---|---|---|---|---|
| Eau de Cologne | 3% | 2 hr | 100ml | 95 EUR |
| Eau de Toilette | 9% | 4 hr | 100ml | 135 EUR |
| Eau de Parfum | 18% | 7 hr | 100ml | 185 EUR |
| Extrait de Parfum | 27% | 12 hr | 50ml | 260 EUR |

### 07 Footer

Full viewport height, fixed behind the entire site from the first frame,
uncovered as the acquire section scrolls up and off.

```css
.site-footer { position: fixed; inset: auto 0 0 0; height: 100vh; z-index: 0; }
main { position: relative; z-index: 1; background: var(--bone);
       margin-bottom: 100vh; }
```

Background is `--pitch`. The wordmark CELADON is set in Instrument Serif at
whatever size fills the viewport width edge to edge, sitting on the baseline at
the very bottom so the descender area is cropped by the screen edge. The
letterforms are the entire composition.

Above the wordmark, in the upper left, three links in sans at body size and one
line of the composition in serif. Nothing else. No social icons, no newsletter
capture, no back to top.

As the footer is uncovered, the wordmark rises by 60px against the scroll, so
it reads as something that was always there rather than something arriving.

Optional and worth trying on camera: set the C as an oversized alternate that
breaks the cap height of the rest of the word, echoing the swash O in the
reference image.

---

## 4. Prompts

### A, ChatGPT, hero start frame

```
Studio product photograph of a perfume bottle, shot on a seamless backdrop
of a cool bone grey colour, hex #E8E5DD, filling the entire frame edge to
edge with no visible horizon line or floor seam.

The bottle: a heavy rectangular flacon, thick clear glass with a solid
weighted base, softly bevelled shoulders, a short neck, and a brushed
nickel cap. The liquid inside is a pale grey green, hex #7E9B84,
translucent. Absolutely no text, no lettering, no logo, no label anywhere
on the bottle or cap.

Lighting: one large soft key from the upper left, broad and even, with a
gentle falloff to the right. A soft contact shadow directly beneath the
bottle. No hard speculars, no rim light, no coloured gels.

Camera: 85mm equivalent, straight on at bottle mid height, bottle centred
in frame with generous headroom above the cap. Shallow but not extreme
depth of field. Clean, sharp, high end commercial product photography.

16:9 landscape. Photorealistic.
```

The glass is blank on purpose. Generated lettering is always mangled, and the
wordmark should be real type set over the video anyway.

### B, ChatGPT, hero end frame

Do not write a fresh prompt. Upload the approved start frame and ask for an
edit, so the bottle, backdrop and lighting stay locked.

```
Edit this image. Keep the bottle, the backdrop colour, the lighting, the
camera angle and the framing exactly identical. Do not redraw or reshape
the bottle.

Change only this: the brushed nickel cap is now removed and resting
upright on the backdrop to the right of the bottle, and a fine cloud of
atomised mist hangs in the air just above and to the right of the open
neck, drifting rightward. A light scatter of small liquid droplets has
landed on the backdrop behind and to the right of the bottle, catching the
light.

Same bone grey backdrop, same soft key from the upper left, same contact
shadow. Photorealistic, no text anywhere.
```

The two frames must differ only in the thing that animates. If the bottle
shifts by even a few pixels between them, Kling will morph it and the scrub
will look like melting glass.

### C, Kling, image to video

Start frame A, end frame B, five seconds, highest quality mode available.

```
The camera is locked off and pushes in very slightly, no more than three
percent over the full shot, perfectly smooth and continuous.

The cap lifts straight up off the neck, drifts to the right and settles
upright on the backdrop. As it clears the neck, a fine cloud of atomised
mist blooms outward from the opening and drifts to the right, and a
scatter of fine droplets travels back and lands on the backdrop behind the
bottle.

One single continuous take. The bottle itself stays completely still and
does not change shape, scale or position at any point.
```

Negative prompt:

```
cut, jump cut, scene change, camera shake, handheld, zoom, whip pan,
people, hands, text, letters, logo, watermark, morphing, warping,
distortion, bottle deforming, extra bottles, colour shift, flicker
```

Expect four or five runs. The cap detaching is the fragile part, since small
rigid objects separating is where Kling is weakest. Keep the failures. The two
best failures plus your explanation of why they failed is now the strongest
segment in the tutorial.

If the cap fights you after five attempts, regenerate the start frame with the
cap already resting beside the bottle and make the mist bloom the whole action.
It is a stronger five seconds anyway, and it reverses cleanly on scroll up.

### D, ChatGPT, the four concentrations

One master prompt, run four times, changing only the bracketed line. Every
other word stays identical or the crossfade in section 04 will jump.

```
Studio product photograph of a perfume bottle on a seamless backdrop of a
near black green, hex #10130F, filling the entire frame with no horizon
line.

The bottle: a heavy rectangular flacon, thick clear glass with a solid
weighted base, softly bevelled shoulders, a short neck, brushed nickel
cap. No text, no lettering, no logo, no label anywhere.

[ VARIABLE, change only this line ]
The liquid inside is [PALE MISTY GREEN, hex #DCE5D6 / SOFT SAGE GREEN, hex
#B9CDB2 / MID GREY GREEN, hex #7E9B84 / DEEP FOREST GREEN, hex #3F5A46],
translucent.
[ END VARIABLE ]

Lighting: one large soft key from the upper left plus a subtle edge light
along the right side of the glass. Soft contact shadow beneath.

Camera: 85mm equivalent, straight on at bottle mid height, bottle centred
with identical framing and identical scale in every image. Photorealistic
commercial product photography.

4:5 portrait. Photorealistic.
```

Then in Canva, drop all four onto one artboard, confirm the bottle sits in the
same pixel position in each, nudge until it does, and export as a set. Ten
minutes of alignment here saves an hour of CSS later.

### E, ChatGPT, the composition portrait

```
Black and white photograph of a woman seen from directly behind, framed
close on the back of her head, her neck, and the top of her shoulders.

Her head is tilted gently to her left, just far enough that the faint edge
of her cheekbone and jaw is visible in profile at the left side of her
head. Her face is not visible. No eyes, no mouth, no front of the face at
any point.

Her hair is dark and smoothed back, catching a soft highlight along the
crown. Bare shoulders, no visible clothing detail, no jewellery.

She is positioned in the right third of the frame. The entire left half of
the image is empty backdrop, a plain seamless mid grey, evenly lit, with
nothing in it.

Lighting: one large soft source from the upper left, wrapping around the
back of the head, with gentle falloff into shadow on the right. Soft, no
hard edges, no harsh contrast.

Camera: 85mm equivalent, at the height of the back of her head, shallow
depth of field with the backdrop slightly soft. Fine film grain, medium
format quality. Monochrome, no colour anywhere.

16:9 landscape. Photorealistic, editorial fashion photography.
```

Negative, if the tool takes one:

```
face, eyes, mouth, front view, profile view, three quarter view, looking
at camera, text, watermark, logo, jewellery, tattoo, harsh shadows, high
contrast, colour
```

Check the left half is genuinely empty before you accept it. The type sits
there, and if the backdrop drifts or a shoulder creeps in, the whole section
loses its footing. Regenerate rather than crop.

### F, Claude Code, scaffolding

Paste this into the terminal as the first build prompt. It deliberately stops
short of the three set pieces, since those get their own prompts on camera and
that is the actual teaching.

```
Scaffold a Next.js 15 project using the App Router and TypeScript for a
single page fragrance brand site called CELADON.

Dependencies: tailwindcss v4, gsap with ScrollTrigger, lenis, motion.

Set up design tokens as CSS custom properties in globals.css and expose
them to Tailwind via @theme:

  --bone #E8E5DD, --bone-deep #DEDAD0, --ink #171A16, --pitch #10130F,
  --muted #6E7268, --celadon #7E9B84, --celadon-deep #2E4433

Type scale as custom properties:
  --step-display clamp(3.25rem, 8.5vw, 8.5rem), line height 0.92,
    letter spacing -0.03em
  --step-h1 clamp(2.25rem, 4.5vw, 4rem), 1.0, -0.02em
  --step-h2 clamp(1.5rem, 2.6vw, 2.25rem), 1.15
  --step-numeral clamp(2.5rem, 5vw, 5rem), tabular figures
  --step-body 1rem, 1.7
  --step-small 0.8125rem, 1.55

Load two fonts with next/font/google: Instrument Serif for display and all
numerals, weights 400 and italic, and Instrument Sans for body and labels,
weights 400 and 500. Expose each as a CSS variable and map them in @theme
as font-display and font-body.

Layout: max width 1440px centred, twelve column grid with 24px gutters,
page margin clamp(1.5rem, 6vw, 7rem), section block padding
clamp(6rem, 14vh, 11rem).

Create a Lenis smooth scroll provider as a client component wrapping the
page, lerp 0.085, and register ScrollTrigger against it with
ScrollTrigger.update on Lenis scroll.

Create seven section components in components/sections, each a full
viewport height placeholder with its name at the top left: Hero, About,
Composition, Intensities, House, Acquire, Footer.

Set up the footer reveal now, since it affects document structure. The
footer is position fixed, inset auto 0 0 0, height 100vh, z-index 0. The
main element is position relative, z-index 1, background var(--bone), with
margin-bottom 100vh so the footer is uncovered as the page scrolls past
it.

Global constraints. Do not add any 1px borders, dividers or hairline rules
anywhere. Do not add small uppercase labels above headings. Do not use any
monospace font. Do not use em dashes in any copy or comment. Separation
between elements comes from tonal background fills and whitespace only.

Respect prefers-reduced-motion globally: disable Lenis and all scrub
behaviour when it is set.

Do not implement the hero video scrubbing, the composition path animation
or the pinned intensities section yet. Stubs only.
```
