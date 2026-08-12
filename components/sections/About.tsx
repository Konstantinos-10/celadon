"use client";

/* About. A staggered run of four expandable cards whose shared edges form
   a grid. The grid is drawn on entrance as SVG lines sweeping left to
   right, the one place on the site where lines are explicitly wanted.
   One card is open at a time and the copy fades inside the existing box,
   so nothing shifts. */

import { useState, type KeyboardEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

const EASE = [0.16, 1, 0.3, 1] as const;

const CARDS = [
  {
    numeral: "01.",
    title: "The house",
    body: "Founded in 2021 in Ghent, four people and one still room. Small enough that every batch passes through the same hands, patient enough that nothing ships before its year is up.",
  },
  {
    numeral: "02.",
    title: "One formula",
    body: "Most houses answer every season with a new bottle. We keep a single formula and spend our years deepening it. The work is not variety. The work is depth.",
  },
  {
    numeral: "03.",
    title: "The materials",
    body: "Bergamot from Calabria, iris butter from Florence, oakmoss tinctured in the studio. The heart notes were chosen because they age well together, folding into one another as the day wears on.",
  },
  {
    numeral: "04.",
    title: "Four strengths",
    body: "Concentration changes character, not just duration. At three percent the formula is a citrus sketch. At twenty seven it is a shadow that lasts until midnight. Four strengths, one argument.",
  },
];

/* Staircase placement: odd cards on the upper row, even cards one column
   over on the lower row, so neighbours meet at a shared corner */
const PLACE = [
  "md:col-start-1 md:row-start-1",
  "md:col-start-2 md:row-start-2",
  "md:col-start-3 md:row-start-1",
  "md:col-start-4 md:row-start-2",
];

/* Grid geometry in a 0 to 100 square, every line drawn edge to edge.
   Horizontals sweep first, then the verticals fill in ordered by x,
   like a traversal being visualised. */
const LINES = [
  { x1: 0, y1: 0, x2: 100, y2: 0, delay: 0, duration: 1.8 },
  { x1: 0, y1: 50, x2: 100, y2: 50, delay: 0.15, duration: 1.8 },
  { x1: 0, y1: 100, x2: 100, y2: 100, delay: 0.3, duration: 1.8 },
  { x1: 0, y1: 0, x2: 0, y2: 100, delay: 0.35, duration: 1.1 },
  { x1: 25, y1: 0, x2: 25, y2: 100, delay: 0.55, duration: 1.1 },
  { x1: 50, y1: 0, x2: 50, y2: 100, delay: 0.75, duration: 1.1 },
  { x1: 75, y1: 0, x2: 75, y2: 100, delay: 0.95, duration: 1.1 },
  { x1: 100, y1: 0, x2: 100, y2: 100, delay: 1.15, duration: 1.1 },
];

const VIEWPORT = { once: true, amount: 0.25 } as const;

export default function About() {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState<number | null>(1);
  const [hovered, setHovered] = useState<number | null>(null);

  const toggle = (i: number) => setOpen((cur) => (cur === i ? null : i));
  const onKey = (e: KeyboardEvent, i: number) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggle(i);
    }
  };

  const rise = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 16 },
    whileInView: { opacity: 1, y: 0 },
    viewport: VIEWPORT,
    transition: { duration: 1.1, ease: EASE, delay },
  });

  return (
    <section className="min-h-svh bg-bone-deep">
      {/* Shallow top padding: this block covers the hero, so its heading
         should ride close to the advancing edge rather than trail a
         viewport of blank ground behind it */}
      <div className="page-shell pb-[var(--section-pad)] pt-[clamp(3.5rem,8vh,6rem)]">
        {/* Heading, top left */}
        <div className="overflow-hidden">
          <motion.h2
            className="font-display text-[clamp(2.5rem,6vw,5.5rem)] leading-[0.95] tracking-[-0.02em]"
            initial={reduce ? false : { opacity: 0, y: "60%" }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VIEWPORT}
            transition={{ duration: 1.3, ease: EASE }}
          >
            The <em className="italic">practice</em>
          </motion.h2>
        </div>

        {/* One sentence in three fragments across the grid */}
        <div className="mt-10 grid-12 text-small uppercase tracking-[0.16em] text-muted max-md:flex max-md:flex-col max-md:gap-1">
          <motion.p className="md:col-span-2" {...rise(0.15)}>
            It is
          </motion.p>
          <motion.p className="md:col-start-3 md:col-span-3" {...rise(0.3)}>
            one composition, refined for years,
          </motion.p>
          <motion.p
            className="md:col-start-9 md:col-span-4 md:text-right"
            {...rise(0.45)}
          >
            and released at four strengths. Nothing else leaves the studio.
          </motion.p>
        </div>

        {/* The card grid with its drawn edges */}
        <div className="relative mt-[clamp(3rem,8vh,6rem)]">
          <svg
            aria-hidden
            className="pointer-events-none absolute inset-0 hidden h-full w-full md:block"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            {LINES.map((l, i) => (
              <motion.line
                key={i}
                x1={l.x1}
                y1={l.y1}
                x2={l.x2}
                y2={l.y2}
                stroke="var(--muted)"
                strokeOpacity={0.4}
                vectorEffect="non-scaling-stroke"
                initial={reduce ? false : { pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={VIEWPORT}
                transition={{
                  duration: l.duration,
                  ease: EASE,
                  delay: l.delay,
                }}
              />
            ))}
          </svg>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-4 md:grid-rows-[repeat(2,clamp(19rem,44vh,24rem))] md:gap-0">
            {CARDS.map((card, i) => {
              const isOpen = open === i;
              return (
                <motion.div
                  key={card.numeral}
                  className={PLACE[i]}
                  {...rise(0.45 + i * 0.18)}
                >
                  <div
                    role="button"
                    tabIndex={0}
                    aria-expanded={isOpen}
                    onClick={() => toggle(i)}
                    onKeyDown={(e) => onKey(e, i)}
                    onMouseEnter={() => setHovered(i)}
                    onMouseLeave={() => setHovered(null)}
                    onFocus={() => setHovered(i)}
                    onBlur={() => setHovered(null)}
                    className={`group relative flex h-full min-h-[15rem] cursor-pointer flex-col p-6 transition-colors duration-500 max-md:bg-bone/60 ${
                      isOpen ? "bg-bone" : "md:hover:bg-bone/60"
                    }`}
                  >
                    {/* While hovered, two segments circulate the cell
                       border. pathLength normalises the perimeter to 100,
                       so a full offset cycle loops seamlessly. */}
                    <svg
                      aria-hidden
                      className="pointer-events-none absolute inset-0 hidden h-full w-full overflow-visible md:block"
                    >
                      <AnimatePresence>
                        {!reduce && hovered === i && (
                          <motion.g
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.35, ease: "easeOut" }}
                          >
                            {/* Paints over the static grid lines on this
                               cell's border so only the moving segments
                               remain visible while hovered */}
                            <rect
                              x="0"
                              y="0"
                              width="100%"
                              height="100%"
                              fill="none"
                              stroke="var(--bone-deep)"
                              strokeWidth={3}
                            />
                            <motion.rect
                              x="0"
                              y="0"
                              width="100%"
                              height="100%"
                              fill="none"
                              stroke="var(--celadon-deep)"
                              strokeOpacity={0.8}
                              vectorEffect="non-scaling-stroke"
                              pathLength={100}
                              strokeDasharray="20 30"
                              initial={{ strokeDashoffset: 0 }}
                              animate={{ strokeDashoffset: -100 }}
                              transition={{
                                strokeDashoffset: {
                                  duration: 3.2,
                                  ease: "linear",
                                  repeat: Infinity,
                                },
                              }}
                            />
                          </motion.g>
                        )}
                      </AnimatePresence>
                    </svg>
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="max-w-[12ch] text-small font-medium uppercase tracking-[0.16em]">
                        {card.title}
                      </h3>
                      <span
                        className={`font-display text-[1.75rem] leading-none transition-colors duration-500 ${
                          isOpen
                            ? "text-celadon-deep"
                            : "text-muted group-hover:text-celadon-deep"
                        }`}
                      >
                        {card.numeral}
                      </span>
                    </div>

                    <div className="min-h-0 flex-1 pt-6">
                      <AnimatePresence>
                        {isOpen && (
                          <motion.p
                            className="max-w-[38ch] text-small leading-[1.7]"
                            initial={reduce ? false : { opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5, ease: EASE }}
                          >
                            {card.body}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>

                    <span
                      aria-hidden
                      className={`mt-6 inline-block w-fit text-xl leading-none text-muted transition-all duration-500 group-hover:text-ink ${
                        isOpen ? "rotate-45" : "md:group-hover:rotate-90"
                      }`}
                    >
                      +
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
