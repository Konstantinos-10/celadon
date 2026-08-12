"use client";

/* Acquire. A specimen table, not a data table: four rows, one per
   concentration, held together by scale and space rather than rules.
   Separation is tonal (alternate rows lift toward bone, since the
   section sits on bone-deep), and on hover the row fills with celadon
   at low opacity while the serif numerals deepen. No lines anywhere. */

import { motion, useReducedMotion } from "motion/react";

const EASE = [0.16, 1, 0.3, 1] as const;
const VIEWPORT = { once: true, amount: 0.25 } as const;

const ROWS = [
  { name: "Eau de Cologne", oil: 3, hours: 2, volume: "100 ml", price: "95 EUR" },
  { name: "Eau de Toilette", oil: 9, hours: 4, volume: "100 ml", price: "135 EUR" },
  { name: "Eau de Parfum", oil: 18, hours: 7, volume: "100 ml", price: "185 EUR" },
  { name: "Extrait de Parfum", oil: 27, hours: 12, volume: "50 ml", price: "260 EUR" },
];

/* Shared column template so the header row and the body rows align */
const COLS =
  "md:grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.9fr)_minmax(0,0.9fr)]";

/* A serif numeral with its unit tucked beside it in the sans */
function Numeral({ value, unit }: { value: number; unit: string }) {
  return (
    <span className="whitespace-nowrap">
      <span className="text-numeral transition-colors duration-500 group-hover:text-celadon-deep">
        {value}
      </span>
      <span className="ml-2 text-small text-muted">{unit}</span>
    </span>
  );
}

/* Mobile-only cell label, since the header row is hidden there */
function CellLabel({ text }: { text: string }) {
  return (
    <span className="mb-1 block text-small uppercase tracking-[0.16em] text-muted md:hidden">
      {text}
    </span>
  );
}

export default function Acquire() {
  const reduce = useReducedMotion();

  const rise = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 16 },
    whileInView: { opacity: 1, y: 0 },
    viewport: VIEWPORT,
    transition: { duration: 1.1, ease: EASE, delay },
  });

  return (
    <section id="acquire" className="min-h-svh bg-bone-deep">
      <div className="page-shell section-pad">
        {/* Heading, top left */}
        <div className="overflow-hidden">
          <motion.h2
            className="font-display text-[clamp(2.5rem,6vw,5.5rem)] leading-[0.95] tracking-[-0.02em]"
            initial={reduce ? false : { opacity: 0, y: "60%" }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VIEWPORT}
            transition={{ duration: 1.3, ease: EASE }}
          >
            Acquire
          </motion.h2>
        </div>

        <div className="mt-[clamp(3rem,8vh,6rem)]">
          {/* Column headers, hidden on narrow viewports */}
          <motion.div
            className={`hidden gap-x-[var(--gutter)] pb-6 text-small uppercase tracking-[0.16em] text-muted md:grid ${COLS}`}
            {...rise(0.15)}
          >
            <span>Concentration</span>
            <span>Oil</span>
            <span>Longevity</span>
            <span>Volume</span>
            <span className="text-right">Price</span>
          </motion.div>

          {ROWS.map((row, i) => (
            <motion.div
              key={row.name}
              className={`group -mx-4 grid items-center gap-x-[var(--gutter)] px-4 transition-colors duration-500 hover:bg-celadon/[0.12] max-md:grid-cols-2 max-md:gap-y-5 max-md:py-8 md:min-h-[8.75rem] md:grid ${COLS} ${
                i % 2 === 1 ? "bg-bone/50" : ""
              }`}
              {...rise(0.25 + i * 0.12)}
            >
              <h3 className="text-h2 max-md:col-span-2">{row.name}</h3>

              <div>
                <CellLabel text="Oil" />
                <Numeral value={row.oil} unit="%" />
              </div>

              <div>
                <CellLabel text="Longevity" />
                <Numeral value={row.hours} unit="hr" />
              </div>

              <div>
                <CellLabel text="Volume" />
                <span className="text-body">{row.volume}</span>
              </div>

              <div className="md:text-right">
                <CellLabel text="Price" />
                <span className="text-body">{row.price}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
